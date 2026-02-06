/**
 * Executor Service
 * 
 * Provides executor-specific tools for estate administration.
 * Designed for people actively administering an estate.
 * 
 * IMPORTANT: This provides administrative guidance only.
 * For legal advice, users should consult appropriate professionals.
 */

import {
  ExecutorChecklistItem,
  ExecutorChecklistCategory,
  ContactEntry,
  ContactType,
  ContactRole,
  LegacyVaultRecord,
} from '../types';

// ============================================================================
// EXECUTOR CHECKLIST SEED DATA (10 phases, spec order)
// ============================================================================

const NEW_CATEGORIES: ExecutorChecklistCategory[] = [
  'IMMEDIATE_LEGAL_DOCUMENTS',
  'COURT_AND_PROBATE',
  'FINANCIAL_ACCOUNTS',
  'DEBTS_OBLIGATIONS',
  'PROPERTY_REAL_ESTATE',
  'TAXES_GOVERNMENT',
  'BENEFICIARIES_DISTRIBUTIONS',
  'BUSINESS_INTERESTS',
  'DIGITAL_ASSETS',
  'FINAL_CLOSEOUT',
];

interface ChecklistItemSeed {
  category: ExecutorChecklistCategory;
  title: string;
  description: string;
  whyItMatters?: string;
  whatYouMayNeed?: string[];
}

