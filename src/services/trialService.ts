/**
 * Trial service for managing 14-day trial periods
 * Standalone app - fully local, no network calls after initial trial start
 */

import { getDeviceFingerprint } from '../utils/deviceFingerprint';

export interface TrialStatus {
  isTrial: boolean;
  trialKey?: string;
  startDate?: Date;
  endDate?: Date;
  deviceFingerprint?: string;
  isExpired: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining?: number;
}

const TRIAL_DURATION_DAYS = 14;

class TrialService {
  private static instance: TrialService;
  private trialStatus: TrialStatus = {
    isTrial: false,
    isExpired: false,
    daysRemaining: 0,
    hoursRemaining: 0,
    minutesRemaining: 0,
  };

  static getInstance(): TrialService {
    if (!TrialService.instance) {
      TrialService.instance = new TrialService();
    }
    return TrialService.instance;
  }

  /**
   * Generate a trial license code
   */
  generateTrialKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        key += '-';
      }
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }

  /**
   * Start a trial - generates key and binds to device
   * Returns the trial key for user to see and activate
   */
  async startTrial(): Promise<{ success: boolean; trialKey?: string; error?: string }> {
    try {
      // Generate trial license code
      const trialKey = this.generateTrialKey();
      const startDate = new Date();
      // Use setTime to correctly add days (avoids month boundary issues with setDate)
      const endDate = new Date(startDate.getTime() + (TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000));

      // Local/offline trial mode - store locally
      const deviceFingerprint = await getDeviceFingerprint();
      
      // Check if device already has a local trial
      const existingTrial = localStorage.getItem('aftercare_trial_status');
      if (existingTrial) {
        try {
          const parsed = JSON.parse(existingTrial);
          if (parsed.isTrial && parsed.deviceFingerprint === deviceFingerprint) {
            const existingEndDate = new Date(parsed.endDate);
            if (existingEndDate > new Date()) {
              return {
                success: false,
                error: 'This device already has an active trial.',
              };
            }
          }
        } catch {
          // Ignore parse errors, allow new trial
        }
      }

      // Store trial locally for offline use
      this.trialStatus = {
        isTrial: true,
        trialKey,
        startDate,
        endDate,
        deviceFingerprint,
        isExpired: false,
        daysRemaining: TRIAL_DURATION_DAYS,
        hoursRemaining: 0,
        minutesRemaining: 0,
      };

      await this.saveTrialStatus();
      
      // Also store trial key mapping for validation
      localStorage.setItem(`aftercare_trial_key_${trialKey}`, JSON.stringify({
        trialKey,
        deviceFingerprint,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isActive: true,
      }));

      return { success: true, trialKey };
    } catch (error) {
      console.error('Failed to start trial:', error);
      return {
        success: false,
        error: 'Failed to start trial. Please try again.',
      };
    }
  }

  /**
   * Validate and bind trial license to device (REQUIRED)
   * This is called when user enters the license to activate
   */
  async validateAndBindTrialKey(trialKey: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const deviceFingerprint = await getDeviceFingerprint();

      // Check if this trial key was generated locally
      const storedKey = localStorage.getItem(`aftercare_trial_key_${trialKey}`);
      
      if (storedKey) {
        try {
          const keyData = JSON.parse(storedKey);
          const endDate = new Date(keyData.endDate);
          const now = new Date();

          if (now > endDate) {
            return { valid: false, error: 'Trial has expired. Please purchase a license to continue.' };
          }

          if (!keyData.isActive) {
            return { valid: false, error: 'Trial is no longer active' };
          }

          // Check if already bound to different device
          if (keyData.deviceFingerprint && keyData.deviceFingerprint !== deviceFingerprint) {
            return { valid: false, error: 'This trial license has already been activated on another device.' };
          }

          // Bind to this device if not already bound
          if (!keyData.deviceFingerprint) {
            keyData.deviceFingerprint = deviceFingerprint;
            localStorage.setItem(`aftercare_trial_key_${trialKey}`, JSON.stringify(keyData));
          }

          // Update trial status
          this.trialStatus = {
            isTrial: true,
            trialKey,
            startDate: new Date(keyData.startDate),
            endDate: new Date(keyData.endDate),
            deviceFingerprint,
            isExpired: false,
            daysRemaining: 0,
            hoursRemaining: 0,
            minutesRemaining: 0,
          };

          await this.saveTrialStatus();
          return { valid: true };
        } catch (e) {
          console.error('Failed to parse local trial key:', e);
        }
      }

      // Also check the existing trial_status
      const existingStatus = localStorage.getItem('aftercare_trial_status');
      if (existingStatus) {
        try {
          const status = JSON.parse(existingStatus);
          if (status.trialKey === trialKey && status.deviceFingerprint === deviceFingerprint) {
            const endDate = new Date(status.endDate);
            if (new Date() <= endDate) {
              this.trialStatus = {
                ...status,
                startDate: new Date(status.startDate),
                endDate: new Date(status.endDate),
              };
              return { valid: true };
            }
          }
        } catch (e) {
          console.error('Failed to parse trial status:', e);
        }
      }

      return { valid: false, error: 'Invalid trial license' };
    } catch (error) {
      console.error('Failed to validate trial license:', error);
      return { valid: false, error: 'Validation failed' };
    }
  }

  /**
   * Load trial status
   */
  async loadTrialStatus(): Promise<void> {
    try {
      const stored = localStorage.getItem('aftercare_trial_status');
      if (stored) {
        const trial = JSON.parse(stored);
        const endDate = new Date(trial.endDate);
        const now = new Date();

        this.trialStatus = {
          ...trial,
          startDate: new Date(trial.startDate),
          endDate,
          isExpired: now > endDate,
        };

        this.updateTimeRemaining();
      }
    } catch (error) {
      console.error('Failed to load trial status:', error);
      this.trialStatus = {
        isTrial: false,
        isExpired: false,
        daysRemaining: 0,
        hoursRemaining: 0,
        minutesRemaining: 0,
      };
    }
  }

  /**
   * Update time remaining until trial expiration
   */
  updateTimeRemaining(): void {
    if (!this.trialStatus.isTrial || !this.trialStatus.endDate) {
      return;
    }

    const now = new Date();
    const endDate = new Date(this.trialStatus.endDate);
    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) {
      this.trialStatus.isExpired = true;
      this.trialStatus.daysRemaining = 0;
      this.trialStatus.hoursRemaining = 0;
      this.trialStatus.minutesRemaining = 0;
      this.trialStatus.secondsRemaining = 0;
    } else {
      this.trialStatus.isExpired = false;
      const totalSeconds = Math.floor(diff / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(totalMinutes / 60);
      
      this.trialStatus.daysRemaining = Math.floor(totalHours / 24);
      this.trialStatus.hoursRemaining = totalHours % 24;
      this.trialStatus.minutesRemaining = totalMinutes % 60;
      this.trialStatus.secondsRemaining = totalSeconds % 60;
    }
  }

  /**
   * Get current trial status
   */
  getTrialStatus(): TrialStatus {
    this.updateTimeRemaining();
    return { ...this.trialStatus };
  }

  /**
   * Check if trial is active
   */
  isTrialActive(): boolean {
    return this.trialStatus.isTrial && !this.trialStatus.isExpired;
  }

  /**
   * Check if warnings should be shown
   */
  shouldShowWarning(): { show: boolean; type?: 'day' | 'hour'; message?: string } {
    if (!this.trialStatus.isTrial || this.trialStatus.isExpired) {
      return { show: false };
    }

    this.updateTimeRemaining();

    // 2 hours before expiration
    if (this.trialStatus.daysRemaining === 0 && this.trialStatus.hoursRemaining <= 2) {
      return {
        show: true,
        type: 'hour',
        message: `Your trial expires in ${this.trialStatus.hoursRemaining} hour(s) and ${this.trialStatus.minutesRemaining} minute(s). Please purchase a license to continue.`,
      };
    }

    // 1 day before expiration
    if (this.trialStatus.daysRemaining === 1) {
      return {
        show: true,
        type: 'day',
        message: 'Your trial expires in 1 day. Please purchase a license to continue using the application.',
      };
    }

    return { show: false };
  }

  /**
   * Save trial status
   */
  private async saveTrialStatus(): Promise<void> {
    try {
      const toStore = {
        ...this.trialStatus,
        startDate: this.trialStatus.startDate?.toISOString(),
        endDate: this.trialStatus.endDate?.toISOString(),
      };
      localStorage.setItem('aftercare_trial_status', JSON.stringify(toStore));
    } catch (error) {
      console.error('Failed to save trial status:', error);
    }
  }

  /**
   * Convert trial to full license (after purchase)
   */
  async convertToLicense(_licenseKey: string): Promise<void> {
    // Clear trial status
    localStorage.removeItem('aftercare_trial_status');
    // Clear trial license mappings
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('aftercare_trial_key_')) {
        localStorage.removeItem(key);
      }
    });
    this.trialStatus = {
      isTrial: false,
      isExpired: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
    };
  }

  /**
   * Check if user can start a trial (hasn't used it yet)
   */
  async canStartTrial(): Promise<boolean> {
    const stored = localStorage.getItem('aftercare_trial_status');
    if (!stored) return true;
    
    try {
      const trial = JSON.parse(stored);
      if (!trial.isTrial) return true;
      
      // Check if existing trial is expired
      const endDate = new Date(trial.endDate);
      return new Date() > endDate;
    } catch {
      return true;
    }
  }

  /**
   * Reset trial (for testing)
   */
  resetTrial(): void {
    localStorage.removeItem('aftercare_trial_status');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('aftercare_trial_key_')) {
        localStorage.removeItem(key);
      }
    });
    this.trialStatus = {
      isTrial: false,
      isExpired: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
    };
  }
}

export const trialService = TrialService.getInstance();

