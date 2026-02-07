/**
 * Backup Service
 * 
 * Handles full state export/import for backup and restore functionality.
 */

import {
  AftercareProfile,
  AftercarePlan,
  UploadedDocument,
  ContactEntry,
  ExecutorChecklistItem,
} from '../types';
import { storageService } from './storageService';

export interface BackupData {
  version: string;
  exportDate: string;
  profile: AftercareProfile | null;
  plan: AftercarePlan | null;
  documents: UploadedDocument[];
  contacts: ContactEntry[];
  checklist: ExecutorChecklistItem[];
  metadata: {
    profileExists: boolean;
    planExists: boolean;
    documentCount: number;
    contactCount: number;
    checklistItemCount: number;
  };
}

/**
 * Export full application state to JSON
 */
export async function exportBackup(): Promise<string> {
  try {
    const profile = await storageService.loadProfile();
    const plan = await storageService.loadPlan();
    const documents = await storageService.loadDocuments();
    const contacts = await storageService.loadContacts();
    const checklist = await storageService.loadChecklist();
    
    const backup: BackupData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      profile,
      plan,
      documents,
      contacts,
      checklist,
      metadata: {
        profileExists: profile !== null,
        planExists: plan !== null,
        documentCount: documents.length,
        contactCount: contacts.length,
        checklistItemCount: checklist.length,
      },
    };
    
    return JSON.stringify(backup, null, 2);
  } catch (error) {
    console.error('Backup export failed:', error);
    throw new Error('Failed to export backup. Please try again.');
  }
}

/**
 * Import backup data from JSON
 */
export interface ImportResult {
  success: boolean;
  error?: string;
  imported: {
    profile: boolean;
    plan: boolean;
    documents: number;
    contacts: number;
    checklist: number;
  };
}

export async function importBackup(backupJson: string): Promise<ImportResult> {
  try {
    const backup: BackupData = JSON.parse(backupJson);
    
    // Validate backup structure
    if (!backup.version || !backup.exportDate) {
      return {
        success: false,
        error: 'Invalid backup file format. Missing version or export date.',
        imported: {
          profile: false,
          plan: false,
          documents: 0,
          contacts: 0,
          checklist: 0,
        },
      };
    }
    
    const imported = {
      profile: false,
      plan: false,
      documents: 0,
      contacts: 0,
      checklist: 0,
    };
    
    // Import profile
    if (backup.profile) {
      await storageService.saveProfile(backup.profile);
      imported.profile = true;
    }
    
    // Import plan
    if (backup.plan) {
      await storageService.savePlan(backup.plan);
      imported.plan = true;
    }
    
    // Import documents
    if (backup.documents && Array.isArray(backup.documents)) {
      await storageService.saveDocuments(backup.documents);
      imported.documents = backup.documents.length;
    }
    
    // Import contacts
    if (backup.contacts && Array.isArray(backup.contacts)) {
      await storageService.saveContacts(backup.contacts);
      imported.contacts = backup.contacts.length;
    }
    
    // Import checklist
    if (backup.checklist && Array.isArray(backup.checklist)) {
      await storageService.saveChecklist(backup.checklist);
      imported.checklist = backup.checklist.length;
    }
    
    return {
      success: true,
      imported,
    };
  } catch (error) {
    console.error('Backup import failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to import backup: ${errorMessage}`,
      imported: {
        profile: false,
        plan: false,
        documents: 0,
        contacts: 0,
        checklist: 0,
      },
    };
  }
}

/**
 * Download backup as file
 */
export async function downloadBackup(): Promise<void> {
  try {
    const backupJson = await exportBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aftercare_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Backup download failed:', error);
    throw new Error('Failed to download backup. Please try again.');
  }
}

/**
 * Export a single case to JSON (for .apgcase or backup).
 * Contains plan, documents, contacts, checklist for that case only.
 */
export interface CaseExportData {
  version: string;
  exportDate: string;
  caseId: string;
  caseLabel: string;
  profile: AftercareProfile | null;
  plan: AftercarePlan | null;
  documents: UploadedDocument[];
  contacts: ContactEntry[];
  checklist: ExecutorChecklistItem[];
  metadata: {
    documentCount: number;
    contactCount: number;
    checklistItemCount: number;
    taskCount: number;
  };
}

export async function exportCaseToJson(caseId: string, caseLabel: string): Promise<string> {
  const plan = await storageService.loadPlanForCase(caseId);
  const allDocs = await storageService.loadAllDocuments();
  const allContacts = await storageService.loadAllContacts();
  const allChecklist = await storageService.loadAllChecklist();
  const documents = allDocs.filter((d) => d.caseId === caseId);
  const contacts = allContacts.filter((c) => c.caseId === caseId);
  const checklist = allChecklist.filter((i) => i.caseId === caseId);
  const taskCount = plan?.tasks?.length ?? 0;
  const data: CaseExportData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    caseId,
    caseLabel,
    profile: plan?.profile ?? null,
    plan,
    documents,
    contacts,
    checklist,
    metadata: {
      documentCount: documents.length,
      contactCount: contacts.length,
      checklistItemCount: checklist.length,
      taskCount,
    },
  };
  return JSON.stringify(data, null, 2);
}

export async function downloadCaseExport(caseId: string, caseLabel: string): Promise<void> {
  const json = await exportCaseToJson(caseId, caseLabel);
  const safeName = caseLabel.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 40);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}_${new Date().toISOString().split('T')[0]}.apgcase.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Load backup from file
 */
export async function loadBackupFromFile(file: File): Promise<ImportResult> {
  try {
    const text = await file.text();
    return await importBackup(text);
  } catch (error) {
    console.error('Backup file load failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to load backup file: ${errorMessage}`,
      imported: {
        profile: false,
        plan: false,
        documents: 0,
        contacts: 0,
        checklist: 0,
      },
    };
  }
}

