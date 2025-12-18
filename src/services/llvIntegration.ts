/**
 * Local Legacy Vault Integration Layer
 * 
 * Provides functions to read data from LLV when running in embedded mode.
 * Also handles add-on licensing within LLV.
 * 
 * When running standalone, this provides mock/manual data entry options.
 */

import {
  LegacyVaultRecord,
  LegacyVaultCategory,
  LLVAddonsState,
  AppMode,
} from '../types';

// ============================================================================
// TYPES FOR LLV DATA MAPPING
// ============================================================================

// These interfaces match the LLV data structures
interface LLVInsuranceRecord {
  id: string;
  subCategory: string;
  title: string;
  description?: string;
  notes?: string;
  policyNumber?: string;
  insuranceCompany?: string;
  agentName?: string;
  agentContact?: string;
  coverageAmount?: string;
  beneficiary?: string;
}

interface LLVFinancialAsset {
  id: string;
  subCategory: string;
  title: string;
  accountNumber?: string;
  institution?: string;
  contactInfo?: string;
  notes?: string;
}

interface LLVDigitalAccount {
  id: string;
  title: string;
  accountType?: string;
  notes?: string;
}

interface LLVPropertyRecord {
  id: string;
  subCategory: string;
  title: string;
  address?: string;
  notes?: string;
}

interface LLVVehicleRecord {
  id: string;
  title: string;
  make?: string;
  model?: string;
  year?: string;
  notes?: string;
}

// ============================================================================
// INTEGRATION SERVICE
// ============================================================================

class LLVIntegrationService {
  private static instance: LLVIntegrationService;
  private mode: AppMode = 'STANDALONE';
  private llvStorageRef: any = null;

  static getInstance(): LLVIntegrationService {
    if (!LLVIntegrationService.instance) {
      LLVIntegrationService.instance = new LLVIntegrationService();
    }
    return LLVIntegrationService.instance;
  }

  /**
   * Initialize the integration layer
   * @param mode - Whether running standalone or embedded in LLV
   * @param llvStorage - Reference to LLV's storage service (when embedded)
   */
  initialize(mode: AppMode, llvStorage?: any): void {
    this.mode = mode;
    this.llvStorageRef = llvStorage || null;
  }

  /**
   * Get current operating mode
   */
  getMode(): AppMode {
    return this.mode;
  }

  /**
   * Check if running in embedded mode within LLV
   */
  isEmbedded(): boolean {
    return this.mode === 'EMBEDDED';
  }

  // ============================================================================
  // ADD-ON LICENSE MANAGEMENT (for embedded mode)
  // ============================================================================

  /**
   * Check if Aftercare add-on is enabled in LLV
   * Uses the same license validation as LPV/LLV
   */
  async isAftercareEnabled(): Promise<boolean> {
    if (this.mode === 'STANDALONE') {
      // In standalone mode, use license service for validation
      const { licenseService } = await import('./licenseService');
      return await licenseService.isLicensed();
    }

    // In embedded mode, check LLV's license store for add-on flag
    // LLV stores add-ons in the same encrypted license file
    try {
      // Try to access LLV's license store
      if (this.llvStorageRef) {
        const llvLicense = this.llvStorageRef.getLocalLicense?.();
        if (llvLicense && llvLicense.addons) {
          return llvLicense.addons.aftercare === true;
        }
      }
      
      // Fallback: check addon state in localStorage
      const addonsState = this.loadAddonsState();
      return addonsState?.aftercareEnabled === true;
    } catch {
      return false;
    }
  }


  /**
   * Save Aftercare license info to LLV's addon state
   */
  saveAftercareLicense(info: LLVAddonsState): void {
    if (this.mode === 'EMBEDDED' && this.llvStorageRef) {
      // Save to LLV's storage
      try {
        this.llvStorageRef.saveAddonsState?.(info);
      } catch (error) {
        console.error('Failed to save addon state to LLV:', error);
      }
    }
    
    // Also save locally as backup
    localStorage.setItem('llv_addons_state', JSON.stringify(info));
  }