const EXECUTOR_CHECKLIST_SEED: ChecklistItemSeed[] = [
  // -------------------------------------------------------------------------
  // Immediate Legal Documents
  // -------------------------------------------------------------------------
  {
    category: 'IMMEDIATE_LEGAL_DOCUMENTS',
    title: 'Obtain certified copies of death certificate',
    description: 'Request multiple certified copies from the funeral home or vital records. Most institutions require originals.',
    whatYouMayNeed: ['Funeral home or vital records contact', 'ID', 'Proof of relationship or executor status'],
  },
  {
    category: 'IMMEDIATE_LEGAL_DOCUMENTS',
    title: 'Locate the original will',
    description: 'Locate the original will. Check safe deposit boxes, home safe, filing cabinets, or with the drafting attorney.',
    whatYouMayNeed: ['Safe deposit key or access', 'Attorney contact if applicable'],
  },
  {
    category: 'IMMEDIATE_LEGAL_DOCUMENTS',
    title: 'Locate trust documents if applicable',
    description: 'Find all trust documents and any amendments. Trust assets may be administered outside of probate.',
    whatYouMayNeed: ['Trust agreement', 'Amendments', 'Trustee contact'],
  },
  {
    category: 'IMMEDIATE_LEGAL_DOCUMENTS',
    title: 'Locate Social Security card and birth certificate',
    description: 'Needed for government notifications and benefit claims.',
    whatYouMayNeed: ['Social Security number', 'Birth certificate (certified copy if possible)'],
  },
  {
    category: 'IMMEDIATE_LEGAL_DOCUMENTS',
    title: 'Find military discharge papers (DD-214) if veteran',
    description: 'Often required for VA benefits, burial benefits, and headstone requests.',
    whatYouMayNeed: ['DD-214 or equivalent', 'VA claim number if applicable'],
  },
  {
    category: 'IMMEDIATE_LEGAL_DOCUMENTS',
    title: 'Locate marriage certificate if applicable',
    description: 'May be required for survivor benefits and account transfers.',
    whatYouMayNeed: ['Certified marriage certificate'],
  },

  // -------------------------------------------------------------------------
  // Court and Probate Filings
  // -------------------------------------------------------------------------
  {
    category: 'COURT_AND_PROBATE',
    title: 'File petition to open probate',
    description: 'File the required petition with the probate court to begin the formal process where applicable.',
    whatYouMayNeed: ['Death certificate', 'Original will', 'Petition forms', 'Filing fee'],
  },
  {
    category: 'COURT_AND_PROBATE',
    title: 'Obtain Letters Testamentary / Letters of Administration',
    description: 'Court-issued documents that prove your authority to act on behalf of the estate.',
    whatYouMayNeed: ['Court order', 'ID', 'Multiple certified copies for institutions'],
  },
  {
    category: 'COURT_AND_PROBATE',
    title: 'Publish required legal notices',
    description: 'Many jurisdictions require publishing notice to creditors in a newspaper. Your attorney or the court can advise.',
    whatYouMayNeed: ['Court requirements', 'Newspaper contact', 'Proof of publication'],
  },
  {
    category: 'COURT_AND_PROBATE',
    title: 'Attend probate hearings if required',
    description: 'The court may set hearings for approval of accounts, distributions, or other matters.',
    whatYouMayNeed: ['Hearing notices', 'Required filings', 'Attorney if retained'],
  },

  // -------------------------------------------------------------------------
  // Financial Accounts and Assets
  // -------------------------------------------------------------------------
  {
    category: 'FINANCIAL_ACCOUNTS',
    title: 'Open estate bank account',
    description: 'A dedicated account for estate funds keeps records clear and separates estate activity from personal.',
    whatYouMayNeed: ['Letters Testamentary or equivalent', 'EIN if obtained', 'ID'],
  },
  {
    category: 'FINANCIAL_ACCOUNTS',
    title: 'Transfer funds into estate account',
    description: 'Move estate funds from the decedent’s accounts into the estate account as allowed by each institution.',
    whatYouMayNeed: ['Death certificate', 'Letters Testamentary', 'Account statements'],
  },
  {
    category: 'FINANCIAL_ACCOUNTS',
    title: 'Freeze or retitle accounts',
    description: 'Work with each institution to freeze accounts or retitle them in the estate’s name as appropriate.',
    whatYouMayNeed: ['Death certificate', 'Letters Testamentary', 'Institution contact'],
  },
  {
    category: 'FINANCIAL_ACCOUNTS',
    title: 'Close individual accounts after settlement',
    description: 'After debts and distributions are handled, close the decedent’s accounts per institution procedures.',
    whatYouMayNeed: ['Final statements', 'Closing forms', 'Proof of authority'],
  },

  // -------------------------------------------------------------------------
  // Debts and Ongoing Obligations
  // -------------------------------------------------------------------------
  {
    category: 'DEBTS_OBLIGATIONS',
    title: 'Identify outstanding debts',
    description: 'Compile a list of known debts: mortgages, loans, credit cards, medical bills, utilities, and other obligations.',
    whatYouMayNeed: ['Mail', 'Statements', 'Online account access', 'Estate inventory'],
  },
  {
    category: 'DEBTS_OBLIGATIONS',
    title: 'Notify creditors',
    description: 'Send notice of death to known creditors. Follow your state’s rules for creditor claims and deadlines.',
    whatYouMayNeed: ['Death certificate', 'Creditor addresses', 'Proof of mailing'],
  },
  {
    category: 'DEBTS_OBLIGATIONS',
    title: 'Validate claims',
    description: 'Review creditor claims for validity and timing. Reject or dispute invalid or time-barred claims as advised.',
    whatYouMayNeed: ['Claim forms', 'State law on claim periods', 'Attorney or advisor'],
  },
  {
    category: 'DEBTS_OBLIGATIONS',
    title: 'Pay approved claims in correct order',
    description: 'State law sets the order in which claims must be paid. Pay in that order to protect yourself and the estate.',
    whatYouMayNeed: ['Priority list per state', 'Estate account', 'Receipts'],
  },

  // -------------------------------------------------------------------------
  // Property and Real Estate
  // -------------------------------------------------------------------------
  {
    category: 'PROPERTY_REAL_ESTATE',
    title: 'Secure real property',
    description: 'Ensure properties are locked, insured, and maintained. Change locks if keys are unaccounted for.',
    whatYouMayNeed: ['Keys', 'Insurance info', 'Property address list'],
  },
  {
    category: 'PROPERTY_REAL_ESTATE',
    title: 'Maintain insurance coverage',
    description: 'Keep homeowners, liability, and other relevant insurance in force while the estate is open.',
    whatYouMayNeed: ['Policy numbers', 'Agent contact', 'Payment records'],
  },
  {
    category: 'PROPERTY_REAL_ESTATE',
    title: 'Arrange appraisals',
    description: 'Obtain appraisals when needed for distribution, sale, or tax reporting.',
    whatYouMayNeed: ['Licensed appraiser', 'Access to property', 'Purpose of appraisal'],
  },
  {
    category: 'PROPERTY_REAL_ESTATE',
    title: 'Prepare property for sale or transfer',
    description: 'When selling or transferring property, complete required disclosures and follow local and contract requirements.',
    whatYouMayNeed: ['Deed', 'Title report', 'Realtor or attorney as needed'],
  },

  // -------------------------------------------------------------------------
  // Taxes and Government Filings
  // -------------------------------------------------------------------------
  {
    category: 'TAXES_GOVERNMENT',
    title: 'File final personal income tax return',
    description: 'The decedent’s final Form 1040 is typically due by the usual deadline for the year of death.',
    whatYouMayNeed: ['W-2s', '1099s', 'Prior returns', 'CPA or preparer'],
  },
  {
    category: 'TAXES_GOVERNMENT',
    title: 'File estate income tax return (if required)',
    description: 'Form 1041 may be required if the estate has income. A tax professional can determine filing requirements.',
    whatYouMayNeed: ['EIN', 'Income records', 'CPA or tax attorney'],
  },
  {
    category: 'TAXES_GOVERNMENT',
    title: 'Pay estate taxes if applicable',
    description: 'Federal or state estate tax may apply in some cases. Deadlines and forms vary.',
    whatYouMayNeed: ['Valuations', 'Estate tax forms', 'Tax advisor'],
  },
  {
    category: 'TAXES_GOVERNMENT',
    title: 'Obtain tax clearance if required',
    description: 'Some states require a tax clearance or consent before closing the estate or distributing assets.',
    whatYouMayNeed: ['State requirements', 'Filed returns', 'Clearance application'],
  },

  // -------------------------------------------------------------------------
  // Beneficiaries and Distributions
  // -------------------------------------------------------------------------
  {
    category: 'BENEFICIARIES_DISTRIBUTIONS',
    title: 'Verify beneficiary designations',
    description: 'Confirm beneficiaries on retirement accounts, life insurance, and other non-probate assets.',
    whatYouMayNeed: ['Account statements', 'Beneficiary forms', 'Institution contact'],
  },
  {
    category: 'BENEFICIARIES_DISTRIBUTIONS',
    title: 'Distribute assets per will or trust',
    description: 'After debts and expenses are paid and any waiting period has passed, distribute according to the will or trust.',
    whatYouMayNeed: ['Will or trust', 'Accounting', 'Receipts or releases if required'],
  },
  {
    category: 'BENEFICIARIES_DISTRIBUTIONS',
    title: 'Obtain receipts/releases from beneficiaries',
    description: 'Document distributions and, where required, obtain receipts or releases from beneficiaries.',
    whatYouMayNeed: ['Distribution records', 'Release forms', 'Attorney guidance'],
  },

  // -------------------------------------------------------------------------
  // Business Interests (if applicable)
  // -------------------------------------------------------------------------
  {
    category: 'BUSINESS_INTERESTS',
    title: 'Identify business interests',
    description: 'List any sole proprietorships, partnerships, LLCs, or corporate interests and locate governing documents.',
    whatYouMayNeed: ['Operating agreements', 'Partnership agreements', 'Stock certificates'],
  },
  {
    category: 'BUSINESS_INTERESTS',
    title: 'Notify business partners or co-owners',
    description: 'Inform other owners and key personnel. Review agreements for buy-sell or succession provisions.',
    whatYouMayNeed: ['Agreements', 'Contact list', 'Attorney or CPA'],
  },
  {
    category: 'BUSINESS_INTERESTS',
    title: 'Maintain or wind down operations',
    description: 'Depending on the business and documents, you may maintain operations, sell, or wind down. Professional advice is often needed.',
    whatYouMayNeed: ['Governing documents', 'Valuation', 'Attorney and CPA'],
  },

  // -------------------------------------------------------------------------
  // Digital Assets and Accounts
  // -------------------------------------------------------------------------
  {
    category: 'DIGITAL_ASSETS',
    title: 'Inventory digital assets',
    description: 'List online accounts, subscriptions, cryptocurrency, domain names, and important digital files.',
    whatYouMayNeed: ['Password manager or list', 'Email access', 'Device access'],
  },
  {
    category: 'DIGITAL_ASSETS',
    title: 'Close or transfer online accounts',
    description: 'Follow each platform’s process for memorialization, closure, or transfer. Requirements vary.',
    whatYouMayNeed: ['Death certificate', 'Proof of authority', 'Account policies'],
  },
  {
    category: 'DIGITAL_ASSETS',
    title: 'Preserve records as needed',
    description: 'Download or export important emails, files, and records before closing accounts if needed for the estate.',
    whatYouMayNeed: ['Access', 'Storage', 'Backup method'],
  },

  // -------------------------------------------------------------------------
  // Final Close-Out Tasks
  // -------------------------------------------------------------------------
  {
    category: 'FINAL_CLOSEOUT',
    title: 'Provide final accounting',
    description: 'Prepare an accounting of assets, income, expenses, and distributions for the court or beneficiaries as required.',
    whatYouMayNeed: ['Bank statements', 'Receipts', 'Distribution records'],
  },
  {
    category: 'FINAL_CLOSEOUT',
    title: 'Close estate account',
    description: 'After all distributions and expenses are paid, close the estate bank account and retain final statements.',
    whatYouMayNeed: ['Final statements', 'Zero balance', 'Bank closing forms'],
  },
  {
    category: 'FINAL_CLOSEOUT',
    title: 'Retain records for required period',
    description: 'Keep estate records for the period required by your state and for tax purposes.',
    whatYouMayNeed: ['State retention rules', 'Organized files', 'Secure storage'],
  },
];

