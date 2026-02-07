/**
 * Storage Service
 * 
 * Handles encrypted local storage for AfterPassing Guide.
 * All user data is encrypted using AES-GCM before storage.
 */

import {
  Case,
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
  CASES: 'aftercare_cases',
  ACTIVE_CASE_ID: 'aftercare_active_case_id',
  PLANS_BY_CASE: 'aftercare_plans_by_case',
  PROFILE: 'aftercare_profile', // legacy; migration moves to plan.profile
  PLAN: 'aftercare_plan', // legacy; migration moves to plans_by_case
  DOCUMENTS: 'aftercare_documents',
  CONTACTS: 'aftercare_contacts',
  CHECKLIST: 'aftercare_checklist',
  LICENSE: 'aftercare_license',
  SETTINGS: 'aftercare_settings',
};

const DEFAULT_FIRST_CASE_LABEL = 'My First Case';

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
  // CASES
  // ============================================================================

  async ensureCasesMigrated(): Promise<void> {
    const rawCases = localStorage.getItem(STORAGE_KEYS.CASES);
    let cases: Case[] = rawCases ? (() => { try { return JSON.parse(rawCases); } catch { return []; } })() : [];
    let activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_CASE_ID);

    if (cases.length === 0) {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `case_${Date.now()}`;
      const now = new Date().toISOString();
      cases = [{
        id,
        label: DEFAULT_FIRST_CASE_LABEL,
        notes: '',
        status: 'active',
        createdAt: now,
        updatedAt: now,
      }];
      try {
        await this.setEncryptedItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
      } catch {
        localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
      }
      activeId = id;
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CASE_ID, id);
    }

    if (!activeId && cases.length > 0) {
      activeId = cases[0].id;
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CASE_ID, activeId);
    }

    const defaultCaseId = activeId || cases[0]?.id;
    if (!defaultCaseId) return;

    const plansRaw = await this.getEncryptedItem(STORAGE_KEYS.PLANS_BY_CASE);
    let plansByCase: Record<string, AftercarePlan> = plansRaw ? (() => { try { return JSON.parse(plansRaw); } catch { return {}; } })() : {};

    const legacyPlanRaw = await this.getEncryptedItem(STORAGE_KEYS.PLAN);
    const legacyProfileRaw = await this.getEncryptedItem(STORAGE_KEYS.PROFILE);
    if ((legacyPlanRaw || legacyProfileRaw) && !plansByCase[defaultCaseId]) {
      let plan: AftercarePlan | null = null;
      if (legacyPlanRaw) {
        try {
          plan = JSON.parse(legacyPlanRaw) as AftercarePlan;
          if (!(plan as any).caseId) (plan as any).caseId = defaultCaseId;
        } catch { plan = null; }
      }
      if (!plan && legacyProfileRaw) {
        try {
          const profile = JSON.parse(legacyProfileRaw) as AftercareProfile;
          plan = {
            id: `plan_${Date.now()}`,
            caseId: defaultCaseId,
            profile,
            tasks: [],
            createdAt: new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString(),
          };
        } catch { plan = null; }
      }
      if (plan) {
        plan.caseId = defaultCaseId;
        if (legacyProfileRaw && !plan.profile) {
          try {
            plan.profile = JSON.parse(legacyProfileRaw) as AftercareProfile;
          } catch { /* ignore */ }
        }
        if (patchPlanTaskDescriptions(plan)) plan.lastUpdatedAt = new Date().toISOString();
        plansByCase[defaultCaseId] = plan;
        await this.setEncryptedItem(STORAGE_KEYS.PLANS_BY_CASE, JSON.stringify(plansByCase));
      }
    }

    const docsRaw = await this.getEncryptedItem(STORAGE_KEYS.DOCUMENTS);
    let docs: UploadedDocument[] = docsRaw ? (() => { try { return JSON.parse(docsRaw); } catch { return []; } })() : [];
    let docsDirty = false;
    for (const d of docs) {
      if (!(d as any).caseId) { (d as any).caseId = defaultCaseId; docsDirty = true; }
    }
    if (docsDirty) await this.setEncryptedItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));

    const contactsRaw = await this.getEncryptedItem(STORAGE_KEYS.CONTACTS);
    let contacts: ContactEntry[] = contactsRaw ? (() => { try { return JSON.parse(contactsRaw); } catch { return []; } })() : [];
    let contactsDirty = false;
    for (const c of contacts) {
      if (!(c as any).caseId) { (c as any).caseId = defaultCaseId; contactsDirty = true; }
    }
    if (contactsDirty) await this.setEncryptedItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));

    const checklistRaw = await this.getEncryptedItem(STORAGE_KEYS.CHECKLIST);
    let checklist: ExecutorChecklistItem[] = checklistRaw ? (() => { try { return JSON.parse(checklistRaw); } catch { return []; } })() : [];
    let checklistDirty = false;
    for (const i of checklist) {
      if (!(i as any).caseId) { (i as any).caseId = defaultCaseId; checklistDirty = true; }
    }
    if (checklistDirty) await this.setEncryptedItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(checklist));
  }

  getActiveCaseId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CASE_ID);
  }

  async setActiveCaseId(caseId: string): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CASE_ID, caseId);
  }

  async loadCases(): Promise<Case[]> {
    const data = await this.getEncryptedItem(STORAGE_KEYS.CASES);
    if (!data) return [];
    try {
      return JSON.parse(data) as Case[];
    } catch {
      return [];
    }
  }

  async saveCases(cases: Case[]): Promise<void> {
    await this.setEncryptedItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
  }

  async createCase(label: string, notes?: string): Promise<Case> {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `case_${Date.now()}`;
    const now = new Date().toISOString();
    const c: Case = { id, label, notes: notes || '', status: 'active', createdAt: now, updatedAt: now };
    const cases = await this.loadCases();
    cases.push(c);
    await this.saveCases(cases);
    return c;
  }

  async updateCase(c: Case): Promise<void> {
    const cases = await this.loadCases();
    const i = cases.findIndex(x => x.id === c.id);
    if (i >= 0) {
      cases[i] = { ...c, updatedAt: new Date().toISOString() };
      await this.saveCases(cases);
    }
  }

  async archiveCase(caseId: string): Promise<void> {
    const cases = await this.loadCases();
    const c = cases.find(x => x.id === caseId);
    if (c) {
      c.status = 'archived';
      c.updatedAt = new Date().toISOString();
      await this.saveCases(cases);
    }
  }

  async deleteCasePermanently(caseId: string): Promise<void> {
    const cases = (await this.loadCases()).filter(x => x.id !== caseId);
    await this.saveCases(cases);
    const plansRaw = await this.getEncryptedItem(STORAGE_KEYS.PLANS_BY_CASE);
    const plans: Record<string, AftercarePlan> = plansRaw ? JSON.parse(plansRaw) : {};
    delete plans[caseId];
    await this.setEncryptedItem(STORAGE_KEYS.PLANS_BY_CASE, JSON.stringify(plans));
    const docs = await this.loadAllDocuments();
    const filteredDocs = docs.filter(d => d.caseId !== caseId);
    await this.setEncryptedItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filteredDocs));
    const contacts = await this.loadAllContacts();
    const filteredContacts = contacts.filter(c => c.caseId !== caseId);
    await this.setEncryptedItem(STORAGE_KEYS.CONTACTS, JSON.stringify(filteredContacts));
    const checklist = await this.loadAllChecklist();
    const filteredChecklist = checklist.filter(i => i.caseId !== caseId);
    await this.setEncryptedItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(filteredChecklist));
    if (this.getActiveCaseId() === caseId && cases.length > 0) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CASE_ID, cases[0].id);
    }
  }

  /** Return approximate data counts for a case (for UI: allow delete only when empty). */
  async getCaseDataCounts(caseId: string): Promise<{ tasks: number; documents: number; contacts: number; checklist: number }> {
    const plan = await this.loadPlanForCase(caseId);
    const allDocs = await this.loadAllDocuments();
    const allContacts = await this.loadAllContacts();
    const allChecklist = await this.loadAllChecklist();
    return {
      tasks: plan?.tasks?.length ?? 0,
      documents: allDocs.filter(d => d.caseId === caseId).length,
      contacts: allContacts.filter(c => c.caseId === caseId).length,
      checklist: allChecklist.filter(i => i.caseId === caseId).length,
    };
  }

  /** Clear all content for a case (keeps case record; removes plan, documents, contacts, checklist). */
  async clearCaseContent(caseId: string): Promise<void> {
    const plans = await this.loadPlansByCase();
    delete plans[caseId];
    await this.setEncryptedItem(STORAGE_KEYS.PLANS_BY_CASE, JSON.stringify(plans));
    const docs = await this.loadAllDocuments();
    await this.setEncryptedItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs.filter(d => d.caseId !== caseId)));
    const contacts = await this.loadAllContacts();
    await this.setEncryptedItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts.filter(c => c.caseId !== caseId)));
    const checklist = await this.loadAllChecklist();
    await this.setEncryptedItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(checklist.filter(i => i.caseId !== caseId)));
  }

  // ============================================================================
  // PROFILE (from active case plan)
  // ============================================================================

  async saveProfile(profile: AftercareProfile): Promise<void> {
    const caseId = this.getActiveCaseId();
    if (!caseId) return;
    const plan = await this.loadPlanForCase(caseId);
    if (!plan) return;
    plan.profile = profile;
    plan.lastUpdatedAt = new Date().toISOString();
    await this.savePlanForCase(plan);
  }

  async loadProfile(): Promise<AftercareProfile | null> {
    const caseId = this.getActiveCaseId();
    if (!caseId) return null;
    const plan = await this.loadPlanForCase(caseId);
    return plan?.profile ?? null;
  }

  deleteProfile(): void {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  }

  // ============================================================================
  // PLAN (per case)
  // ============================================================================

  async loadPlansByCase(): Promise<Record<string, AftercarePlan>> {
    const data = await this.getEncryptedItem(STORAGE_KEYS.PLANS_BY_CASE);
    if (!data) return {};
    try {
      return JSON.parse(data) as Record<string, AftercarePlan>;
    } catch {
      return {};
    }
  }

  async loadPlanForCase(caseId: string): Promise<AftercarePlan | null> {
    const plans = await this.loadPlansByCase();
    return plans[caseId] ?? null;
  }

  async savePlanForCase(plan: AftercarePlan): Promise<void> {
    const plans = await this.loadPlansByCase();
    plans[plan.caseId] = plan;
    await this.setEncryptedItem(STORAGE_KEYS.PLANS_BY_CASE, JSON.stringify(plans));
  }

  async savePlan(plan: AftercarePlan): Promise<void> {
    await this.savePlanForCase(plan);
  }

  async loadPlan(): Promise<AftercarePlan | null> {
    const caseId = this.getActiveCaseId();
    if (!caseId) return null;
    const plan = await this.loadPlanForCase(caseId);
    if (!plan) return null;
    if (patchPlanTaskDescriptions(plan)) {
      plan.lastUpdatedAt = new Date().toISOString();
      await this.savePlanForCase(plan);
    }
    return plan;
  }

  async deletePlan(): Promise<void> {
    const caseId = this.getActiveCaseId();
    if (!caseId) return;
    const plans = await this.loadPlansByCase();
    delete plans[caseId];
    await this.setEncryptedItem(STORAGE_KEYS.PLANS_BY_CASE, JSON.stringify(plans));
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
  // DOCUMENTS (case-scoped)
  // ============================================================================

  async loadAllDocuments(): Promise<UploadedDocument[]> {
    const data = await this.getEncryptedItem(STORAGE_KEYS.DOCUMENTS);
    if (!data) return [];
    try {
      const arr = JSON.parse(data) as UploadedDocument[];
      return arr.map(d => ({ ...d, caseId: (d as any).caseId || '' }));
    } catch {
      return [];
    }
  }

  async loadDocuments(): Promise<UploadedDocument[]> {
    const caseId = this.getActiveCaseId();
    if (!caseId) return [];
    const all = await this.loadAllDocuments();
    return all.filter(d => d.caseId === caseId);
  }

  async saveDocuments(documents: UploadedDocument[]): Promise<void> {
    const caseId = this.getActiveCaseId();
    if (!caseId) return;
    const all = await this.loadAllDocuments();
    const others = all.filter(d => d.caseId !== caseId);
    const withCaseId = documents.map(d => ({ ...d, caseId }));
    const data = JSON.stringify([...others, ...withCaseId]);
    await this.setEncryptedItem(STORAGE_KEYS.DOCUMENTS, data);
  }

  async addDocument(document: UploadedDocument): Promise<void> {
    const caseId = this.getActiveCaseId();
    if (!caseId) return;
    const doc = { ...document, caseId };
    const documents = await this.loadDocuments();
    documents.push(doc);
    await this.saveDocuments(documents);
  }

  async updateDocument(document: UploadedDocument): Promise<void> {
    const documents = await this.loadDocuments();
    const index = documents.findIndex(d => d.id === document.id);
    if (index >= 0) {
      documents[index] = { ...document, caseId: document.caseId || this.getActiveCaseId()! };
      await this.saveDocuments(documents);
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    const documents = await this.loadDocuments();
    const filtered = documents.filter(d => d.id !== documentId);
    await this.saveDocuments(filtered);
  }

  // ============================================================================
  // CONTACTS (case-scoped)
  // ============================================================================

  async loadAllContacts(): Promise<ContactEntry[]> {
    const data = await this.getEncryptedItem(STORAGE_KEYS.CONTACTS);
    if (!data) return [];
    try {
      const arr = JSON.parse(data) as ContactEntry[];
      return arr.map(c => ({ ...c, caseId: (c as any).caseId || '' }));
    } catch {
      return [];
    }
  }

  async loadContacts(): Promise<ContactEntry[]> {
    const caseId = this.getActiveCaseId();
    if (!caseId) return [];
    const all = await this.loadAllContacts();
    return all.filter(c => c.caseId === caseId);
  }

  async saveContacts(contacts: ContactEntry[]): Promise<void> {
    const caseId = this.getActiveCaseId();
    if (!caseId) return;
    const all = await this.loadAllContacts();
    const others = all.filter(c => c.caseId !== caseId);
    const withCaseId = contacts.map(c => ({ ...c, caseId }));
    await this.setEncryptedItem(STORAGE_KEYS.CONTACTS, JSON.stringify([...others, ...withCaseId]));
  }

  async updateContact(contact: ContactEntry): Promise<void> {
    const contacts = await this.loadContacts();
    const index = contacts.findIndex(c => c.id === contact.id);
    const caseId = this.getActiveCaseId()!;
    if (index >= 0) {
      contacts[index] = { ...contact, caseId };
      await this.saveContacts(contacts);
    } else {
      contacts.push({ ...contact, caseId });
      await this.saveContacts(contacts);
    }
  }

  async deleteContact(contactId: string): Promise<void> {
    const contacts = await this.loadContacts();
    const filtered = contacts.filter(c => c.id !== contactId);
    await this.saveContacts(filtered);
  }

  // ============================================================================
  // EXECUTOR CHECKLIST (case-scoped)
  // ============================================================================

  async loadAllChecklist(): Promise<ExecutorChecklistItem[]> {
    const data = await this.getEncryptedItem(STORAGE_KEYS.CHECKLIST);
    if (!data) return [];
    try {
      const arr = JSON.parse(data) as ExecutorChecklistItem[];
      return arr.map(i => ({ ...i, caseId: (i as any).caseId || '' }));
    } catch {
      return [];
    }
  }

  async loadChecklist(): Promise<ExecutorChecklistItem[]> {
    const caseId = this.getActiveCaseId();
    if (!caseId) return [];
    const all = await this.loadAllChecklist();
    return all.filter(i => i.caseId === caseId);
  }

  async saveChecklist(checklist: ExecutorChecklistItem[]): Promise<void> {
    const caseId = this.getActiveCaseId();
    if (!caseId) return;
    const all = await this.loadAllChecklist();
    const others = all.filter(i => i.caseId !== caseId);
    const withCaseId = checklist.map(i => ({ ...i, caseId }));
    await this.setEncryptedItem(STORAGE_KEYS.CHECKLIST, JSON.stringify([...others, ...withCaseId]));
  }

  async updateChecklistItem(item: ExecutorChecklistItem): Promise<void> {
    const checklist = await this.loadChecklist();
    const index = checklist.findIndex(i => i.id === item.id);
    const caseId = this.getActiveCaseId()!;
    if (index >= 0) {
      checklist[index] = { ...item, caseId };
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
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CASE_ID);
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
