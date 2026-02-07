/**
 * Close Case — 3-step flow: Review → Export → Archive or Wipe.
 */

import { useState, useCallback } from 'react';
import { FileDown, Archive, Trash2, Check } from 'lucide-react';
import type { Case as CaseType } from '../../types';
import { storageService } from '../../services/storageService';
import { downloadCaseExport } from '../../services/backupService';
import { exportPlanToPdf } from '../../services/exportService';

interface CloseCaseWizardProps {
  caseToClose: CaseType;
  summary: {
    taskCount: number;
    documentCount: number;
    contactCount: number;
    checklistCount: number;
    lastUpdated: string;
  };
  onComplete: () => void;
  onCancel: () => void;
}

type Step = 1 | 2 | 3;

export function CloseCaseWizard({
  caseToClose,
  summary,
  onComplete,
  onCancel,
}: CloseCaseWizardProps) {
  const [step, setStep] = useState<Step>(1);
  const [exported, setExported] = useState(false);
  const [exportPdf, setExportPdf] = useState(false);
  const [pdfDone, setPdfDone] = useState(false);
  const [choice, setChoice] = useState<'archive' | 'wipe' | null>(null);
  const [confirmName, setConfirmName] = useState('');
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameMatch = confirmName.trim().toLowerCase() === caseToClose.label.trim().toLowerCase();
  const canWipe = choice === 'wipe' && nameMatch && confirmCheckbox;

  const handleExport = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await downloadCaseExport(caseToClose.id, caseToClose.label);
      setExported(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setBusy(false);
    }
  }, [caseToClose.id, caseToClose.label]);

  const handleExportPdf = useCallback(async () => {
    const plan = await storageService.loadPlanForCase(caseToClose.id);
    if (!plan) return;
    setBusy(true);
    setError(null);
    try {
      await exportPlanToPdf(plan);
      setPdfDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'PDF export failed');
    } finally {
      setBusy(false);
    }
  }, [caseToClose.id]);

  const handleFinish = useCallback(async () => {
    if (choice === 'archive') {
      setBusy(true);
      setError(null);
      try {
        await storageService.archiveCase(caseToClose.id);
        onComplete();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Archive failed');
      } finally {
        setBusy(false);
      }
      return;
    }
    if (choice === 'wipe' && canWipe) {
      setBusy(true);
      setError(null);
      try {
        await storageService.deleteCasePermanently(caseToClose.id);
        onComplete();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Delete failed');
      } finally {
        setBusy(false);
      }
    }
  }, [choice, canWipe, caseToClose.id, onComplete]);

  return (
    <div className="max-w-lg mx-auto p-6 rounded-xl border border-border-subtle bg-card-bg">
      <h2 className="text-lg font-semibold text-text-primary mb-1">Close case: {caseToClose.label}</h2>
      <p className="text-sm text-text-muted mb-6">Export, then archive or permanently delete.</p>

      {/* Step indicator */}
      <div className="flex gap-2 mb-6">
        {([1, 2, 3] as const).map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full ${
              step === s ? 'bg-accent-gold' : step > s ? 'bg-accent-gold/40' : 'bg-border-subtle'
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-400/10 border border-red-400/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Review */}
      {step === 1 && (
        <>
          <div className="space-y-2 text-sm text-text-secondary mb-6">
            <p>Tasks: {summary.taskCount}</p>
            <p>Documents: {summary.documentCount}</p>
            <p>Contacts: {summary.contactCount}</p>
            <p>Checklist items: {summary.checklistCount}</p>
            <p>Last updated: {summary.lastUpdated}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(2)} className="px-4 py-2 bg-accent-gold text-vault-dark font-medium rounded-lg hover:bg-accent-gold-hover">
              Next: Export options
            </button>
            <button type="button" onClick={onCancel} className="px-4 py-2 border border-border-subtle text-text-muted rounded-lg hover:bg-card-bg">
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Step 2: Export */}
      {step === 2 && (
        <>
          <p className="text-sm text-text-muted mb-4">
            Export a backup before closing. Recommended: download the case file below.
          </p>
          <div className="space-y-2 mb-4">
            <button
              type="button"
              onClick={handleExport}
              disabled={busy}
              className="flex items-center gap-2 w-full px-4 py-3 rounded-lg border border-border-subtle hover:bg-card-bg-hover text-text-primary disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              {exported ? 'Exported ✓' : 'Download .apgcase (JSON)'}
            </button>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportPdf}
                onChange={(e) => setExportPdf(e.target.checked)}
                className="rounded border-border-subtle"
              />
              <span className="text-sm text-text-secondary">Also export PDF summary</span>
            </label>
            {exportPdf && (
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={busy}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-border-subtle rounded-lg hover:bg-card-bg-hover text-text-secondary disabled:opacity-50"
              >
                {pdfDone ? 'PDF exported ✓' : 'Export PDF now'}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(3)} className="px-4 py-2 bg-accent-gold text-vault-dark font-medium rounded-lg hover:bg-accent-gold-hover">
              Next: Archive or wipe
            </button>
            <button type="button" onClick={() => setStep(1)} className="px-4 py-2 border border-border-subtle text-text-muted rounded-lg hover:bg-card-bg">
              Back
            </button>
            <button type="button" onClick={onCancel} className="px-4 py-2 border border-border-subtle text-text-muted rounded-lg hover:bg-card-bg">
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Step 3: Archive or Wipe */}
      {step === 3 && (
        <>
          <p className="text-sm text-text-muted mb-4">
            Archive keeps the case in the app (read-only). Wipe permanently deletes its data.
          </p>
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => setChoice('archive')}
              className={`flex items-center gap-2 w-full px-4 py-3 rounded-lg border text-left ${
                choice === 'archive' ? 'border-accent-gold bg-accent-gold/10' : 'border-border-subtle hover:bg-card-bg-hover'
              } text-text-primary`}
            >
              <Archive className="w-4 h-4" />
              Archive (keep in app, read-only)
            </button>
            <button
              type="button"
              onClick={() => setChoice('wipe')}
              className={`flex items-center gap-2 w-full px-4 py-3 rounded-lg border text-left ${
                choice === 'wipe' ? 'border-red-400 bg-red-400/10' : 'border-border-subtle hover:bg-card-bg-hover'
              } text-text-primary`}
            >
              <Trash2 className="w-4 h-4" />
              Wipe (permanently delete)
            </button>

            {choice === 'wipe' && (
              <div className="mt-4 p-4 rounded-lg border border-red-400/30 bg-red-400/5 space-y-3">
                <p className="text-sm text-text-primary font-medium">Confirm permanent deletion</p>
                <label className="block text-sm text-text-secondary">
                  Type the case name to confirm: <strong className="text-text-primary">{caseToClose.label}</strong>
                </label>
                <input
                  type="text"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder="Paste or type case name"
                  className="w-full px-3 py-2 rounded-lg bg-vault-dark border border-border-subtle text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-red-400/50"
                />
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmCheckbox}
                    onChange={(e) => setConfirmCheckbox(e.target.checked)}
                    className="mt-1 rounded border-border-subtle"
                  />
                  <span className="text-sm text-text-secondary">
                    I understand this cannot be undone. All data for this case will be permanently deleted.
                  </span>
                </label>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleFinish}
              disabled={
                !choice ||
                (choice === 'wipe' && !canWipe) ||
                busy
              }
              className="px-4 py-2 bg-accent-gold text-vault-dark font-medium rounded-lg hover:bg-accent-gold-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {choice === 'archive' ? 'Archive case' : choice === 'wipe' ? 'Permanently delete' : 'Confirm'}
            </button>
            <button type="button" onClick={() => setStep(2)} className="px-4 py-2 border border-border-subtle text-text-muted rounded-lg hover:bg-card-bg">
              Back
            </button>
            <button type="button" onClick={onCancel} className="px-4 py-2 border border-border-subtle text-text-muted rounded-lg hover:bg-card-bg">
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
