/**
 * Cases list — cards with label, status, last updated; Open, Export, Archive, Delete.
 * Sorted: active case first, then by updated_at desc.
 * Delete only enabled for empty cases (no tasks, documents, contacts, checklist).
 */

import { useState, useEffect, useMemo } from 'react';
import { FolderOpen, FileDown, Archive, Trash2, Plus } from 'lucide-react';
import { TitleBar } from '../common/TitleBar';
import type { Case as CaseType } from '../../types';
import { storageService } from '../../services/storageService';

interface CasesViewProps {
  cases: CaseType[];
  activeCaseId: string | null;
  onRefreshCases: () => void;
  onSwitchCase: (caseId: string) => void;
  onExportCase: (caseId: string) => void;
  onArchiveCase: (caseId: string) => void;
  onDeleteCase: (caseId: string) => void;
  onCreateCase: () => void;
  onOpenCloseCaseFlow: () => void;
}

export function CasesView({
  cases,
  activeCaseId,
  onRefreshCases,
  onSwitchCase,
  onExportCase,
  onArchiveCase,
  onDeleteCase,
  onCreateCase,
  onOpenCloseCaseFlow,
}: CasesViewProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [createLabel, setCreateLabel] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleDelete = async (c: CaseType) => {
    if (!confirm(`Permanently delete case "${c.label}"? This cannot be undone.`)) return;
    setDeletingId(c.id);
    try {
      await storageService.deleteCasePermanently(c.id);
      onRefreshCases();
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreate = async () => {
    const label = createLabel.trim() || 'New case';
    await storageService.createCase(label);
    setCreateLabel('');
    setShowCreateForm(false);
    onRefreshCases();
  };

  return (
    <div className="max-w-4xl">
      <TitleBar title="Cases" />
      <p className="text-text-muted text-sm mb-4">
        Each case holds its own checklist, documents, and contacts. Switch cases from the dropdown above, or manage them here.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold text-vault-dark font-medium rounded-lg hover:bg-accent-gold-hover"
        >
          <Plus className="w-4 h-4" />
          New case
        </button>
        <button
          type="button"
          onClick={onOpenCloseCaseFlow}
          className="inline-flex items-center gap-2 px-4 py-2 border border-border-subtle text-text-secondary rounded-lg hover:bg-card-bg"
        >
          <FileDown className="w-4 h-4" />
          Close case (export & archive/wipe)
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-6 p-4 rounded-xl border border-border-subtle bg-card-bg">
          <label className="block text-sm font-medium text-text-primary mb-2">Case name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={createLabel}
              onChange={(e) => setCreateLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. John Smith 2026"
              className="flex-1 px-3 py-2 rounded-lg bg-vault-dark border border-border-subtle text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-gold/50"
            />
            <button type="button" onClick={handleCreate} className="px-4 py-2 bg-accent-gold text-vault-dark font-medium rounded-lg hover:bg-accent-gold-hover">
              Create
            </button>
            <button type="button" onClick={() => { setShowCreateForm(false); setCreateLabel(''); }} className="px-4 py-2 border border-border-subtle text-text-muted rounded-lg hover:bg-card-bg">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {sortedCases.map((c) => {
          const isActive = c.id === activeCaseId;
          const isArchived = c.status === 'archived';
          return (
            <div
              key={c.id}
              className={`rounded-xl border p-4 flex flex-col ${
                isActive ? 'border-accent-gold/50 bg-accent-gold/5' : 'border-border-subtle bg-card-bg'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-base font-semibold text-text-primary truncate">{c.label}</h3>
                {isArchived && (
                  <span className="text-[10px] font-medium uppercase text-text-muted bg-card-bg px-2 py-0.5 rounded">
                    Archived
                  </span>
                )}
              </div>
              <p className="text-[12px] text-text-muted mb-4">
                Last updated {new Date(c.updatedAt).toLocaleDateString()}
              </p>
              <div className="flex flex-wrap gap-2 mt-auto">
                <button
                  type="button"
                  onClick={() => onSwitchCase(c.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-accent-gold hover:bg-accent-gold/10 rounded-lg"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => onExportCase(c.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:bg-card-bg-hover rounded-lg"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Export
                </button>
                {!isArchived && (
                  <button
                    type="button"
                    onClick={() => onArchiveCase(c.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:bg-card-bg-hover rounded-lg"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Archive
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(c)}
                  disabled={deletingId === c.id}
                  title={!isEmpty(c.id) ? 'Case has data; prefer Close case to export first, or confirm to delete all data' : 'Permanently delete this case'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 hover:bg-red-400/10 rounded-lg disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {sortedCases.length === 0 && (
        <p className="text-text-muted text-sm">No cases yet. Create one above.</p>
      )}
    </div>
  );
}
