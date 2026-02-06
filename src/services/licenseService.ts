/**
 * License Service for AfterPassing Guide
 * 
 * Implements the same licensing model as LPV and LLV:
 * - Single-device activation with transfer capability
 * - ONE network call during activation, then fully offline
 * - No user data transmitted, only license + device hash
 * - Local license file for offline validation
 * 
 * Security Philosophy:
 * - Offline-first, single-device activation
 * - No cloud storage, no telemetry, no shared license data
 * - Zero user data on the internet
 * 
 * Product Identifier: AFTERCARE_ASSISTANT
 */

import { getDeviceFingerprint, isValidDeviceId } from '../utils/deviceFingerprint';

// License storage key (matches pattern from LPV/LLV)
const LICENSE_STORAGE_KEY = 'aftercare_license_file';
const LICENSE_KEY_STORAGE = 'aftercare_license_key';
const LICENSE_ACTIVATED_STORAGE = 'aftercare_license_activated';
const DEVICE_ID_STORAGE = 'aftercare_device_id';

// License server URL (can be overridden via env var)
const LICENSE_SERVER_URL = import.meta.env.VITE_LICENSE_SERVER_URL || 'https://server.localpasswordvault.com';
// Optional: use Supabase Edge Functions for APG (e.g. https://xxx.supabase.co/functions/v1/apg-activate)
const ACTIVATE_URL = import.meta.env.VITE_APG_ACTIVATE_URL || `${LICENSE_SERVER_URL}/api/aftercare/license/activate`;
const TRANSFER_URL = import.meta.env.VITE_APG_TRANSFER_URL || `${LICENSE_SERVER_URL}/api/aftercare/license/transfer`;

/**
 * Local license file structure
 * Written after successful activation for offline validation
 */
export interface LocalLicenseFile {
  license_key: string;
  device_id: string;
  activated_at: string;
  plan_type?: string;
}

/**
 * Activation API response types
 */
export type ActivationStatus = 
  | "activated" 
  | "device_mismatch" 
  | "invalid" 
  | "revoked"
  | "transfer_limit_reached"
  | "error";

export type ActivationMode = "first_activation" | "same_device" | "requires_transfer";

export interface ActivationResponse {
  status: ActivationStatus;
  mode?: ActivationMode;
  requires_transfer?: boolean;
  plan_type?: string;
  error?: string;
}

export interface TransferResponse {
  status: "transferred" | "transfer_limit_reached" | "invalid" | "error";
  error?: string;
}

export interface LicenseInfo {
  isValid: boolean;
  key: string | null;
  activatedDate: Date | null;
  deviceId: string | null;
}

export class LicenseService {
  private static instance: LicenseService;
  
  // Cached device fingerprint
  private cachedDeviceId: string | null = null;

  static getInstance(): LicenseService {
    if (!LicenseService.instance) {
      LicenseService.instance = new LicenseService();
    }
    return LicenseService.instance;
  }

  /**
   * Get current device fingerprint (cached for performance)
   */
  async getDeviceId(): Promise<string> {
    if (this.cachedDeviceId) {
      return this.cachedDeviceId;
    }
    this.cachedDeviceId = await getDeviceFingerprint();
    return this.cachedDeviceId;
  }