// ============================================================================
// CHECKLIST FUNCTIONS
// ============================================================================

function generateId(): string {
  return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate the initial executor checklist (new 10-phase structure).
 */
export function generateExecutorChecklist(): ExecutorChecklistItem[] {
  return EXECUTOR_CHECKLIST_SEED.map((seed): ExecutorChecklistItem => ({
    id: generateId(),
    category: seed.category,
    title: seed.title,
    description: seed.description,
    whyItMatters: seed.whyItMatters,
    whatYouMayNeed: seed.whatYouMayNeed,
    status: 'PENDING',
  }));
}

/**
 * Returns true if the checklist uses legacy categories. Caller can replace with generateExecutorChecklist().
 */
export function hasLegacyChecklistCategories(checklist: ExecutorChecklistItem[]): boolean {
  const legacy: ExecutorChecklistCategory[] = ['DOCUMENTS', 'COMMUNICATION', 'ASSET_TRACKING', 'RECORD_KEEPING', 'FOLLOW_UP'];
  return checklist.some(item => legacy.includes(item.category));
}

/**
 * Get checklist items by category
 */
export function getChecklistByCategory(
  checklist: ExecutorChecklistItem[],
  category: ExecutorChecklistCategory
): ExecutorChecklistItem[] {
  return checklist.filter(item => item.category === category);
}

/**
 * Calculate checklist progress (for internal use; UI does not emphasize counts).
 */
export function getChecklistProgress(checklist: ExecutorChecklistItem[]): {
  total: number;
  completed: number;
  percentage: number;
  byCategory: Record<string, { total: number; completed: number }>;
} {
  const total = checklist.length;
  const completed = checklist.filter(item => item.status === 'DONE' || item.status === 'NOT_APPLICABLE').length;

  const byCategory: Record<string, { total: number; completed: number }> = {};
  for (const cat of NEW_CATEGORIES) {
    const catItems = checklist.filter(item => item.category === cat);
    byCategory[cat] = {
      total: catItems.length,
      completed: catItems.filter(item => item.status === 'DONE' || item.status === 'NOT_APPLICABLE').length,
    };
  }
  
  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    byCategory,
  };
}

