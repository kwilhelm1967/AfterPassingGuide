/**
 * Storage Service
 * 
 * Handles encrypted local storage for Local Aftercare Vault.
 * All user data is encrypted using AES-GCM before storage.
 */

import {
  AftercarePlan,
  AftercareProfile,
  AftercareTask,
  UploadedDocument,
  ContactEntry,
  ExecutorChecklistItem,
  AftercareLicense,
  AppState,
} from '../types';
import { encryptData, decryptData, isEncrypted } from '../utils/encryption';
import { getDeviceFingerprint } from '../utils/deviceFingerprint';

// Storage keys
const STORAGE_KEYS = {
  PROFILE: 'aftercare_profile',
  PLAN: 'aftercare_plan',
  DOCUMENTS: 'aftercare_documents',
  CONTACTS: 'aftercare_contacts',
  CHECKLIST: 'aftercare_checklist',
  LICENSE: 'aftercare_license',
  SETTINGS: 'aftercare_settings',
};

// ============================================================================
// STORAGE SERVICE
// ============================================================================

class StorageService {
  private static instance: StorageService;
  private deviceFingerprint: string | null = null;

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Get device fingerprint (cached after first call)
   */
  private async getDeviceFingerprint(): Promise<string> {
    if (!this.deviceFingerprint) {
      this.deviceFingerprint = await getDeviceFingerprint();
    }
    return this.deviceFingerprint;
  }

