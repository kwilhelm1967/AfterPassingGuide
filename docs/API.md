# API Documentation

## Service APIs

### StorageService

Singleton service for localStorage operations.

#### Methods

##### `getInstance(): StorageService`
Returns the singleton instance.

##### `saveProfile(profile: AftercareProfile): void`
Saves user profile to localStorage.

##### `loadProfile(): AftercareProfile | null`
Loads user profile from localStorage.

##### `savePlan(plan: AftercarePlan): void`
Saves task plan to localStorage.

##### `loadPlan(): AftercarePlan | null`
Loads task plan from localStorage.

##### `saveDocuments(documents: UploadedDocument[]): void`
Saves uploaded documents array.

##### `loadDocuments(): UploadedDocument[]`
Loads uploaded documents array.

##### `saveContacts(contacts: ContactEntry[]): void`
Saves contact entries array.

##### `loadContacts(): ContactEntry[]`
Loads contact entries array.

##### `saveChecklist(checklist: ExecutorChecklistItem[]): void`
Saves executor checklist array.

##### `loadChecklist(): ExecutorChecklistItem[]`
Loads executor checklist array.

##### `clearAll(): void`
Clears all application data from localStorage.

---

### LicenseService

Singleton service for license management.

#### Methods

##### `getInstance(): LicenseService`
Returns the singleton instance.

##### `async activateLicense(licenseKey: string): Promise<ActivationResult>`
Activates a license.

**Parameters:**
- `licenseKey`: 16-character license key (format: XXXX-XXXX-XXXX-XXXX)

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
  requiresTransfer?: boolean;
  status?: ActivationStatus;
}
```

**Errors:**
- Invalid format
- Server validation failure
- Device binding failure

##### `async validateLocalLicense(): Promise<ValidationResult>`
Validates license against local license file (offline).

**Returns:**
```typescript
{
  valid: boolean;
  requiresTransfer?: boolean;
}
```

##### `async isLicensed(): Promise<boolean>`
Checks if user has an active license (valid local license for this device).

**Returns:** `true` if licensed, `false` otherwise.

##### `async getLicenseInfo(): Promise<LicenseInfo>`
Gets current license information.

**Returns:**
```typescript
{
  isValid: boolean;
  key: string | null;
  activatedDate: Date | null;
  deviceId: string | null;
}
```

##### `async transferLicense(licenseKey: string): Promise<TransferResult>`
Transfers license to current device.

**Parameters:**
- `licenseKey`: License to transfer

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
}
```

##### `formatLicenseKey(key: string): string`
Formats license key for display.

##### `validateKeyFormat(key: string): boolean`
Validates license format.

##### `async isLicenseActive(): Promise<boolean>`
Equivalent to `isLicensed()`. AfterPassing Guide has no trial; license only.

---

### TaskGenerationEngine

Stateless service for generating task plans.

#### Functions

##### `generateAftercarePlan(input: TaskGenerationInput): TaskGenerationResult`
Generates a personalized aftercare plan.

**Parameters:**
```typescript
{
  profile: AftercareProfile;
  vaultRecords?: LegacyVaultRecord[];
  existingPlan?: AftercarePlan;
}
```

**Returns:**
```typescript
{
  plan: AftercarePlan;
  summary: string;
}
```

##### `getPhaseInfo(phase: TaskPhase): PhaseInfo`
Gets information about a task phase.

**Parameters:**
- `phase`: Task phase identifier

**Returns:**
```typescript
{
  label: string;
  description: string;
}
```

**Phases:**
- `FIRST_48_HOURS`: First 48 Hours
- `WEEK_1`: Week 1
- `WEEKS_2_6`: Weeks 2-6
- `DAYS_60_90`: Days 60-90
- `LONG_TERM`: Long Term

---

### ExecutorService

Stateless service for executor tools.

#### Functions

##### `generateExecutorChecklist(profile: AftercareProfile, vaultRecords?: LegacyVaultRecord[]): ExecutorChecklistItem[]`
Generates executor checklist items.

##### `generateContactsFromVault(vaultRecords: LegacyVaultRecord[]): ContactEntry[]`
Generates contact entries from vault records.

##### `getChecklistProgress(checklist: ExecutorChecklistItem[]): ProgressInfo`
Calculates checklist completion progress.

**Returns:**
```typescript
{
  total: number;
  completed: number;
  percentage: number;
}
```

##### `getContactProgress(contacts: ContactEntry[]): ProgressInfo`
Calculates contact completion progress.

##### `getChecklistCategoryInfo(category: ExecutorChecklistCategory): CategoryInfo`
Gets information about a checklist category.

##### `getContactTypeInfo(type: ContactType): TypeInfo`
Gets information about a contact type.

---

### LLVIntegration

Singleton service for Local Legacy Vault integration.

#### Methods

##### `getInstance(): LLVIntegration`
Returns the singleton instance.

##### `async detectMode(): Promise<AppMode>`
Detects if running standalone or embedded.

