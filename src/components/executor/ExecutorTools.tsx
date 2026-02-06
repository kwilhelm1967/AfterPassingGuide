/**
 * Executor Tools
 *
 * Serious executor workspace for people actively administering an estate.
 * Structured, complete, no gamification. Feels like a competent desk.
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  CheckSquare,
  Users,
  FileDown,
  ChevronDown,
  ChevronRight,
  Check,
} from 'lucide-react';
import { TitleBar } from '../common/TitleBar';
import {
  ExecutorChecklistItem,
  ContactEntry,
  AftercarePlan,
  ExecutorChecklistCategory,
  UploadedDocument,
} from '../../types';
import {
  getChecklistCategoryInfo,
  getContactDisplayLabel,
  getContactDisplayColor,
  getExecutorChecklistCategoryOrder,
} from '../../services/executorService';
import { storageService } from '../../services/storageService';

interface ExecutorToolsProps {
  checklist: ExecutorChecklistItem[];
  contacts: ContactEntry[];
  plan: AftercarePlan | null;
  documents?: UploadedDocument[];
  onChecklistChange: (checklist: ExecutorChecklistItem[]) => void;
  onContactsChange: (contacts: ContactEntry[]) => void;
}

type ExecutorTab = 'checklist' | 'contacts' | 'export';

export const ExecutorTools: React.FC<ExecutorToolsProps> = ({
  checklist,
  contacts,
  plan,
  documents = [],
  onChecklistChange,
  onContactsChange,
}) => {
  const [activeTab, setActiveTab] = useState<ExecutorTab>('checklist');
  const categoryOrder = useMemo(() => getExecutorChecklistCategoryOrder(), []);
  const [expandedCategories, setExpandedCategories] = useState<Set<ExecutorChecklistCategory>>(
    new Set(['IMMEDIATE_LEGAL_DOCUMENTS', 'COURT_AND_PROBATE'])
  );
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<'all' | 'required' | 'optional' | 'legal' | 'financial'>('all');
  const [hideCompleted, setHideCompleted] = useState(false);

  const [exportOptions, setExportOptions] = useState({
    includeChecklistSummary: true,
    includeNotesPerItem: true,
    includeKeyDocumentsList: true,
    includeKeyContacts: true,
  });
  const [exportStatus, setExportStatus] = useState<'idle' | 'copying' | 'copied'>('idle');

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggleCategory = useCallback((category: ExecutorChecklistCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const setItemStatus = useCallback(
    async (itemId: string, status: 'DONE' | 'NOT_APPLICABLE') => {
      const updated = checklist.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status,
              completedAt: status === 'DONE' ? new Date().toISOString() : undefined,
            }
          : item
      );
      onChecklistChange(updated);
      await storageService.saveChecklist(updated);
    },
    [checklist, onChecklistChange]
  );

  const updateItemNotes = useCallback(
    async (itemId: string, notes: string) => {
      const updated = checklist.map((item) =>
        item.id === itemId ? { ...item, notes: notes || undefined } : item
      );
      onChecklistChange(updated);
      await storageService.saveChecklist(updated);
    },
    [checklist, onChecklistChange]
  );

  const updateContactStatus = useCallback(
    async (contactId: string, status: ContactEntry['contactStatus']) => {
      const updated = contacts.map((c) =>
        c.id === contactId
          ? { ...c, contactStatus: status, lastContactedAt: new Date().toISOString() }
          : c
      );
      onContactsChange(updated);
      await storageService.saveContacts(updated);
    },
    [contacts, onContactsChange]
  );

  const checklistByCategory = useMemo(() => {
    const grouped: Record<string, ExecutorChecklistItem[]> = {};
    categoryOrder.forEach((cat) => {
      grouped[cat] = checklist.filter((item) => item.category === cat);
    });
    return grouped;
  }, [checklist, categoryOrder]);

  const legalCategories = new Set<ExecutorChecklistCategory>([
    'IMMEDIATE_LEGAL_DOCUMENTS', 'COURT_AND_PROBATE', 'BENEFICIARIES_DISTRIBUTIONS',
  ]);
  const financialCategories = new Set<ExecutorChecklistCategory>([
    'FINANCIAL_ACCOUNTS', 'DEBTS_OBLIGATIONS', 'TAXES_GOVERNMENT',
  ]);
  const optionalCategories = new Set<ExecutorChecklistCategory>([
    'BUSINESS_INTERESTS', 'DIGITAL_ASSETS',
  ]);

  const filteredCategoryOrder = useMemo(() => {
    if (quickFilter === 'all') return categoryOrder;
    return categoryOrder.filter((cat) => {
      if (quickFilter === 'legal') return legalCategories.has(cat);
      if (quickFilter === 'financial') return financialCategories.has(cat);
      if (quickFilter === 'optional') return optionalCategories.has(cat);
      if (quickFilter === 'required') return !optionalCategories.has(cat);
      return true;
    });
  }, [categoryOrder, quickFilter]);

  const handleExportChecklist = useCallback(async () => {
    if (!plan) return;
    setExportStatus('copying');
    try {
      const { exportAftercareBinder } = await import('../../services/exportService');
      await exportAftercareBinder(
        plan,
        [],
        checklist,
        { includeNotesPerItem: true, includeKeyDocumentsList: false },
        undefined
      );
      setExportStatus('copied');
      setTimeout(() => setExportStatus('idle'), 2000);
    } catch (e) {
      console.error(e);
      setExportStatus('idle');
    }
  }, [plan, checklist]);

  return (
    <div className="space-y-6">
      {/* Header — flat zone: subtle gradient, bottom inner shadow, thin gold rule */}
      <div className="page-header-zone flex flex-col items-center text-center">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold text-text-primary">Executor Tools</h2>
          <TitleBar className="mt-1.5" />
        </div>
        <p className="text-slate-400 text-sm mt-1.5 max-w-md">
          Tools and references commonly used when administering an estate.
        </p>
        <p className="text-slate-500 text-xs mt-1 max-w-xl">
          For legal, financial, or medical decisions, consult a qualified professional.
        </p>
      </div>

      {/* Tab Navigation — no counts */}
      <nav role="tablist" aria-label="Executor tools navigation">
        <div className="flex gap-2 border-b border-slate-700 pb-2">
          <button
            onClick={() => setActiveTab('checklist')}
            role="tab"
            aria-selected={activeTab === 'checklist'}
            aria-controls="checklist-panel"
            id="checklist-tab"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'checklist'
                ? 'bg-slate-600/50 text-text-primary border border-slate-500'
                : 'text-slate-400 hover:text-text-primary border border-transparent'
            }`}
          >
            <CheckSquare className="w-4 h-4" aria-hidden="true" />
            Executor Checklist
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            role="tab"
            aria-selected={activeTab === 'contacts'}
            aria-controls="contacts-panel"
            id="contacts-tab"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'contacts'
                ? 'bg-slate-600/50 text-text-primary border border-slate-500'
                : 'text-slate-400 hover:text-text-primary border border-transparent'
            }`}
          >
            <Users className="w-4 h-4" aria-hidden="true" />
            Key Contacts
          </button>
          <button
            onClick={() => setActiveTab('export')}
            role="tab"
            aria-selected={activeTab === 'export'}
            aria-controls="export-panel"
            id="export-tab"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'export'
                ? 'bg-slate-600/50 text-text-primary border border-slate-500'
                : 'text-slate-400 hover:text-text-primary border border-transparent'
            }`}
          >
            <FileDown className="w-4 h-4" aria-hidden="true" />
            Export Estate Binder
          </button>
        </div>
      </nav>

      {/* Checklist Tab */}
      {activeTab === 'checklist' && (
        <div className="space-y-4" role="tabpanel" id="checklist-panel" aria-labelledby="checklist-tab">
          <p className="text-sm text-slate-400">
            Track what applies to this estate. Not all items will be needed.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'required', 'optional', 'legal', 'financial'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setQuickFilter(f)}
                className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                  quickFilter === f
                    ? 'bg-slate-600 text-text-primary border-slate-500'
                    : 'bg-transparent text-slate-400 border-slate-600 hover:bg-slate-800/50'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <label className="ml-2 flex items-center gap-1.5 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={hideCompleted}
                onChange={(e) => setHideCompleted(e.target.checked)}
                className="rounded border-slate-600"
              />
              Hide completed
            </label>
            <button
              type="button"
              onClick={handleExportChecklist}
              disabled={!plan || exportStatus === 'copying'}
              className="ml-auto text-xs text-slate-400 hover:text-text-primary transition-colors flex items-center gap-1"
            >
              <FileDown className="w-3.5 h-3.5" />
              Export checklist
            </button>
          </div>

          {filteredCategoryOrder.map((category) => {
            const info = getChecklistCategoryInfo(category);
            let categoryItems = checklistByCategory[category] ?? [];
            if (hideCompleted) {
              categoryItems = categoryItems.filter((i) => i.status !== 'DONE' && i.status !== 'NOT_APPLICABLE');
            }
            if (categoryItems.length === 0) return null;

            const isExpanded = expandedCategories.has(category);
            return (
              <div
                key={category}
                ref={(el) => {
                  categoryRefs.current[category] = el;
                }}
                className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-700/20 text-left"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-accent-gold" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-text-muted" />
                    )}
                    <div className="text-left">
                      <h4 className="font-medium text-text-primary">{info.label}</h4>
                      <p className="text-sm text-slate-400">{info.description}</p>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div
                    id={`category-${category}-content`}
                    className="border-t border-slate-700/50 divide-y divide-slate-700/30"
                    role="region"
                    aria-label={`${info.label} items`}
                  >
                    {categoryItems.map((item) => {
                      const isItemExpanded = expandedItemId === item.id;
                      return (
                        <div key={item.id} className="bg-slate-800/20">
                          <div className="flex items-start gap-3 p-4">
                            {/* Mark Addressed / Not applicable — decisive, no "leave for now" */}
                            <div className="flex flex-shrink-0 gap-1" role="group" aria-label={`Status for ${item.title}`}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setItemStatus(item.id, 'DONE');
                                }}
                                className={`px-2.5 py-1.5 text-xs font-normal rounded border transition-colors ${
                                  item.status === 'DONE'
                                    ? 'bg-slate-600 text-text-primary border-slate-500'
                                    : 'bg-transparent text-slate-400 border-slate-600 hover:bg-slate-700/50'
                                }`}
                              >
                                Addressed
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setItemStatus(item.id, 'NOT_APPLICABLE');
                                }}
                                className={`px-2.5 py-1.5 text-xs font-normal rounded border transition-colors ${
                                  item.status === 'NOT_APPLICABLE'
                                    ? 'bg-slate-600 text-text-primary border-slate-500'
                                    : 'bg-transparent text-slate-400 border-slate-600 hover:bg-slate-700/50'
                                }`}
                              >
                                Not applicable
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => setExpandedItemId(isItemExpanded ? null : item.id)}
                              className="flex-1 min-w-0 text-left"
                            >
                              <h5
                                className={`font-medium ${
                                  item.status === 'DONE' || item.status === 'NOT_APPLICABLE'
                                    ? 'text-slate-400'
                                    : 'text-text-primary'
                                } ${item.status === 'DONE' ? 'line-through' : ''}`}
                              >
                                {item.title}
                              </h5>
                            </button>
                            <span className={`flex-shrink-0 ${isItemExpanded ? 'text-accent-gold' : 'text-text-muted'}`}>
                              {isItemExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </span>
                          </div>

                          {/* Expanded: What this is, Why it matters, What you may need, Notes */}
                          {isItemExpanded && (
                            <div
                              className="px-4 pb-4 pt-0 ml-14 space-y-3 text-sm border-t border-slate-700/30 pt-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div>
                                <p className="text-slate-500 font-medium">What this is</p>
                                <p className="text-slate-300 mt-0.5">{item.description}</p>
                              </div>
                              {item.whyItMatters && (
                                <div>
                                  <p className="text-slate-500 font-medium">Why it matters</p>
                                  <p className="text-slate-300 mt-0.5">{item.whyItMatters}</p>
                                </div>
                              )}
                              {item.whatYouMayNeed && item.whatYouMayNeed.length > 0 && (
                                <div>
                                  <p className="text-slate-500 font-medium">What you may need</p>
                                  <ul className="list-disc list-inside text-slate-300 mt-0.5 space-y-0.5">
                                    {item.whatYouMayNeed.map((need, i) => (
                                      <li key={i}>{need}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <div>
                                <label className="text-slate-500 font-medium block mb-1">Notes</label>
                                <textarea
                                  value={item.notes ?? ''}
                                  onChange={(e) => updateItemNotes(item.id, e.target.value)}
                                  placeholder="Optional notes"
                                  rows={2}
                                  className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-500 text-sm"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Key Contacts Tab */}
      {activeTab === 'contacts' && (
        <div className="space-y-4" role="tabpanel" id="contacts-panel" aria-labelledby="contacts-tab">
          <div className="grid gap-4 md:grid-cols-2">
            {contacts.map((contact) => {
              const label = getContactDisplayLabel(contact);
              const color = getContactDisplayColor(contact);
              return (
                <div
                  key={contact.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex items-center justify-center w-8 h-8 rounded text-sm font-medium"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        {label.charAt(0)}
                      </span>
                      <div>
                        <h4 className="font-medium text-text-primary">{contact.name}</h4>
                        <p className="text-xs text-slate-400">{contact.organization || label}</p>
                      </div>
                    </div>
                    <select
                      value={contact.contactStatus ?? 'NOT_CONTACTED'}
                      onChange={(e) =>
                        updateContactStatus(contact.id, e.target.value as ContactEntry['contactStatus'])
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-600/50 bg-slate-800 text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    >
                      <option value="NOT_CONTACTED">Not contacted</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                  <div className="space-y-2 text-sm text-slate-400">
                    {contact.phone && <p>{contact.phone}</p>}
                    {contact.email && <p>{contact.email}</p>}
                    {contact.website && <p className="truncate">{contact.website}</p>}
                  </div>
                  {contact.notes && (
                    <p className="mt-3 text-sm text-slate-500 border-t border-slate-700 pt-3">{contact.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
          {contacts.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No contacts yet. Contacts are populated from your Local Legacy Vault data.</p>
            </div>
          )}
        </div>
      )}

      {/* Export Estate Binder Tab */}
      {activeTab === 'export' && (
        <div
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
          role="tabpanel"
          id="export-panel"
          aria-labelledby="export-tab"
        >
          <div className="text-center mb-6">
            <FileDown className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary">Export Estate Binder</h3>
            <p className="text-slate-400 text-sm mt-1">
              Professional handoff artifact for attorneys, courts, and beneficiaries.
            </p>
          </div>

          <div className="space-y-3 max-w-md mx-auto">
            <label className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includeChecklistSummary}
                onChange={(e) =>
                  setExportOptions({ ...exportOptions, includeChecklistSummary: e.target.checked })
                }
                className="w-4 h-4 rounded border-slate-500"
              />
              <span className="text-slate-300">Checklist summary (addressed / not applicable)</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includeNotesPerItem}
                onChange={(e) =>
                  setExportOptions({ ...exportOptions, includeNotesPerItem: e.target.checked })
                }
                className="w-4 h-4 rounded border-slate-500"
              />
              <span className="text-slate-300">Notes per item</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includeKeyDocumentsList}
                onChange={(e) =>
                  setExportOptions({ ...exportOptions, includeKeyDocumentsList: e.target.checked })
                }
                className="w-4 h-4 rounded border-slate-500"
              />
              <span className="text-slate-300">Key documents list</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includeKeyContacts}
                onChange={(e) =>
                  setExportOptions({ ...exportOptions, includeKeyContacts: e.target.checked })
                }
                className="w-4 h-4 rounded border-slate-500"
              />
              <span className="text-slate-300">Key contacts list</span>
            </label>

            <button
              type="button"
              onClick={async () => {
                if (!plan) return;
                setExportStatus('copying');
                try {
                  const { exportAftercareBinder } = await import('../../services/exportService');
                  await exportAftercareBinder(
                    plan,
                    exportOptions.includeKeyContacts ? contacts : [],
                    exportOptions.includeChecklistSummary ? checklist : [],
                    {
                      includeNotesPerItem: exportOptions.includeNotesPerItem,
                      includeKeyDocumentsList: exportOptions.includeKeyDocumentsList,
                    },
                    exportOptions.includeKeyDocumentsList ? documents : undefined
                  );
                  setExportStatus('copied');
                  setTimeout(() => setExportStatus('idle'), 2000);
                } catch (error) {
                  console.error('Export failed:', error);
                  setExportStatus('idle');
                }
              }}
              disabled={!plan || exportStatus === 'copying'}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all mt-6 ${
                exportStatus === 'copied'
                  ? 'bg-slate-600 text-text-primary'
                  : exportStatus === 'copying'
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-600 hover:bg-slate-500 text-text-primary'
              }`}
            >
              {exportStatus === 'copied' ? (
                <>
                  <Check className="w-5 h-5" />
                  PDF downloaded
                </>
              ) : exportStatus === 'copying' ? (
                <>Generating PDF…</>
              ) : (
                <>
                  <FileDown className="w-5 h-5" />
                  Download PDF
                </>
              )}
            </button>
            <p className="text-xs text-slate-500 text-center">
              Disclaimer included at bottom of PDF.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