/**
 * Get category display information (10 executor phases + legacy for migration).
 */
export function getChecklistCategoryInfo(category: ExecutorChecklistCategory): {
  label: string;
  description: string;
  icon: string;
} {
  const info: Record<string, { label: string; description: string; icon: string }> = {
    IMMEDIATE_LEGAL_DOCUMENTS: {
      label: 'Immediate Legal Documents',
      description: 'Essential documents to locate and obtain early.',
      icon: 'FileText',
    },
    COURT_AND_PROBATE: {
      label: 'Court and Probate Filings',
      description: 'Court filings and authority to act for the estate.',
      icon: 'Scale',
    },
    FINANCIAL_ACCOUNTS: {
      label: 'Financial Accounts and Assets',
      description: 'Estate accounts, transfers, and account closure.',
      icon: 'Landmark',
    },
    DEBTS_OBLIGATIONS: {
      label: 'Debts and Ongoing Obligations',
      description: 'Identifying, notifying, and paying creditors.',
      icon: 'FileCheck',
    },
    PROPERTY_REAL_ESTATE: {
      label: 'Property and Real Estate',
      description: 'Securing, insuring, and disposing of real property.',
      icon: 'Home',
    },
    TAXES_GOVERNMENT: {
      label: 'Taxes and Government Filings',
      description: 'Final and estate tax returns and clearances.',
      icon: 'Receipt',
    },
    BENEFICIARIES_DISTRIBUTIONS: {
      label: 'Beneficiaries and Distributions',
      description: 'Verifying designations and making distributions.',
      icon: 'Users',
    },
    BUSINESS_INTERESTS: {
      label: 'Business Interests (if applicable)',
      description: 'Identifying and handling business interests.',
      icon: 'Briefcase',
    },
    DIGITAL_ASSETS: {
      label: 'Digital Assets and Accounts',
      description: 'Inventorying and closing or transferring digital assets.',
      icon: 'Smartphone',
    },
    FINAL_CLOSEOUT: {
      label: 'Final Close-Out Tasks',
      description: 'Accounting, closing the estate account, and retaining records.',
      icon: 'Archive',
    },
    // Legacy
    DOCUMENTS: { label: 'Documents', description: 'Gathering and organizing important documents', icon: 'FileText' },
    COMMUNICATION: { label: 'Communication', description: 'Notifying institutions and individuals', icon: 'MessageSquare' },
    ASSET_TRACKING: { label: 'Asset Tracking', description: 'Inventorying and documenting assets', icon: 'ClipboardList' },
    RECORD_KEEPING: { label: 'Record Keeping', description: 'Maintaining organized records', icon: 'FolderOpen' },
    FOLLOW_UP: { label: 'Follow Up', description: 'Ongoing monitoring and follow-up tasks', icon: 'Clock' },
  };
  return info[category] ?? { label: category, description: '', icon: 'Circle' };
}