**Returns:** `'STANDALONE'` or `'EMBEDDED'`

##### `async loadLegacyVaultSummary(): Promise<LegacyVaultRecord[]>`
Loads vault summary from LLV (embedded mode only).

**Returns:** Array of vault records.

##### `async isAftercareEnabled(): Promise<boolean>`
Checks if Aftercare add-on is enabled in LLV.

**Returns:** `true` if enabled, `false` otherwise.

##### `async saveAddonState(state: LLVAddonsState): Promise<boolean>`
Saves add-on state to LLV storage.

---

### ExportService

Stateless service for generating exports.

#### Functions

##### `async exportPlanToPdf(plan: AftercarePlan, options: PlanExportOptions): Promise<string>`
Exports plan to PDF (currently text-based placeholder).

**Parameters:**
```typescript
{
  includeTasks?: boolean;
  includeDocuments?: boolean;
  includeContacts?: boolean;
}
```

**Returns:** Text representation (PDF generation pending).

##### `async exportBinderToPdf(plan: AftercarePlan, checklist: ExecutorChecklistItem[], contacts: ContactEntry[], options: BinderExportOptions): Promise<string>`
Exports comprehensive binder to PDF.

**Parameters:**
```typescript
{
  includeTasks?: boolean;
  includeChecklist?: boolean;
  includeContacts?: boolean;
  includeDocumentSummaries?: boolean;
}
```

---

### ScriptTemplates

Template service for phone scripts, letters, and emails.

#### Functions

##### `getScriptTemplates(): ScriptTemplate[]`
Gets all available script templates.

**Returns:** Array of template objects with:
- `id`: Unique identifier
- `type`: Template type (PHONE_SCRIPT, LETTER, EMAIL, GUIDE)
- `title`: Display title
- `description`: Template description
- `category`: Category classification
- `placeholders`: Array of placeholder names
- `bodyTemplate`: Template string with placeholders

##### `renderTemplate(templateId: string, context: ScriptRenderContext): string`
Renders a template with provided context.

**Parameters:**
- `templateId`: Template identifier
- `context`: Object with placeholder values

**Returns:** Rendered template string.

**Placeholders:**
- `[Deceased Name]`: Name of deceased
- `[Your Name]`: User's name
- `[Your Relationship]`: Relationship to deceased
- `[Date of Death]`: Date of death
- `[Date]`: Current date or placeholder
- `[Your Address]`: User's address
- `[Your Phone]`: User's phone number
- `[Your Email]`: User's email

---

## Type Definitions

### Core Types

```typescript
// Profile
interface AftercareProfile {
  id: string;
  userRole?: UserRole;
  relationship?: RelationshipType;
  deceasedName?: string;
  dateOfDeath?: string;
  country?: string;
  region?: string;
  isExecutor?: boolean;
  hasConfirmedDisclaimer: boolean;
  createdAt: string;
  updatedAt: string;
}

// Plan
interface AftercarePlan {
  id: string;
  profileId: string;
  tasks: AftercareTask[];
  summary: string;
  createdAt: string;
  lastUpdatedAt: string;
}

// Task
interface AftercareTask {
  id: string;
  phase: TaskPhase;
  category: TaskCategory;
  title: string;
  description: string;
  status: TaskStatus;
  reason?: string;
  relatedVaultRecordIds?: string[];
  completedAt?: string;
  notes?: string;
}

// Executor Checklist
interface ExecutorChecklistItem {
  id: string;
  category: ExecutorChecklistCategory;
  title: string;
  description: string;
  status: 'NOT_STARTED' | 'DONE';
  completedAt?: string;
  notes?: string;
}

// Contact
interface ContactEntry {
  id: string;
  type: ContactType;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  status: 'NOT_CONTACTED' | 'CONTACTED' | 'COMPLETED';
  contactedAt?: string;
}
```

### Enums

```typescript
type UserRole = 'SELF' | 'SPOUSE_PARTNER' | 'PARENT' | 'FAMILY_FRIEND' | 'NOT_SURE';
type TaskPhase = 'FIRST_48_HOURS' | 'WEEK_1' | 'WEEKS_2_6' | 'DAYS_60_90' | 'LONG_TERM';
type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | 'NOT_APPLICABLE';
type AppMode = 'STANDALONE' | 'EMBEDDED';
```

---

## Error Handling

All service methods that can fail return result objects with:
- `success: boolean` or `valid: boolean`
- `error?: string` - Human-readable error message

Services log errors to console but don't throw exceptions. Components should check result objects and display errors to users.

---

## Storage Keys

All localStorage keys are prefixed with `aftercare_*`:
- `aftercare_profile`
- `aftercare_plan`
- `aftercare_documents`
- `aftercare_contacts`
- `aftercare_checklist`
- `aftercare_license_file`
- `aftercare_license_key`
- `aftercare_license_activated`
- `aftercare_device_id`
- `aftercare_has_visited`
- `aftercare_user_state`
- `aftercare_focus_tasks`

