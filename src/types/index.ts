/**
 * AfterPassing Guide - Core Type Definitions
 * 
 * This application provides administrative guidance only.
 * It does not provide legal, financial, or medical advice.
 */

// ============================================================================
// LICENSING TYPES (Simplified - One Product)
// ============================================================================

export interface AftercareLicense {
  licenseKey: string;
  deviceId: string;
  activatedAt: string;
}

export interface LLVAddonsState {
  aftercareEnabled: boolean;
  aftercareLicenseKey?: string;
  aftercareActivationDate?: string;
}

// ============================================================================
// PROFILE TYPES
// ============================================================================

export type UserRole = 
  | 'SELF' 
  | 'SPOUSE_PARTNER' 
  | 'PARENT' 
  | 'FAMILY_FRIEND' 
  | 'NOT_SURE';

// Relationship type - unified with UserRole for consistency
// Maps: SPOUSE_PARTNER -> SPOUSE, FAMILY_FRIEND -> FRIEND, NOT_SURE -> OTHER
export type RelationshipType = 'SELF' | 'SPOUSE' | 'PARENT' | 'SIBLING' | 'CHILD' | 'FRIEND' | 'OTHER';

/**
 * Helper to convert UserRole to RelationshipType
 */
export function userRoleToRelationship(role?: UserRole): RelationshipType {
  switch (role) {
    case 'SELF': return 'SELF';
    case 'SPOUSE_PARTNER': return 'SPOUSE';
    case 'PARENT': return 'PARENT';
    case 'FAMILY_FRIEND': return 'FRIEND';
    case 'NOT_SURE': return 'OTHER';
    default: return 'OTHER';
  }
}

