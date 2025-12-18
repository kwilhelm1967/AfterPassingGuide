/**
 * Executor Service
 * 
 * Provides executor-specific tools for estate administration.
 * Included in Local Aftercare Vault.
 * 
 * IMPORTANT: This provides administrative guidance only.
 * For legal advice, users should consult appropriate professionals.
 */

import {
  ExecutorChecklistItem,
  ExecutorChecklistCategory,
  ContactEntry,
  ContactType,
  LegacyVaultRecord,
} from '../types';

// ============================================================================
// EXECUTOR CHECKLIST SEED DATA
// ============================================================================

interface ChecklistItemSeed {
  category: ExecutorChecklistCategory;
  title: string;
  description: string;
}

const EXECUTOR_CHECKLIST_SEED: ChecklistItemSeed[] = [
  // ============================================================================
  // IMMEDIATE PRIORITIES (First 48-72 Hours)
  // ============================================================================
  {
    category: 'DOCUMENTS',
    title: 'Obtain certified copies of death certificate',
    description: 'Request 10-15 certified copies from funeral home or vital records. Most institutions ask for originals, not photocopies.',
  },
  {
    category: 'DOCUMENTS',
    title: 'Locate the original will',
    description: 'Check safe deposit boxes, home safe, filing cabinets, or with attorneys. Original may be needed for probate.',
  },
  {
    category: 'DOCUMENTS',
    title: 'Locate trust documents if applicable',
    description: 'Find all trust documents including any amendments. Trusts may allow you to avoid probate for certain assets.',
  },
  {
    category: 'DOCUMENTS',
    title: 'Locate Social Security card and birth certificate',
    description: 'Needed for government notifications and benefit claims.',
  },
  {
    category: 'DOCUMENTS',
    title: 'Find military discharge papers (DD-214) if veteran',
    description: 'Commonly requested for VA benefits, burial benefits, and headstone requests.',
  },
  {
    category: 'DOCUMENTS',
    title: 'Locate marriage certificate if applicable',
    description: 'May be needed for survivor benefits and account transfers.',
  },

  // ============================================================================
  // DOCUMENTS TO GATHER
  // ============================================================================
  {
    category: 'DOCUMENTS',
    title: 'Gather financial account statements',
    description: 'Collect recent statements from all bank, investment, and retirement accounts.',
  },
  {
    category: 'DOCUMENTS',
    title: 'Locate insurance policies',
    description: 'Gather life, health, auto, home, and any other insurance policies.',
  },
  {
    category: 'DOCUMENTS',
    title: 'Find property deeds and titles',
    description: 'Locate deeds for real property and titles for vehicles, boats, etc.',
  },
  {
    category: 'DOCUMENTS',
    title: 'Collect tax returns from last 3-5 years',
    description: 'These reveal income sources, deductions, and may be needed for final returns.',
  },
  {
    category: 'DOCUMENTS',
    title: 'Locate loan documents and mortgage papers',
    description: 'Find documentation for mortgages, car loans, personal loans, and lines of credit.',
  },
  {
    category: 'DOCUMENTS',
    title: 'Find business documents if applicable',
    description: 'Locate partnership agreements, corporate documents, or business ownership records.',
  },

  // ============================================================================
  // NOTIFICATIONS - CRITICAL
  // ============================================================================
  {
    category: 'COMMUNICATION',
    title: 'Coordinate with funeral home',
    description: 'Confirm arrangements, costs, and any documents the funeral home needs from you.',
  },
  {
    category: 'COMMUNICATION',
    title: 'Place obituary if desired',
    description: 'Work with funeral home or newspapers. Include service details and memorial donation info.',
  },
  {
    category: 'COMMUNICATION',
    title: 'Notify immediate family and close friends',
    description: 'Ensure loved ones are informed. Consider delegating some calls to a trusted friend.',
  },
  {
    category: 'COMMUNICATION',
    title: 'Notify employer if applicable',
    description: 'Contact HR about final pay, unused vacation, life insurance, retirement benefits, and COBRA.',
  },
  {
    category: 'COMMUNICATION',
    title: 'Notify Social Security Administration',
    description: 'Call 1-800-772-1213. Ask about stopping benefits and survivor benefit eligibility.',
  },
  {
    category: 'COMMUNICATION',
    title: 'Notify the three credit bureaus',
    description: 'Contact Equifax, Experian, and TransUnion to place deceased alert and prevent identity fraud.',
  },
  {
    category: 'COMMUNICATION',
    title: 'Notify Veterans Affairs if veteran',
    description: 'Call 1-800-827-1000 to inquire about burial benefits, headstone, and survivor benefits.',
  },
  {
    category: 'COMMUNICATION',
    title: 'Notify financial institutions',
    description: 'Contact all banks, credit cards, investment firms, and brokerages.',
  },
  {
    category: 'COMMUNICATION',
    title: 'Notify insurance companies',
    description: 'Consider starting life insurance claims and notifying health, auto, and property insurers when ready.',
  },
  {
    category: 'COMMUNICATION',
    title: 'Request student loan discharge',
    description: 'Federal loans: Call 1-800-557-7394. Private loans: Contact each lender. Loans are discharged, not transferred to family.',
  },
  {
    category: 'COMMUNICATION',
    title: 'Notify pension and retirement administrators',
    description: 'Contact 401(k) providers, pension plans, and IRA custodians about beneficiary claims.',
  },
  {
    category: 'COMMUNICATION',
    title: 'Notify utilities and service providers',
    description: 'Transfer or cancel electric, gas, water, internet, phone, and cable services.',
  },
  {
    category: 'COMMUNICATION',
    title: 'Notify DMV to cancel driver\'s license',
    description: 'Prevents identity fraud. May be done by mail with death certificate.',
  },
  {
    category: 'COMMUNICATION',
    title: 'Notify post office to forward mail',
    description: 'Forward mail to executor address to catch bills and account notices.',
  },

  // ============================================================================
  // ASSET INVENTORY
  // ============================================================================
  {
    category: 'ASSET_TRACKING',
    title: 'Create inventory of bank accounts',
    description: 'List all accounts with institution, account number, type, and approximate balance.',
  },
  {
    category: 'ASSET_TRACKING',
    title: 'Create inventory of investment accounts',
    description: 'List brokerage accounts, IRAs, 401(k)s, annuities, and other investments.',
  },
  {
    category: 'ASSET_TRACKING',
    title: 'Create inventory of real property',
    description: 'List all real estate with address, estimated value, mortgage balance, and how titled.',
  },
  {
    category: 'ASSET_TRACKING',
    title: 'Create inventory of vehicles',
    description: 'List all vehicles with make, model, year, VIN, value, and loan balance.',
  },
  {
    category: 'ASSET_TRACKING',
    title: 'Create inventory of valuable personal property',
    description: 'Document jewelry, art, antiques, collectibles, and other valuable items with estimated values.',
  },
  {
    category: 'ASSET_TRACKING',
    title: 'Inventory digital assets',
    description: 'List online accounts, digital subscriptions, cryptocurrency, domain names, and digital files.',
  },
  {
    category: 'ASSET_TRACKING',
    title: 'Access and inventory safe deposit box',
    description: 'Schedule bank appointment to access box. Bring death certificate and executor documents.',
  },
  {
    category: 'ASSET_TRACKING',
    title: 'Identify all debts and liabilities',
    description: 'List mortgages, loans, credit cards, medical bills, and any other obligations.',
  },
  {
    category: 'ASSET_TRACKING',
    title: 'Review life insurance beneficiary designations',
    description: 'Confirm beneficiaries and gather policy information for claim filing.',
  },

  // ============================================================================
  // LEGAL/PROBATE
  // ============================================================================
  {
    category: 'RECORD_KEEPING',
    title: 'Consult with estate attorney if needed',
    description: 'Many families choose to consult an attorney to understand whether probate applies and what the executor role involves.',
  },
  {
    category: 'RECORD_KEEPING',
    title: 'Consider filing will with probate court',
    description: 'Some states expect the will to be filed with the court, even if full probate is not needed. An attorney can advise.',
  },
  {
    category: 'RECORD_KEEPING',
    title: 'Apply for Letters Testamentary if needed',
    description: 'Court document proving your authority to act on behalf of the estate.',
  },
  {
    category: 'RECORD_KEEPING',
    title: 'Open estate checking account',
    description: 'Use for receiving estate income and paying estate expenses. Keeps records clean.',
  },
  {
    category: 'RECORD_KEEPING',
    title: 'Set up organized filing system',
    description: 'Create folders for: correspondence, financial statements, bills paid, legal documents, tax documents.',
  },
  {
    category: 'RECORD_KEEPING',
    title: 'Track all expenses paid from estate',
    description: 'Keep receipts for funeral, attorney fees, accounting, property maintenance, etc.',
  },
  {
    category: 'RECORD_KEEPING',
    title: 'Maintain communication log',
    description: 'Record every call: date, who you spoke with, their reference number, and what was discussed.',
  },
  {
    category: 'RECORD_KEEPING',
    title: 'Collect and organize incoming mail weekly',
    description: 'Watch for bills, statements, and notices. These often reveal unknown accounts.',
  },
  {
    category: 'RECORD_KEEPING',
    title: 'Obtain EIN for the estate if needed',
    description: 'Many estates obtain an EIN if there is ongoing income or the estate will be open for an extended period. You can apply at IRS.gov.',
  },

  // ============================================================================
  // FOLLOW-UP AND ONGOING
  // ============================================================================
  {
    category: 'FOLLOW_UP',
    title: 'Follow up on insurance claims after 30 days',
    description: 'Check claim status. Be persistent - claims can get stuck in processing.',
  },
  {
    category: 'FOLLOW_UP',
    title: 'Follow up on benefit applications',
    description: 'Check status of pension, Social Security survivor, and other benefit claims.',
  },
  {
    category: 'FOLLOW_UP',
    title: 'Review account statements monthly',
    description: 'Watch for unexpected charges, subscriptions, or suspicious activity.',
  },
  {
    category: 'FOLLOW_UP',
    title: 'Pay ongoing bills and property taxes',
    description: 'Keep utilities on, insurance current, and property taxes paid while estate is open.',
  },
  {
    category: 'FOLLOW_UP',
    title: 'Respond to creditor inquiries',
    description: 'Handle legitimate creditor communications. Know your state\'s rules on creditor claims.',
  },
  {
    category: 'FOLLOW_UP',
    title: 'Consider final income tax return',
    description: 'Typically due April 15 of the year after death. Many families consult a CPA for this.',
  },
  {
    category: 'FOLLOW_UP',
    title: 'Consider estate income tax return',
    description: 'Form 1041 may apply if the estate had income. A tax professional can help determine if this applies.',
  },
  {
    category: 'FOLLOW_UP',
    title: 'Prepare accounting for beneficiaries',
    description: 'Document assets, income received, expenses paid, and distributions made.',
  },
  {
    category: 'FOLLOW_UP',
    title: 'Make distributions to beneficiaries',
    description: 'After debts are paid and waiting period has passed, distribute according to will.',
  },
  {
    category: 'FOLLOW_UP',
    title: 'Work toward closing the estate',
    description: 'This typically involves distributions, final returns, and closing accounts. Many families work with professionals for this step.',
  },
];

