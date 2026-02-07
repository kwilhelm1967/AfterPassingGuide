/**
 * Case Switcher — header dropdown above nav.
 * Shows current case name; Create new, Switch, Archive, Export, Clear.
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Archive, FileDown, Trash2, FolderOpen } from 'lucide-react';
import type { Case } from '../../types';

interface CaseSwitcherProps {
  currentCase: Case | null;
  cases: Case[];
  onSwitchCase: (caseId: string) => void;
  onCreateCase: () => void;
  onArchiveCurrent: () => void;
  onExportCurrent: () => void;
  onClearCurrent: () => void;
  onOpenCloseCaseFlow: () => void;
}

export function CaseSwitcher({
  currentCase,
  cases,
  onSwitchCase,
  onCreateCase,
  onArchiveCurrent,
  onExportCurrent,
  onClearCurrent,
  onOpenCloseCaseFlow,
}: CaseSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) {
      document.addEventListener('click', onOutside);
      return () => document.removeEventListener('click', onOutside);
    }
  }, [open]);

  const label = currentCase?.label ?? 'No case';
  const isArchived = currentCase?.status === 'archived';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full gap-2 px-3 py-2.5 rounded-lg border border-border-subtle bg-card-bg/80 hover:bg-card-bg text-left"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="text-[13px] font-medium text-text-primary truncate flex-1">{label}</span>
        {isArchived && (
          <span className="text-[10px] uppercase text-text-muted font-medium shrink-0">Archived</span>
        )}
        <ChevronDown className={`w-4 h-4 text-text-muted shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 py-1 rounded-lg border border-border-subtle bg-sidebar-bg shadow-lg z-50 max-h-[70vh] overflow-y-auto"
          role="listbox"
        >
          <div className="px-2 py-1.5 text-[11px] font-medium text-text-muted uppercase tracking-wide">
            Switch case
          </div>
          {cases.filter((c) => c.id !== currentCase?.id).map((c) => (
            <button
              key={c.id}
              type="button"
              role="option"
              onClick={() => {
                onSwitchCase(c.id);
                setOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 text-left text-[13px] text-text-primary hover:bg-card-bg rounded"
            >
              <FolderOpen className="w-4 h-4 text-text-muted mr-2 shrink-0" />
              <span className="truncate">{c.label}</span>
              {c.status === 'archived' && (
                <span className="ml-1.5 text-[10px] text-text-muted">Archived</span>
              )}
            </button>
          ))}
          <div className="border-t border-border-subtle my-1" />
          <button
            type="button"
            onClick={() => { onCreateCase(); setOpen(false); }}
            className="flex items-center w-full px-3 py-2 text-[13px] text-accent-gold hover:bg-accent-gold/10 rounded"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create new case
          </button>
          <button
            type="button"
            onClick={() => { onOpenCloseCaseFlow(); setOpen(false); }}
            className="flex items-center w-full px-3 py-2 text-[13px] text-text-secondary hover:bg-card-bg rounded"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Close case (export & archive/wipe)
          </button>
          {currentCase && (
            <>
              <button
                type="button"
                onClick={() => { onExportCurrent(); setOpen(false); }}
                className="flex items-center w-full px-3 py-2 text-[13px] text-text-secondary hover:bg-card-bg rounded"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Export current case
              </button>
              {!isArchived && (
                <button
                  type="button"
                  onClick={() => { onArchiveCurrent(); setOpen(false); }}
                  className="flex items-center w-full px-3 py-2 text-[13px] text-text-secondary hover:bg-card-bg rounded"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archive current case
                </button>
              )}
              <button
                type="button"
                onClick={() => { onClearCurrent(); setOpen(false); }}
                className="flex items-center w-full px-3 py-2 text-[13px] text-red-400 hover:bg-red-400/10 rounded"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear current case content (danger)
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
