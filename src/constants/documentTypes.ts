/**
 * Document Type Constants
 *
 * Type, owner, importance, applies-to. Clarity over completeness; no required fields beyond upload.
 */

import type {
  DocumentType,
  DocumentOwner,
  DocumentImportance,
  DocumentAppliesTo,
  DocumentCategory,
  DocumentStatus,
} from '../types';

/** Document type (recommended). Default: Other. */
export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'Bond', label: 'Bond' },
  { value: 'Will', label: 'Will' },
  { value: 'Insurance', label: 'Insurance' },
  { value: 'Bank', label: 'Bank' },
  { value: 'Property', label: 'Property' },
  { value: 'Tax', label: 'Tax' },
  { value: 'ID', label: 'ID' },
  { value: 'Medical', label: 'Medical' },
  { value: 'Other', label: 'Other' },
];

/** Owner / related person (optional). */
export const DOCUMENT_OWNERS: { value: DocumentOwner; label: string }[] = [
  { value: 'Me', label: 'Me' },
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Child', label: 'Child' },
  { value: 'Parent', label: 'Parent' },
  { value: 'Estate', label: 'Estate' },
  { value: 'Other', label: 'Other' },
];

/** Importance for filtering and executor focus (optional). */
export const DOCUMENT_IMPORTANCE: { value: DocumentImportance; label: string }[] = [
  { value: 'Critical', label: 'Critical' },
  { value: 'Important', label: 'Important' },
  { value: 'Reference', label: 'Reference' },
];

/** Applies to (optional). Matters for crossover with Local Legacy Vault. */
export const APPLIES_TO: { value: DocumentAppliesTo; label: string }[] = [
  { value: 'Estate', label: 'Estate' },
  { value: 'Ongoing Life', label: 'Ongoing Life' },
  { value: 'After Passing Only', label: 'After Passing Only' },
];

/** Optional category for organization (do not force selection). */
export const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: 'Legal', label: 'Legal' },
  { value: 'Financial', label: 'Financial' },
  { value: 'Personal', label: 'Personal' },
  { value: 'Property', label: 'Property' },
  { value: 'Other', label: 'Other' },
];

/** Optional per-document status. */
export const DOCUMENT_STATUSES: { value: DocumentStatus; label: string }[] = [
  { value: 'Reference', label: 'Reference' },
  { value: 'Original', label: 'Original' },
  { value: 'Copy', label: 'Copy' },
  { value: 'Not sure', label: 'Not sure' },
];