// ============================================================================
// CHECKLIST FUNCTIONS
// ============================================================================

function generateId(): string {
  return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate the initial executor checklist
 */
export function generateExecutorChecklist(): ExecutorChecklistItem[] {
  return EXECUTOR_CHECKLIST_SEED.map((seed): ExecutorChecklistItem => ({
    id: generateId(),
    category: seed.category,
    title: seed.title,
    description: seed.description,
    status: 'PENDING' as const,
  }));
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
 * Calculate checklist progress
 */
export function getChecklistProgress(checklist: ExecutorChecklistItem[]): {
  total: number;
  completed: number;
  percentage: number;
  byCategory: Record<ExecutorChecklistCategory, { total: number; completed: number }>;
} {
  const total = checklist.length;
  const completed = checklist.filter(item => item.status === 'DONE').length;
  
  const categories: ExecutorChecklistCategory[] = [
    'DOCUMENTS', 'COMMUNICATION', 'ASSET_TRACKING', 'RECORD_KEEPING', 'FOLLOW_UP'
  ];
  
  const byCategory: Record<ExecutorChecklistCategory, { total: number; completed: number }> = {} as any;
  
  for (const cat of categories) {
    const catItems = checklist.filter(item => item.category === cat);
    byCategory[cat] = {
      total: catItems.length,
      completed: catItems.filter(item => item.status === 'DONE').length,
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
 * Get category display information
 */
export function getChecklistCategoryInfo(category: ExecutorChecklistCategory): {
  label: string;
  description: string;
  icon: string;
} {
  const info: Record<ExecutorChecklistCategory, { label: string; description: string; icon: string }> = {
    DOCUMENTS: {
      label: 'Documents',
      description: 'Gathering and organizing important documents',
      icon: 'FileText',
    },
    COMMUNICATION: {
      label: 'Communication',
      description: 'Notifying institutions and individuals',
      icon: 'MessageSquare',
    },
    ASSET_TRACKING: {
      label: 'Asset Tracking',
      description: 'Inventorying and documenting assets',
      icon: 'ClipboardList',
    },
    RECORD_KEEPING: {
      label: 'Record Keeping',
      description: 'Maintaining organized records',
      icon: 'FolderOpen',
    },
    FOLLOW_UP: {
      label: 'Follow Up',
      description: 'Ongoing monitoring and follow-up tasks',
      icon: 'Clock',
    },
  };
  
  return info[category];
}

// ============================================================================
// CONTACT WORKBOOK FUNCTIONS
// ============================================================================

/**
 * Generate contacts from vault records
 */
export function generateContactsFromVault(records: LegacyVaultRecord[]): ContactEntry[] {
  const contacts: ContactEntry[] = [];
  const seenInstitutions = new Set<string>();
  
  for (const record of records) {
    const institutionKey = (record.institutionName || record.name).toLowerCase().trim();
    
    // Skip if we've already created a contact for this institution
    if (seenInstitutions.has(institutionKey)) {
      // Find existing contact and add this record ID
      const existing = contacts.find(c => 
        c.name.toLowerCase().trim() === institutionKey
      );
      if (existing && existing.relatedVaultRecordIds) {
        existing.relatedVaultRecordIds.push(record.id);
      }
      continue;
    }
    
    seenInstitutions.add(institutionKey);
    
    // Map vault category to contact type
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
  
  return mapping[category] || 'OTHER';
}

/**
 * Get contacts by type
 */
export function getContactsByType(contacts: ContactEntry[], type: ContactType): ContactEntry[] {
  return contacts.filter(c => c.type === type);
}

/**
 * Get contact type display information
 */
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

/**
 * Get contact status display
 */
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

/**
 * Calculate contact progress
 */
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

