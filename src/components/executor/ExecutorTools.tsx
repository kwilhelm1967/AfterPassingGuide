/**
 * Executor Tools
 * 
 * Comprehensive tools for executors including checklist and contact workbook.
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { 
  CheckSquare, 
  Users, 
  FileDown,
  CheckCircle2,
  Circle,
  Phone,
  Mail,
  Globe,
  ChevronDown,
  ChevronRight,
  Check,
} from 'lucide-react';
import { VirtualizedList } from '../common/VirtualizedList';
import { 
  ExecutorChecklistItem, 
  ContactEntry, 
  AftercarePlan,
  ExecutorChecklistCategory,
} from '../../types';
import { 
  getChecklistProgress, 
  getChecklistCategoryInfo,
  getContactTypeInfo,
  getContactProgress,
} from '../../services/executorService';
import { storageService } from '../../services/storageService';

interface ExecutorToolsProps {
  checklist: ExecutorChecklistItem[];
  contacts: ContactEntry[];
  plan: AftercarePlan | null;
  onChecklistChange: (checklist: ExecutorChecklistItem[]) => void;
  onContactsChange: (contacts: ContactEntry[]) => void;
}

type ExecutorTab = 'checklist' | 'contacts' | 'export';

export const ExecutorTools: React.FC<ExecutorToolsProps> = ({
  checklist,
  contacts,
  plan,
  onChecklistChange,
  onContactsChange,
}) => {
  const [activeTab, setActiveTab] = useState<ExecutorTab>('checklist');
  const [expandedCategories, setExpandedCategories] = useState<Set<ExecutorChecklistCategory>>(
    new Set(['DOCUMENTS', 'COMMUNICATION'])
  );
  
  // Export options state
  const [exportOptions, setExportOptions] = useState({
    includeTasks: true,
    includeChecklist: true,
    includeContacts: true,
    includeDocumentSummaries: false,
  });
  const [exportStatus, setExportStatus] = useState<'idle' | 'copying' | 'copied'>('idle');

  // Memoize progress calculations
  const checklistProgress = useMemo(() => getChecklistProgress(checklist), [checklist]);
  const contactProgress = useMemo(() => getContactProgress(contacts), [contacts]);
  
  // Properly initialize category refs
  const categories: ExecutorChecklistCategory[] = [
    'DOCUMENTS', 'COMMUNICATION', 'ASSET_TRACKING', 'RECORD_KEEPING', 'FOLLOW_UP'
  ];
  const categoryRefs = useRef<Record<ExecutorChecklistCategory, HTMLDivElement | null>>(
    categories.reduce((acc, cat) => ({ ...acc, [cat]: null }), {} as Record<ExecutorChecklistCategory, HTMLDivElement | null>)
  );

  const toggleCategory = useCallback((category: ExecutorChecklistCategory) => {
    setExpandedCategories(prev => {
      const wasExpanded = prev.has(category);
      const newExpanded = new Set(prev);
      if (newExpanded.has(category)) {
        newExpanded.delete(category);
      } else {
        newExpanded.add(category);
      }
      // Scroll into view when expanding
      if (!wasExpanded) {
        setTimeout(() => {
          categoryRefs.current[category]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
      return newExpanded;
    });
  }, []);

  const toggleChecklistItem = useCallback(async (itemId: string) => {
    const updated = checklist.map(item =>
      item.id === itemId
        ? { 
            ...item, 
            status: item.status === 'DONE' ? 'PENDING' as const : 'DONE' as const,
            completedAt: item.status === 'PENDING' ? new Date().toISOString() : undefined,
          }
        : item
    );
    onChecklistChange(updated);
    await storageService.saveChecklist(updated);
  }, [checklist, onChecklistChange]);

  const updateContactStatus = useCallback(async (contactId: string, status: ContactEntry['contactStatus']) => {
    const updated = contacts.map(c =>
      c.id === contactId
        ? { ...c, contactStatus: status, lastContactedAt: new Date().toISOString() }
        : c
    );
    onContactsChange(updated);
    await storageService.saveContacts(updated);
  }, [contacts, onContactsChange]);

  // Memoize checklist items grouped by category
  const checklistByCategory = useMemo(() => {
    const grouped: Record<ExecutorChecklistCategory, ExecutorChecklistItem[]> = {
      DOCUMENTS: [],
      COMMUNICATION: [],
      ASSET_TRACKING: [],
      RECORD_KEEPING: [],
      FOLLOW_UP: [],
    };
    checklist.forEach(item => {
      if (grouped[item.category]) {
        grouped[item.category].push(item);
      }
    });
    return grouped;
  }, [checklist]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white">Executor Tools</h2>
        <p className="text-slate-400 text-sm mt-1">
          Comprehensive tools for estate administration
        </p>
      </div>

      {/* Tab Navigation */}
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
                ? 'bg-brand-gold/20 text-brand-gold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" aria-hidden="true" />
            Checklist
            <span className="ml-1 px-2 py-0.5 bg-slate-700 rounded-full text-xs" aria-label={`${checklistProgress.completed} of ${checklistProgress.total} items completed`}>
              {checklistProgress.completed}/{checklistProgress.total}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            role="tab"
            aria-selected={activeTab === 'contacts'}
            aria-controls="contacts-panel"
            id="contacts-tab"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'contacts'
                ? 'bg-brand-gold/20 text-brand-gold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" aria-hidden="true" />
            Contacts
            <span className="ml-1 px-2 py-0.5 bg-slate-700 rounded-full text-xs" aria-label={`${contacts.length} contacts`}>
              {contacts.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            role="tab"
            aria-selected={activeTab === 'export'}
            aria-controls="export-panel"
            id="export-tab"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'export'
                ? 'bg-brand-gold/20 text-brand-gold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileDown className="w-4 h-4" aria-hidden="true" />
            Export Binder
          </button>
        </div>
      </nav>

      {/* Checklist Tab */}
      {activeTab === 'checklist' && (
        <div className="space-y-4" role="tabpanel" id="checklist-panel" aria-labelledby="checklist-tab">
          {/* Disclaimer and Progress */}
          <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-xl p-4 mb-4">
            <p className="text-sm text-brand-gold/80">
              <strong>Not everything here will apply.</strong> These are common executor tasks, but your situation may be simpler. 
              Mark items as "Done" or skip them entirely—there's no requirement to complete everything.
            </p>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-300 font-medium">Items Addressed</span>
              <span className="text-brand-gold">{checklistProgress.completed} of {checklistProgress.total}</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-gold rounded-full transition-all"
                style={{ width: `${checklistProgress.percentage}%` }}
              />
            </div>
          </div>

          {/* Checklist Categories */}
          {categories.map((category) => {
            const info = getChecklistCategoryInfo(category);
            // Use memoized grouping instead of filtering on every render
            const categoryItems = checklistByCategory[category];
            const completed = categoryItems.filter(i => i.status === 'DONE').length;
            const isExpanded = expandedCategories.has(category);

            return (
              <div
                key={category}
                ref={el => { categoryRefs.current[category] = el; }}
                className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-700/20 text-left"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                    <div className="text-left">
                      <h4 className="font-medium text-white">{info.label}</h4>
                      <p className="text-sm text-slate-400">{info.description}</p>
                    </div>
                  </div>
                  <span className="text-sm text-slate-400">
                    {completed}/{categoryItems.length}
                  </span>
                </button>

                {isExpanded && (
                  <div id={`category-${category}-content`} className="border-t border-slate-700/50 divide-y divide-slate-700/30" role="region" aria-label={`${info.label} items`}>
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-4 hover:bg-slate-700/10"
                      >
                        <button
                          onClick={() => toggleChecklistItem(item.id)}
                          aria-label={`${item.status === 'DONE' ? 'Unmark' : 'Mark'} ${item.title} as ${item.status === 'DONE' ? 'pending' : 'done'}`}
                          className="flex-shrink-0 mt-0.5"
                        >
                          {item.status === 'DONE' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-500 hover:text-slate-400" />
                          )}
                        </button>
                        <div>
                          <h5 className={`font-medium ${
                            item.status === 'DONE' 
                              ? 'text-slate-400 line-through' 
                              : 'text-white'
                          }`}>
                            {item.title}
                          </h5>
                          <p className="text-sm text-slate-400 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <div className="space-y-4" role="tabpanel" id="contacts-panel" aria-labelledby="contacts-tab">
          {/* Contact Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{contactProgress.total}</div>
              <div className="text-sm text-slate-400">Total Contacts</div>
            </div>
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-brand-gold">{contactProgress.inProgress}</div>
              <div className="text-sm text-slate-400">In Progress</div>
            </div>
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">{contactProgress.contacted}</div>
              <div className="text-sm text-slate-400">Completed</div>
            </div>
          </div>

          {/* Contact List */}
          <div className="grid gap-4 md:grid-cols-2">
            {contacts.map((contact) => {
              const typeInfo = getContactTypeInfo(contact.type);
              
              return (
                <div
                  key={contact.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${typeInfo.color}20` }}
                      >
                        <span style={{ color: typeInfo.color }}>
                          {typeInfo.label.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{contact.name}</h4>
                        <p className="text-xs text-slate-400">{typeInfo.label}</p>
                      </div>
                    </div>
                    <select
                      value={contact.contactStatus || 'NOT_CONTACTED'}
                      onChange={(e) => updateContactStatus(
                        contact.id, 
                        e.target.value as ContactEntry['contactStatus']
                      )}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        contact.contactStatus === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : contact.contactStatus === 'IN_PROGRESS'
                            ? 'bg-brand-gold/20 text-brand-gold'
                            : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      <option value="NOT_CONTACTED">Not Contacted</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <div className="space-y-2 text-sm">
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Phone className="w-4 h-4" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Mail className="w-4 h-4" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                    {contact.website && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Globe className="w-4 h-4" />
                        <span className="truncate">{contact.website}</span>
                      </div>
                    )}
                  </div>

                  {contact.notes && (
                    <p className="mt-3 text-sm text-slate-500 border-t border-slate-700 pt-3">
                      {contact.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {contacts.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No contacts yet</p>
              <p className="text-slate-500 text-sm mt-1">
                Contacts will be populated from your Local Legacy Vault data
              </p>
            </div>
          )}
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6" role="tabpanel" id="export-panel" aria-labelledby="export-tab">
          <div className="text-center mb-6">
            <FileDown className="w-12 h-12 text-brand-gold mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">Export Aftercare Binder</h3>
            <p className="text-slate-400 text-sm mt-1">
              Copy a text summary to your clipboard for printing or saving
            </p>
          </div>

          <div className="space-y-4 max-w-md mx-auto">
            <label className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includeTasks}
                onChange={(e) => setExportOptions({...exportOptions, includeTasks: e.target.checked})}
                className="w-4 h-4 rounded border-slate-500"
              />
              <span className="text-slate-300">Include Task Plan</span>
            </label>
            <label className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includeChecklist}
                onChange={(e) => setExportOptions({...exportOptions, includeChecklist: e.target.checked})}
                className="w-4 h-4 rounded border-slate-500"
              />
              <span className="text-slate-300">Include Executor Checklist</span>
            </label>
            <label className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includeContacts}
                onChange={(e) => setExportOptions({...exportOptions, includeContacts: e.target.checked})}
                className="w-4 h-4 rounded border-slate-500"
              />
              <span className="text-slate-300">Include Contact Directory</span>
            </label>
            <label className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includeDocumentSummaries}
                onChange={(e) => setExportOptions({...exportOptions, includeDocumentSummaries: e.target.checked})}
                className="w-4 h-4 rounded border-slate-500"
              />
              <span className="text-slate-300">Include Document Summaries</span>
            </label>

            <button
              onClick={async () => {
                if (!plan) return;
                setExportStatus('copying');
                
                try {
                  const { exportAftercareBinder } = await import('../../services/exportService');
                  await exportAftercareBinder(
                    plan,
                    exportOptions.includeContacts ? contacts : [],
                    exportOptions.includeChecklist ? checklist : []
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
                  ? 'bg-emerald-500 text-white' 
                  : exportStatus === 'copying'
                  ? 'bg-slate-600 text-slate-300 cursor-not-allowed'
                  : 'bg-brand-gold hover:bg-brand-gold/90 text-slate-900'
              }`}
            >
              {exportStatus === 'copied' ? (
                <>
                  <Check className="w-5 h-5" />
                  PDF Downloaded!
                </>
              ) : exportStatus === 'copying' ? (
                <>
                  <FileDown className="w-5 h-5 animate-pulse" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FileDown className="w-5 h-5" />
                  Download PDF Binder
                </>
              )}
            </button>
            <p className="text-xs text-slate-500 text-center">
              PDF will download automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

