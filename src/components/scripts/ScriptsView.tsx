/**
 * Scripts View
 * 
 * Phone scripts and letter templates for common communications.
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { 
  Phone, 
  Mail, 
  FileText, 
  Copy, 
  Check,
  ChevronRight,
  Edit3,
  Download,
} from 'lucide-react';
import { AftercareProfile, ScriptTemplate, ScriptRenderContext } from '../../types';
import { 
  SCRIPT_TEMPLATES, 
  renderScript, 
  getTemplateTypeInfo,
  getAllTemplateTypes,
} from '../../services/scriptTemplates';

interface ScriptsViewProps {
  profile: AftercareProfile;
}

export const ScriptsView: React.FC<ScriptsViewProps> = ({ profile }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ScriptTemplate | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [copied, setCopied] = useState(false);
  // Pre-populate context from profile where possible
  const getRelationshipLabelForScript = (relationship?: string): string => {
    const labels: Record<string, string> = {
      'SPOUSE': 'the spouse',
      'CHILD': 'the son/daughter',
      'PARENT': 'the parent',
      'SIBLING': 'a sibling',
      'FRIEND': 'a friend',
      'SELF': 'handling my own affairs',
      'OTHER': 'a family representative',
    };
    return relationship ? labels[relationship] || 'a family member' : '[Your Relationship]';
  };

  const [customContext, setCustomContext] = useState<Partial<ScriptRenderContext>>({
    deceasedName: profile.deceasedName,
    userRelationship: getRelationshipLabelForScript(profile.relationship),
    dateOfDeath: profile.dateOfDeath ? new Date(profile.dateOfDeath).toLocaleDateString() : undefined,
    todayDate: new Date().toLocaleDateString(),
  });
  const contentRef = useRef<HTMLDivElement>(null);

  // Memoize template types - they don't change
  const templateTypes = useMemo(() => getAllTemplateTypes(), []);
  
  // Memoize templates grouped by type
  const templatesByType = useMemo(() => {
    const grouped: Record<string, ScriptTemplate[]> = {};
    SCRIPT_TEMPLATES.forEach(template => {
      if (!grouped[template.type]) {
        grouped[template.type] = [];
      }
      grouped[template.type].push(template);
    });
    return grouped;
  }, []);

  const handleSelectTemplate = useCallback((template: ScriptTemplate) => {
    setSelectedTemplate(template);
    const rendered = renderScript(template, customContext as ScriptRenderContext);
    setEditedContent(rendered);
    setCopied(false);
    // Scroll content into view
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, [customContext]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [editedContent]);

  const handleDownloadWord = () => {
    if (!selectedTemplate || !editedContent) return;
    
    // Create Word-compatible HTML document
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
      <head>
        <meta charset="utf-8">
        <title>${selectedTemplate.title}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5; }
          pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>
        <pre>${editedContent}</pre>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTemplate.title.replace(/[^a-z0-9]/gi, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleContextChange = (key: keyof ScriptRenderContext, value: string) => {
    const newContext = { ...customContext, [key]: value };
    setCustomContext(newContext);
    if (selectedTemplate) {
      const rendered = renderScript(selectedTemplate, newContext as ScriptRenderContext);
      setEditedContent(rendered);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PHONE_SCRIPT':
        return <Phone className="w-4 h-4" />;
      case 'EMAIL':
        return <Mail className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Templates</h2>
        <p className="text-slate-400 text-sm">
          Phone scripts and written notifications
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="lg:col-span-1 space-y-4">
          {templateTypes.map((type) => {
            const typeInfo = getTemplateTypeInfo(type);
            // Use memoized grouping instead of filtering on every render
            const templates = templatesByType[type] || [];
            
            return (
              <div key={type} className="space-y-2">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                  {typeInfo.label}
                </h4>
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-brand-gold bg-brand-gold/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="p-2 rounded bg-brand-gold/15 text-brand-gold">
                      {getCategoryIcon(template.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {template.title}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {/* Template Editor - Document reader style, auto-height */}
        <div ref={contentRef} className="lg:col-span-2">
          {selectedTemplate ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              {/* Template Header with Actions */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {selectedTemplate.title}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {selectedTemplate.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      copied
                        ? 'bg-emerald-500 text-white'
                        : 'bg-brand-gold hover:bg-brand-gold text-slate-900'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadWord}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Word
                  </button>
                </div>
              </div>

              {/* Quick Fill Fields */}
              <div className="bg-slate-700/30 rounded-lg p-3 mb-3">
                <div className="grid grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={customContext.userName || ''}
                    onChange={(e) => handleContextChange('userName', e.target.value)}
                    placeholder="Your name"
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  />
                  <input
                    type="text"
                    value={customContext.institutionName || ''}
                    onChange={(e) => handleContextChange('institutionName', e.target.value)}
                    placeholder="Institution"
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  />
                  <input
                    type="text"
                    value={customContext.accountReference || ''}
                    onChange={(e) => handleContextChange('accountReference', e.target.value)}
                    placeholder="Account ref"
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  />
                  <input
                    type="text"
                    value={customContext.userRelationship || ''}
                    onChange={(e) => handleContextChange('userRelationship', e.target.value)}
                    placeholder="Relationship"
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  />
                </div>
              </div>

              {/* Editable Content - Document reader style, auto-height */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Edit3 className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Edit as needed</span>
                </div>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full px-6 py-5 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 text-sm leading-relaxed focus:outline-none focus:border-brand-gold resize-y"
                  style={{ 
                    fontFamily: 'Arial, sans-serif',
                    fieldSizing: 'content',
                  } as React.CSSProperties}
                  rows={Math.max(8, editedContent.split('\n').length + 2)}
                  aria-label="Template content editor"
                />
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8 text-center">
              <FileText className="w-10 h-10 text-accent-gold mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Select a template to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
