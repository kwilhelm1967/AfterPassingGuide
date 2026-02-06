/**
 * Scripts View (Templates)
 *
 * Emotional support for difficult conversations — simple scripts and messages.
 * Quiet help finding the right words, not a tool performing an action.
 */

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Copy, Check, Printer } from 'lucide-react';
import { AftercareProfile, ScriptTemplate, ScriptRenderContext } from '../../types';
import {
  SCRIPT_TEMPLATES,
  renderScript,
  getTemplateTypeInfo,
  getAllTemplateTypes,
  getTemplateDisplayTitle,
} from '../../services/scriptTemplates';
import { TitleBar } from '../common/TitleBar';

const NOTES_STORAGE_KEY = 'afterpassing_template_notes';
const RECENT_TEMPLATES_KEY = 'afterpassing_recent_templates';
const RECENT_MAX = 5;

function getRecentTemplateIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function pushRecentTemplateId(id: string): void {
  const ids = getRecentTemplateIds().filter((x) => x !== id);
  ids.unshift(id);
  try {
    localStorage.setItem(RECENT_TEMPLATES_KEY, JSON.stringify(ids.slice(0, RECENT_MAX)));
  } catch {}
}

function getStoredNotes(templateId: string): string {
  try {
    const raw = localStorage.getItem(`${NOTES_STORAGE_KEY}_${templateId}`);
    return raw ?? '';
  } catch {
    return '';
  }
}

function setStoredNotes(templateId: string, value: string): void {
  try {
    if (value) localStorage.setItem(`${NOTES_STORAGE_KEY}_${templateId}`, value);
    else localStorage.removeItem(`${NOTES_STORAGE_KEY}_${templateId}`);
  } catch {
    // ignore
  }
}

/** Detect if a line is a section header (e.g. main title, FACEBOOK/META, INSTAGRAM, TIPS) for accent styling */
function isSectionHeader(line: string): boolean {
  const t = line.trim();
  if (!t || t.length > 120 || t.includes(':')) return false;
  // Plain all-caps line (no placeholders)
  if (t.length >= 2 && t.length <= 55 && /^[A-Z0-9\/\s]+$/.test(t)) return true;
  // Title-style line with optional [Placeholder] parts (e.g. "MANAGING SOCIAL MEDIA ACCOUNTS FOR [Deceased Name]")
  const withoutPlaceholders = t.replace(/\s*\[[^\]]*\]\s*/g, ' ').replace(/\s+/g, ' ').trim();
  return withoutPlaceholders.length >= 10 && /^[A-Z0-9\/\s]+$/.test(withoutPlaceholders);
}

interface ScriptsViewProps {
  profile: AftercareProfile;
}

