/**
 * Storage Service
 * 
 * Handles encrypted local storage for AfterPassing Guide.
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

/** Patch saved plans so task descriptions match current copy (e.g. after content updates). Returns true if any task was updated. */
function patchPlanTaskDescriptions(plan: AftercarePlan): boolean {
  const updates: Record<string, string> = {
    'Review any funeral or cremation plans': "Check whether funeral or cremation wishes were documented. If final wishes were recorded in a Local Legacy Vault, start there. A funeral home can guide you through the next steps when you're ready.",
    'Consider memorial or service details': "Decide whether to plan memorial or service details now or later. If preferences were recorded in a Local Legacy Vault, review them there. A funeral home can offer guidance if and when you want it.",
    'Review mail and messages': "Notice what's arriving by mail or message. You don't need to respond to everything right away. Forwarding mail can help catch anything important.",
    'Check whether any immediate notifications are needed': 'Decide whether any organizations need to be notified right now. Focus only on what feels necessary. If a Local Legacy Vault exists, account or contact information may already be recorded there.',
    'Consider whether to request death certificates': 'Decide whether to request certified copies of the death certificate. Many institutions require them. Funeral homes often help with this. Ordering 10–15 copies is common, and more can be requested later if needed.',
    'Check whether Social Security was notified': 'Confirm whether Social Security was notified. Funeral homes often report this automatically. You can also confirm by calling 1-800-772-1213 and asking about survivor benefits if applicable.',
    'Gather financial and account information': "Gather what you can find. Missing items are okay. If a Local Legacy Vault exists, financial accounts may already be documented there. You're simply becoming aware of what's there.",
    'Review insurance policies and benefits': "Identify any insurance policies or benefits that exist. If a Local Legacy Vault exists, policies may already be recorded there. Claims can be started when you're ready.",
    'Consider whether legal or professional help is needed': "Decide whether professional guidance would be helpful. An estate attorney or accountant can answer questions if and when you want support.",
    'Begin organizing documents in one place': 'Begin gathering documents in one place. A folder or box is enough. If a Local Legacy Vault exists, documents may already be organized there. You can add to or reorganize later.',
    'Review recurring charges and subscriptions': "Review bank and credit statements when you have time. If a Local Legacy Vault exists, subscriptions may already be listed there. Canceling can wait until you're ready.",
    'Consider how to handle digital accounts': "Decide how to handle digital accounts such as email, social media, and online services. If a Local Legacy Vault exists, digital account information may already be recorded there. There's no need to decide right away.",
    'Review ongoing household or property needs': 'Address household or property needs as they come up. If a Local Legacy Vault exists, property details may already be recorded there. Utilities, maintenance, and related matters can be handled gradually.',
    'Check in on open accounts or subscriptions': "Review any accounts or subscriptions that remain active. If a Local Legacy Vault exists, they may already be listed there. Decide what to address next when you're ready.",
    'Consider longer-term decisions': 'Recognize that longer-term decisions do not need to be made now. Matters involving property, belongings, or legal issues can be addressed later, when you feel steadier.',
    'Check status of any pending claims or benefits': "If insurance claims or benefit applications were started, check their status when it's convenient.",
    'Consider tax filing needs when ready': 'Plan to address tax filing needs when the time comes. A tax professional can help with final returns, which are typically handled within the normal tax year.',
    'Take care of yourself': "Grief has no timeline. Support groups, counseling, or quiet time can all help. You've been carrying something difficult.",
    'Review estate or legacy details when ready': 'Review estate or legacy details when you feel ready. If a Local Legacy Vault exists, wishes and important information may already be recorded there. Finalizing matters can happen in their own time.',
    'Update records if needed': 'Update records only if something has changed. Titles, deeds, and beneficiary designations can be addressed when convenient.',
    'Store documents for future reference': 'Store documents in a way that makes them easy to find later. If a Local Legacy Vault exists, documents can be added there. A simple folder or digital backup is also enough.',
    'Consider your own planning when ready': "This experience may prompt reflection on your own plans. There's no pressure to act.",
  };
  let patched = false;
  for (const task of plan.tasks) {
    const newDesc = updates[task.title];
    if (newDesc && task.description !== newDesc) {
      task.description = newDesc;
      patched = true;
    }
  }
  return patched;
}

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
      const plan = JSON.parse(data) as AftercarePlan;
      if (patchPlanTaskDescriptions(plan)) {
        plan.lastUpdatedAt = new Date().toISOString();
        await this.savePlan(plan);
      }
      return plan;
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