  /**
   * Get local license file data
   */
  getLocalLicenseFile(): LocalLicenseFile | null {
    try {
      const stored = localStorage.getItem(LICENSE_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Invalid or missing file
    }
    return null;
  }

  /**
   * Save local license file
   */
  private saveLocalLicenseFile(data: LocalLicenseFile): void {
    localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * Clear local license file
   */
  private clearLocalLicenseFile(): void {
    localStorage.removeItem(LICENSE_STORAGE_KEY);
    localStorage.removeItem(LICENSE_KEY_STORAGE);
    localStorage.removeItem(LICENSE_ACTIVATED_STORAGE);
    localStorage.removeItem(DEVICE_ID_STORAGE);
  }

  /**
   * Validate license locally (offline check)
   * Returns true if local license matches current device
   */
  async validateLocalLicense(): Promise<{ valid: boolean; requiresTransfer: boolean }> {
    const localLicense = this.getLocalLicenseFile();
    
    if (!localLicense) {
      return { valid: false, requiresTransfer: false };
    }

    const currentDeviceId = await this.getDeviceId();
    
    // Check if device IDs match
    if (localLicense.device_id === currentDeviceId) {
      return { valid: true, requiresTransfer: false };
    }
    
    // Device mismatch - transfer required
    return { valid: false, requiresTransfer: true };
  }

  /**
   * Get current license information
   * Performs offline validation
   */
  async getLicenseInfo(): Promise<LicenseInfo> {
    const key = localStorage.getItem(LICENSE_KEY_STORAGE);
    const activatedDateStr = localStorage.getItem(LICENSE_ACTIVATED_STORAGE);
    const deviceId = localStorage.getItem(DEVICE_ID_STORAGE);

    if (!key) {
      return {
        isValid: false,
        key: null,
        activatedDate: null,
        deviceId: null,
      };
    }

    // Validate device binding locally
    const localValidation = await this.validateLocalLicense();
    if (!localValidation.valid && !localValidation.requiresTransfer) {
      // No local license file - might need re-activation
      return {
        isValid: false,
        key: null,
        activatedDate: null,
        deviceId: null,
      };
    }

    return {
      isValid: localValidation.valid,
      key,
      activatedDate: activatedDateStr ? new Date(activatedDateStr) : null,
      deviceId,
    };
  }

  /**
   * Format license for display (XXXX-XXXX-XXXX-XXXX)
   */
  formatLicenseKey(key: string): string {
    const cleanKey = key.replace(/[-\s]/g, '').toUpperCase();
    if (cleanKey.length === 16) {
      return `${cleanKey.slice(0, 4)}-${cleanKey.slice(4, 8)}-${cleanKey.slice(8, 12)}-${cleanKey.slice(12, 16)}`;
    }
    return key;
  }

  /**
   * Validate license format
   */
  validateKeyFormat(key: string): boolean {
    const cleanKey = key.replace(/[-\s]/g, '').toUpperCase();
    return /^[A-Z0-9]{16}$/.test(cleanKey);
  }

  /**
   * Check if user has an active license (same as isLicensed). AfterPassing Guide has no trial; license only.
   */
  async isLicenseActive(): Promise<boolean> {
    return this.isLicensed();
  }

  /**
   * Activate a license
   *
   * Flow:
   * 1. Validate license format
   * 2. Get device fingerprint
   * 3. Call activation API (ONE network call)
   * 4. Handle response (activated, device_mismatch, invalid)
   * 5. On success, save local license file for offline use
   */
  async activateLicense(licenseKey: string): Promise<{
    success: boolean;
    error?: string;
    requiresTransfer?: boolean;
    status?: ActivationStatus;
  }> {
    const isDevMode = import.meta.env.DEV;

    try {
      const cleanKey = licenseKey.replace(/[^A-Z0-9-]/g, "").toUpperCase();
      const isValidFormat = this.validateKeyFormat(cleanKey);
      
      if (!isValidFormat) {
        return { success: false, error: "Invalid license format. License must be in format XXXX-XXXX-XXXX-XXXX." };
      }

      // Get device fingerprint
      const deviceId = await this.getDeviceId();

      // Development mode: bypass server
      if (isDevMode) {
        return this.activateLocalLicense(cleanKey, deviceId);
      }

      // Call activation API (ONE network call)
      const response = await fetch(ACTIVATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          license_key: cleanKey,
          device_id: deviceId,
          product: "AFTERCARE_ASSISTANT",
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: "Unable to connect to license server. Please check your internet connection and try again.",
        };
      }

      const result: ActivationResponse = await response.json();

      // Handle device mismatch
      if (result.status === "device_mismatch") {
        return {
          success: false,
          requiresTransfer: true,
          status: "device_mismatch",
          error: "This license is active on another device. Transfer required."
        };
      }

      // Handle invalid/revoked
      if (result.status === "invalid" || result.status === "revoked") {
        return {
          success: false,
          status: result.status,
          error: result.error || "This is not a valid license."
        };
      }

      // Handle successful activation
      if (result.status === "activated") {
        const formattedKey = this.formatLicenseKey(cleanKey);
        
        // Save local license file for offline validation
        this.saveLocalLicenseFile({
          license_key: formattedKey,
          device_id: deviceId,
          activated_at: new Date().toISOString(),
          plan_type: result.plan_type || 'aftercare_single',
        });

        // Update localStorage
        localStorage.setItem(LICENSE_KEY_STORAGE, formattedKey);
        localStorage.setItem(LICENSE_ACTIVATED_STORAGE, new Date().toISOString());
        localStorage.setItem(DEVICE_ID_STORAGE, deviceId);

        return { 
          success: true, 
          status: "activated"
        };
      }

      return { 
        success: false, 
        error: result.error || "Activation failed" 
      };

    } catch (error) {
      console.error("License activation error:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          success: false,
          error: "Unable to connect to license server. Please check your internet connection and try again.",
        };
      }

      return { success: false, error: "License activation failed" };
    }
  }