export const ScriptsView: React.FC<ScriptsViewProps> = ({ profile }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ScriptTemplate | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const getRelationshipLabelForScript = (relationship?: string): string => {
    const labels: Record<string, string> = {
      SPOUSE: 'the spouse',
      CHILD: 'the son/daughter',
      PARENT: 'the parent',
      SIBLING: 'a sibling',
      FRIEND: 'a friend',
      SELF: 'handling my own affairs',
      OTHER: 'a family representative',
    };
    return relationship ? labels[relationship] || 'a family member' : '[Your Relationship]';
  };

  const [customContext, setCustomContext] = useState<Partial<ScriptRenderContext>>({
    deceasedName: profile.deceasedName,
    userRelationship: getRelationshipLabelForScript(profile.relationship),
    dateOfDeath: profile.dateOfDeath ? new Date(profile.dateOfDeath).toLocaleDateString() : undefined,
    todayDate: new Date().toLocaleDateString(),
  });

  const templateTypes = useMemo(() => getAllTemplateTypes(), []);
  const templatesByType = useMemo(() => {
    const grouped: Record<string, ScriptTemplate[]> = {};
    SCRIPT_TEMPLATES.forEach((template) => {
      if (!grouped[template.type]) grouped[template.type] = [];
      grouped[template.type].push(template);
    });
    return grouped;
  }, []);

  const handleSelectTemplate = useCallback(
    (template: ScriptTemplate) => {
      setSelectedTemplate(template);
      pushRecentTemplateId(template.id);
      const rendered = renderScript(template, customContext as ScriptRenderContext);
      setEditedContent(rendered);
      setCopied(false);
      setNotes(getStoredNotes(template.id));
      setShowNotes(false);
      setTimeout(() => printRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    },
    [customContext]
  );

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [editedContent]);

  const handlePrint = useCallback(() => {
    if (!printRef.current) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><title>${selectedTemplate?.title ?? 'Template'}</title>
      <style>body{font-family:Arial,sans-serif;font-size:12pt;font-weight:normal;line-height:1.6;max-width:40em;margin:2em auto;padding:0 1em;color:#333;} pre{white-space:pre-wrap;font-family:inherit;font-weight:normal;}</style>
      </head><body><pre>${editedContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></body></html>
    `);
    win.document.close();
    win.print();
    win.close();
  }, [editedContent, selectedTemplate?.title]);

  const handleNotesChange = useCallback((value: string) => {
    setNotes(value);
    if (selectedTemplate) setStoredNotes(selectedTemplate.id, value);
  }, [selectedTemplate]);

  useEffect(() => {
    if (selectedTemplate) setStoredNotes(selectedTemplate.id, notes);
  }, [selectedTemplate?.id, notes]);

  const handleContextChange = (key: keyof ScriptRenderContext, value: string) => {
    const newContext = { ...customContext, [key]: value };
    setCustomContext(newContext);
    if (selectedTemplate) {
      const rendered = renderScript(selectedTemplate, newContext as ScriptRenderContext);
      setEditedContent(rendered);
    }
  };

  const recentIds = React.useMemo(() => getRecentTemplateIds(), [selectedTemplate?.id]);
  const recentTemplates = useMemo(() => {
    const out: ScriptTemplate[] = [];
    const seen = new Set<string>();
    for (const id of recentIds) {
      for (const t of SCRIPT_TEMPLATES) {
        if (t.id === id && !seen.has(id)) {
          out.push(t);
          seen.add(id);
          break;
        }
      }
    }
    return out;
  }, [recentIds]);

  return (
    <div className="pb-6">
      <div className="page-header-zone flex flex-col items-center text-center">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold text-text-primary" style={{ fontFamily: 'Arial, sans-serif' }}>Templates</h2>
          <TitleBar className="mt-1.5" />
        </div>
        <p className="text-slate-400 text-sm mt-1.5 font-normal max-w-md" style={{ fontFamily: 'Arial, sans-serif' }}>
          Scripts and messages for notifications and requests.
        </p>
      </div>

      <div className="rounded-lg bg-slate-800/30 border border-slate-700/40 p-3 mb-5">
        <p className="text-xs text-slate-500 leading-relaxed" style={{ fontFamily: 'Arial, sans-serif' }}>
          General guidance only. Not legal advice.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left column — collapsible categories + Recently used */}
        <div className="lg:col-span-1 space-y-4">
          {recentTemplates.length > 0 && (
            <details open className="group">
              <summary className="text-[13px] font-medium text-slate-400 cursor-pointer list-none flex items-center gap-1">
                <span className="group-open:rotate-90 transition-transform">▶</span>
                Recently used
              </summary>
              <div className="mt-2 space-y-1 pl-4">
                {recentTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleSelectTemplate(template)}
                    className={`w-full text-left px-2 py-2 rounded text-sm ${selectedTemplate?.id === template.id ? 'bg-slate-800/50 text-text-primary' : 'text-slate-300 hover:bg-slate-800/30'}`}
                  >
                    {getTemplateDisplayTitle(template)}
                  </button>
                ))}
              </div>
            </details>
          )}
          {templateTypes.map((type) => {
            const typeInfo = getTemplateTypeInfo(type);
            const templates = templatesByType[type] || [];
            return (
              <details key={type} className="group" defaultOpen={templateTypes.indexOf(type) < 2}>
                <summary className="text-[13px] font-normal text-slate-500 cursor-pointer list-none flex items-center gap-1">
                  <span className="group-open:rotate-90 transition-transform">▶</span>
                  {typeInfo.label}
                </summary>
                <div className="mt-2 space-y-1 pl-4">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleSelectTemplate(template)}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded text-left text-sm border transition-colors ${
                        selectedTemplate?.id === template.id ? 'border-slate-600/70 bg-slate-800/50 text-text-primary' : 'border-transparent hover:bg-slate-800/30 text-slate-300'
                      }`}
                    >
                      {getTemplateDisplayTitle(template)}
                    </button>
                  ))}
                </div>
              </details>
            );
          })}
        </div>

        {/* Right panel — header with name + Copy, Edit, Print top-right */}
        <div ref={printRef} className="lg:col-span-2">
          {selectedTemplate ? (
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <h3 className="text-base font-medium text-text-primary" style={{ fontFamily: 'Arial, sans-serif' }}>
                  {getTemplateDisplayTitle(selectedTemplate)}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-normal transition-colors ${
                      copied ? 'bg-slate-600 text-slate-200' : 'bg-slate-700/70 hover:bg-slate-700/90 text-slate-200'
                    }`}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNotes((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-normal text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-normal bg-slate-700/70 hover:bg-slate-700/90 text-slate-200 transition-colors"
                  >
                    <Printer className="w-3 h-3" />
                    Print
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500" style={{ fontFamily: 'Arial, sans-serif' }}>
                Use as-is or adjust to sound like you.
              </p>

              {/* Reading surface: formatted view with section headers in accent color */}
              <div className="rounded-lg bg-slate-800/20 p-6">
                <div
                  className="whitespace-pre-wrap text-slate-200 text-[15px] leading-[1.8] font-normal"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  {editedContent.split('\n').map((line, i) =>
                    isSectionHeader(line) ? (
                      <span key={i} className="block font-medium mt-4 first:mt-0 text-accent-gold">
                        {line}
                      </span>
                    ) : (
                      <span key={i} className="block">{line || ' '}</span>
                    )
                  )}
                </div>
                <details className="mt-4 group/edit">
                  <summary className="text-[13px] text-slate-500 cursor-pointer hover:text-slate-400 list-none">
                    Edit content
                  </summary>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="mt-3 w-full min-h-[200px] px-0 py-0 bg-transparent border-none text-slate-200 text-[15px] leading-[1.8] font-normal focus:outline-none focus:ring-0 resize-y placeholder-slate-500"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                    rows={Math.max(8, editedContent.split('\n').length + 2)}
                    aria-label="Template content"
                  />
                </details>
              </div>

              {/* Optional personalize — light, minimal; reduced divider contrast */}
              <details className="group rounded-lg border border-slate-700/40 bg-slate-800/20">
                <summary className="list-none cursor-pointer px-4 py-3 text-[15px] text-slate-400 hover:text-slate-300 font-normal" style={{ fontFamily: 'Arial, sans-serif' }}>
                  Personalize placeholders
                </summary>
                <div className="px-4 pb-4 pt-1 grid grid-cols-2 sm:grid-cols-[repeat(4,minmax(11rem,1fr))] gap-3">
                  <input
                    type="text"
                    value={customContext.userName ?? ''}
                    onChange={(e) => handleContextChange('userName', e.target.value)}
                    placeholder="Your name"
                    className="min-w-0 px-3 py-2 bg-slate-800/60 border border-slate-600/60 rounded-lg text-text-primary text-[15px] font-normal focus:outline-none focus:border-slate-600/60"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  />
                  <input
                    type="text"
                    value={customContext.institutionName ?? ''}
                    onChange={(e) => handleContextChange('institutionName', e.target.value)}
                    placeholder="Institution"
                    className="min-w-0 px-3 py-2 bg-slate-800/60 border border-slate-600/60 rounded-lg text-text-primary text-[15px] font-normal focus:outline-none focus:border-slate-600/60"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  />
                  <input
                    type="text"
                    value={customContext.accountReference ?? ''}
                    onChange={(e) => handleContextChange('accountReference', e.target.value)}
                    placeholder="Account ref"
                    className="min-w-0 px-3 py-2 bg-slate-800/60 border border-slate-600/60 rounded-lg text-text-primary text-[15px] font-normal focus:outline-none focus:border-slate-600/60"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  />
                  <input
                    type="text"
                    value={customContext.userRelationship ?? ''}
                    onChange={(e) => handleContextChange('userRelationship', e.target.value)}
                    placeholder="Relationship"
                    className="min-w-0 px-3 py-2 bg-slate-800/60 border border-slate-600/60 rounded-lg text-text-primary text-[15px] font-normal focus:outline-none focus:border-slate-600/60"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  />
                </div>
              </details>

              {/* Optional Save notes */}
              {showNotes && (
                <div className="space-y-2">
                  <label className="block text-[13px] text-slate-500 font-normal" style={{ fontFamily: 'Arial, sans-serif' }}>Your notes (saved on this device)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Add notes about this template..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-800/40 border border-slate-700/60 rounded-lg text-slate-200 text-[15px] font-normal placeholder-slate-500 resize-none"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center max-w-sm mx-auto">
              <p className="text-slate-400 text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>Choose a template from the list.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
