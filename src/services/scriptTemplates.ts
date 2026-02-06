/**
 * Script and Letter Templates Service
 * 
 * Provides templates for common communications needed during estate administration.
 * Included in AfterPassing Guide.
 * 
 * IMPORTANT: These templates provide administrative guidance only.
 * Users should customize them for their specific situation.
 */

import {
  ScriptTemplate,
  ScriptTemplateType,
  ScriptRenderContext,
} from '../types';

// ============================================================================
// TEMPLATE LIBRARY
// ============================================================================

export const SCRIPT_TEMPLATES: ScriptTemplate[] = [
  // Bank Notification
  {
    id: 'bank-notification-phone',
    type: 'BANK_NOTIFICATION',
    title: 'Bank Notification Call Script',
    description: 'A guide for calling your bank to notify them of the passing.',
    category: 'PHONE_SCRIPT',
    placeholders: ['deceasedName', 'userName', 'userRelationship', 'institutionName', 'accountReference'],
    bodyTemplate: `Hello, my name is {{userName}}. I'm calling to notify you that {{deceasedName}}, who held an account with {{institutionName}}, has passed away. I am {{userRelationship}}. Account reference: {{accountReference}}.

Please tell me what documents you need, what options exist for the account going forward, if there's a specific department I should speak with, and the typical timeline for this process.

Thank you for your assistance during this difficult time.`,
  },
  {
    id: 'bank-notification-letter',
    type: 'BANK_NOTIFICATION',
    title: 'Bank Notification Letter',
    description: 'A formal letter template for notifying a bank.',
    category: 'LETTER',
    placeholders: ['deceasedName', 'userName', 'userRelationship', 'institutionName', 'accountReference', 'dateOfDeath', 'todayDate', 'userAddress', 'userPhone'],
    bodyTemplate: `{{todayDate}}
{{institutionName}}
[Bank Address]
Re: Notification of Death
Deceased: {{deceasedName}}
Account: {{accountReference}}

To Whom It May Concern:

I am writing to notify you of the death of {{deceasedName}}, who passed away on {{dateOfDeath}}. I am {{userRelationship}} of the deceased.

Please let me know: (1) what documents would be helpful (I can provide a certified death certificate), (2) any forms to complete, (3) the process for handling the account, and (4) the general timeline.

Please contact me with next steps.

Sincerely,

{{userName}}
{{userAddress}}
{{userPhone}}`,
  },

  // Credit Card Closure
  {
    id: 'credit-card-closure-phone',
    type: 'CREDIT_CARD_CLOSURE',
    title: 'Credit Card Closure Call Script',
    description: 'A guide for calling to close a credit card account.',
    category: 'PHONE_SCRIPT',
    placeholders: ['deceasedName', 'userName', 'userRelationship', 'institutionName', 'accountReference'],
    bodyTemplate: `Hello, my name is {{userName}}. I'm calling regarding a credit card account held by {{deceasedName}}, who has passed away. I am {{userRelationship}}. Account reference: {{accountReference}}.

I would like to notify you of the death, stop any automatic payments or recurring charges, understand the process for closing the account, and learn about any remaining balance procedures.

Please let me know what documentation would be helpful and the next steps.

Thank you for your help.`,
  },

  // Utility Cancellation
  {
    id: 'utility-cancellation-phone',
    type: 'UTILITY_CANCELLATION',
    title: 'Utility Service Call Script',
    description: 'A guide for managing utility accounts.',
    category: 'PHONE_SCRIPT',
    placeholders: ['deceasedName', 'userName', 'userRelationship', 'institutionName', 'accountReference'],
    bodyTemplate: `Hello, my name is {{userName}}.

I'm calling about the {{institutionName}} account for {{deceasedName}}, who has passed away. I am {{userRelationship}}.

I would like to discuss options for this account. Depending on the situation, I may need to:
- Transfer the account to another name
- Continue service temporarily
- Schedule a final reading and close the account

The account reference is {{accountReference}}.

Please tell me what information you need from me and what my options are.

Thank you.`,
  },

  // Subscription Cancellation
  {
    id: 'subscription-cancellation-email',
    type: 'SUBSCRIPTION_CANCELLATION',
    title: 'Subscription Cancellation Email',
    description: 'An email template for canceling subscriptions.',
    category: 'EMAIL',
    placeholders: ['deceasedName', 'userName', 'userRelationship', 'institutionName', 'accountReference', 'dateOfDeath'],
    bodyTemplate: `Subject: Account Cancellation Request - {{deceasedName}}

Dear {{institutionName}} Customer Service,

I am writing to request cancellation of the account held by {{deceasedName}}, who passed away on {{dateOfDeath}}. I am {{userRelationship}} of the deceased. Account: {{accountReference}}.

I would like to request cancellation of the account and ask that any recurring charges be stopped. If there is any unused prepaid portion, please let me know about the refund process. I can provide a death certificate if helpful.

Thank you for your assistance.
Sincerely,

{{userName}}`,
  },

  // Employer Notification
  {
    id: 'employer-notification-phone',
    type: 'EMPLOYER_NOTIFICATION',
    title: 'Employer Notification Call Script',
    description: 'A guide for contacting an employer\'s HR department.',
    category: 'PHONE_SCRIPT',
    placeholders: ['deceasedName', 'userName', 'userRelationship', 'institutionName'],
    bodyTemplate: `Hello, my name is {{userName}}. I'm calling to notify you that {{deceasedName}}, who was employed at {{institutionName}}, has passed away. I am {{userRelationship}}.

I would like to inquire about: final pay or remaining compensation, unused vacation or PTO balance, life insurance benefits, retirement or pension benefits, COBRA or health insurance options, and any personal belongings at the workplace.

Please direct me to the appropriate contact for these matters and let me know what documentation you will need. Thank you for your understanding.`,
  },

  // Insurance Claim Request
  {
    id: 'insurance-claim-phone',
    type: 'INSURANCE_CLAIM_REQUEST',
    title: 'Insurance Claim Call Script',
    description: 'A guide for initiating an insurance claim.',
    category: 'PHONE_SCRIPT',
    placeholders: ['deceasedName', 'userName', 'userRelationship', 'institutionName', 'accountReference'],
    bodyTemplate: `Hello, my name is {{userName}}. I'm calling to report a claim on a policy held by {{deceasedName}}, who has passed away. I am {{userRelationship}} and believe I may be a beneficiary. Policy number: {{accountReference}}.

I would like to understand how to file a claim, what documentation you typically need, the general timeline for processing, and any forms I may need to complete. I have a certified copy of the death certificate available.

Please provide the next steps. Thank you.`,
  },
  {
    id: 'insurance-claim-letter',
    type: 'INSURANCE_CLAIM_REQUEST',
    title: 'Insurance Claim Letter',
    description: 'A formal letter for filing an insurance claim.',
    category: 'LETTER',
    placeholders: ['deceasedName', 'userName', 'userRelationship', 'institutionName', 'accountReference', 'dateOfDeath', 'todayDate', 'userAddress', 'userPhone'],
    bodyTemplate: `{{todayDate}}
{{institutionName}} Claims Department
[Insurance Company Address]
Re: Death Claim
Policy #{{accountReference}}
Insured: {{deceasedName}}
Date of Death: {{dateOfDeath}}

Dear Claims Department:

I am writing to file a death claim on the above policy. {{deceasedName}} passed away on {{dateOfDeath}}. I am {{userRelationship}} and believe I am named as a beneficiary. Enclosed is a certified copy of the death certificate.

Please send any claim forms needed and let me know what additional documentation may be helpful.

Contact: {{userName}}
{{userAddress}}
{{userPhone}}

Thank you for your prompt attention.`,
  },

  // Pension Benefits Request
  {
    id: 'pension-benefits-phone',
    type: 'PENSION_BENEFITS_REQUEST',
    title: 'Pension Benefits Call Script',
    description: 'A guide for inquiring about pension or retirement benefits.',
    category: 'PHONE_SCRIPT',
    placeholders: ['deceasedName', 'userName', 'userRelationship', 'institutionName'],
    bodyTemplate: `Hello, my name is {{userName}}. I'm calling to inquire about pension or retirement benefits for {{deceasedName}}, who has passed away. I am {{userRelationship}}.

{{deceasedName}} was receiving benefits from {{institutionName}}, or may have had benefits that hadn't started yet. I would like to understand whether there are survivor benefits available, what documentation you need, the process for filing a claim, and how to update your records.

Please provide any relevant information. Thank you.`,
  },

  // Government Benefits Notification
  {
    id: 'government-benefits-phone',
    type: 'GOVERNMENT_BENEFITS_NOTIFICATION',
    title: 'Government Benefits Call Script',
    description: 'A guide for notifying government benefit agencies.',
    category: 'PHONE_SCRIPT',
    placeholders: ['deceasedName', 'userName', 'userRelationship'],
    bodyTemplate: `Hello, my name is {{userName}}. I'm calling to report the death of {{deceasedName}}, who was receiving benefits. I am {{userRelationship}}.

I would like to notify you of the death, stop future payments if applicable, inquire about any survivor benefits, and understand if any overpayments need to be returned.

Please tell me what information you need from me and the next steps. Thank you.`,
  },

  // Landlord Notification
  {
    id: 'landlord-notification-letter',
    type: 'LANDLORD_NOTIFICATION',
    title: 'Landlord Notification Letter',
    description: 'A letter template for notifying a landlord.',
    category: 'LETTER',
    placeholders: ['deceasedName', 'userName', 'userRelationship', 'dateOfDeath', 'todayDate', 'userAddress', 'userPhone'],
    bodyTemplate: `{{todayDate}}
[Landlord/Property Management Name]
[Property Address]
Re: Notice Regarding Tenant {{deceasedName}}

Dear [Landlord Name]:

I am writing to inform you that {{deceasedName}}, the tenant at [Rental Address], passed away on {{dateOfDeath}}. I am {{userRelationship}} and am handling their affairs.

I would like to discuss the lease agreement and any remaining obligations, a timeline for vacating and returning keys, return of the security deposit, and any final utility readings needed.

Please contact me to discuss the best way to proceed.

Sincerely,

{{userName}}
{{userAddress}}
{{userPhone}}`,
  },

  // Creditor Notification
  {
    id: 'creditor-notification-letter',
    type: 'CREDITOR_NOTIFICATION',
    title: 'Creditor Notification Letter',
    description: 'A letter template for notifying creditors.',
    category: 'LETTER',
    placeholders: ['deceasedName', 'userName', 'userRelationship', 'institutionName', 'accountReference', 'dateOfDeath', 'todayDate', 'userAddress'],
    bodyTemplate: `{{todayDate}}
{{institutionName}}
[Creditor Address]
Re: Notice of Death
Account: {{accountReference}}
Deceased: {{deceasedName}}

To Whom It May Concern:

This letter is to notify you that {{deceasedName}}, the holder of account {{accountReference}}, passed away on {{dateOfDeath}}. I am {{userRelationship}} and am providing this notification for your records.

Please update your records accordingly. I would appreciate if collection activities directed at the deceased could be stopped. If you need documentation or have questions about the estate, please contact me.

Sincerely,

{{userName}}
{{userAddress}}`,
  },

  // Social Security Administration
  {
    id: 'social-security-phone',
    type: 'SOCIAL_SECURITY_NOTIFICATION',
    title: 'Social Security Call Script',
    description: 'A guide for calling Social Security to report a death and claim benefits.',
    category: 'PHONE_SCRIPT',
    placeholders: ['deceasedName', 'userName', 'userRelationship'],
    bodyTemplate: `SOCIAL SECURITY ADMINISTRATION
Call: 1-800-772-1213 (TTY 1-800-325-0778)
Hours: Mon-Fri, 8am-7pm
Website: ssa.gov
NOTE: SSA is typically notified by phone or in person, not online.

HAVE READY:
- Deceased's SSN, date of birth, date of death
- Your SSN
- Certified death certificate
- Proof of relationship (marriage/birth certificate)

KEY FORMS:
- SSA-10: Widow(er)'s Benefits
- SSA-4: Child's Benefits
- SSA-8: Lump-Sum $255
- SSA-721: Statement of Death

CALL SCRIPT:
Hello, my name is {{userName}}. I am calling to report the death of {{deceasedName}}. I am {{userRelationship}}.

I would like to report the death to stop benefit payments, check if the funeral home has already notified you, apply for the lump-sum death benefit ($255), ask about survivor benefits, and report any benefits received after the date of death.

Could you let me know what information would be helpful for this notification?

SURVIVOR BENEFITS:
- Widow(er) 60+: 71.5-100%
- Widow(er) 50-59 disabled: 71.5%
- Widow(er) with child under 16: 75%
- Children under 18: 75% each
- Lump-sum: $255 (spouse/child only)

Benefits are not automatic—many families choose to apply when ready.`,
  },

  // Credit Bureau Notification
  {
    id: 'credit-bureau-letter',
    type: 'CREDIT_BUREAU_NOTIFICATION',
    title: 'Credit Bureau Death Notification',
    description: 'Letter template to notify credit bureaus and request a deceased alert.',
    category: 'LETTER',
    placeholders: ['deceasedName', 'userName', 'userRelationship', 'dateOfDeath', 'todayDate', 'userAddress', 'userPhone'],
    bodyTemplate: `[Date]


Send to:
- Equifax: P.O. Box 105139, Atlanta, GA 30348
- Experian: P.O. Box 4500, Allen, TX 75013
- TransUnion: P.O. Box 2000, Chester, PA 19016


Re: Deceased Consumer Alert

Name: {{deceasedName}}
Date of Death: {{dateOfDeath}}


To Whom It May Concern:


I am writing to notify you of the death of {{deceasedName}}, who passed away on {{dateOfDeath}}. I am {{userRelationship}} and request that you place a "deceased" notation on the credit file to prevent fraudulent activity.


Enclosed: Certified death certificate and proof of authority (executor letter or relationship documentation).


Please confirm in writing that the deceased alert has been placed.


Sincerely,


{{userName}}
{{userAddress}}
{{userPhone}}`,
  },

  // Mortgage Company Notification
  {
    id: 'mortgage-notification-phone',
    type: 'MORTGAGE_NOTIFICATION',
    title: 'Mortgage Company Call Script',
    description: 'A guide for notifying your mortgage lender.',
    category: 'PHONE_SCRIPT',
    placeholders: ['deceasedName', 'userName', 'userRelationship', 'institutionName', 'accountReference'],
    bodyTemplate: `Hello, my name is {{userName}}. I am calling about a mortgage held by {{deceasedName}}, who has passed away. I am {{userRelationship}}. The mortgage is with {{institutionName}}, account/loan number: {{accountReference}}.

I would like to understand my options for this mortgage, the process to assume the loan or continue payments if staying in the home, what documentation you need, any protections for surviving spouses or heirs, and whether there is mortgage life insurance on this loan.

Please provide the next steps. Thank you for your help.`,
  },

  // Veterans Affairs Notification
  {
    id: 'veterans-affairs-phone',
    type: 'VETERANS_NOTIFICATION',
    title: 'Veterans Affairs Call Script',
    description: 'A guide for reporting a veteran\'s death to the VA.',
    category: 'PHONE_SCRIPT',
    placeholders: ['deceasedName', 'userName', 'userRelationship'],
    bodyTemplate: `VETERANS AFFAIRS
Call: 1-800-827-1000
Hours: Mon-Fri, 8am-9pm ET

HAVE READY:
- Veteran's full name, SSN, date of birth, date of death
- Military service dates and branch
- Death certificate
- DD-214 (if available)

Hello, my name is {{userName}}. I am calling to report the death of {{deceasedName}}, who was a veteran. I am {{userRelationship}}.

I would like to inquire about VA burial benefits and burial allowance, headstone or grave marker, burial in a national cemetery, survivor benefits for spouse or dependents, Dependency and Indemnity Compensation (DIC), and any pension benefits.

Please tell me what information and documentation you need from me. Thank you.`,
  },

  // DMV Notification
  {
    id: 'dmv-notification-letter',
    type: 'DMV_NOTIFICATION',
    title: 'DMV Notification Letter',
    description: 'Letter template to cancel a driver\'s license.',
    category: 'LETTER',
    placeholders: ['deceasedName', 'userName', 'userRelationship', 'dateOfDeath', 'todayDate', 'userAddress'],
    bodyTemplate: `{{todayDate}}
[Your State DMV]
[DMV Address]
Re: Cancellation of Driver's License
Name: {{deceasedName}}
Date of Death: {{dateOfDeath}}

To Whom It May Concern:

I am writing to request cancellation of the driver's license for {{deceasedName}}, who passed away on {{dateOfDeath}}. I am {{userRelationship}} and am handling their affairs.

Enclosed: Certified death certificate and original driver's license (if available, or note: "The license was not located").

Please remove the deceased from your records and confirm the cancellation in writing.

Sincerely,

{{userName}}
{{userAddress}}`,
  },

  // Health Insurance/COBRA
  {
    id: 'health-insurance-phone',
    type: 'HEALTH_INSURANCE_NOTIFICATION',
    title: 'Health Insurance Call Script',
    description: 'A guide for notifying health insurance and asking about COBRA.',
    category: 'PHONE_SCRIPT',
    placeholders: ['deceasedName', 'userName', 'userRelationship', 'institutionName', 'accountReference'],
    bodyTemplate: `Hello, my name is {{userName}}. I am calling about the health insurance policy for {{deceasedName}}, who has passed away. I am {{userRelationship}}. The policy is through {{institutionName}}, member/policy number: {{accountReference}}.

I need to notify you of the death, ask about coverage for surviving family members, understand COBRA continuation options and deadlines, ask about premium refunds, and confirm pending claims will still be processed.

Please tell me what documentation you need and what my options are for continuing coverage. Thank you.`,
  },

  // Professional Association Cancellation
  {
    id: 'membership-cancellation-email',
    type: 'MEMBERSHIP_CANCELLATION',
    title: 'Membership Cancellation Email',
    description: 'Email template for canceling professional associations and memberships.',
    category: 'EMAIL',
    placeholders: ['deceasedName', 'userName', 'userRelationship', 'institutionName', 'accountReference', 'dateOfDeath'],
    bodyTemplate: `Subject: Membership Cancellation Due to Death - {{deceasedName}}

Dear {{institutionName}} Member Services,

I am writing to notify you of the death of {{deceasedName}}, who passed away on {{dateOfDeath}}. I am {{userRelationship}} and am handling their affairs. Membership: {{accountReference}}.

I would like to request cancellation of this membership. If there is any refund due for prepaid fees, please let me know. I can provide a death certificate if helpful.

Thank you for your understanding.
Sincerely,

{{userName}}`,
  },

  // Social Media Memorialization
  {
    id: 'social-media-guide',
    type: 'SOCIAL_MEDIA_NOTIFICATION',
    title: 'Social Media Account Guide',
    description: 'Instructions for memorializing or deleting social media accounts.',
    category: 'GUIDE',
    placeholders: ['deceasedName'],
    bodyTemplate: `MANAGING SOCIAL MEDIA ACCOUNTS FOR {{deceasedName}}

FACEBOOK/META
Memorialize: facebook.com/help/contact/305593649477238
Delete: facebook.com/help/contact/228813257197480
Typically needs proof of death

INSTAGRAM
Website: help.instagram.com (search "deceased")
Options: Memorialize or Remove
Typically needs proof of death and relationship

TWITTER/X
Website: help.twitter.com
Typically needs death certificate and ID
Account deactivated, not memorialized

LINKEDIN
Website: linkedin.com/help/linkedin/ask/ts-rdmlp
Typically needs name, profile URL, relationship, death certificate

GOOGLE
Website: support.google.com/accounts/troubleshooter/6357590
Options: Request data or close account

TIPS
- Screenshot posts/photos first
- Download account data before deletion
- Check for 2FA requiring deceased's phone
- Some accounts needed for email recovery`,
  },

  // Student Loan Discharge
  {
    id: 'student-loan-federal-phone',
    type: 'STUDENT_LOAN_DISCHARGE',
    title: 'Federal Student Loan Discharge Script',
    description: 'Guide for discharging federal student loans due to death.',
    category: 'PHONE_SCRIPT',
    placeholders: ['deceasedName', 'userName', 'userRelationship'],
    bodyTemplate: `FEDERAL STUDENT LOAN DEATH DISCHARGE
Call: 1-800-557-7394
Hours: Mon-Fri, 8am-11pm ET
Website: StudentAid.gov
IMPORTANT: Federal loans are discharged upon borrower death. Parent PLUS loans discharged if student dies.

HAVE READY:
- Deceased's SSN
- Certified death certificate
- Loan servicer name (check StudentAid.gov)
- Loan account numbers

SERVICERS:
- Nelnet: 1-888-486-4722
- MOHELA: 1-888-866-4352
- Aidvantage: 1-800-722-1300
- EdFinancial: 1-855-337-6884
- OSLA: 1-866-264-9762

CALL SCRIPT:
Hello, my name is {{userName}}. I am calling to report the death of {{deceasedName}} and request a death discharge of their federal student loans. I am {{userRelationship}}.

I would like to report the death and request discharge, understand what documentation you need, ask where to send the death certificate, confirm no tax consequences (since 2018), and request collections stop immediately. Please provide the next steps.

KEY INFO:
- Federal loans 100% discharged, no tax liability
- Parent PLUS discharged if student or parent dies
- Processing: 30-60 days
- Payments after death may be refunded`,
  },
  {
    id: 'student-loan-private-letter',
    type: 'STUDENT_LOAN_DISCHARGE',
    title: 'Private Student Loan Death Notification',
    description: 'Letter template for private student loan death discharge.',
    category: 'LETTER',
    placeholders: ['deceasedName', 'userName', 'userRelationship', 'institutionName', 'accountReference', 'dateOfDeath', 'todayDate', 'userAddress', 'userPhone'],
    bodyTemplate: `{{todayDate}}
{{institutionName}}
[Lender Address]
Re: Death Discharge Request
Borrower: {{deceasedName}}
Account: {{accountReference}}
Date of Death: {{dateOfDeath}}

To Whom It May Concern:

I am writing to notify you of the death of {{deceasedName}}, who passed away on {{dateOfDeath}}. I am {{userRelationship}} and am handling their affairs.

I am writing to ask that you: (1) stop collection activities related to this account, (2) provide information about your death discharge policy, (3) let me know what documentation would be helpful, and (4) confirm whether any cosigner may be affected.

Enclosed: Certified death certificate. Please respond in writing within 30 days.

Sincerely,

{{userName}}
{{userAddress}}
{{userPhone}}

PRIVATE LENDER POLICIES:
- Sallie Mae, Discover, SoFi offer death discharge
- Navient varies by loan terms
- Check your loan agreement
- Some may release cosigner, others may not`,
  },
  {
    id: 'student-loan-cosigner-guide',
    type: 'STUDENT_LOAN_DISCHARGE',
    title: 'Student Loan Cosigner Death Guide',
    description: 'What to do if a cosigner dies on student loans.',
    category: 'GUIDE',
    placeholders: ['deceasedName'],
    bodyTemplate: `STUDENT LOAN COSIGNER DEATH - WHAT TO KNOW
If {{deceasedName}} was a COSIGNER on student loans (not the primary borrower):

FEDERAL LOANS: Do not have cosigners (except Parent PLUS, where parent is the borrower). Primary borrower remains responsible.

PRIVATE LOANS - WHEN COSIGNER DIES: Lenders may (1) continue normally with borrower only, (2) accelerate the loan (request full repayment - becoming less common), or (3) ask for a new cosigner or offer refinancing.

STEPS TO TAKE:
- Review loan agreement for death clauses
- Contact lender immediately
- Request policy in writing
- Ask about cosigner release if borrower has good credit
- Consider refinancing
- Get legal advice if lender threatens acceleration

LENDER CONTACTS:
- Sallie Mae: 1-888-272-5543
- Discover: 1-800-788-3368
- SoFi: 1-855-456-7634
- College Ave: 1-844-422-7543
- Citizens Bank: 1-888-411-0266`,
  },
];

