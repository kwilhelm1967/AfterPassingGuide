/**
 * AfterPassing Guide
 * 
 * Administrative guidance for those navigating loss.
 * This application does not provide legal, financial, or medical advice.
 */

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { safeGetItem, safeSetItem } from './utils/safeStorage';
import { AlertTriangle, Lock, ArrowLeft } from 'lucide-react';

// Types
import type { 
  Case as CaseType,
  AftercareProfile, 
  AftercarePlan, 
  NavigationTab,
  UploadedDocument,
  ContactEntry,
  ExecutorChecklistItem,
  AppMode,
} from './types';

// Constants
import { createNavItems } from './constants/navigation.tsx';

const NAV_ITEMS = createNavItems();

// Services
import { 
  storageService,
  llvIntegration,
  generateAftercarePlan,
  generateExecutorChecklist,
  generateContactsFromVault,
  hasLegacyChecklistCategories,
} from './services';
import { downloadCaseExport } from './services/backupService';

// Components — eager for shell and first paint
import { AdminDashboard } from './components';
import { FaveIcon } from './components/common/FaveIcon';
import { CaseSwitcher } from './components/cases/CaseSwitcher';
import { CasesView } from './components/cases/CasesView';
import { CloseCaseWizard } from './components/cases/CloseCaseWizard';

// Lazy-loaded routes and heavy views (code-splitting to reduce initial bundle)
const MarketingLandingPage = lazy(() => import('./LAV/MarketingLandingPage').then(m => ({ default: m.MarketingLandingPage })));
const OnboardingWizard = lazy(() => import('./components/onboarding/OnboardingWizard').then(m => ({ default: m.OnboardingWizard })));
const LicenseActivationScreen = lazy(() => import('./components/license/LicenseActivationScreen').then(m => ({ default: m.LicenseActivationScreen })));
const FocusView = lazy(() => import('./components/tasks/FocusView').then(m => ({ default: m.FocusView })));
const ChecklistView = lazy(() => import('./components/tasks/ChecklistView').then(m => ({ default: m.ChecklistView })));
const DocumentsView = lazy(() => import('./components/documents/DocumentsView').then(m => ({ default: m.DocumentsView })));
const ScriptsView = lazy(() => import('./components/scripts/ScriptsView').then(m => ({ default: m.ScriptsView })));
const ContactsView = lazy(() => import('./components/contacts/ContactsView').then(m => ({ default: m.ContactsView })));
const ExecutorTools = lazy(() => import('./components/executor/ExecutorTools').then(m => ({ default: m.ExecutorTools })));
const SettingsView = lazy(() => import('./components/settings/SettingsView').then(m => ({ default: m.SettingsView })));