/** Display order for executor checklist sections. */
export function getExecutorChecklistCategoryOrder(): ExecutorChecklistCategory[] {
  return [...NEW_CATEGORIES];
}

// ============================================================================
// CONTACT WORKBOOK FUNCTIONS
// ============================================================================

export function generateContactsFromVault(records: LegacyVaultRecord[]): ContactEntry[] {
  const contacts: ContactEntry[] = [];
  const seenInstitutions = new Set<string>();
  
  for (const record of records) {
    const institutionKey = (record.institutionName || record.name).toLowerCase().trim();
    
    if (seenInstitutions.has(institutionKey)) {
      const existing = contacts.find(c => c.name.toLowerCase().trim() === institutionKey);
      if (existing?.relatedVaultRecordIds) {
        existing.relatedVaultRecordIds.push(record.id);
      }
      continue;
    }
    
    seenInstitutions.add(institutionKey);
    const contactType = mapVaultCategoryToContactType(record.category);
    
    contacts.push({
      id: generateId(),
      type: contactType,
      name: record.institutionName || record.name,
      phone: record.contactPhone,
      email: record.contactEmail,
      website: record.contactWebsite,
      relatedVaultRecordIds: [record.id],
      contactStatus: 'NOT_CONTACTED',
      source: 'vault',
    });
  }
  
  return contacts;
}

function mapVaultCategoryToContactType(category: string): ContactType {
  const mapping: Record<string, ContactType> = {
    BANK_ACCOUNT: 'BANK',
    CREDIT_CARD: 'BANK',
    INVESTMENT: 'BANK',
    INSURANCE: 'INSURANCE',
    EMPLOYMENT: 'EMPLOYER',
    UTILITY: 'UTILITY',
    SUBSCRIPTION: 'SUBSCRIPTION',
    LOAN: 'BANK',
  };
  return mapping[category] ?? 'OTHER';
}