// ============================================================================
// TEMPLATE FUNCTIONS
// ============================================================================

/**
 * Get all templates of a specific type
 */
export function getTemplatesByType(type: ScriptTemplateType): ScriptTemplate[] {
  return SCRIPT_TEMPLATES.filter(t => t.type === type);
}

/**
 * Get all templates of a specific category (phone, letter, email)
 */
export function getTemplatesByCategory(category: 'PHONE_SCRIPT' | 'LETTER' | 'EMAIL'): ScriptTemplate[] {
  return SCRIPT_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get a specific template by ID
 */
export function getTemplateById(id: string): ScriptTemplate | undefined {
  return SCRIPT_TEMPLATES.find(t => t.id === id);
}

/**
 * Render a template with the provided context
 */
export function renderScript(template: ScriptTemplate, context: ScriptRenderContext): string {
  let result = template.bodyTemplate;
  
  // Replace all placeholders
  result = result.replace(/\{\{deceasedName\}\}/g, context.deceasedName || '[Deceased Name]');
  result = result.replace(/\{\{userName\}\}/g, context.userName || '[Your Name]');
  result = result.replace(/\{\{userRelationship\}\}/g, context.userRelationship || '[Your Relationship]');
  result = result.replace(/\{\{institutionName\}\}/g, context.institutionName || '[Institution Name]');
  result = result.replace(/\{\{accountReference\}\}/g, context.accountReference || '[Account Number]');
  result = result.replace(/\{\{contactPhone\}\}/g, context.contactPhone || '[Phone Number]');
  result = result.replace(/\{\{dateOfDeath\}\}/g, context.dateOfDeath || '[Date of Death]');
  result = result.replace(/\{\{todayDate\}\}/g, context.todayDate || '[Date]');
  result = result.replace(/\{\{userAddress\}\}/g, context.userAddress || '[Your Address]');
  result = result.replace(/\{\{userPhone\}\}/g, context.userPhone || '[Your Phone]');
  result = result.replace(/\{\{userEmail\}\}/g, context.userEmail || '[Your Email]');
  
  return result;
}

/**
 * Get template type display information (category labels for left column).
 */
export function getTemplateTypeInfo(type: ScriptTemplateType): { label: string; icon: string } {
  const info: Record<ScriptTemplateType, { label: string; icon: string }> = {
    BANK_NOTIFICATION: { label: 'Banks', icon: 'Building2' },
    CREDIT_CARD_CLOSURE: { label: 'Credit Cards', icon: 'CreditCard' },
    UTILITY_CANCELLATION: { label: 'Utilities', icon: 'Lightbulb' },
    SUBSCRIPTION_CANCELLATION: { label: 'Subscriptions', icon: 'RefreshCcw' },
    EMPLOYER_NOTIFICATION: { label: 'Employer', icon: 'Briefcase' },
    INSURANCE_CLAIM_REQUEST: { label: 'Insurance', icon: 'Shield' },
    PENSION_BENEFITS_REQUEST: { label: 'Pension Benefits', icon: 'Wallet' },
    GOVERNMENT_BENEFITS_NOTIFICATION: { label: 'Government Benefits', icon: 'Landmark' },
    LANDLORD_NOTIFICATION: { label: 'Landlord', icon: 'Home' },
    CREDITOR_NOTIFICATION: { label: 'Creditors', icon: 'FileText' },
    SOCIAL_SECURITY_NOTIFICATION: { label: 'Social Security', icon: 'Landmark' },
    CREDIT_BUREAU_NOTIFICATION: { label: 'Credit Bureaus', icon: 'FileText' },
    MORTGAGE_NOTIFICATION: { label: 'Mortgage', icon: 'Home' },
    VETERANS_NOTIFICATION: { label: 'Veterans Affairs', icon: 'Shield' },
    DMV_NOTIFICATION: { label: 'DMV', icon: 'Car' },
    HEALTH_INSURANCE_NOTIFICATION: { label: 'Health Insurance', icon: 'Heart' },
    MEMBERSHIP_CANCELLATION: { label: 'Memberships', icon: 'Users' },
    SOCIAL_MEDIA_NOTIFICATION: { label: 'Social Media', icon: 'Share2' },
    STUDENT_LOAN_DISCHARGE: { label: 'Student Loans', icon: 'GraduationCap' },
  };
  return info[type] || { label: type, icon: 'FileText' };
}

/** Short, humanized display title for template list (optional override). */
const TEMPLATE_DISPLAY_TITLES: Record<string, string> = {
  'bank-notification-phone': 'Call a bank',
  'bank-notification-letter': 'Write to a bank',
  'credit-card-closure-phone': 'Call a credit card company',
  'utility-cancellation-phone': 'Call a utility provider',
  'subscription-cancellation-email': 'Cancel a subscription',
  'employer-notification-phone': 'Notify an employer',
  'insurance-claim-phone': 'Call an insurance provider',
  'insurance-claim-letter': 'Write to an insurance provider',
};

export function getTemplateDisplayTitle(template: ScriptTemplate): string {
  return TEMPLATE_DISPLAY_TITLES[template.id] ?? template.title;
}

/**
 * Get all unique template types
 */
export function getAllTemplateTypes(): ScriptTemplateType[] {
  const types = new Set<ScriptTemplateType>();
  SCRIPT_TEMPLATES.forEach(t => types.add(t.type));
  return Array.from(types);
}

