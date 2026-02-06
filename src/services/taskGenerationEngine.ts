/**
 * Task Generation Engine
 * 
 * Generates personalized guidance items based on profile and vault records.
 * Uses rule-based logic to map LLV categories to organizational tasks.
 * 
 * LEGAL SAFETY GUIDELINES:
 * - This engine provides organizational guidance only
 * - It does not provide legal, financial, or medical advice
 * - Items are informational and may not apply to every situation
 * - Laws and requirements vary by location
 * - Never use "must", "required by law", or imply deadlines
 * - Use soft verbs: "review", "consider", "check whether", "locate"
 * - Do not interpret wills, trusts, or legal documents
 * - Do not recommend how assets should be distributed
 * - Encourage consulting qualified professionals for legal/financial matters
 */

import {
  AftercareTask,
  AftercareProfile,
  LegacyVaultRecord,
  LegacyVaultCategory,
  TaskGenerationInput,
  TaskGenerationResult,
  TaskPhase,
  TaskCategory,
  TaskStatus,
} from '../types';

// ============================================================================
// TASK TEMPLATES
// ============================================================================

interface TaskTemplate {
  titleTemplate: string;
  descriptionTemplate: string;
  reason: string;
  phase: TaskPhase;
  category: TaskCategory;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// Templates for each vault category - using soft, consideration-based language
const CATEGORY_TASK_TEMPLATES: Record<LegacyVaultCategory, TaskTemplate[]> = {
  BANK_ACCOUNT: [
    {
      titleTemplate: 'Review account at {{institutionName}}',
      descriptionTemplate: 'When you are ready, you may want to contact the bank to ask about next steps. This can wait until you have other priorities settled.',
      reason: 'Banks can explain their process when you call.',
      phase: 'WEEKS_2_6',
      category: 'FINANCIAL',
      priority: 'MEDIUM',
    },
  ],
  CREDIT_CARD: [
    {
      titleTemplate: 'Review {{institutionName}} credit card',
      descriptionTemplate: 'Contact the card company when convenient. Automatic payments can be stopped if needed.',
      reason: 'Reviewing statements can help identify recurring charges.',
      phase: 'WEEKS_2_6',
      category: 'FINANCIAL',
      priority: 'LOW',
    },
  ],
  INVESTMENT: [
    {
      titleTemplate: 'Review investment account at {{institutionName}}',
      descriptionTemplate: 'When ready, you can contact them to ask about their process. Investment companies are used to guiding families through this.',
      reason: 'They can explain beneficiary claims when you call.',
      phase: 'WEEKS_2_6',
      category: 'FINANCIAL',
      priority: 'MEDIUM',
    },
  ],
  INSURANCE: [
    {
      titleTemplate: 'Locate {{name}} policy documents',
      descriptionTemplate: 'Finding the policy helps you understand what coverage exists. You can contact the company when you feel ready.',
      reason: 'Policy details are helpful before calling.',
      phase: 'WEEK_1',
      category: 'INSURANCE',
      priority: 'MEDIUM',
    },
  ],
  SUBSCRIPTION: [
    {
      titleTemplate: 'Review {{name}} subscription',
      descriptionTemplate: 'This can be canceled when convenient. Some subscriptions offer refunds for unused time.',
      reason: 'No rush on subscriptions.',
      phase: 'WEEKS_2_6',
      category: 'DIGITAL',
      priority: 'LOW',
    },
  ],
  PROPERTY: [
    {
      titleTemplate: 'Check on property at {{name}}',
      descriptionTemplate: 'When you have time, check that the property is secure.',
      reason: 'A quick check provides peace of mind.',
      phase: 'WEEK_1',
      category: 'PROPERTY',
      priority: 'MEDIUM',
    },
  ],
  VEHICLE: [
    {
      titleTemplate: 'Note location of {{vehicleYear}} {{vehicleMake}} {{vehicleModel}}',
      descriptionTemplate: 'Just making sure you know where the vehicle is. Decisions about it can wait.',
      reason: 'Awareness now, decisions later.',
      phase: 'WEEK_1',
      category: 'PROPERTY',
      priority: 'LOW',
    },
  ],
  EMPLOYMENT: [
    {
      titleTemplate: 'Consider contacting employer at {{institutionName}}',
      descriptionTemplate: 'When ready, HR can explain any final pay or benefits. This is often not urgent.',
      reason: 'Employers can explain their process.',
      phase: 'WEEK_1',
      category: 'NOTIFICATION',
      priority: 'MEDIUM',
    },
  ],
  LOAN: [
    {
      titleTemplate: 'Review loan with {{institutionName}}',
      descriptionTemplate: 'Some loans have insurance that covers balances. You can contact them when convenient to ask about their process.',
      reason: 'Lenders can explain options when you call.',
      phase: 'WEEKS_2_6',
      category: 'FINANCIAL',
      priority: 'LOW',
    },
  ],
  UTILITY: [
    {
      titleTemplate: 'Review {{name}} utility account',
      descriptionTemplate: 'Utilities can usually be transferred or kept active. Contact them when you have time.',
      reason: 'Utilities are flexible about timing.',
      phase: 'WEEKS_2_6',
      category: 'ADMINISTRATIVE',
      priority: 'LOW',
    },
  ],
  DIGITAL_ACCOUNT: [
    {
      titleTemplate: 'Note {{name}} digital account',
      descriptionTemplate: 'Digital accounts can be memorialized or closed later. There is no rush to decide.',
      reason: 'These accounts will wait for you.',
      phase: 'WEEKS_2_6',
      category: 'DIGITAL',
      priority: 'LOW',
    },
  ],
  LEGAL_DOCUMENT: [
    {
      titleTemplate: 'Locate {{name}}',
      descriptionTemplate: 'Knowing where this document is can be helpful. You can review the contents when ready.',
      reason: 'Location awareness helps later.',
      phase: 'WEEK_1',
      category: 'LEGAL',
      priority: 'MEDIUM',
    },
  ],
  PERSONAL_INFO: [
    {
      titleTemplate: 'Note {{name}} information',
      descriptionTemplate: 'For reference. No action required.',
      reason: 'Just for your awareness.',
      phase: 'WEEKS_2_6',
      category: 'PERSONAL',
      priority: 'LOW',
    },
  ],
  OTHER: [
    {
      titleTemplate: 'Review {{name}}',
      descriptionTemplate: 'Take a look when you have time and decide if anything is needed.',
      reason: 'Review at your own pace.',
      phase: 'WEEKS_2_6',
      category: 'ADMINISTRATIVE',
      priority: 'LOW',
    },
  ],
};

// ============================================================================
// GENERAL TASKS (not tied to specific records)
// ============================================================================

interface GeneralTask {
  title: string;
  description: string;
  reason: string;
  phase: TaskPhase;
  category: TaskCategory;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  suggestedTimingNote?: string;
  condition?: (profile: AftercareProfile) => boolean;
}

const GENERAL_TASKS: GeneralTask[] = [
  // ============================================================================
  // FIRST 48 HOURS - Stabilizing, not urgent
  // ============================================================================
  {
    title: 'Take a moment',
    description: "There's no rush. It's okay to pause before doing anything else. Most of what follows can wait hours or even days.",
    reason: 'This space is here when you need it.',
    phase: 'FIRST_48_HOURS',
    category: 'PERSONAL',
    priority: 'HIGH',
  },
  {
    title: 'Review any funeral or cremation plans',
    description: "Check whether funeral or cremation wishes were documented. If final wishes were recorded in a Local Legacy Vault, start there. A funeral home can guide you through the next steps when you're ready.",
    reason: 'Funeral homes often guide families through immediate decisions.',
    phase: 'FIRST_48_HOURS',
    category: 'ADMINISTRATIVE',
    priority: 'HIGH',
  },
  {
    title: 'Let close family or friends know',
    description: "Start with one or two people you trust. If you have a Local Legacy Vault, check there for trusted contacts. You can ask someone to help share the news.",
    reason: 'Sharing with a few trusted people can provide support.',
    phase: 'FIRST_48_HOURS',
    category: 'NOTIFICATION',
    priority: 'HIGH',
  },
  {
    title: 'Check on dependents or pets',
    description: 'Make sure dependents or pets are cared for. Short-term arrangements are fine while things settle.',
    reason: 'Knowing dependents are cared for can ease your mind.',
    phase: 'FIRST_48_HOURS',
    category: 'PERSONAL',
    priority: 'MEDIUM',
  },
  {
    title: 'Locate important personal documents',
    description: "Note where important personal documents are located. You're only identifying where things are for now. If a Local Legacy Vault exists, documents and locations may already be listed.",
    reason: 'Knowing where documents are helps later.',
    phase: 'FIRST_48_HOURS',
    category: 'LEGAL',
    priority: 'MEDIUM',
  },

  // ============================================================================
  // WEEK 1 - Gentle awareness, not demands
  // ============================================================================
  {
    title: 'Consider memorial or service details',
    description: "Decide whether to plan memorial or service details now or later. If preferences were recorded in a Local Legacy Vault, review them there. A funeral home can offer guidance if and when you want it.",
    reason: 'Services can happen when the time feels right.',
    phase: 'WEEK_1',
    category: 'ADMINISTRATIVE',
    priority: 'MEDIUM',
  },
  {
    title: 'Review mail and messages',
    description: "Notice what's arriving by mail or message. You don't need to respond to everything right away. Forwarding mail can help catch anything important.",
    reason: 'Mail sometimes reveals accounts or obligations.',
    phase: 'WEEK_1',
    category: 'ADMINISTRATIVE',
    priority: 'MEDIUM',
  },
  {
    title: 'Check whether any immediate notifications are needed',
    description: 'Decide whether any organizations need to be notified right now. Focus only on what feels necessary. If a Local Legacy Vault exists, account or contact information may already be recorded there.',
    reason: 'Most notifications are not time-sensitive.',
    phase: 'WEEK_1',
    category: 'NOTIFICATION',
    priority: 'MEDIUM',
  },
  {
    title: 'Make note of recurring obligations',
    description: 'This is just awareness, not action. Notice any bills, subscriptions, or commitments that might need attention eventually.',
    reason: 'Awareness helps you plan, not pressure you.',
    phase: 'WEEK_1',
    category: 'ADMINISTRATIVE',
    priority: 'LOW',
  },
  {
    title: 'Consider whether to request death certificates',
    description: 'Decide whether to request certified copies of the death certificate. Many institutions require them. Funeral homes often help with this. Ordering 10–15 copies is common, and more can be requested later if needed.',
    reason: 'Having copies available can make other steps easier.',
    phase: 'WEEK_1',
    category: 'ADMINISTRATIVE',
    priority: 'MEDIUM',
  },
  {
    title: 'Check whether Social Security was notified',
    description: 'Confirm whether Social Security was notified. Funeral homes often report this automatically. You can also confirm by calling 1-800-772-1213 and asking about survivor benefits if applicable.',
    reason: 'Confirming gives peace of mind.',
    phase: 'WEEK_1',
    category: 'NOTIFICATION',
    priority: 'MEDIUM',
    condition: (profile) => profile.country === 'USA' || profile.country === 'United States',
  },
  {
    title: 'Consider placing a credit freeze',
    description: 'Contacting the three credit bureaus (Equifax, Experian, TransUnion) can help prevent identity issues. This can wait if you have other priorities.',
    reason: 'A freeze is a precaution, not an emergency.',
    phase: 'WEEK_1',
    category: 'NOTIFICATION',
    priority: 'LOW',
    condition: (profile) => profile.country === 'USA' || profile.country === 'United States',
  },
  {
    title: 'Check whether veteran benefits apply',
    description: 'If the deceased was a veteran, the VA (1-800-827-1000) may offer burial benefits or survivor support. This can be explored when you are ready.',
    reason: 'Benefits are available but not time-limited.',
    phase: 'WEEK_1',
    category: 'NOTIFICATION',
    priority: 'LOW',
    condition: (profile) => profile.country === 'USA' || profile.country === 'United States',
  },
  
  // ============================================================================
  // WEEKS 2-6 - Gathering and organizing, at your pace
  // ============================================================================
  {
    title: 'Gather financial and account information',
    description: "Gather what you can find. Missing items are okay. If a Local Legacy Vault exists, financial accounts may already be documented there. You're simply becoming aware of what's there.",
    reason: 'A rough picture is more useful than perfection.',
    phase: 'WEEKS_2_6',
    category: 'FINANCIAL',
    priority: 'MEDIUM',
  },
  {
    title: 'Review insurance policies and benefits',
    description: "Identify any insurance policies or benefits that exist. If a Local Legacy Vault exists, policies may already be recorded there. Claims can be started when you're ready.",
    reason: 'Knowing what coverage exists helps with planning.',
    phase: 'WEEKS_2_6',
    category: 'INSURANCE',
    priority: 'MEDIUM',
  },
  {
    title: 'Consider whether legal or professional help is needed',
    description: "Decide whether professional guidance would be helpful. An estate attorney or accountant can answer questions if and when you want support.",
    reason: 'Professional help is available if you want it.',
    phase: 'WEEKS_2_6',
    category: 'LEGAL',
    priority: 'MEDIUM',
  },
  {
    title: 'Begin organizing documents in one place',
    description: 'Begin gathering documents in one place. A folder or box is enough. If a Local Legacy Vault exists, documents may already be organized there. You can add to or reorganize later.',
    reason: 'Having things in one spot reduces searching later.',
    phase: 'WEEKS_2_6',
    category: 'ADMINISTRATIVE',
    priority: 'LOW',
  },
  {
    title: 'Review recurring charges and subscriptions',
    description: "Review bank and credit statements when you have time. If a Local Legacy Vault exists, subscriptions may already be listed there. Canceling can wait until you're ready.",
    reason: 'Stopping charges gradually is fine.',
    phase: 'WEEKS_2_6',
    category: 'ADMINISTRATIVE',
    priority: 'LOW',
  },
  {
    title: 'Consider how to handle digital accounts',
    description: "Decide how to handle digital accounts such as email, social media, and online services. If a Local Legacy Vault exists, digital account information may already be recorded there. There's no need to decide right away.",
    reason: 'Digital accounts will wait for you.',
    phase: 'WEEKS_2_6',
    category: 'DIGITAL',
    priority: 'LOW',
  },
  {
    title: 'Check whether student loans apply',
    description: 'Federal student loans are discharged upon death. Contact the servicer (1-800-557-7394) when ready. Family members are not responsible for this debt.',
    reason: 'Discharge is available but not urgent.',
    phase: 'WEEKS_2_6',
    category: 'FINANCIAL',
    priority: 'LOW',
    condition: (profile) => profile.country === 'USA' || profile.country === 'United States',
  },
  {
    title: 'Note any receipts for estate expenses',
    description: 'If you are paying for funeral costs, bills, or other expenses, keep receipts loosely gathered. These can be reimbursable from the estate.',
    reason: 'Loose notes now save searching later.',
    phase: 'WEEKS_2_6',
    category: 'ADMINISTRATIVE',
    priority: 'LOW',
    condition: (profile) => profile.isExecutor === true,
  },
  
  // ============================================================================
  // DAYS 60-90 - Checking in, not catching up
  // ============================================================================
  {
    title: 'Review ongoing household or property needs',
    description: 'Address household or property needs as they come up. If a Local Legacy Vault exists, property details may already be recorded there. Utilities, maintenance, and related matters can be handled gradually.',
    reason: 'One thing at a time is enough.',
    phase: 'DAYS_60_90',
    category: 'PROPERTY',
    priority: 'LOW',
  },
  {
    title: 'Check in on open accounts or subscriptions',
    description: "Review any accounts or subscriptions that remain active. If a Local Legacy Vault exists, they may already be listed there. Decide what to address next when you're ready.",
    reason: 'Slow progress is still progress.',
    phase: 'DAYS_60_90',
    category: 'FINANCIAL',
    priority: 'LOW',
  },
  {
    title: 'Consider longer-term decisions',
    description: 'Recognize that longer-term decisions do not need to be made now. Matters involving property, belongings, or legal issues can be addressed later, when you feel steadier.',
    reason: 'Big decisions can wait for clarity.',
    phase: 'DAYS_60_90',
    category: 'ADMINISTRATIVE',
    priority: 'LOW',
  },
  {
    title: 'Check status of any pending claims or benefits',
    description: "If insurance claims or benefit applications were started, check their status when it's convenient.",
    reason: 'Following up is optional and can wait.',
    phase: 'DAYS_60_90',
    category: 'INSURANCE',
    priority: 'LOW',
  },
  {
    title: 'Consider tax filing needs when ready',
    description: 'Plan to address tax filing needs when the time comes. A tax professional can help with final returns, which are typically handled within the normal tax year.',
    reason: 'Professional help is available when you need it.',
    phase: 'DAYS_60_90',
    category: 'FINANCIAL',
    priority: 'LOW',
  },
  
  // ============================================================================
  // LONG TERM - When you feel ready
  // ============================================================================
  {
    title: 'Review estate or legacy details when ready',
    description: 'Review estate or legacy details when you feel ready. If a Local Legacy Vault exists, wishes and important information may already be recorded there. Finalizing matters can happen in their own time.',
    reason: 'There is no deadline for closure.',
    phase: 'LONG_TERM',
    category: 'LEGAL',
    priority: 'LOW',
  },
  {
    title: 'Update records if needed',
    description: 'Update records only if something has changed. Titles, deeds, and beneficiary designations can be addressed when convenient.',
    reason: 'Updates can happen gradually.',
    phase: 'LONG_TERM',
    category: 'ADMINISTRATIVE',
    priority: 'LOW',
  },
  {
    title: 'Store documents for future reference',
    description: 'Store documents in a way that makes them easy to find later. If a Local Legacy Vault exists, documents can be added there. A simple folder or digital backup is also enough.',
    reason: 'Organized records help if questions come up later.',
    phase: 'LONG_TERM',
    category: 'ADMINISTRATIVE',
    priority: 'LOW',
  },
  {
    title: 'Consider your own planning when ready',
    description: "This experience may prompt reflection on your own plans. There's no pressure to act.",
    reason: 'Planning ahead is a gift to those you love.',
    phase: 'LONG_TERM',
    category: 'PERSONAL',
    priority: 'LOW',
  },
  {
    title: 'Take care of yourself',
    description: "Grief has no timeline. Support groups, counseling, or quiet time can all help. You've been carrying something difficult.",
    reason: 'Your wellbeing matters most.',
    phase: 'LONG_TERM',
    category: 'PERSONAL',
    priority: 'HIGH',
  },
];

// ============================================================================
// TASK GENERATION FUNCTIONS
// ============================================================================

function generateId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function fillTemplate(template: string, record: LegacyVaultRecord): string {
  let result = template;
  
  // Replace all placeholders with actual values or fallbacks
  result = result.replace(/\{\{name\}\}/g, record.name || 'this item');
  result = result.replace(/\{\{institutionName\}\}/g, record.institutionName || record.name || 'the institution');
  result = result.replace(/\{\{vehicleMake\}\}/g, record.vehicleMake || '');
  result = result.replace(/\{\{vehicleModel\}\}/g, record.vehicleModel || '');
  result = result.replace(/\{\{vehicleYear\}\}/g, record.vehicleYear || '');
  result = result.replace(/\{\{insuranceCompany\}\}/g, record.insuranceCompany || record.institutionName || 'the insurance company');
  
  // Clean up any double spaces
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

function generateTasksForRecord(record: LegacyVaultRecord): AftercareTask[] {
  const templates = CATEGORY_TASK_TEMPLATES[record.category] || CATEGORY_TASK_TEMPLATES.OTHER;
  
  return templates.map((template): AftercareTask => ({
    id: generateId(),
    phase: template.phase,
    category: template.category,
    title: fillTemplate(template.titleTemplate, record),
    description: fillTemplate(template.descriptionTemplate, record),
    reason: template.reason,
    relatedVaultRecordIds: [record.id],
    suggestedTimingNote: getTimingNote(template.phase),
    status: 'NOT_STARTED' as TaskStatus,
    priority: template.priority,
    createdAt: new Date().toISOString(),
  }));
}

function getTimingNote(phase: TaskPhase): string {
  switch (phase) {
    case 'FIRST_48_HOURS':
      return 'This can wait if you need it to.';
    case 'WEEK_1':
      return 'Whenever you feel ready.';
    case 'WEEKS_2_6':
      return 'No rush on this one.';
    case 'DAYS_60_90':
      return 'Take your time with this.';
    case 'LONG_TERM':
      return 'When the time feels right.';
    default:
      return '';
  }
}

function generateGeneralTasks(profile: AftercareProfile): AftercareTask[] {
  return GENERAL_TASKS
    .filter(task => !task.condition || task.condition(profile))
    .map((task): AftercareTask => ({
      id: generateId(),
      phase: task.phase,
      category: task.category,
      title: task.title,
      description: task.description,
      reason: task.reason,
      suggestedTimingNote: getTimingNote(task.phase),
      status: 'NOT_STARTED' as TaskStatus,
      priority: task.priority,
      createdAt: new Date().toISOString(),
    }));
}

function countByCategory(records: LegacyVaultRecord[]): Record<LegacyVaultCategory, number> {
  const counts: Partial<Record<LegacyVaultCategory, number>> = {};
  
  for (const record of records) {
    counts[record.category] = (counts[record.category] || 0) + 1;
  }
  
  // Fill in zeros for missing categories
  const allCategories: LegacyVaultCategory[] = [
    'BANK_ACCOUNT', 'CREDIT_CARD', 'INVESTMENT', 'INSURANCE',
    'SUBSCRIPTION', 'PROPERTY', 'VEHICLE', 'EMPLOYMENT',
    'LOAN', 'UTILITY', 'DIGITAL_ACCOUNT', 'LEGAL_DOCUMENT',
    'PERSONAL_INFO', 'OTHER'
  ];
  
  for (const cat of allCategories) {
    if (!(cat in counts)) {
      counts[cat] = 0;
    }
  }
  
  return counts as Record<LegacyVaultCategory, number>;
}

function generateSummary(
  _profile: AftercareProfile,
  records: LegacyVaultRecord[],
  tasks: AftercareTask[]
): string {
  const recordCount = records.length;
  const taskCount = tasks.length;
  const phaseFirst48 = tasks.filter(t => t.phase === 'FIRST_48_HOURS').length;
  const phaseWeek1 = tasks.filter(t => t.phase === 'WEEK_1').length;
  
  let summary = `Based on your situation and ${recordCount} record${recordCount !== 1 ? 's' : ''}, `;
  summary += `we've gathered ${taskCount} item${taskCount !== 1 ? 's' : ''} for you to consider.\n\n`;
  
  if (phaseFirst48 > 0) {
    summary += `• ${phaseFirst48} item${phaseFirst48 !== 1 ? 's' : ''} for the first few days\n`;
  }
  if (phaseWeek1 > 0) {
    summary += `• ${phaseWeek1} item${phaseWeek1 !== 1 ? 's' : ''} for the first week\n`;
  }
  
  summary += '\nThis is organizational guidance only—not legal, financial, or medical advice. ';
  summary += 'Items shown are informational and may not apply to your situation. ';
  summary += 'Laws and requirements vary by location. For legal, financial, or tax matters, ';
  summary += 'consider consulting a qualified professional.';
  
  return summary;
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

/**
 * Generate a personalized aftercare plan based on profile and vault records.
 * 
 * This function creates administrative guidance tasks - never legal advice.
 */
export function generateAftercarePlan(input: TaskGenerationInput): TaskGenerationResult {
  const { profile, vaultRecords } = input;
  
  // Generate tasks for each vault record
  const recordTasks: AftercareTask[] = [];
  for (const record of vaultRecords) {
    recordTasks.push(...generateTasksForRecord(record));
  }
  
  // Generate general tasks
  const generalTasks = generateGeneralTasks(profile);
  
  // Combine and sort by phase priority
  const phaseOrder: TaskPhase[] = ['FIRST_48_HOURS', 'WEEK_1', 'WEEKS_2_6', 'DAYS_60_90', 'LONG_TERM'];
  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  
  const allTasks = [...generalTasks, ...recordTasks].sort((a, b) => {
    const phaseCompare = phaseOrder.indexOf(a.phase) - phaseOrder.indexOf(b.phase);
    if (phaseCompare !== 0) return phaseCompare;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  // Generate summary
  const summary = generateSummary(profile, vaultRecords, allTasks);
  
  return {
    tasks: allTasks,
    summary,
    recordsProcessed: vaultRecords.length,
    categoryCounts: countByCategory(vaultRecords),
  };
}

/**
 * Get phase display information
 */
export function getPhaseInfo(phase: TaskPhase): { label: string; description: string } {
  switch (phase) {
    case 'FIRST_48_HOURS':
      return { label: 'The first few days', description: 'Grounding and stabilizing' };
    case 'WEEK_1':
      return { label: 'The first week', description: 'Gentle awareness' };
    case 'WEEKS_2_6':
      return { label: 'The weeks ahead', description: 'Gathering at your pace' };
    case 'DAYS_60_90':
      return { label: 'A few months out', description: 'Checking in when ready' };
    case 'LONG_TERM':
      return { label: 'Later on', description: 'No rush' };
    default:
      return { label: phase, description: '' };
  }
}

/**
 * Get category display information
 */
export function getCategoryInfo(category: TaskCategory): { label: string; color: string } {
  // All categories use consistent gold color for calm, unified appearance
  const CATEGORY_COLOR = '#C9AE66';
  
  const info: Record<TaskCategory, { label: string; color: string }> = {
    FINANCIAL: { label: 'Financial', color: CATEGORY_COLOR },
    INSURANCE: { label: 'Insurance', color: CATEGORY_COLOR },
    PROPERTY: { label: 'Property', color: CATEGORY_COLOR },
    DIGITAL: { label: 'Digital', color: CATEGORY_COLOR },
    LEGAL: { label: 'Legal', color: CATEGORY_COLOR },
    PERSONAL: { label: 'Personal', color: CATEGORY_COLOR },
    NOTIFICATION: { label: 'Notifications', color: CATEGORY_COLOR },
    ADMINISTRATIVE: { label: 'Administrative', color: CATEGORY_COLOR },
  };
  
  return info[category] || { label: category, color: CATEGORY_COLOR };
}