export function getContactsByType(contacts: ContactEntry[], type: ContactType): ContactEntry[] {
  return contacts.filter(c => c.type === type);
}

export function getContactTypeInfo(type: ContactType): { label: string; icon: string; color: string } {
  const info: Record<ContactType, { label: string; icon: string; color: string }> = {
    BANK: { label: 'Banks and Financial', icon: 'Building2', color: '#10b981' },
    INSURANCE: { label: 'Insurance', icon: 'Shield', color: '#3b82f6' },
    EMPLOYER: { label: 'Employers', icon: 'Briefcase', color: '#8b5cf6' },
    UTILITY: { label: 'Utilities', icon: 'Lightbulb', color: '#C9AE66' },
    SUBSCRIPTION: { label: 'Subscriptions', icon: 'RefreshCcw', color: '#06b6d4' },
    ADVISOR: { label: 'Advisors', icon: 'Users', color: '#ec4899' },
    ATTORNEY: { label: 'Attorneys', icon: 'Scale', color: '#6366f1' },
    ACCOUNTANT: { label: 'Accountants', icon: 'Calculator', color: '#84cc16' },
    GOVERNMENT: { label: 'Government', icon: 'Landmark', color: '#64748b' },
    OTHER: { label: 'Other', icon: 'MoreHorizontal', color: '#94a3b8' },
  };
  return info[type];
}

/** Role labels for manual contact entry. */
export const CONTACT_ROLES: { value: ContactRole; label: string }[] = [
  { value: 'EXECUTOR', label: 'Executor' },
  { value: 'ATTORNEY', label: 'Attorney' },
  { value: 'FUNERAL_HOME', label: 'Funeral home' },
  { value: 'BANK', label: 'Bank' },
  { value: 'EMPLOYER', label: 'Employer' },
  { value: 'FAMILY', label: 'Family' },
  { value: 'OTHER', label: 'Other' },
];

export function getContactRoleInfo(role: ContactRole): { label: string; color: string } {
  const info: Record<ContactRole, { label: string; color: string }> = {
    EXECUTOR: { label: 'Executor', color: '#C9AE66' },
    ATTORNEY: { label: 'Attorney', color: '#6366f1' },
    FUNERAL_HOME: { label: 'Funeral home', color: '#64748b' },
    BANK: { label: 'Bank', color: '#10b981' },
    EMPLOYER: { label: 'Employer', color: '#8b5cf6' },
    FAMILY: { label: 'Family', color: '#ec4899' },
    OTHER: { label: 'Other', color: '#94a3b8' },
  };
  return info[role];
}

/** Create a new manual contact. */
export function createManualContact(overrides: Partial<ContactEntry> = {}): ContactEntry {
  return {
    id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'OTHER',
    name: '',
    source: 'manual',
    ...overrides,
  };
}

/** Display label for a contact (role for manual, type for vault-imported). */
export function getContactDisplayLabel(contact: ContactEntry): string {
  if (contact.role) return getContactRoleInfo(contact.role).label;
  return getContactTypeInfo(contact.type).label;
}

/** Display color for a contact. */
export function getContactDisplayColor(contact: ContactEntry): string {
  if (contact.role) return getContactRoleInfo(contact.role).color;
  return getContactTypeInfo(contact.type).color;
}

export function getContactStatusInfo(status: string): { label: string; color: string } {
  switch (status) {
    case 'NOT_CONTACTED':
      return { label: 'Not Contacted', color: '#94a3b8' };
    case 'IN_PROGRESS':
      return { label: 'In Progress', color: '#C9AE66' };
    case 'COMPLETED':
      return { label: 'Completed', color: '#10b981' };
    default:
      return { label: status, color: '#64748b' };
  }
}

export function getContactProgress(contacts: ContactEntry[]): {
  total: number;
  contacted: number;
  inProgress: number;
  percentage: number;
} {
  const total = contacts.length;
  const contacted = contacts.filter(c => c.contactStatus === 'COMPLETED').length;
  const inProgress = contacts.filter(c => c.contactStatus === 'IN_PROGRESS').length;
  return {
    total,
    contacted,
    inProgress,
    percentage: total > 0 ? Math.round((contacted / total) * 100) : 0,
  };
}
