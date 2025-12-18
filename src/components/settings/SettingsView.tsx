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
} from 'lucide-react';
import { AftercareProfile, AppMode, RelationshipType } from '../../types';
import { validateProfile, type ProfileValidationResult } from '../../utils/validation';
import { downloadBackup, loadBackupFromFile, type ImportResult } from '../../services/backupService';

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
  const [showBackupRestore, setShowBackupRestore] = useState(false);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Profile Section */}
      <section className="lg:col-span-2 bg-card-bg border border-border-subtle rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-accent-gold/20 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-accent-gold" strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary text-base">Your Situation</h3>
            <p className="text-sm text-text-secondary">Update if circumstances change</p>
          </div>
          {hasChanges && (
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                saved ? 'bg-emerald-500 text-white' : 'bg-accent-gold text-vault-dark hover:bg-accent-gold-hover'
              }`}
            >
              {saved ? <><Check className="w-4 h-4" />Saved</> : 'Save Changes'}
            </button>
          )}
        </div>
        
        {/* Regenerate Option */}
        {showRegenerateOption && (
          <div className="mb-4 p-3 bg-accent-gold/10 border border-accent-gold/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-accent-gold" />
              <span className="text-sm text-text-secondary">Your situation changed. Update your guidance?</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-gold text-vault-dark rounded-lg text-xs font-medium"
              >
                <RefreshCcw className="w-3 h-3" /> Refresh Guidance
              </button>
              <button
                onClick={() => setShowRegenerateOption(false)}
                className="px-3 py-1.5 text-text-muted hover:text-text-primary text-xs"
              >
                Keep Current
              </button>
            </div>
          </div>
        )}
        
        {/* Helper text */}
        <p className="text-xs text-text-muted mb-4 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          These details help customize your guidance and templates
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Name of deceased</label>
            <input 
              type="text" 
              value={editedProfile.deceasedName || ''} 
              onChange={(e) => handleProfileChange('deceasedName', e.target.value)} 
              placeholder="Used in templates" 
              maxLength={100}
              className="w-full px-3 py-2.5 bg-vault-dark border border-border-subtle rounded-lg text-text-primary text-sm placeholder-text-muted focus:outline-none focus:border-accent-gold" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Your relationship</label>
            <select 
              value={editedProfile.relationship} 
              onChange={(e) => handleProfileChange('relationship', e.target.value)} 
              className="w-full px-3 py-2.5 bg-vault-dark border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-gold"
            >
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Country</label>
            <select 
              value={editedProfile.country || ''} 
              onChange={(e) => handleProfileChange('country', e.target.value)} 
              className="w-full px-3 py-2.5 bg-vault-dark border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-gold"
            >
              <option value="">Select country...</option>
              {COUNTRY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-text-muted mt-1">US-specific guidance shown for United States</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">State or Region</label>
            {editedProfile.country === 'United States' ? (
              <select 
                value={editedProfile.region || ''} 
                onChange={(e) => handleProfileChange('region', e.target.value)} 
                className="w-full px-3 py-2.5 bg-vault-dark border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-gold"
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
                className="w-full px-3 py-2.5 bg-vault-dark border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-gold placeholder-text-muted" 
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Is there a will?</label>
            <select 
              value={editedProfile.hasWill === undefined ? '' : editedProfile.hasWill.toString()} 
              onChange={(e) => handleProfileChange('hasWill', e.target.value === '' ? undefined : e.target.value === 'true')} 
              className="w-full px-3 py-2.5 bg-vault-dark border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-gold"
            >
              <option value="">Not sure</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Are you the executor?</label>
            <select 
              value={editedProfile.isExecutor === undefined ? '' : editedProfile.isExecutor.toString()} 
              onChange={(e) => handleProfileChange('isExecutor', e.target.value === '' ? undefined : e.target.value === 'true')} 
              className="w-full px-3 py-2.5 bg-vault-dark border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-gold"
            >
              <option value="">Not sure</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Date of passing (optional)</label>
            <input 
              type="date" 
              value={editedProfile.dateOfDeath || ''} 
              onChange={(e) => handleProfileChange('dateOfDeath', e.target.value || undefined)} 
              aria-invalid={!!validationErrors.dateOfDeath}
              aria-describedby={validationErrors.dateOfDeath ? 'dateOfDeath-error' : undefined}
              className={`w-full max-w-xs px-3 py-2.5 bg-vault-dark border rounded-lg text-text-primary text-sm focus:outline-none ${
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
      </section>

      {/* Right Column - Help and Actions */}
      <div className="space-y-4">
        {/* About Aftercare */}
        <section className="bg-card-bg border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-accent-gold/20 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-accent-gold" strokeWidth={1.75} />
            </div>
            <h3 className="font-semibold text-text-primary text-sm">Local Aftercare Vault</h3>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            Administrative guidance for navigating the practical matters after a loss. Work at your own pace—there's no rush.
          </p>
          <p className="text-xs text-text-muted">
            {mode === 'EMBEDDED' ? 'Connected to Local Legacy Vault' : 'Standalone mode'}
          </p>
        </section>

        {/* Data Storage Notice */}
        <section className="bg-card-bg border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-accent-gold" strokeWidth={1.75} />
            <h3 className="font-semibold text-text-primary text-sm">Data Privacy & Saving</h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed mb-2">
            All data is stored locally on this device only. Nothing is sent to the cloud.
          </p>
          <p className="text-xs text-text-secondary leading-relaxed mb-2">
            <strong>Auto-save:</strong> Tasks, documents, contacts, and checklist items save automatically as you work.
          </p>
          <p className="text-xs text-text-secondary leading-relaxed mb-2">
            <strong>Profile changes:</strong> Click "Save Changes" above to save your situation updates.
          </p>
          <p className="text-xs text-text-muted">
            <strong>Shared computer?</strong> Use "Reset Data" below when finished to clear your information.
          </p>
        </section>

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

        {/* Help Section */}
        <section className="bg-card-bg border border-border-subtle rounded-xl p-4">
          <h3 className="font-semibold text-text-primary text-sm mb-3">Help</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowUserGuide(true)} 
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-vault-dark rounded-lg hover:bg-card-bg-hover text-text-secondary text-sm transition-colors"
            >
              <BookOpen className="w-4 h-4 text-accent-gold" strokeWidth={1.75} />
              User Guide
            </button>
            <button 
              onClick={() => setShowFAQs(true)} 
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-vault-dark rounded-lg hover:bg-card-bg-hover text-text-secondary text-sm transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-accent-gold" strokeWidth={1.75} />
              FAQs
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-card-bg border border-burnt-orange/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-burnt-orange" />
            <h3 className="font-semibold text-burnt-orange text-sm">Danger Zone</h3>
          </div>
          <p className="text-xs text-text-muted mb-3">
            This will erase your saved data and return to initial setup. Your Local Legacy Vault data is not affected.
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
              className="flex items-center gap-1.5 px-3 py-1.5 border border-burnt-orange/50 text-burnt-orange hover:bg-burnt-orange/10 rounded text-xs transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Reset Data
            </button>
          )}
        </section>

        {/* Footer */}
        <div className="text-center text-text-muted text-xs">
          <p>Local Aftercare Vault v1.0.0</p>
          <p>Administrative guidance only</p>
        </div>
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
                    <div><span className="text-accent-gold">First 48 Hours</span> — Immediate priorities</div>
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
                { q: "What is Local Aftercare Vault?", a: "It's an organizational tool that helps you keep track of what may need attention after losing a loved one. It provides suggestions, templates, and a way to track what you've addressed." },
                { q: "Is this legal or financial advice?", a: "No. This tool provides organizational guidance only—not legal, financial, or medical advice. Items shown are informational and may not apply to your situation. For legal, financial, or tax decisions, consider consulting a qualified professional." },
                { q: "Is this for the United States only?", a: "Yes. The checklists, templates, and resources are focused on the United States. References to agencies like Social Security, the VA, credit bureaus, and DMV are US-specific. If you are outside the US, some items may still be helpful as general guidance, but you should consult local resources." },
                { q: "Where is my data stored?", a: "All data is stored locally on your device. Nothing is uploaded to the cloud or shared with anyone." },
                { q: "Can I change my answers later?", a: "Yes. Go to Settings and update your situation anytime. You'll be prompted to refresh your guidance if key details change." },
                { q: "What if an item doesn't apply to me?", a: "Mark it as 'Not applicable.' This removes it from your active list without affecting other items." },
                { q: "How do I get death certificates?", a: "Usually through the funeral home or the vital records office in the state where the death occurred. Order 10-15 copies—many institutions ask for originals." },
                { q: "Can I use this without Local Legacy Vault?", a: "Yes. Local Aftercare Vault works standalone. If connected to Local Legacy Vault, it can read your saved data to provide more specific guidance." },
                { q: "How do I start over?", a: "Go to Settings and use 'Reset Data' in the Danger Zone. This clears Aftercare data but does not affect your Local Legacy Vault." },
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