  private loadAddonsState(): LLVAddonsState | null {
    const data = localStorage.getItem('llv_addons_state');
    if (!data) return null;
    try {
      return JSON.parse(data) as LLVAddonsState;
    } catch {
      return null;
    }
  }

  // ============================================================================
  // VAULT DATA ACCESS
  // ============================================================================

  /**
   * Load summary of all relevant vault records from LLV
   * Returns non-sensitive high-level data needed to drive tasks
   */
  async loadLegacyVaultSummary(): Promise<LegacyVaultRecord[]> {
    if (this.mode === 'STANDALONE') {
      // In standalone mode, return empty array
      // User will need to manually add data or import
      return this.loadManualRecords();
    }

    // In embedded mode, read from LLV storage
    if (!this.llvStorageRef) {
      console.warn('LLV storage reference not available');
      return [];
    }

    try {
      const records: LegacyVaultRecord[] = [];

      // Load and map insurance records
      const insuranceRecords = await this.loadFromLLV('insurance') as LLVInsuranceRecord[];
      records.push(...this.mapInsuranceRecords(insuranceRecords));

      // Load and map financial records
      const financialRecords = await this.loadFromLLV('financial') as LLVFinancialAsset[];
      records.push(...this.mapFinancialRecords(financialRecords));

      // Load and map digital accounts
      const digitalRecords = await this.loadFromLLV('digitalLife') as LLVDigitalAccount[];
      records.push(...this.mapDigitalRecords(digitalRecords));

      // Load and map properties
      const propertyRecords = await this.loadFromLLV('properties') as LLVPropertyRecord[];
      records.push(...this.mapPropertyRecords(propertyRecords));

      // Load and map vehicles
      const vehicleRecords = await this.loadFromLLV('vehicles') as LLVVehicleRecord[];
      records.push(...this.mapVehicleRecords(vehicleRecords));

      return records;
    } catch (error) {
      console.error('Failed to load vault summary:', error);
      return [];
    }
  }

  private async loadFromLLV(category: string): Promise<any[]> {
    if (!this.llvStorageRef) return [];
    
    try {
      switch (category) {
        case 'insurance':
          return this.llvStorageRef.loadInsuranceRecords?.() || [];
        case 'financial':
          return this.llvStorageRef.loadFinancialAssets?.() || [];
        case 'digitalLife':
          return this.llvStorageRef.loadDigitalLifeRecords?.() || [];
        case 'properties':
          return this.llvStorageRef.loadPropertiesRecords?.() || [];
        case 'vehicles':
          return this.llvStorageRef.loadVehiclesRecords?.() || [];
        default:
          return [];
      }
    } catch {
      return [];
    }
  }

  // ============================================================================
  // DATA MAPPING FUNCTIONS
  // ============================================================================

  private mapInsuranceRecords(records: LLVInsuranceRecord[]): LegacyVaultRecord[] {
    return (records || []).map(record => ({
      id: record.id,
      category: 'INSURANCE' as LegacyVaultCategory,
      subCategory: record.subCategory,
      name: record.title,
      institutionName: record.insuranceCompany,
      policyNumberMasked: this.maskSensitive(record.policyNumber),
      contactPhone: record.agentContact,
      insuranceCompany: record.insuranceCompany,
      agentName: record.agentName,
      agentContact: record.agentContact,
      coverageAmount: record.coverageAmount,
      beneficiaryNames: record.beneficiary ? [record.beneficiary] : undefined,
      notes: record.notes,
    }));
  }

