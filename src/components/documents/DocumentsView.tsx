/**
 * Documents View
 * 
 * Upload and manage documents with summarization.
 */

import React, { useState, useMemo } from 'react';
import { 
  Upload, 
  FileText, 
  Trash2, 
  AlertTriangle,
} from 'lucide-react';
import type { UploadedDocument, AftercareProfile, DocumentType } from '../../types';
import { storageService } from '../../services/storageService';
import { DOCUMENT_TYPES } from '../../constants/documentTypes';
import { extractDocumentMetadata, analyzeDocument } from '../../utils/documentAnalysis';
import { VirtualizedList } from '../common/VirtualizedList';

interface DocumentsViewProps {
  documents: UploadedDocument[];
  onDocumentsChange: (docs: UploadedDocument[]) => void;
  profile: AftercareProfile;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onDocumentsChange,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<UploadedDocument | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Extract metadata and analyze document
      const metadata = extractDocumentMetadata(file);
      const tempDoc: UploadedDocument = {
        id: crypto.randomUUID(),
        filePath: '',
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        documentType: metadata.suggestedCategory ? 
          (DOCUMENT_TYPES.find(dt => dt.label === metadata.suggestedCategory)?.value as DocumentType | undefined) :
          undefined,
        userLabel: '',
      };
      const analysis = analyzeDocument(tempDoc, metadata);

      const newDoc: UploadedDocument = {
        id: crypto.randomUUID(),
        filePath: '', // Would be set by Electron file dialog
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        documentType: metadata.suggestedCategory ? 
          (DOCUMENT_TYPES.find(dt => dt.label === metadata.suggestedCategory)?.value as DocumentType | undefined) :
          undefined,
        userLabel: '',
        summary: analysis.summary,
        keyPoints: analysis.keyPoints,
      };

      const updated = [...documents, newDoc];
      onDocumentsChange(updated);
      await storageService.saveDocuments(updated);
    } catch (error) {
      console.error('Failed to process document:', error);
      // Fallback to basic document entry
      const newDoc: UploadedDocument = {
        id: crypto.randomUUID(),
        filePath: '',
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        documentType: undefined,
        userLabel: '',
      };
      const updated = [...documents, newDoc];
      onDocumentsChange(updated);
      await storageService.saveDocuments(updated);
    }
    
    // Reset input
    e.target.value = '';
  };

  const handleDelete = async (docId: string) => {
    const updated = documents.filter(d => d.id !== docId);
    onDocumentsChange(updated);
    await storageService.saveDocuments(updated);
    if (selectedDoc?.id === docId) {
      setSelectedDoc(null);
    }
  };

  const handleTypeChange = async (docId: string, type: DocumentType) => {
    const updated = documents.map(d => 
      d.id === docId ? { ...d, documentType: type } : d
    );
    onDocumentsChange(updated);
    await storageService.saveDocuments(updated);
  };

  const handleLabelChange = async (docId: string, label: string) => {
    const updated = documents.map(d =>
      d.id === docId ? { ...d, userLabel: label } : d
    );
    onDocumentsChange(updated);
    await storageService.saveDocuments(updated);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Documents</h2>
          <p className="text-slate-400 text-sm mt-1">
            Upload and organize important documents for reference
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-brand-gold/80 mb-2">
              Document summaries are for organizational purposes only. 
              They do not interpret legal meaning. For legal interpretation, 
              please consult an attorney.
            </p>
            <p className="text-xs text-brand-gold/60">
              <strong>Note:</strong> This feature stores document references only—actual files remain on your device.
              Full document scanning coming in a future update.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <label 
        className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-600 rounded-xl hover:border-brand-gold cursor-pointer transition-colors"
        aria-label="Upload document"
      >
        <Upload className="w-10 h-10 text-slate-500 mb-3" aria-hidden="true" />
        <span className="text-slate-300 font-medium">Upload Document</span>
        <span className="text-slate-500 text-sm mt-1">PDF, images, or documents</span>
        <input
          type="file"
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          className="hidden"
          aria-label="Select file to upload"
        />
      </label>

      {/* Document List */}
      {documents.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-gold/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white truncate max-w-[200px]">
                      {doc.userLabel || doc.fileName}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-slate-500 hover:text-burnt-orange rounded-lg hover:bg-slate-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Type Selector */}
              <select
                value={doc.documentType || ''}
                onChange={(e) => handleTypeChange(doc.id, e.target.value as DocumentType)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm mb-3"
              >
                <option value="">Select document type...</option>
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>

              {/* Label Input */}
              <input
                type="text"
                value={doc.userLabel || ''}
                onChange={(e) => handleLabelChange(doc.id, e.target.value)}
                placeholder="Add a label..."
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 mb-3"
              />

              {/* Notes Section */}
              {doc.summary && (
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <h5 className="text-xs font-medium text-slate-400 mb-2">Notes</h5>
                  <p className="text-sm text-slate-300">{doc.summary}</p>
                  {doc.keyPoints && doc.keyPoints.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {doc.keyPoints.map((point, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                          <span className="text-brand-gold">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-accent-gold mx-auto mb-4" />
          <p className="text-slate-400">No documents uploaded yet</p>
          <p className="text-slate-500 text-sm mt-1">
            Upload documents to organize and summarize them
          </p>
          <p className="text-slate-500 text-xs mt-3">
            If you have a Local Legacy Vault, you may already have important documents stored there.
          </p>
        </div>
      )}
    </div>
  );
};

