/**
 * Document Type Constants
 * 
 * Available document types for upload and categorization.
 */

import { DocumentType } from '../types';

export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'WILL', label: 'Will' },
  { value: 'TRUST', label: 'Trust' },
  { value: 'INSURANCE_POLICY', label: 'Insurance Policy' },
  { value: 'BANK_STATEMENT', label: 'Bank Statement' },
  { value: 'LOAN_DOCUMENT', label: 'Loan Document' },
  { value: 'DEED', label: 'Property Deed' },
  { value: 'TITLE', label: 'Vehicle Title' },
  { value: 'TAX_RETURN', label: 'Tax Return' },
  { value: 'OTHER', label: 'Other' },
];