const PageFallback = () => (
  <div className="flex items-center justify-center py-16">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent" aria-hidden />
  </div>
);

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  // App state
  const [mode, setMode] = useState<AppMode>('STANDALONE');
  
  // Data state
  const [cases, setCases] = useState<CaseType[]>([]);
  const [activeCaseId, setActiveCaseIdState] = useState<string | null>(null);
  const [profile, setProfile] = useState<AftercareProfile | null>(null);
  const [plan, setPlan] = useState<AftercarePlan | null>(null);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [executorChecklist, setExecutorChecklist] = useState<ExecutorChecklistItem[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState<NavigationTab>('guidance');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showActivation, setShowActivation] = useState(false);
  const [isLicensed, setIsLicensed] = useState(false);
  const [showCloseCaseWizard, setShowCloseCaseWizard] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);

  const currentCase = cases.find((c) => c.id === activeCaseId) ?? null;

  const refreshData = useCallback(async () => {
    const savedProfile = await storageService.loadProfile();
    const savedPlan = await storageService.loadPlan();
    const savedDocs = await storageService.loadDocuments();
    const savedContacts = await storageService.loadContacts();
    let savedChecklist = await storageService.loadChecklist();
    if (savedChecklist.length > 0 && hasLegacyChecklistCategories(savedChecklist)) {
      savedChecklist = generateExecutorChecklist();
      await storageService.saveChecklist(savedChecklist);
    }
    setProfile(savedProfile);
    setPlan(savedPlan);
    setDocuments(savedDocs);
    setContacts(savedContacts);
    setExecutorChecklist(savedChecklist);
  }, []);

  const refreshCases = useCallback(async () => {
    const list = await storageService.loadCases();
    setCases(list);
    const id = storageService.getActiveCaseId();
    setActiveCaseIdState(id);
  }, []);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    let licenseCheckInterval: NodeJS.Timeout | null = null;
    
    const init = async () => {
      setIsLoading(true);
      
      try {
        // Check if we're running embedded in LLV
        const isEmbedded = window.location.hash.includes('embedded') || 
                          window.parent !== window;
        
        llvIntegration.initialize(isEmbedded ? 'EMBEDDED' : 'STANDALONE');
        setMode(isEmbedded ? 'EMBEDDED' : 'STANDALONE');
        
        // Check license status (offline validation)
        const checkLicense = async () => {
          const currentMode = isEmbedded ? 'EMBEDDED' : 'STANDALONE';
          let licensed = false;
          
          if (currentMode === 'STANDALONE') {
            const { licenseService } = await import('./services/licenseService');
            licensed = await licenseService.isLicensed();
            setIsLicensed(licensed);
            if (!licensed) {
              setShowActivation(true);
            }
          } else {
            // Embedded mode - check LLV's license store for add-on flag
            licensed = await llvIntegration.isAftercareEnabled();
            setIsLicensed(licensed);
            if (!licensed) {
              // In embedded mode, show locked state (LLV will handle upgrade prompt)
              // For now, we'll still allow access but could add a guard here
            }
          }
        };
        
        await checkLicense();
        
        // Periodically check license status (every 30 seconds)
        licenseCheckInterval = setInterval(async () => {
          await checkLicense();
        }, 30000);
        
        // Multi-case: ensure default case exists and migrate legacy data
        await storageService.ensureCasesMigrated();
        const list = await storageService.loadCases();
        setCases(list);
        const activeId = storageService.getActiveCaseId();
        setActiveCaseIdState(activeId);
        
        // Load saved data for active case (encrypted)
        const savedProfile = await storageService.loadProfile();
        const savedPlan = await storageService.loadPlan();
        const savedDocs = await storageService.loadDocuments();
        const savedContacts = await storageService.loadContacts();
        let savedChecklist = await storageService.loadChecklist();
        if (savedChecklist.length > 0 && hasLegacyChecklistCategories(savedChecklist)) {
          savedChecklist = generateExecutorChecklist();
          await storageService.saveChecklist(savedChecklist);
        }
        
        setProfile(savedProfile);
        setPlan(savedPlan);
        setDocuments(savedDocs);
        setContacts(savedContacts);
        setExecutorChecklist(savedChecklist);
        
        const hasSeenLandingPage = safeGetItem('aftercare_hasSeenLandingPage') === 'true';
        if (!hasSeenLandingPage) {
          setShowLandingPage(true);
        } else if (!savedProfile) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
    
    // Cleanup interval on unmount
    return () => {
      if (licenseCheckInterval) {
        clearInterval(licenseCheckInterval);
      }
    };
  }, []);

  // ============================================================================
  // LANDING PAGE DISMISSAL
  // ============================================================================

  const handleLandingPageDismiss = useCallback(() => {
    // Push app view so browser Back returns to marketing (showroom pattern)
    const baseUrl = window.location.pathname + window.location.search;
    window.history.pushState({ view: 'app' }, '', baseUrl);
    safeSetItem('aftercare_hasSeenLandingPage', 'true');
    setShowLandingPage(false);
    if (!profile) {
      setShowOnboarding(true);
    }
  }, [profile]);

  const handleBackToOverview = useCallback(() => {
    const baseUrl = window.location.pathname + window.location.search;
    window.history.pushState({ view: 'marketing' }, '', baseUrl);
    setShowOnboarding(false);
    setShowLandingPage(true);
  }, []);

  /** Open Local Legacy Vault purchase flow (same process as in the Local Legacy Vault app). */
  const handlePurchaseLocalLegacyVault = useCallback(() => {
    const purchaseUrl = (import.meta as any).env?.VITE_LLV_PURCHASE_URL || 'https://locallegacyvault.com/pricing.html#pricing';
    const api = (window as any).electronAPI;
    if (api?.openExternal) {
      api.openExternal(purchaseUrl).then((ok: boolean) => {
        if (!ok) window.open(purchaseUrl, '_blank', 'noopener,noreferrer');
      }).catch(() => {
        window.open(purchaseUrl, '_blank', 'noopener,noreferrer');
      });
    } else {
      window.open(purchaseUrl, '_blank', 'noopener,noreferrer');
    }
  }, []);

  // Keep marketing as current history entry when it's visible; allow Back from app to return
  useEffect(() => {
    if (!showLandingPage) return;
    const baseUrl = window.location.pathname + window.location.search;
    window.history.replaceState({ view: 'marketing' }, '', baseUrl);
  }, [showLandingPage]);

  useEffect(() => {
    const onPopState = () => {
      if (window.history.state?.view === 'marketing') {
        setShowLandingPage(true);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // ============================================================================
  // ONBOARDING COMPLETION
  // ============================================================================

  const handleOnboardingComplete = useCallback(async (newProfile: AftercareProfile) => {
    const caseId = storageService.getActiveCaseId();
    if (!caseId) return;
    setProfile(newProfile);
    await storageService.saveProfile(newProfile);
    setShowOnboarding(false);
    
    // Generate initial guidance (scoped to active case)
    try {
      const vaultRecords = await llvIntegration.loadLegacyVaultSummary();
      const result = generateAftercarePlan({
        profile: newProfile,
        vaultRecords,
      });
      
      const newPlan: AftercarePlan = {
        id: `plan_${Date.now()}`,
        caseId,
        profile: newProfile,
        tasks: result.tasks,
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      };
      
      setPlan(newPlan);
      await storageService.savePlan(newPlan);
      
      // Generate contacts from vault records (storage adds caseId)
      const newContacts = generateContactsFromVault(vaultRecords);
      setContacts(newContacts);
      await storageService.saveContacts(newContacts);
      
      // Generate executor checklist (storage adds caseId)
      const checklist = generateExecutorChecklist();
      setExecutorChecklist(checklist);
      await storageService.saveChecklist(checklist);
    } catch (error) {
      console.error('Failed to generate guidance:', error);
    }
  }, []);

  // ============================================================================
  // PLAN UPDATES
  // ============================================================================

  const handlePlanUpdate = useCallback(async (updatedPlan: AftercarePlan) => {
    setPlan(updatedPlan);
    await storageService.savePlan(updatedPlan);
  }, []);

  // ============================================================================
  // CASE ACTIONS
  // ============================================================================

  const handleSwitchCase = useCallback(async (caseId: string) => {
    await storageService.setActiveCaseId(caseId);
    setActiveCaseIdState(caseId);
    await refreshData();
  }, [refreshData]);

  const handleCreateCase = useCallback(async () => {
    const label = 'New case ' + new Date().toLocaleDateString();
    const c = await storageService.createCase(label);
    await storageService.setActiveCaseId(c.id);
    setActiveCaseIdState(c.id);
    await refreshCases();
    await refreshData();
  }, [refreshCases, refreshData]);

  const handleArchiveCurrent = useCallback(async () => {
    if (!activeCaseId) return;
    await storageService.archiveCase(activeCaseId);
    await refreshCases();
  }, [activeCaseId, refreshCases]);

  const handleExportCurrent = useCallback(async () => {
    if (!currentCase) return;
    await downloadCaseExport(currentCase.id, currentCase.label);
  }, [currentCase]);

  const handleClearCurrent = useCallback(async () => {
    if (!activeCaseId || !currentCase) return;
    const msg = 'Clear all content in this case? Export first if you want to keep a backup. This cannot be undone.';
    if (!confirm(msg)) return;
    await storageService.clearCaseContent(activeCaseId);
    await refreshData();
    await refreshCases();
  }, [activeCaseId, currentCase, refreshData, refreshCases]);

  const handleCloseCaseWizardComplete = useCallback(() => {
    setShowCloseCaseWizard(false);
    refreshCases();
    refreshData();
  }, [refreshCases, refreshData]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
    return <AdminDashboard />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vault-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not seen before (before license check)
  if (showLandingPage) {
    return (
      <Suspense fallback={<PageFallback />}>
        <MarketingLandingPage
          onGetStarted={handleLandingPageDismiss}
          onPurchaseLocalLegacyVault={handlePurchaseLocalLegacyVault}
        />
      </Suspense>
    );
  }

  // License guard — show activation screen if not licensed (standalone mode only)
  if (showActivation && mode === 'STANDALONE' && !isLicensed) {
    return (
      <Suspense fallback={<PageFallback />}>
        <LicenseActivationScreen
          onActivated={async () => {
            const { licenseService } = await import('./services/licenseService');
            const nowLicensed = await licenseService.isLicensed();
            setIsLicensed(nowLicensed);
            setShowActivation(!nowLicensed);
          }}
        />
      </Suspense>
    );
  }

  if (showOnboarding || !profile) {
    return (
      <Suspense fallback={<PageFallback />}>
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onBackToOverview={handleBackToOverview}
        />
      </Suspense>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-vault-dark">
      {/* Sidebar - LLV Style */}
      <aside className="w-60 h-screen flex flex-col bg-sidebar-bg border-r border-border-subtle">
        {/* Header */}
        <div className="p-3 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <FaveIcon size={36} heartClassName="text-accent-gold" circleClassName="bg-accent-gold/15" />
            <div>
              <h1 className="text-[15px] font-semibold text-text-primary leading-tight">
                AfterPassing Guide
              </h1>
              <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">
                A local, offline tool for organizing administrative tasks after a loss.
              </p>
            </div>
          </div>
          {mode === 'EMBEDDED' && (
            <button
              onClick={() => {
                if ((window as any).electronAPI?.openLLV) {
                  (window as any).electronAPI.openLLV();
                }
              }}
              className="flex items-center gap-1.5 mt-2.5 text-[11px] text-text-secondary hover:text-accent-gold transition-colors"
            >
              <Lock className="w-3 h-3" strokeWidth={1.75} />
              <span>Return to Local Legacy Vault</span>
            </button>
          )}
          {mode === 'STANDALONE' && (
            <button
              onClick={handleBackToOverview}
              className="flex items-center gap-1.5 mt-2.5 text-[11px] text-text-secondary hover:text-accent-gold transition-colors"
            >
              <ArrowLeft className="w-3 h-3" strokeWidth={1.75} />
              <span>Back to overview</span>
            </button>
          )}
        </div>

        {/* Case Switcher — above nav */}
        <div className="px-3 pb-2">
          <CaseSwitcher
            currentCase={currentCase}
            cases={cases}
            onSwitchCase={handleSwitchCase}
            onCreateCase={handleCreateCase}
            onArchiveCurrent={handleArchiveCurrent}
            onExportCurrent={handleExportCurrent}
            onClearCurrent={handleClearCurrent}
            onOpenCloseCaseFlow={() => setShowCloseCaseWizard(true)}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2.5 pr-1.5 overflow-y-auto">
          <div className="flex flex-col gap-px">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              const isOptional = item.optional;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    window.scrollTo(0, 0);
                    mainContentRef.current?.scrollTo(0, 0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveTab(item.id);
                      window.scrollTo(0, 0);
                      mainContentRef.current?.scrollTo(0, 0);
                    }
                  }}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={0}
                  className={`nav-item-hover ${isActive ? 'nav-item-selected' : ''} flex items-center w-full h-[38px] px-4 gap-1.5 rounded-r-md border-none cursor-pointer bg-transparent relative transition-colors ${isOptional && !isActive ? 'opacity-80' : ''}`}
                >
                  <span className={isActive ? 'text-accent-gold' : 'text-text-muted'}>
                    {item.icon}
                  </span>
                  <span className={`text-[13px] ${isActive ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border-subtle">
          <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
            <AlertTriangle className="w-3 h-3" strokeWidth={1.75} />
            <span>Administrative guidance only</span>
          </div>
        </div>
      </aside>

      {/* Main Content — subtle textured background for depth */}
      <main ref={mainContentRef} className="flex-1 overflow-y-auto bg-vault-dark">
        <div className="min-h-full p-4 md:p-5 bg-textured">
          {/* Archived case banner */}
          {currentCase?.status === 'archived' && (
            <div className="mb-4 py-2.5 px-4 rounded-lg bg-accent-gold/15 border border-accent-gold/40 text-accent-gold text-sm font-medium">
              Archived case — read only
            </div>
          )}

          {/* Tab Content — lazy-loaded chunks */}
          <div className="mt-4">
            <Suspense fallback={<PageFallback />}>
              {activeTab === 'cases' && (
                <CasesView
                  cases={cases}
                  activeCaseId={activeCaseId}
                  onRefreshCases={refreshCases}
                  onSwitchCase={handleSwitchCase}
                  onExportCase={async (id) => {
                    const c = cases.find((x) => x.id === id);
                    if (c) await downloadCaseExport(id, c.label);
                  }}
                  onArchiveCase={async (id) => {
                    await storageService.archiveCase(id);
                    await refreshCases();
                  }}
                  onDeleteCase={async (id) => {
                    if (!confirm('Permanently delete this case? This cannot be undone.')) return;
                    await storageService.deleteCasePermanently(id);
                    await refreshCases();
                    if (activeCaseId === id) await refreshData();
                  }}
                  onCreateCase={handleCreateCase}
                  onOpenCloseCaseFlow={() => setShowCloseCaseWizard(true)}
                />
              )}

              {activeTab === 'guidance' && plan && (
                <FocusView onViewFullChecklist={() => setActiveTab('checklist')} />
              )}

              {activeTab === 'checklist' && plan && (
                <ChecklistView
                plan={plan}
                onPlanUpdate={handlePlanUpdate}
                onReturnToFocus={() => setActiveTab('guidance')}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentsView 
                documents={documents}
                onDocumentsChange={setDocuments}
                profile={profile}
                checklistItems={executorChecklist}
              />
            )}

            {activeTab === 'templates' && (
              <ScriptsView profile={profile} />
            )}

            {activeTab === 'contacts' && (
              <ContactsView contacts={contacts} onContactsChange={setContacts} />
            )}

            {activeTab === 'executor' && (
              <ExecutorTools 
                checklist={executorChecklist}
                contacts={contacts}
                plan={plan}
                documents={documents}
                onChecklistChange={setExecutorChecklist}
                onContactsChange={setContacts}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView 
                profile={profile}
                mode={mode}
                onProfileUpdate={async (p) => {
                  setProfile(p);
                  await storageService.saveProfile(p);
                }}
                onRegenerateTasks={async () => {
                  if (!profile || !plan) return;
                  try {
                    const vaultRecords = await llvIntegration.loadLegacyVaultSummary();
                    const result = generateAftercarePlan({
                      profile,
                      vaultRecords,
                    });
                    const newPlan: AftercarePlan = {
                      id: `plan_${Date.now()}`,
                      caseId: plan.caseId,
                      profile,
                      tasks: result.tasks,
                      createdAt: plan.createdAt,
                      lastUpdatedAt: new Date().toISOString(),
                    };
                    setPlan(newPlan);
                    await storageService.savePlan(newPlan);
                    setActiveTab('guidance');
                  } catch (error) {
                    console.error('Failed to regenerate tasks:', error);
                  }
                }}
                onStartOver={() => {
                  setShowOnboarding(true);
                }}
              />
            )}
            </Suspense>
          </div>
        </div>
      </main>

      {/* Close Case Wizard modal */}
      {showCloseCaseWizard && currentCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowCloseCaseWizard(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <CloseCaseWizard
              caseToClose={currentCase}
              summary={{
                taskCount: plan?.tasks?.length ?? 0,
                documentCount: documents.length,
                contactCount: contacts.length,
                checklistCount: executorChecklist.length,
                lastUpdated: currentCase.updatedAt ? new Date(currentCase.updatedAt).toLocaleString() : '—',
              }}
              onComplete={handleCloseCaseWizardComplete}
              onCancel={() => setShowCloseCaseWizard(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