  private mapFinancialRecords(records: LLVFinancialAsset[]): LegacyVaultRecord[] {
    return (records || []).map(record => {
      // Map subcategory to our category types
      let category: LegacyVaultCategory = 'OTHER';
      const subCat = record.subCategory?.toLowerCase() || '';
      
      if (subCat.includes('bank') || subCat.includes('checking') || subCat.includes('savings')) {
        category = 'BANK_ACCOUNT';
      } else if (subCat.includes('credit')) {
        category = 'CREDIT_CARD';
      } else if (subCat.includes('invest') || subCat.includes('brokerage') || subCat.includes('retirement')) {
        category = 'INVESTMENT';
      } else if (subCat.includes('loan') || subCat.includes('mortgage')) {
        category = 'LOAN';
      }

      return {
        id: record.id,
        category,
        subCategory: record.subCategory,
        name: record.title,
        institutionName: record.institution,
        accountNumberMasked: this.maskSensitive(record.accountNumber),
        contactPhone: record.contactInfo,
        notes: record.notes,
      };
    });
  }

  private mapDigitalRecords(records: LLVDigitalAccount[]): LegacyVaultRecord[] {
    return (records || []).map(record => {
      let category: LegacyVaultCategory = 'DIGITAL_ACCOUNT';
      const type = record.accountType?.toLowerCase() || '';
      
      if (type.includes('subscription') || type.includes('streaming')) {
        category = 'SUBSCRIPTION';
      }

      return {
        id: record.id,
        category,
        name: record.title,
        notes: record.notes,
      };
    });
  }

  private mapPropertyRecords(records: LLVPropertyRecord[]): LegacyVaultRecord[] {
    return (records || []).map(record => {
      let category: LegacyVaultCategory = 'PROPERTY';
      const subCat = record.subCategory?.toLowerCase() || '';
      
      if (subCat.includes('utility')) {
        category = 'UTILITY';
      }

      return {
        id: record.id,
        category,
        subCategory: record.subCategory,
        name: record.title,
        addressLine1: record.address,
        notes: record.notes,
      };
    });
  }

  private mapVehicleRecords(records: LLVVehicleRecord[]): LegacyVaultRecord[] {
    return (records || []).map(record => ({
      id: record.id,
      category: 'VEHICLE' as LegacyVaultCategory,
      name: record.title,
      vehicleMake: record.make,
      vehicleModel: record.model,
      vehicleYear: record.year,
      notes: record.notes,
    }));
  }

  /**
   * Mask sensitive information (show only last 4 characters)
   */
  private maskSensitive(value: string | undefined): string | undefined {
    if (!value || value.length < 4) return value;
    const last4 = value.slice(-4);
    return `****${last4}`;
  }

  // ============================================================================
  // MANUAL RECORDS (for standalone mode)
  // ============================================================================

  private loadManualRecords(): LegacyVaultRecord[] {
    const data = localStorage.getItem('aftercare_manual_records');
    if (!data) return [];
    try {
      return JSON.parse(data) as LegacyVaultRecord[];
    } catch {
      return [];
    }
  }

  saveManualRecords(records: LegacyVaultRecord[]): void {
    localStorage.setItem('aftercare_manual_records', JSON.stringify(records));
  }

  addManualRecord(record: LegacyVaultRecord): void {
    const records = this.loadManualRecords();
    records.push(record);
    this.saveManualRecords(records);
  }

  updateManualRecord(record: LegacyVaultRecord): void {
    const records = this.loadManualRecords();
    const index = records.findIndex(r => r.id === record.id);
    if (index >= 0) {
      records[index] = record;
      this.saveManualRecords(records);
    }
  }

  deleteManualRecord(recordId: string): void {
    const records = this.loadManualRecords();
    const filtered = records.filter(r => r.id !== recordId);
    this.saveManualRecords(filtered);
  }
}

export const llvIntegration = LLVIntegrationService.getInstance();

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export function loadLegacyVaultSummary(): Promise<LegacyVaultRecord[]> {
  return llvIntegration.loadLegacyVaultSummary();
}

export async function isAftercareEnabled(): Promise<boolean> {
  return await llvIntegration.isAftercareEnabled();
}

export function saveAftercareLicense(info: LLVAddonsState): void {
  llvIntegration.saveAftercareLicense(info);
}



