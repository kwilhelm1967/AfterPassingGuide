/**
 * Documents View
 *
 * A secure place to keep important documents easy to find.
 * Clarity over completeness; fewer decisions. No required fields beyond upload.
 */

import React, { useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { TitleBar } from '../common/TitleBar';
import type {
  UploadedDocument,
  AftercareProfile,
  DocumentCategory,
  DocumentStatus,
  DocumentType,
  DocumentOwner,
  DocumentImportance,
  DocumentAppliesTo,
  ExecutorChecklistItem,
} from '../../types';
import { storageService } from '../../services/storageService';
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_STATUSES,
  DOCUMENT_TYPES,
  DOCUMENT_OWNERS,
  DOCUMENT_IMPORTANCE,
  APPLIES_TO,
} from '../../constants/documentTypes';

interface DocumentsViewProps {
  documents: UploadedDocument[];
  onDocumentsChange: (docs: UploadedDocument[]) => void;
  profile: AftercareProfile;
  checklistItems?: ExecutorChecklistItem[];
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onDocumentsChange,
  checklistItems = [],
}) => {
  const saveDocs = async (updated: UploadedDocument[]) => {
    onDocumentsChange(updated);
    await storageService.saveDocuments(updated);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const newDoc: UploadedDocument = {
        id: crypto.randomUUID(),
        filePath: '',
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        userLabel: '',
        documentType: 'Other',
      };
      await saveDocs([...documents, newDoc]);
    } catch (error) {
      console.error('Failed to add document:', error);
    }
    e.target.value = '';
  };

  const handleDelete = async (docId: string) => {
    await saveDocs(documents.filter((d) => d.id !== docId));
  };

  const handleCategoryChange = async (docId: string, category: DocumentCategory | '') => {
    await saveDocs(documents.map((d) =>
      d.id === docId ? { ...d, category: category || undefined } : d
    ));
  };

  const handleNotesChange = async (docId: string, notes: string) => {
    await saveDocs(documents.map((d) =>
      d.id === docId ? { ...d, notes } : d
    ));
  };

  const handleStatusChange = async (docId: string, documentStatus: DocumentStatus | '') => {
    await saveDocs(documents.map((d) =>
      d.id === docId ? { ...d, documentStatus: documentStatus || undefined } : d
    ));
  };

  const handleLabelChange = async (docId: string, userLabel: string) => {
    await saveDocs(documents.map((d) =>
      d.id === docId ? { ...d, userLabel } : d
    ));
  };

  const handleTypeChange = async (docId: string, documentType: DocumentType) => {
    await saveDocs(documents.map((d) =>
      d.id === docId ? { ...d, documentType } : d
    ));
  };

  const handleOwnerChange = async (docId: string, ownerOrRelatedPerson: DocumentOwner | '') => {
    await saveDocs(documents.map((d) =>
      d.id === docId ? { ...d, ownerOrRelatedPerson: ownerOrRelatedPerson || undefined } : d
    ));
  };

  const handleImportanceChange = async (docId: string, importance: DocumentImportance | '') => {
    await saveDocs(documents.map((d) =>
      d.id === docId ? { ...d, importance: importance || undefined } : d
    ));
  };

  const handleAppliesToChange = async (docId: string, appliesTo: DocumentAppliesTo | '') => {
    await saveDocs(documents.map((d) =>
      d.id === docId ? { ...d, appliesTo: appliesTo || undefined } : d
    ));
  };

  const handleActionRequiredChange = async (docId: string, actionRequired: boolean) => {
    await saveDocs(documents.map((d) =>
      d.id === docId ? { ...d, actionRequired } : d
    ));
  };

  const handleLinkedTaskChange = async (docId: string, linkedTaskId: string) => {
    await saveDocs(documents.map((d) =>
      d.id === docId ? { ...d, linkedTaskId: linkedTaskId || undefined } : d
    ));
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div className="page-header-zone flex flex-col items-center text-center">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold text-text-primary">Documents</h2>
          <TitleBar className="mt-1.5" />
        </div>
        <p className="text-slate-400 text-sm mt-1.5 max-w-md">
          A secure place to keep important documents easy to find.
        </p>
      </div>

      {/* Compact disclaimer under title only */}
      <div className="rounded-lg bg-slate-800/30 border border-slate-700/50 p-3">
        <p className="text-xs text-slate-500 leading-relaxed">
          For reference only. Not legal advice. For legal, financial, or medical decisions, consult a qualified professional.
        </p>
      </div>

      {/* Single compact card: Add document button + drag hint. When docs exist, only button. */}
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-text-primary bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors w-fit"
        >
          <Upload className="w-4 h-4" aria-hidden="true" />
          Add document
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          className="hidden"
          aria-label="Select file to upload"
        />
        {documents.length === 0 && (
          <p className="text-[11px] text-slate-500">Or drag a file here. Stored on this device only.</p>
        )}
      </div>

      {/* Document list — filename + date in header; metadata inline two-column; notes collapsible; delete on hover */}
      {documents.length > 0 && (
        <div className="max-w-xl space-y-2">
          {documents.map((doc) => {
            const displayName = doc.userLabel || doc.fileName;
            return (
              <div
                key={doc.id}
                className="group/doc bg-slate-800/30 border border-slate-700/50 rounded-lg p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text-primary truncate text-sm">
                      {doc.fileName}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                      {doc.userLabel ? ` · ${doc.userLabel}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 text-slate-500 opacity-0 group-hover/doc:opacity-100 hover:text-slate-400 rounded transition-all flex-shrink-0"
                    aria-label="Remove document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Metadata: inline two-column; notes collapsible (collapsed by default) */}
                <details className="mt-2 pt-2 border-t border-slate-700/40 group/details">
                  <summary className="text-[11px] text-slate-500 cursor-pointer hover:text-slate-400 list-none py-0.5">
                    {doc.userLabel || doc.category || doc.documentStatus || doc.notes ? 'Details' : 'Add details'}
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Label</label>
                        <input
                          type="text"
                          value={doc.userLabel || ''}
                          onChange={(e) => handleLabelChange(doc.id, e.target.value)}
                          placeholder="Optional label"
                          className="block w-full text-xs text-text-primary placeholder-slate-500 bg-transparent border border-slate-700/50 rounded px-2 py-1 focus:outline-none focus:border-slate-600"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-text-muted block mb-0.5">Category</label>
                        <select
                          value={doc.category || ''}
                          onChange={(e) => handleCategoryChange(doc.id, e.target.value as DocumentCategory | '')}
                          className="doc-select block w-full text-xs bg-card-bg border border-border-subtle rounded px-2 py-1.5 pr-8 text-text-primary focus:outline-none focus:border-accent-gold/50"
                        >
                          <option value="">—</option>
                          {DOCUMENT_CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-text-muted block mb-0.5">Status</label>
                        <select
                          value={doc.documentStatus || ''}
                          onChange={(e) => handleStatusChange(doc.id, e.target.value as DocumentStatus | '')}
                          className="doc-select block w-full text-xs bg-card-bg border border-border-subtle rounded px-2 py-1.5 pr-8 text-text-primary focus:outline-none focus:border-accent-gold/50"
                        >
                          <option value="">—</option>
                          {DOCUMENT_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <details className="group/notes">
                      <summary className="text-[11px] text-slate-500 cursor-pointer hover:text-slate-400 list-none py-0.5">
                        {doc.notes ? 'Note' : 'Note (optional)'}
                      </summary>
                      <textarea
                        value={doc.notes || ''}
                        onChange={(e) => handleNotesChange(doc.id, e.target.value)}
                        rows={2}
                        className="mt-1 w-full text-xs text-text-primary placeholder-slate-500 bg-transparent border border-slate-700/50 rounded px-2 py-1.5 focus:outline-none focus:border-slate-600 resize-none"
                      />
                    </details>
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