export interface AftercareProfile {
  id: string;
  // New grief-appropriate fields
  userRole?: UserRole;
  // Optional details (asked last)
  deceasedName?: string;
  dateOfDeath?: string; // ISO date string, optional for templates
  country?: string;
  region?: string;
  // Legacy fields (kept for compatibility)
  relationship?: RelationshipType;
  hasWill?: boolean;
  isExecutor?: boolean;
  hasConfirmedDisclaimer: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// TASK TYPES
// ============================================================================

export type TaskPhase = 
  | 'FIRST_48_HOURS' 
  | 'WEEK_1' 
  | 'WEEKS_2_6' 
  | 'DAYS_60_90' 
  | 'LONG_TERM';

export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | 'NOT_APPLICABLE';

export type TaskCategory = 
  | 'FINANCIAL'
  | 'INSURANCE'
  | 'PROPERTY'
  | 'DIGITAL'
  | 'LEGAL'
  | 'PERSONAL'
  | 'NOTIFICATION'
  | 'ADMINISTRATIVE';

export interface AftercareTask {
  id: string;
  phase: TaskPhase;
  category: TaskCategory;
  title: string;
  description: string;
  reason?: string;
  relatedVaultRecordIds?: string[];
  suggestedTimingNote?: string;
  status: TaskStatus;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface AftercarePlan {
  id: string;
  profile: AftercareProfile;
  tasks: AftercareTask[];
  createdAt: string;
  lastUpdatedAt: string;
}

// ============================================================================
// LEGACY VAULT DATA INTERFACE (for reading from LLV)
// ============================================================================

export type LegacyVaultCategory = 
  | 'BANK_ACCOUNT'
  | 'CREDIT_CARD'
  | 'INVESTMENT'
  | 'INSURANCE'
  | 'SUBSCRIPTION'
  | 'PROPERTY'
  | 'VEHICLE'
  | 'EMPLOYMENT'
  | 'LOAN'
  | 'UTILITY'
  | 'DIGITAL_ACCOUNT'
  | 'LEGAL_DOCUMENT'
  | 'PERSONAL_INFO'
  | 'OTHER';

export interface LegacyVaultRecord {
  id: string;
  category: LegacyVaultCategory;
  subCategory?: string;
  name: string;
  institutionName?: string;
  accountNumberMasked?: string;
  policyNumberMasked?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactWebsite?: string;
  notes?: string;
  tags?: string[];
  ownerName?: string;
  beneficiaryNames?: string[];
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  // Insurance-specific
  insuranceCompany?: string;
  agentName?: string;
  agentContact?: string;
  coverageAmount?: string;
  // Property-specific
  propertyType?: string;
  // Vehicle-specific
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
}

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

/** Document type (recommended). Default: Other. */
export type DocumentType =
  | 'Bond'
  | 'Will'
  | 'Insurance'
  | 'Bank'
  | 'Property'
  | 'Tax'
  | 'ID'
  | 'Medical'
  | 'Other';

/** Owner / related person (optional). */
export type DocumentOwner =
  | 'Me'
  | 'Spouse'
  | 'Child'
  | 'Parent'
  | 'Estate'
  | 'Other';

/** Importance for filtering and executor focus (optional). */
export type DocumentImportance = 'Critical' | 'Important' | 'Reference';

/** Applies to estate, ongoing life, or after-passing only (optional). */
export type DocumentAppliesTo = 'Estate' | 'Ongoing Life' | 'After Passing Only';

/** Optional document category for organization (do not force selection). */
export type DocumentCategory = 'Legal' | 'Financial' | 'Personal' | 'Property' | 'Other';

/** Optional document status. */
export type DocumentStatus = 'Reference' | 'Original' | 'Copy' | 'Not sure';

export interface UploadedDocument {
  id: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  /** Type: Bond, Will, Insurance, Bank, Property, Tax, ID, Medical, Other. Default: Other. */
  documentType?: DocumentType;
  userLabel?: string;
  /** Optional category: Legal, Financial, Personal, Property, Other */
  category?: DocumentCategory;
  /** Optional notes (user-editable). */
  notes?: string;
  /** Optional status: Reference, Original, Copy, Not sure */
  documentStatus?: DocumentStatus;
  /** Owner / related person (optional). */
  ownerOrRelatedPerson?: DocumentOwner;
  /** Importance for filtering (optional). */
  importance?: DocumentImportance;
  /** Estate, ongoing life, or after-passing only (optional). */
  appliesTo?: DocumentAppliesTo;
  /** If true, surfaces in checklist view. */
  actionRequired?: boolean;
  /** Optional link to an executor checklist item id. */
  linkedTaskId?: string;
  summary?: string;
  keyPoints?: string[];
}

export interface DocumentSummary {
  summary: string;
  keyPoints: string[];
  possibleNextSteps: string[]; // Generic, non-legal administrative steps
}

// ============================================================================
// SCRIPT/LETTER TEMPLATE TYPES
// ============================================================================

export type ScriptTemplateType =
  | 'BANK_NOTIFICATION'
  | 'CREDIT_CARD_CLOSURE'
  | 'UTILITY_CANCELLATION'
  | 'SUBSCRIPTION_CANCELLATION'
  | 'EMPLOYER_NOTIFICATION'
  | 'INSURANCE_CLAIM_REQUEST'
  | 'PENSION_BENEFITS_REQUEST'
  | 'GOVERNMENT_BENEFITS_NOTIFICATION'
  | 'LANDLORD_NOTIFICATION'
  | 'CREDITOR_NOTIFICATION'
  | 'SOCIAL_SECURITY_NOTIFICATION'
  | 'CREDIT_BUREAU_NOTIFICATION'
  | 'MORTGAGE_NOTIFICATION'
  | 'VETERANS_NOTIFICATION'
  | 'DMV_NOTIFICATION'
  | 'HEALTH_INSURANCE_NOTIFICATION'
  | 'MEMBERSHIP_CANCELLATION'
  | 'SOCIAL_MEDIA_NOTIFICATION'
  | 'STUDENT_LOAN_DISCHARGE';

export interface ScriptTemplate {
  id: string;
  type: ScriptTemplateType;
  title: string;
  description: string;
  bodyTemplate: string; // with placeholders like {{deceasedName}}
  placeholders: string[];
  category: 'PHONE_SCRIPT' | 'LETTER' | 'EMAIL' | 'GUIDE';
}

export interface ScriptRenderContext {
  deceasedName?: string;
  userName?: string;
  userRelationship?: string;
  institutionName?: string;
  accountReference?: string;
  contactPhone?: string;
  dateOfDeath?: string;
  todayDate?: string;
  userAddress?: string;
  userPhone?: string;
  userEmail?: string;
}

// ============================================================================
// EXECUTOR TYPES
// ============================================================================

export type ExecutorChecklistCategory =
  | 'IMMEDIATE_LEGAL_DOCUMENTS'
  | 'COURT_AND_PROBATE'
  | 'FINANCIAL_ACCOUNTS'
  | 'DEBTS_OBLIGATIONS'
  | 'PROPERTY_REAL_ESTATE'
  | 'TAXES_GOVERNMENT'
  | 'BENEFICIARIES_DISTRIBUTIONS'
  | 'BUSINESS_INTERESTS'
  | 'DIGITAL_ASSETS'
  | 'FINAL_CLOSEOUT'
  // Legacy (for migration); map to new categories when loading
  | 'DOCUMENTS'
  | 'COMMUNICATION'
  | 'ASSET_TRACKING'
  | 'RECORD_KEEPING'
  | 'FOLLOW_UP';

export interface ExecutorChecklistItem {
  id: string;
  category: ExecutorChecklistCategory;
  title: string;
  /** What this is (1–2 sentences). */
  description: string;
  /** Addressed | Not applicable; PENDING = not yet set. */
  status: 'PENDING' | 'DONE' | 'NOT_APPLICABLE';
  completedAt?: string;
  /** Optional: why it matters (concise). */
  whyItMatters?: string;
  /** Optional: documents, info, contacts (bullet list). */
  whatYouMayNeed?: string[];
  /** Free-text notes (optional). */
  notes?: string;
}

export type ContactType =
  | 'BANK'
  | 'INSURANCE'
  | 'EMPLOYER'
  | 'UTILITY'
  | 'SUBSCRIPTION'
  | 'ADVISOR'
  | 'ATTORNEY'
  | 'ACCOUNTANT'
  | 'GOVERNMENT'
  | 'OTHER';

/** Role for manual contact entry (executor-first). */
export type ContactRole =
  | 'EXECUTOR'
  | 'ATTORNEY'
  | 'FUNERAL_HOME'
  | 'BANK'
  | 'EMPLOYER'
  | 'FAMILY'
  | 'OTHER';

export interface ContactEntry {
  id: string;
  type: ContactType;
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  relatedVaultRecordIds?: string[];
  notes?: string;
  lastContactedAt?: string;
  contactStatus?: 'NOT_CONTACTED' | 'IN_PROGRESS' | 'COMPLETED';
  /** Role for manual contacts (executor, attorney, etc.). */
  role?: ContactRole;
  /** Organization (optional). */
  organization?: string;
  /** Mark as key contact; included in Export Binder. */
  isKeyContact?: boolean;
  /** 'manual' = user-created; 'vault' = from Local Legacy Vault import. */
  source?: 'manual' | 'vault';
}

// ============================================================================
// APP STATE TYPES
// ============================================================================

export type AppMode = 'STANDALONE' | 'EMBEDDED';

export interface AppState {
  mode: AppMode;
  isLicensed: boolean;
  profile: AftercareProfile | null;
  plan: AftercarePlan | null;
  documents: UploadedDocument[];
  contacts: ContactEntry[];
  executorChecklist: ExecutorChecklistItem[];
}

// ============================================================================
// TASK GENERATION TYPES
// ============================================================================

export interface TaskGenerationInput {
  profile: AftercareProfile;
  vaultRecords: LegacyVaultRecord[];
}

export interface TaskGenerationResult {
  tasks: AftercareTask[];
  summary: string;
  recordsProcessed: number;
  categoryCounts: Record<LegacyVaultCategory, number>;
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export type NavigationTab =
  | 'guidance'
  | 'checklist'
  | 'documents'
  | 'templates'
  | 'contacts'
  | 'executor'
  | 'settings';

export interface NavigationItem {
  id: NavigationTab;
  label: string;
  icon: string;
}