  /**
   * Import license from file content (same model as LLV: file-first activation).
   * File must be JSON with license_key and device_id. Validates device_id against this device.
   * If device matches, saves locally and returns success. If not, returns requiresTransfer so UI can offer transfer.
   */
  async importLicenseFromFile(fileContent: string): Promise<{
    success: boolean;
    error?: string;
    requiresTransfer?: boolean;
    licenseKey?: string;
  }> {
    let data: unknown;
    try {
      data = JSON.parse(fileContent);
    } catch {
      return { success: false, error: 'Invalid file format. The license file should be JSON.' };
    }
    if (!data || typeof data !== 'object' || !('license_key' in data) || !('device_id' in data)) {
      return { success: false, error: 'Invalid file format. File must contain license_key and device_id.' };
    }
    const license_key = (data as Record<string, unknown>).license_key;
    const device_id = (data as Record<string, unknown>).device_id;
    if (typeof license_key !== 'string' || typeof device_id !== 'string') {
      return { success: false, error: 'Invalid file format.' };
    }
    const cleanKey = license_key.replace(/[-\s]/g, '').toUpperCase();
    if (!this.validateKeyFormat(cleanKey)) {
      return { success: false, error: 'Invalid license format in file.' };
    }
    const currentDeviceId = await this.getDeviceId();
    if (device_id !== currentDeviceId) {
      return {
        success: false,
        requiresTransfer: true,
        licenseKey: this.formatLicenseKey(cleanKey),
        error: 'This license is for a different device. Use Transfer to this device below, or open the license file on the computer it was activated on.',
      };
    }
    const formattedKey = this.formatLicenseKey(cleanKey);
    const activated_at = (data as Record<string, unknown>).activated_at;
    const activatedAt = typeof activated_at === 'string' ? activated_at : new Date().toISOString();
    this.saveLocalLicenseFile({
      license_key: formattedKey,
      device_id: currentDeviceId,
      activated_at: activatedAt,
      plan_type: (data as Record<string, unknown>).plan_type as string | undefined || 'aftercare_single',
    });
    localStorage.setItem(LICENSE_KEY_STORAGE, formattedKey);
    localStorage.setItem(LICENSE_ACTIVATED_STORAGE, activatedAt);
    localStorage.setItem(DEVICE_ID_STORAGE, currentDeviceId);
    return { success: true };
  }

