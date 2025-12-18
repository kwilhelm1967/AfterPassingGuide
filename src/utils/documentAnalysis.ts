/**
 * Document Analysis Utilities
 * 
 * Extracts metadata and provides basic organizational information
 * about uploaded documents. This is NOT legal analysis - just
 * organizational metadata extraction.
 */

import type { UploadedDocument, DocumentType } from '../types';

export interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: Date;
  documentType?: DocumentType;
  suggestedCategory?: string;
  organizationalNotes?: string[];
}

/**
 * Extract metadata from a file
 */
export function extractDocumentMetadata(file: File): DocumentMetadata {
  const metadata: DocumentMetadata = {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || getFileTypeFromExtension(file.name),
    uploadDate: new Date(),
  };

  // Suggest category based on file name
  metadata.suggestedCategory = suggestCategoryFromFileName(file.name);
  
  // Generate organizational notes
  metadata.organizationalNotes = generateOrganizationalNotes(metadata);

  return metadata;
}

/**
 * Get file type from extension
 */
function getFileTypeFromExtension(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const typeMap: Record<string, string> = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'txt': 'text/plain',
  };
  return typeMap[ext] || 'application/octet-stream';
}

/**
 * Suggest document category from file name
 */
function suggestCategoryFromFileName(fileName: string): string {
  const lower = fileName.toLowerCase();
  
  if (lower.includes('will') || lower.includes('testament')) {
    return 'Estate Planning';
  }
  if (lower.includes('trust')) {
    return 'Estate Planning';
  }
  if (lower.includes('death') || lower.includes('certificate')) {
    return 'Vital Records';
  }
  if (lower.includes('insurance') || lower.includes('policy')) {
    return 'Insurance';
  }
  if (lower.includes('bank') || lower.includes('statement') || lower.includes('account')) {
    return 'Financial';
  }
  if (lower.includes('deed') || lower.includes('property') || lower.includes('title')) {
    return 'Property';
  }
  if (lower.includes('tax') || lower.includes('irs') || lower.includes('return')) {
    return 'Tax';
  }
  if (lower.includes('power') || lower.includes('attorney') || lower.includes('poa')) {
    return 'Legal Documents';
  }
  
  return 'General';
}

/**
 * Generate organizational notes based on metadata
 */
function generateOrganizationalNotes(metadata: DocumentMetadata): string[] {
  const notes: string[] = [];
  
  // File size note
  if (metadata.fileSize > 10 * 1024 * 1024) {
    notes.push('Large file - ensure you have a backup');
  }
  
  // Date-based notes
  const uploadYear = metadata.uploadDate.getFullYear();
  const currentYear = new Date().getFullYear();
  if (uploadYear < currentYear - 5) {
    notes.push('Document is older than 5 years - verify if still current');
  }
  
  // Type-based notes
  if (metadata.suggestedCategory === 'Estate Planning') {
    notes.push('Keep original in a secure location');
    notes.push('Consider consulting an attorney for interpretation');
  }
  
  if (metadata.suggestedCategory === 'Financial') {
    notes.push('Note any account numbers or policy numbers');
    notes.push('Keep with other financial records');
  }
  
  if (metadata.suggestedCategory === 'Vital Records') {
    notes.push('Keep certified copies in a safe location');
    notes.push('You may need multiple copies for various institutions');
  }
  
  // General notes
  notes.push('Add your own notes below to track important details');
  
  return notes;
}

/**
 * Analyze document and provide summary
 */
export function analyzeDocument(doc: UploadedDocument, metadata?: DocumentMetadata): {
  summary: string;
  keyPoints: string[];
} {
  const docTypeLabels: Record<string, string> = {
    'DEATH_CERTIFICATE': 'death certificate',
    'WILL': 'will or testament',
    'TRUST': 'trust document',
    'INSURANCE_POLICY': 'insurance policy',
    'BANK_STATEMENT': 'bank statement',
    'DEED': 'property deed',
    'TAX_DOCUMENT': 'tax document',
    'POWER_OF_ATTORNEY': 'power of attorney',
  };
  
  const docLabel = doc.documentType 
    ? docTypeLabels[doc.documentType] || doc.documentType.toLowerCase().replace('_', ' ')
    : 'document';
  
  const summary = `This ${docLabel} has been added to your records for reference. ${metadata?.organizationalNotes?.[0] || 'You can add notes below to track important details.'}`;
  
  const keyPoints = metadata?.organizationalNotes || [
    'Keep the original in a safe location',
    'Note any account numbers or policy numbers',
    'Consider consulting professionals for interpretation',
  ];
  
  return { summary, keyPoints };
}

