/**
 * Settings View
 * 
 * Profile management and app settings.
 */

import React, { useState } from 'react';
import { 
  User, 
  AlertTriangle,
  Check,
  RefreshCw,
  RefreshCcw,
  Info,
  BookOpen,
  HelpCircle,
  X,
  ChevronDown,
  ChevronRight,
  Heart,
  Shield,
  Download,
  Upload,
  Settings,
  Wrench,
  FileText,
  ExternalLink,
  Landmark,
} from 'lucide-react';
import { AftercareProfile, AppMode, RelationshipType } from '../../types';
import { validateProfile, type ProfileValidationResult } from '../../utils/validation';
import { downloadBackup, loadBackupFromFile, type ImportResult } from '../../services/backupService';
import { TitleBar } from '../common/TitleBar';

// Country options for US-specific feature detection
const COUNTRY_OPTIONS = [
  { value: 'United States', label: 'United States' },
  { value: 'Canada', label: 'Canada' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Other', label: 'Other' },
];

// US State options for consistent data entry
const US_STATE_OPTIONS = [
  { value: '', label: 'Select state...' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' },
];

interface SettingsViewProps {
  profile: AftercareProfile;
  mode: AppMode;
  onProfileUpdate: (profile: AftercareProfile) => void;
  onRegenerateTasks: () => void;
  onStartOver: () => void;
}

const RELATIONSHIP_OPTIONS: { value: RelationshipType; label: string }[] = [
  { value: 'SPOUSE', label: 'Spouse or Partner' },
  { value: 'CHILD', label: 'Son or Daughter' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'SIBLING', label: 'Sibling' },
  { value: 'FRIEND', label: 'Friend' },
  { value: 'SELF', label: 'Myself (planning ahead)' },
  { value: 'OTHER', label: 'Other Relationship' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  mode,
  onProfileUpdate,
  onRegenerateTasks,
  onStartOver,
}) => {
  const [editedProfile, setEditedProfile] = useState(profile);
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showRegenerateOption, setShowRegenerateOption] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [showFAQs, setShowFAQs] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<ProfileValidationResult['errors']>({});
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'tools' | 'resources'>('settings');
  const [situationExpanded, setSituationExpanded] = useState(false);
  const [officialResourcesExpanded, setOfficialResourcesExpanded] = useState(false);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'exporting' | 'importing' | 'success' | 'error'>('idle');
  const [backupMessage, setBackupMessage] = useState<string>('');

  const handleProfileChange = (key: keyof AftercareProfile, value: any) => {
    const updated = { ...editedProfile, [key]: value };
    setEditedProfile(updated);
    setHasChanges(true);
    setSaved(false);
    
    // Validate on change
    const validation = validateProfile(updated);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
    } else {
      setValidationErrors({});
    }
  };

  const handleSave = () => {
    // Validate before saving
    const validation = validateProfile(editedProfile);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }
    
    setValidationErrors({});
    
    // Check if key fields changed that would affect task generation
    const situationChanged = 
      editedProfile.hasWill !== profile.hasWill ||
      editedProfile.isExecutor !== profile.isExecutor ||
      editedProfile.country !== profile.country ||
      editedProfile.relationship !== profile.relationship;
    
    onProfileUpdate({
      ...editedProfile,
      updatedAt: new Date().toISOString(),
    });
    setHasChanges(false);
    setSaved(true);
    
    if (situationChanged) {
      setShowRegenerateOption(true);
    }
    
    setTimeout(() => setSaved(false), 2000);
  };
  
  const handleExportBackup = async () => {
    setBackupStatus('exporting');
    setBackupMessage('');
    try {
      await downloadBackup();
      setBackupStatus('success');
      setBackupMessage('Backup downloaded successfully');
      setTimeout(() => {
        setBackupStatus('idle');
        setBackupMessage('');
      }, 3000);
    } catch (error) {
      setBackupStatus('error');
      setBackupMessage(error instanceof Error ? error.message : 'Failed to export backup');
    }
  };
  
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setBackupStatus('importing');
    setBackupMessage('');
    try {
      const result: ImportResult = await loadBackupFromFile(file);
      if (result.success) {
        setBackupStatus('success');
        setBackupMessage(
          `Imported: ${result.imported.profile ? 'Profile' : ''} ${result.imported.plan ? 'Plan' : ''} ` +
          `${result.imported.documents} documents, ${result.imported.contacts} contacts, ${result.imported.checklist} checklist items`
        );
        // Reload the app to show imported data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setBackupStatus('error');
        setBackupMessage(result.error || 'Failed to import backup');
      }
    } catch (error) {
      setBackupStatus('error');
      setBackupMessage(error instanceof Error ? error.message : 'Failed to import backup');
    }
    
    // Reset file input
    e.target.value = '';
  };
  
  const handleRegenerate = () => {
    onRegenerateTasks();
    setShowRegenerateOption(false);
  };

  const handleReset = () => {
    setShowResetConfirm(false);
    onStartOver();
  };

  const TABS = [
    { id: 'settings' as const, label: 'Settings', icon: Settings },
    { id: 'tools' as const, label: 'Tools', icon: Wrench },
    { id: 'resources' as const, label: 'Resources', icon: FileText },
  ];

  const situationSummary = [
    editedProfile.deceasedName && `For: ${editedProfile.deceasedName}`,
    editedProfile.relationship && RELATIONSHIP_OPTIONS.find(r => r.value === editedProfile.relationship)?.label,
    editedProfile.country,
  ].filter(Boolean).join(' · ') || 'Not set';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header — flat zone: subtle gradient, bottom inner shadow, thin gold rule */}
      <div className="page-header-zone flex flex-col items-center text-center">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold text-text-primary">Settings</h2>
          <TitleBar className="mt-1.5" />
        </div>
        <p className="text-text-muted text-sm mt-1.5">Your situation, data, and resources.</p>
      </div>
      {/* Tab Bar */}
      <div className="flex gap-1 p-1 bg-card-bg rounded-xl border border-border-subtle">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSubTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeSubTab === id
                ? 'bg-vault-dark text-accent-gold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Settings Tab */}
      {activeSubTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Your Situation - Compact */}
          <section className="bg-card-bg border border-border-subtle rounded-xl p-4">
            <button
              onClick={() => setSituationExpanded(!situationExpanded)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-accent-gold" strokeWidth={1.75} />
                <h3 className="font-semibold text-text-primary text-sm">Your Situation</h3>
              </div>
              {situationExpanded ? (
                <ChevronDown className="w-4 h-4 text-text-muted" />
              ) : (
                <ChevronRight className="w-4 h-4 text-text-muted" />
              )}
            </button>
            {!situationExpanded ? (
              <p className="text-xs text-text-muted mt-2 truncate">{situationSummary}</p>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="text-xs text-text-muted flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Customizes guidance and templates
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Name of deceased</label>
                    <input 
                      type="text" 
                      value={editedProfile.deceasedName || ''} 
                      onChange={(e) => handleProfileChange('deceasedName', e.target.value)} 
                      placeholder="Used in templates" 
                      maxLength={100}
                      className="w-full px-3 py-2 bg-vault-dark border border-border-subtle rounded-lg text-text-primary text-sm placeholder-text-muted focus:outline-none focus:border-accent-gold" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      Your relationship
                      <span className="text-accent-gold ml-0.5" aria-hidden>*</span>
                    </label>
                    <select 
                      value={editedProfile.relationship ?? ''} 
                      onChange={(e) => handleProfileChange('relationship', e.target.value || undefined)} 
                      aria-required
                      aria-invalid={!!validationErrors.relationship}
                      className={`w-full px-3 py-2.5 bg-vault-dark border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-gold/20 ${
                        validationErrors.relationship ? 'border-red-500 focus:border-red-500' : 'border-border-subtle focus:border-accent-gold'
                      }`}
                    >
                      <option value="">Select...</option>
                      {RELATIONSHIP_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {validationErrors.relationship && (
                      <p className="text-xs text-red-400 mt-1" role="alert">{validationErrors.relationship}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Country</label>
                    <select 
                      value={editedProfile.country || ''} 
                      onChange={(e) => handleProfileChange('country', e.target.value)} 
                      className="w-full px-3 py-2.5 bg-vault-dark border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20"
                    >
                      <option value="">Select country...</option>
                      {COUNTRY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">State or Region</label>
                    {editedProfile.country === 'United States' ? (
                      <select 
                        value={editedProfile.region || ''} 
                        onChange={(e) => handleProfileChange('region', e.target.value)} 
                        className="w-full px-3 py-2.5 bg-vault-dark border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20"
                      >
                        {US_STATE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        type="text" 
                        value={editedProfile.region || ''} 
                        onChange={(e) => handleProfileChange('region', e.target.value)} 
                        placeholder={editedProfile.country ? "Enter region" : "Select country first"}
                        maxLength={100}
                        className="w-full px-3 py-2 bg-vault-dark border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-gold placeholder-text-muted" 
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Is there a will?</label>
                    <select 
                      value={editedProfile.hasWill === undefined ? '' : editedProfile.hasWill.toString()} 
                      onChange={(e) => handleProfileChange('hasWill', e.target.value === '' ? undefined : e.target.value === 'true')} 
                      className="w-full px-3 py-2.5 bg-vault-dark border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20"
                    >
                      <option value="">Not sure</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Are you the executor?</label>
                    <select 
                      value={editedProfile.isExecutor === undefined ? '' : editedProfile.isExecutor.toString()} 
                      onChange={(e) => handleProfileChange('isExecutor', e.target.value === '' ? undefined : e.target.value === 'true')} 
                      className="w-full px-3 py-2.5 bg-vault-dark border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20"
                    >
                      <option value="">Not sure</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Date of passing (optional)</label>
                    <input 
                      type="date" 
                      value={editedProfile.dateOfDeath || ''} 
                      onChange={(e) => handleProfileChange('dateOfDeath', e.target.value || undefined)} 
                      aria-invalid={!!validationErrors.dateOfDeath}
                      aria-describedby={validationErrors.dateOfDeath ? 'dateOfDeath-error' : undefined}
                      className={`w-full px-3 py-2 bg-vault-dark border rounded-lg text-text-primary text-sm focus:outline-none ${
                        validationErrors.dateOfDeath 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-border-subtle focus:border-accent-gold'
                      }`}
                    />
                    {validationErrors.dateOfDeath ? (
                      <p id="dateOfDeath-error" className="text-xs text-red-400 mt-1" role="alert">
                        {validationErrors.dateOfDeath}
                      </p>
                    ) : (
                      <p className="text-xs text-text-muted mt-1">Used to auto-fill templates and letters</p>
                    )}
                  </div>
                </div>
                {showRegenerateOption && (
                  <div className="mt-3 p-2 bg-accent-gold/10 border border-accent-gold/30 rounded-lg flex items-center justify-between gap-2">
                    <span className="text-xs text-text-secondary">Situation changed. Update guidance?</span>
                    <div className="flex gap-1">
                      <button onClick={handleRegenerate} className="px-2 py-1 bg-accent-gold text-vault-dark rounded text-xs font-medium">Refresh</button>
                      <button onClick={() => setShowRegenerateOption(false)} className="px-2 py-1 text-text-muted text-xs">Keep</button>
                    </div>
                  </div>
                )}
                {hasChanges && (
                  <button
                    onClick={handleSave}
                    disabled={Object.keys(validationErrors).length > 0}
                    className={`mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      saved
                        ? 'bg-emerald-500 text-text-primary'
                        : Object.keys(validationErrors).length === 0
                          ? 'bg-accent-gold text-vault-dark hover:bg-accent-gold-hover'
                          : 'bg-card-bg-hover text-text-muted cursor-not-allowed'
                    }`}
                  >
                    {saved ? <><Check className="w-4 h-4" />Saved</> : 'Save Changes'}
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Preferences — Language, Date format, Print */}
          <section className="bg-card-bg border border-border-subtle rounded-xl p-4">
            <h3 className="font-semibold text-text-primary text-sm mb-3">Preferences</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Language</label>
                <select className="w-full px-3 py-2 bg-vault-dark border border-border-subtle rounded-lg text-text-primary text-sm font-medium focus:outline-none focus:border-accent-gold" disabled>
                  <option>English</option>
                </select>
                <p className="text-[11px] text-text-muted mt-0.5">More languages in a future update.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Date format</label>
                <select className="w-full px-3 py-2 bg-vault-dark border border-border-subtle rounded-lg text-text-primary text-sm font-medium focus:outline-none focus:border-accent-gold">
                  <option value="locale">Use device default</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Print preferences</label>
                <p className="text-xs text-text-muted">Full disclaimer is always included at the bottom of printed and exported PDFs.</p>
              </div>
            </div>
          </section>

          {/* Data & Privacy */}
          <section className="bg-card-bg border border-border-subtle rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-accent-gold" strokeWidth={1.75} />
              <h3 className="font-semibold text-text-primary text-sm">Data & Privacy</h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed mb-2">
              All data is stored locally on this device. Nothing is sent to the cloud.
            </p>
            <p className="text-xs text-text-secondary leading-relaxed mb-2">
              <strong>Auto-save:</strong> Tasks, documents, and contacts save as you work.
            </p>
            <p className="text-xs text-text-muted">
              {mode === 'EMBEDDED' ? 'Connected to Local Legacy Vault' : 'Standalone mode'}
            </p>
          </section>

          {/* About — factual only; version lives in footer */}
          <section className="bg-card-bg/80 border border-border-subtle rounded-xl p-3 md:col-span-2">
            <div className="flex items-center gap-2 mb-1.5">
              <Heart className="w-3.5 h-3.5 text-text-muted" strokeWidth={1.75} />
              <h3 className="font-semibold text-text-primary text-sm">About AfterPassing Guide</h3>
            </div>
            <p className="text-sm text-text-secondary leading-snug">
              A local, offline tool for organizing administrative tasks after a loss.
            </p>
            <p className="text-xs text-text-muted mt-1.5">Administrative guidance only.</p>
          </section>
        </div>
      )}

      {/* Tools Tab — Backup separate from Reset; confirm for destructive actions */}
      {activeSubTab === 'tools' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backup & Restore */}
          <section className="bg-card-bg border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Download className="w-4 h-4 text-accent-gold" strokeWidth={1.75} />
            <h3 className="font-semibold text-text-primary text-sm">Backup & Restore</h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed mb-3">
            Export all your data to a backup file, or restore from a previous backup.
          </p>
          <div className="space-y-2">
            <button
              onClick={handleExportBackup}
              disabled={backupStatus === 'exporting' || backupStatus === 'importing'}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-accent-gold/20 text-accent-gold rounded-lg text-xs font-medium hover:bg-accent-gold/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Export backup"
            >
              {backupStatus === 'exporting' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Export Backup
                </>
              )}
            </button>
            <label className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 text-text-primary rounded-lg text-xs font-medium hover:bg-slate-700/70 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              <Upload className="w-3.5 h-3.5" />
              {backupStatus === 'importing' ? 'Importing...' : 'Import Backup'}
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                disabled={backupStatus === 'exporting' || backupStatus === 'importing'}
                className="hidden"
                aria-label="Import backup"
              />
            </label>
            {backupMessage && (
              <p 
                className={`text-xs mt-2 ${
                  backupStatus === 'success' ? 'text-emerald-400' : 
                  backupStatus === 'error' ? 'text-red-400' : 
                  'text-text-secondary'
                }`}
                role="alert"
              >
                {backupMessage}
              </p>
            )}
          </div>
          </section>
          </div>

          {/* Reset — separated visually from backup */}
          <section className="bg-card-bg border border-slate-600/50 rounded-xl p-4 border-l-4 border-l-amber-600/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-amber-200 text-sm">Reset Data</h3>
            </div>
            <p className="text-xs text-text-muted mb-3">
              Erase saved data and return to initial setup. Local Legacy Vault data is not affected.
            </p>
            {showResetConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-200">Are you sure? This cannot be undone.</span>
                <button onClick={handleReset} className="px-3 py-1.5 bg-amber-600 text-vault-dark rounded text-xs font-medium">Yes, Reset</button>
                <button onClick={() => setShowResetConfirm(false)} className="px-3 py-1.5 bg-slate-700 text-text-primary rounded text-xs font-medium">Cancel</button>
              </div>
            ) : (
              <button 
                onClick={() => setShowResetConfirm(true)} 
                className="flex items-center gap-1.5 px-3 py-2 border border-amber-600/50 text-amber-200 hover:bg-amber-600/10 rounded-lg text-xs transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Reset Data
              </button>
            )}
          </section>

          {/* Refresh Guidance - when situation changed */}
          {showRegenerateOption && (
            <section className="bg-card-bg border border-accent-gold/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCcw className="w-4 h-4 text-accent-gold" strokeWidth={1.75} />
                <h3 className="font-semibold text-text-primary text-sm">Refresh Guidance</h3>
              </div>
              <p className="text-xs text-text-secondary mb-3">
                Your situation changed. Regenerate your checklist with updated guidance?
              </p>
              <div className="flex gap-2">
                <button onClick={handleRegenerate} className="px-3 py-2 bg-accent-gold text-vault-dark rounded-lg text-xs font-medium">Refresh</button>
                <button onClick={() => setShowRegenerateOption(false)} className="px-3 py-2 text-text-muted text-xs">Keep Current</button>
              </div>
            </section>
          )}

          {/* Reset Data */}
          <section className="bg-card-bg border border-burnt-orange/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-burnt-orange" />
              <h3 className="font-semibold text-burnt-orange text-sm">Reset Data</h3>
            </div>
            <p className="text-xs text-text-muted mb-3">
              Erase saved data and return to initial setup. Local Legacy Vault data is not affected.
            </p>
            {showResetConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-burnt-orange">Are you sure?</span>
                <button onClick={handleReset} className="px-3 py-1.5 bg-burnt-orange text-vault-dark rounded text-xs font-medium">Yes, Reset</button>
                <button onClick={() => setShowResetConfirm(false)} className="px-3 py-1.5 bg-card-bg-hover text-text-primary rounded text-xs font-medium">Cancel</button>
              </div>
            ) : (
              <button 
                onClick={() => setShowResetConfirm(true)} 
                className="flex items-center gap-1.5 px-3 py-2 border border-burnt-orange/50 text-burnt-orange hover:bg-burnt-orange/10 rounded-lg text-xs transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Reset Data
              </button>
            )}
          </section>
        </div>
      )}

      {/* Resources Tab */}
      {activeSubTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Guide & FAQs */}
          <section className="bg-card-bg border border-border-subtle rounded-xl p-4">
            <h3 className="font-semibold text-text-primary text-sm mb-3">Help & Learning</h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setShowUserGuide(true)} 
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-vault-dark rounded-lg hover:bg-card-bg-hover text-text-primary text-sm transition-colors text-left"
              >
                <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-accent-gold" /> User Guide</span>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </button>
              <button 
                onClick={() => setShowFAQs(true)} 
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-vault-dark rounded-lg hover:bg-card-bg-hover text-text-primary text-sm transition-colors text-left"
              >
                <span className="flex items-center gap-2"><HelpCircle className="w-4 h-4 text-accent-gold" /> FAQs</span>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </button>
            </div>
          </section>

          {/* Printable guides */}
          <section className="bg-card-bg border border-border-subtle rounded-xl p-4">
            <h3 className="font-semibold text-text-primary text-sm mb-2">Printable guides</h3>
            <p className="text-xs text-text-muted">Export your checklist or full estate binder from Executor Tools for a clean, printable PDF. Full disclaimer is included at the bottom.</p>
          </section>

          {/* Official U.S. Resources — collapsed by default; reference only, no advice; not in first-48 or checklists */}
          <section className="bg-card-bg border border-border-subtle rounded-xl p-4 md:col-span-2">
            <button
              type="button"
              onClick={() => setOfficialResourcesExpanded((v) => !v)}
              className="w-full flex items-center gap-2 text-left"
              aria-expanded={officialResourcesExpanded}
            >
              <Landmark className="w-4 h-4 text-text-muted flex-shrink-0" aria-hidden />
              <h3 className="font-semibold text-text-primary text-sm">Official U.S. Resources</h3>
              {officialResourcesExpanded ? <ChevronDown className="w-4 h-4 text-text-muted ml-auto" /> : <ChevronRight className="w-4 h-4 text-text-muted ml-auto" />}
            </button>
            {officialResourcesExpanded && (
              <>
                <p className="text-xs text-text-muted mt-2 mb-4">Links to commonly used government and public resources. For reference only.</p>
                <ul className="space-y-4 list-none pl-0">
                  <li>
                    <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide block mb-1.5">Government &amp; Identity</span>
                    <ul className="space-y-1.5 text-sm">
                      <li><a href="https://www.ssa.gov/survivors/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-text-primary hover:underline"><span>Social Security Administration</span><ExternalLink className="w-3.5 h-3.5 text-text-muted flex-shrink-0" aria-hidden /></a></li>
                      <li><a href="https://www.irs.gov/individuals/family-special-situations" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-text-primary hover:underline"><span>IRS</span><ExternalLink className="w-3.5 h-3.5 text-text-muted flex-shrink-0" aria-hidden /></a></li>
                      <li><a href="https://www.usa.gov/vital-records" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-text-primary hover:underline"><span>State Vital Records Offices</span><ExternalLink className="w-3.5 h-3.5 text-text-muted flex-shrink-0" aria-hidden /></a></li>
                    </ul>
                  </li>
                  <li>
                    <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide block mb-1.5">Probate &amp; Courts</span>
                    <ul className="space-y-1.5 text-sm">
                      <li><a href="https://www.ncsc.org/find-a-court" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-text-primary hover:underline"><span>State Probate Court Locator</span><ExternalLink className="w-3.5 h-3.5 text-text-muted flex-shrink-0" aria-hidden /></a></li>
                      <li><a href="https://www.ncsc.org/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-text-primary hover:underline"><span>National Center for State Courts</span><ExternalLink className="w-3.5 h-3.5 text-text-muted flex-shrink-0" aria-hidden /></a></li>
                    </ul>
                  </li>
                  <li>
                    <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide block mb-1.5">Veterans <span className="normal-case font-normal text-text-muted">(If applicable)</span></span>
                    <ul className="space-y-1.5 text-sm">
                      <li><a href="https://www.va.gov/survivors/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-text-primary hover:underline"><span>U.S. Department of Veterans Affairs</span><ExternalLink className="w-3.5 h-3.5 text-text-muted flex-shrink-0" aria-hidden /></a></li>
                    </ul>
                  </li>
                  <li>
                    <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide block mb-1.5">Financial &amp; Property</span>
                    <ul className="space-y-1.5 text-sm">
                      <li><a href="https://www.consumerfinance.gov/consumer-tools/death-of-a-family-member/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-text-primary hover:underline"><span>CFPB</span><ExternalLink className="w-3.5 h-3.5 text-text-muted flex-shrink-0" aria-hidden /></a></li>
                      <li><a href="https://www.fdic.gov/consumers/consumer/news/cnsum22/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-text-primary hover:underline"><span>FDIC</span><ExternalLink className="w-3.5 h-3.5 text-text-muted flex-shrink-0" aria-hidden /></a></li>
                    </ul>
                  </li>
                  <li>
                    <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide block mb-1.5">Consumer &amp; Mail</span>
                    <ul className="space-y-1.5 text-sm">
                      <li><a href="https://www.usps.com/manage/mail-for-deceased.htm" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-text-primary hover:underline"><span>USPS</span><ExternalLink className="w-3.5 h-3.5 text-text-muted flex-shrink-0" aria-hidden /></a></li>
                      <li><a href="https://consumer.ftc.gov/articles/what-do-when-someone-dies" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-text-primary hover:underline"><span>FTC</span><ExternalLink className="w-3.5 h-3.5 text-text-muted flex-shrink-0" aria-hidden /></a></li>
                    </ul>
                  </li>
                </ul>
                <p className="text-[10px] text-text-muted mt-4 pt-3 border-t border-border-subtle">Links provided for convenience. We do not control or endorse external sites.</p>
              </>
            )}
          </section>

          {/* Legal */}
          <section className="bg-card-bg border border-border-subtle rounded-xl p-4 md:col-span-2">
            <h3 className="font-semibold text-text-primary text-sm mb-2">Legal & Policies</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              This tool provides organizational guidance for the United States only. It does not provide legal, financial, or medical advice. Laws and processes vary by state. For decisions about legal, financial, or tax matters, consider consulting a qualified professional.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <a href="/leg/terms.html" target="_blank" rel="noopener noreferrer" className="text-xs text-accent-gold hover:underline">Terms</a>
              <a href="/leg/privacy.html" target="_blank" rel="noopener noreferrer" className="text-xs text-accent-gold hover:underline">Privacy</a>
              <a href="/leg/disclaimer.html" target="_blank" rel="noopener noreferrer" className="text-xs text-accent-gold hover:underline">Disclaimer</a>
            </div>
          </section>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-text-muted text-xs pt-4">
        <p>AfterPassing Guide v1.0.0 · Administrative guidance only</p>
      </div>

      {/* User Guide Modal */}
      {showUserGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card-bg rounded-xl border border-border-subtle w-full max-w-4xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent-gold" />
                <h2 className="text-lg font-semibold text-text-primary">User Guide</h2>
              </div>
              <button onClick={() => setShowUserGuide(false)} className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-card-bg-hover">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <section>
                  <h3 className="font-semibold text-text-primary mb-1">Getting Started</h3>
                  <p className="text-text-secondary text-xs mb-2">Navigate administrative tasks at your own pace.</p>
                  <ol className="list-decimal list-inside text-text-muted text-xs space-y-0.5">
                    <li>Complete setup to tell us about your situation</li>
                    <li>Review guidance organized by timeline</li>
                    <li>Mark items as done or "not applicable"</li>
                    <li>Use templates for calls and letters</li>
                  </ol>
                </section>

                <section>
                  <h3 className="font-semibold text-text-primary mb-1">Item Status Options</h3>
                  <div className="grid grid-cols-2 gap-1 text-xs text-text-muted">
                    <div><strong>Not started</strong> — Not yet reviewed</div>
                    <div><strong>In progress</strong> — Working on it</div>
                    <div><strong>Done</strong> — Completed</div>
                    <div><strong>Not applicable</strong> — Doesn't apply</div>
                  </div>
                </section>
              </div>

              <div className="space-y-4">
                <section>
                  <h3 className="font-semibold text-text-primary mb-1">Timeline Phases</h3>
                  <div className="text-xs text-text-muted space-y-0.5">
                    <div><span className="text-accent-gold">The first few days</span> — Immediate priorities</div>
                    <div><span className="text-accent-gold">Week 1</span> — Early notifications</div>
                    <div><span className="text-accent-gold">Weeks 2-6</span> — Financial and legal matters</div>
                    <div><span className="text-accent-gold">Days 60-90</span> — Follow-ups</div>
                    <div><span className="text-accent-gold">Long Term</span> — Settlement and planning</div>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-text-primary mb-1">Privacy</h3>
                  <p className="text-text-secondary text-xs">All data stays on your device. Nothing is uploaded to the cloud.</p>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQs Modal */}
      {showFAQs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card-bg rounded-xl border border-border-subtle w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-accent-gold" />
                <h2 className="text-lg font-semibold text-text-primary">Frequently Asked Questions</h2>
              </div>
              <button onClick={() => setShowFAQs(false)} className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-card-bg-hover">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2 text-sm">
              {[
                { q: 'What is the AfterPassing Guide?', a: 'The AfterPassing Guide is an organizational tool that helps families manage paperwork, notifications, and administrative tasks after a loss. It provides checklists, document organization, templates, and executor tools in one place.' },
                { q: 'Is this legal or financial advice?', a: 'No. The AfterPassing Guide provides administrative and organizational guidance only. It does not replace attorneys, accountants, or medical professionals.' },
                { q: 'Who is this for?', a: 'Anyone helping manage affairs after a death, including spouses, adult children, executors, trustees, and caregivers.' },
                { q: 'Is my data stored online?', a: 'No. All data is stored locally on your device unless you choose to export it.' },
                { q: 'Does the app require internet access?', a: 'No. The app works offline. Internet access is only needed if you open external resource links.' },
                { q: 'Can I use this without a Local Legacy Vault?', a: 'Yes. The AfterPassing Guide works on its own. If you use a Local Legacy Vault, certain data can appear automatically, but it is not required.' },
                { q: 'Can multiple people use the same data?', a: 'The app is designed for one device at a time. You can share information by exporting the Estate Binder PDF.' },
                { q: 'What is the Estate Binder?', a: 'The Estate Binder is a downloadable PDF summary that includes selected checklist items, notes, documents list, and contacts for professional handoff.' },
                { q: 'Can I edit templates before using them?', a: 'Yes. Templates are meant to be adapted. You can copy, edit, and personalize them.' },
                { q: 'Can I back up my data?', a: 'Yes. You can export a full backup file and restore it later if needed.' },
                { q: 'Can I delete everything and start over?', a: 'Yes. The Reset Data option clears AfterPassing Guide data on this device.' },
              ].map((faq, index) => (
                <div key={index} className="border border-border-subtle rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-card-bg-hover transition-colors"
                  >
                    <span className="text-text-primary font-medium">{faq.q}</span>
                    {expandedFAQ === index ? (
                      <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                    )}
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-3 pb-3 text-text-muted">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