  /**
   * Transfer license to current device
   * 
   * Called when user confirms transfer after device_mismatch
   */
  async transferLicense(licenseKey: string): Promise<{
    success: boolean;
    error?: string;
    status?: string;
  }> {
    try {
      const cleanKey = licenseKey.replace(/[^A-Z0-9-]/g, "").toUpperCase();
      const deviceId = await this.getDeviceId();

      // Development mode: simulate transfer
      if (import.meta.env.DEV) {
        return this.transferLocalLicense(cleanKey, deviceId);
      }

      const response = await fetch(TRANSFER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          license_key: cleanKey,
          new_device_id: deviceId,
          product: "AFTERCARE_ASSISTANT",
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: "Unable to connect to license server. Please check your internet connection.",
        };
      }

      const result: TransferResponse = await response.json();

      if (result.status === "transferred") {
        const formattedKey = this.formatLicenseKey(cleanKey);
        
        // Update local license file
        this.saveLocalLicenseFile({
          license_key: formattedKey,
          device_id: deviceId,
          activated_at: new Date().toISOString(),
        });

        // Update localStorage
        localStorage.setItem(LICENSE_KEY_STORAGE, formattedKey);
        localStorage.setItem(LICENSE_ACTIVATED_STORAGE, new Date().toISOString());
        localStorage.setItem(DEVICE_ID_STORAGE, deviceId);

        return { success: true, status: "transferred" };
      }

      if (result.status === "transfer_limit_reached") {
        return {
          success: false,
          status: "transfer_limit_reached",
          error: "Your license has reached its automatic transfer limit. Please contact support."
        };
      }

      return {
        success: false,
        error: result.error || "Transfer failed"
      };

    } catch (error) {
      console.error("License transfer error:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          success: false,
          error: "Unable to connect to license server. Please check your internet connection.",
        };
      }

      return { success: false, error: "License transfer failed" };
    }
  }

  /**
   * Development mode: Activate license locally
   */
  private async activateLocalLicense(
    licenseKey: string,
    deviceId: string
  ): Promise<{ success: boolean; error?: string }> {
    const formattedKey = this.formatLicenseKey(licenseKey);
    
    // Save local license file
    this.saveLocalLicenseFile({
      license_key: formattedKey,
      device_id: deviceId,
      activated_at: new Date().toISOString(),
      plan_type: 'aftercare_single',
    });

    localStorage.setItem(LICENSE_KEY_STORAGE, formattedKey);
    localStorage.setItem(LICENSE_ACTIVATED_STORAGE, new Date().toISOString());
    localStorage.setItem(DEVICE_ID_STORAGE, deviceId);
    
    return { success: true };
  }

  /**
   * Development mode: Transfer license locally
   */
  private async transferLocalLicense(
    licenseKey: string,
    deviceId: string
  ): Promise<{ success: boolean; error?: string; status?: string }> {
    const formattedKey = this.formatLicenseKey(licenseKey);
    
    this.saveLocalLicenseFile({
      license_key: formattedKey,
      device_id: deviceId,
      activated_at: new Date().toISOString(),
    });

    localStorage.setItem(DEVICE_ID_STORAGE, deviceId);
    localStorage.setItem(LICENSE_ACTIVATED_STORAGE, new Date().toISOString());

    return { success: true, status: "transferred" };
  }

  /**
   * Check if device mismatch requires transfer
   * Used on app startup
   */
  async checkDeviceMismatch(): Promise<{
    hasMismatch: boolean;
    licenseKey: string | null;
  }> {
    const localLicense = this.getLocalLicenseFile();
    
    if (!localLicense) {
      return { hasMismatch: false, licenseKey: null };
    }

    const currentDeviceId = await this.getDeviceId();
    
    if (localLicense.device_id !== currentDeviceId) {
      return { 
        hasMismatch: true, 
        licenseKey: localLicense.license_key 
      };
    }

    return { hasMismatch: false, licenseKey: null };
  }

  /**
   * Remove license (for testing or manual reset)
   */
  removeLicense(): void {
    this.clearLocalLicenseFile();
    this.cachedDeviceId = null;
  }

  /**
   * Check if app should run (valid local license for this device).
   * This is the main guard check - used throughout the app.
   */
  async isLicensed(): Promise<boolean> {
    const validation = await this.validateLocalLicense();
    return validation.valid;
  }

  /**
   * Get stored device ID
   */
  getStoredDeviceId(): string | null {
    return localStorage.getItem(DEVICE_ID_STORAGE);
  }

  /**
   * Verify device ID is valid format
   */
  isValidDeviceId(deviceId: string): boolean {
    return isValidDeviceId(deviceId);
  }
}

export const licenseService = LicenseService.getInstance();