  /**
   * Encrypt and store data
   */
  private async setEncryptedItem(key: string, data: string): Promise<void> {
    try {
      const fingerprint = await this.getDeviceFingerprint();
      const encrypted = await encryptData(data, fingerprint);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error(`Failed to encrypt data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve and decrypt data
   */
  private async getEncryptedItem(key: string): Promise<string | null> {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;

      // Check if data is encrypted (new format) or plaintext (legacy)
      if (!isEncrypted(encrypted)) {
        // Legacy unencrypted data - return as-is for migration
        return encrypted;
      }

      const fingerprint = await this.getDeviceFingerprint();
      return await decryptData(encrypted, fingerprint);
    } catch (error) {
      console.error(`Failed to decrypt data for key ${key}:`, error);
      // If decryption fails, try returning as plaintext (for migration)
      return localStorage.getItem(key);
    }
  }

  // ============================================================================
  // PROFILE
  // ============================================================================

  async saveProfile(profile: AftercareProfile): Promise<void> {
    try {
      const data = JSON.stringify(profile);
      await this.setEncryptedItem(STORAGE_KEYS.PROFILE, data);
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw new Error('Failed to save profile. Please try again.');
    }
  }

  async loadProfile(): Promise<AftercareProfile | null> {
    try {
      const data = await this.getEncryptedItem(STORAGE_KEYS.PROFILE);
      if (!data) return null;
      return JSON.parse(data) as AftercareProfile;
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Try to recover by returning null (will trigger onboarding)
      return null;
    }
  }

  deleteProfile(): void {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  }

  // ============================================================================
  // PLAN
  // ============================================================================

  async savePlan(plan: AftercarePlan): Promise<void> {
    const data = JSON.stringify(plan);
    await this.setEncryptedItem(STORAGE_KEYS.PLAN, data);
  }

  async loadPlan(): Promise<AftercarePlan | null> {
    const data = await this.getEncryptedItem(STORAGE_KEYS.PLAN);
    if (!data) return null;
    try {
      return JSON.parse(data) as AftercarePlan;
    } catch {
      return null;
    }
  }

  deletePlan(): void {
    localStorage.removeItem(STORAGE_KEYS.PLAN);
  }

  // ============================================================================
  // TASKS (within plan)
  // ============================================================================

  async updateTask(planId: string, task: AftercareTask): Promise<void> {
    const plan = await this.loadPlan();
    if (!plan || plan.id !== planId) return;

    const taskIndex = plan.tasks.findIndex(t => t.id === task.id);
    if (taskIndex >= 0) {
      plan.tasks[taskIndex] = task;
      plan.lastUpdatedAt = new Date().toISOString();
      await this.savePlan(plan);
    }
  }

  // ============================================================================
  // DOCUMENTS
  // ============================================================================

  async saveDocuments(documents: UploadedDocument[]): Promise<void> {
    const data = JSON.stringify(documents);
    await this.setEncryptedItem(STORAGE_KEYS.DOCUMENTS, data);
  }

  async loadDocuments(): Promise<UploadedDocument[]> {
    const data = await this.getEncryptedItem(STORAGE_KEYS.DOCUMENTS);
    if (!data) return [];
    try {
      return JSON.parse(data) as UploadedDocument[];
    } catch {
      return [];
    }
  }

  async addDocument(document: UploadedDocument): Promise<void> {
    const documents = await this.loadDocuments();
    documents.push(document);
    await this.saveDocuments(documents);
  }

  async updateDocument(document: UploadedDocument): Promise<void> {
    const documents = await this.loadDocuments();
    const index = documents.findIndex(d => d.id === document.id);
    if (index >= 0) {
      documents[index] = document;
      await this.saveDocuments(documents);
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    const documents = await this.loadDocuments();
    const filtered = documents.filter(d => d.id !== documentId);
    await this.saveDocuments(filtered);
  }

  // ============================================================================
  // CONTACTS
  // ============================================================================

  async saveContacts(contacts: ContactEntry[]): Promise<void> {
    const data = JSON.stringify(contacts);
    await this.setEncryptedItem(STORAGE_KEYS.CONTACTS, data);
  }

  async loadContacts(): Promise<ContactEntry[]> {
    const data = await this.getEncryptedItem(STORAGE_KEYS.CONTACTS);
    if (!data) return [];
    try {
      return JSON.parse(data) as ContactEntry[];
    } catch {
      return [];
    }
  }

  async updateContact(contact: ContactEntry): Promise<void> {
    const contacts = await this.loadContacts();
    const index = contacts.findIndex(c => c.id === contact.id);
    if (index >= 0) {
      contacts[index] = contact;
      await this.saveContacts(contacts);
    } else {
      contacts.push(contact);
      await this.saveContacts(contacts);
    }
  }

  async deleteContact(contactId: string): Promise<void> {
    const contacts = await this.loadContacts();
    const filtered = contacts.filter(c => c.id !== contactId);
    await this.saveContacts(filtered);
  }

  // ============================================================================
  // EXECUTOR CHECKLIST
  // ============================================================================

  async saveChecklist(checklist: ExecutorChecklistItem[]): Promise<void> {
    const data = JSON.stringify(checklist);
    await this.setEncryptedItem(STORAGE_KEYS.CHECKLIST, data);
  }

  async loadChecklist(): Promise<ExecutorChecklistItem[]> {
    const data = await this.getEncryptedItem(STORAGE_KEYS.CHECKLIST);
    if (!data) return [];
    try {
      return JSON.parse(data) as ExecutorChecklistItem[];
    } catch {
      return [];
    }
  }

  async updateChecklistItem(item: ExecutorChecklistItem): Promise<void> {
    const checklist = await this.loadChecklist();
    const index = checklist.findIndex(i => i.id === item.id);
    if (index >= 0) {
      checklist[index] = item;
      await this.saveChecklist(checklist);
    }
  }

  // ============================================================================
  // LICENSE
  // ============================================================================
  // Note: License data is NOT encrypted as it's needed for offline validation
  // and doesn't contain sensitive user information

  saveLicense(license: AftercareLicense): void {
    localStorage.setItem(STORAGE_KEYS.LICENSE, JSON.stringify(license));
  }

  loadLicense(): AftercareLicense | null {
    const data = localStorage.getItem(STORAGE_KEYS.LICENSE);
    if (!data) return null;
    try {
      return JSON.parse(data) as AftercareLicense;
    } catch {
      return null;
    }
  }

  deleteLicense(): void {
    localStorage.removeItem(STORAGE_KEYS.LICENSE);
  }

  isLicensed(): boolean {
    const license = this.loadLicense();
    return license !== null && !!license.licenseKey;
  }

  // ============================================================================
  // SETTINGS
  // ============================================================================

  async saveSetting(key: string, value: unknown): Promise<void> {
    const settings = await this.loadSettings();
    settings[key] = value;
    const data = JSON.stringify(settings);
    await this.setEncryptedItem(STORAGE_KEYS.SETTINGS, data);
  }

  async loadSettings(): Promise<Record<string, unknown>> {
    const data = await this.getEncryptedItem(STORAGE_KEYS.SETTINGS);
    if (!data) return {};
    try {
      return JSON.parse(data) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    const settings = await this.loadSettings();
    return (settings[key] as T) ?? defaultValue;
  }

  // ============================================================================
  // FULL STATE
  // ============================================================================

  async loadFullState(): Promise<Partial<AppState>> {
    return {
      profile: await this.loadProfile(),
      plan: await this.loadPlan(),
      documents: await this.loadDocuments(),
      contacts: await this.loadContacts(),
      executorChecklist: await this.loadChecklist(),
      isLicensed: this.isLicensed(),
    };
  }

  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // ============================================================================
  // DATA EXISTS CHECK
  // ============================================================================

  async hasExistingData(): Promise<boolean> {
    const profile = await this.loadProfile();
    const plan = await this.loadPlan();
    return profile !== null || plan !== null;
  }
}

export const storageService = StorageService.getInstance();
