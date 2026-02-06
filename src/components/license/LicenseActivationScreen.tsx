/**
 * License Activation Screen
 *
 * Matches Local Legacy Vault: file-only activation (Choose License File / drop). No manual code entry.
 * Uses AfterPassing Guide colors and branding only.
 */

import React, { useState, useRef } from 'react';
import { ArrowLeft, HelpCircle, Loader2, AlertCircle, FileUp } from 'lucide-react';
import { licenseService } from '../../services/licenseService';

const SUPPORT_EMAIL = 'support@afterpassingguide.com';

interface LicenseActivationScreenProps {
  onActivated: () => void;
  onBack?: () => void;
}

export const LicenseActivationScreen: React.FC<LicenseActivationScreenProps> = ({
  onActivated,
  onBack,
}) => {
  const [isActivating, setIsActivating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresTransfer, setRequiresTransfer] = useState(false);
  const [transferKey, setTransferKey] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    if (isImporting) return;
    fileInputRef.current?.click();
  };

  const processFile = async (file: File) => {
    const text = await file.text();
    setIsImporting(true);
    setError(null);
    setSelectedFileName(file.name || null);
    setRequiresTransfer(false);
    setTransferKey(null);
    try {
      const result = await licenseService.importLicenseFromFile(text);
      if (result.success) {
        onActivated();
        return;
      }
      if (result.requiresTransfer && result.licenseKey) {
        setRequiresTransfer(true);
        setTransferKey(result.licenseKey);
        setError(result.error || 'This license is for another device. Transfer it to this device below.');
        return;
      }
      setError(result.error || 'Invalid license file.');
    } catch (err) {
      console.error('Import error:', err);
      setError('Could not read the file. Make sure it is a valid license file (.license, .json, or .txt).');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const ext = (file.name || '').toLowerCase();
    if (ext.endsWith('.license') || ext.endsWith('.json') || ext.endsWith('.txt') || file.type === 'application/json' || file.type === 'text/plain') {
      void processFile(file);
    } else {
      setError('Please choose a license file (.license, .json, or .txt).');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    const ext = (file.name || '').toLowerCase();
    if (ext.endsWith('.license') || ext.endsWith('.json') || ext.endsWith('.txt') || file.type === 'application/json' || file.type === 'text/plain') {
      void processFile(file);
    } else {
      setError('Please drop a license file (.license, .json, or .txt).');
    }
  };

  const handleTransfer = async () => {
    if (!transferKey) return;

    setIsActivating(true);
    setError(null);

    try {
      const result = await licenseService.transferLicense(transferKey);

      if (result.success) {
        onActivated();
      } else {
        setError(result.error || 'Transfer failed. Please try again or contact support.');
        setRequiresTransfer(false);
      }
    } catch (err) {
      setError('An unexpected error occurred during transfer. Please try again.');
      console.error('Transfer error:', err);
    } finally {
      setIsActivating(false);
    }
  };

  const resetTransfer = () => {
    setRequiresTransfer(false);
    setError(null);
    setTransferKey(null);
  };

  return (
    <div className="h-screen w-full page-background-match overflow-hidden flex flex-col">
      <div className="flex-1 min-h-0 flex items-center justify-center p-4 bg-textured">
        <div className="max-w-md w-full max-h-[100vh] overflow-y-auto flex flex-col">
          <div className="bg-card-bg border border-border-subtle rounded-2xl p-6 shadow-2xl">
          {/* Header — AfterPassing Guide branding */}
          <div className="text-center mb-5">
            <div className="flex justify-center mb-2">
              <FileUp className="w-6 h-6 text-accent-gold" strokeWidth={1.75} />
            </div>
            <h1 className="text-sm font-semibold text-accent-gold mb-1">
              AfterPassing Guide
            </h1>
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              Activate
            </h2>
            <p className="text-text-secondary text-xs">
              AfterPassing Guide works offline once activated. Use the license file or code sent to your email.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".license,.json,.txt,application/json,text/plain"
            className="hidden"
            onChange={handleFileSelected}
            aria-hidden
          />

          {/* Primary: License file (LLV-style) */}
          <div className="space-y-2 mb-4">
            <button
              type="button"
              onClick={handleImportClick}
              disabled={isImporting}
              className="w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-accent-gold hover:bg-accent-gold-hover text-vault-dark disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Importing…</span>
                </>
              ) : (
                <>
                  <FileUp className="w-4 h-4" />
                  <span>Choose License File</span>
                </>
              )}
            </button>
            <div
              role="region"
              aria-label="Or drop license file"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                isDragOver ? 'border-accent-gold bg-accent-gold/10' : 'border-border-subtle bg-white/5'
              }`}
            >
              <p className="text-xs text-text-muted">Or drop your license file here</p>
              {selectedFileName && (
                <p className="text-xs text-text-secondary mt-1">Selected: {selectedFileName}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg flex items-start gap-2 bg-accent-gold/10 border border-accent-gold/40 mb-3">
              <AlertCircle className="w-3.5 h-3.5 text-accent-gold flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[10px] font-semibold mb-0.5 text-accent-gold">Notice</p>
                <p className="text-[10px] text-text-secondary">{error}</p>
              </div>
            </div>
          )}

          {/* Actions: only transfer UI when file import said license is on another device */}
          {requiresTransfer && (
            <div className="space-y-2 mb-4">
              <button
                onClick={handleTransfer}
                disabled={isActivating}
                className="w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-accent-gold hover:bg-accent-gold/90 text-[#1F2534] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isActivating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transferring…</span>
                  </>
                ) : (
                  <span>Transfer license to this device</span>
                )}
              </button>
              <button
                type="button"
                onClick={resetTransfer}
                className="w-full py-2 text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
                <span>Cancel</span>
              </button>
            </div>
          )}

          {onBack && !requiresTransfer && (
            <div className="mb-4">
              <button
                type="button"
                onClick={onBack}
                className="w-full py-2 text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
                <span>I don't have my license</span>
              </button>
            </div>
          )}

          {/* Help — same as Local Legacy Vault: file only, no code entry */}
          <div className="p-2.5 bg-white/5 rounded-lg border border-border-subtle">
            <div className="flex items-start gap-2 text-text-muted text-[10px]">
              <HelpCircle className="w-3.5 h-3.5 text-accent-gold flex-shrink-0 mt-0.5" strokeWidth={1.75} />
              <div>
                <p className="font-medium text-text-secondary mb-0.5">Need help?</p>
                <p className="leading-tight">
                  The license file may be named .txt or .license. Open it in the app (Choose License File or drag it here)—don't open it in a text editor.
                </p>
                <p className="mt-1.5 leading-tight">
                  Can't find your license file? It was emailed to you when you completed your purchase.{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent-gold hover:underline">
                    {SUPPORT_EMAIL}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};
