/**
 * Local Aftercare Vault
 * 
 * Administrative guidance for those navigating loss.
 * This application does not provide legal, financial, or medical advice.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, AlertTriangle, Lock } from 'lucide-react';

// Types
import type { 
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
} from './services';

// Components
import {
  OnboardingWizard,
  FocusView,
  ChecklistView,
  DocumentsView,
  ScriptsView,
  ExecutorTools,
  SettingsView,
  DisclaimerBanner,
  LicenseActivationScreen,
  TrialStatusBanner,
} from './components';
import { LandingPage } from './LAV/LandingPage';
import { MarketingLandingPage } from './LAV/MarketingLandingPage';

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  // App state
  const [mode, setMode] = useState<AppMode>('STANDALONE');
  
  // Data state
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
  const [showFullChecklist, setShowFullChecklist] = useState(false);
  const [showActivation, setShowActivation] = useState(false);
  const [isLicensed, setIsLicensed] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);

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
            const { trialService } = await import('./services/trialService');
            
            // Check trial status first
            await trialService.loadTrialStatus();
            trialService.updateTimeRemaining(); // Update expiration status
            const trialStatus = trialService.getTrialStatus();
            
            // If trial expired, block access
            if (trialStatus.isTrial && trialStatus.isExpired) {
              licensed = false;
              setIsLicensed(false);
              setShowActivation(true);
            } else {
              licensed = await licenseService.isLicensed();
              setIsLicensed(licensed);
              if (!licensed) {
                setShowActivation(true);
              }
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
        
        // Periodically check license/trial status (every 30 seconds)
        licenseCheckInterval = setInterval(async () => {
          await checkLicense();
        }, 30000);
        
        // Load saved data (encrypted)
        const savedProfile = await storageService.loadProfile();
        const savedPlan = await storageService.loadPlan();
        const savedDocs = await storageService.loadDocuments();
        const savedContacts = await storageService.loadContacts();
        const savedChecklist = await storageService.loadChecklist();
        
        setProfile(savedProfile);
        setPlan(savedPlan);
        setDocuments(savedDocs);
        setContacts(savedContacts);
        setExecutorChecklist(savedChecklist);
        
        // TEMPORARY: Always show landing page for development
        setShowLandingPage(true);
        
        // Check if user has seen landing page
        // const hasSeenLandingPage = localStorage.getItem('aftercare_hasSeenLandingPage') === 'true';
        
        // Show landing page if not seen before
        // if (!hasSeenLandingPage) {
        //   setShowLandingPage(true);
        // } else if (!savedProfile) {
        //   // Show onboarding if no profile exists (and landing page already seen)
        //   setShowOnboarding(true);
        // }
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
    localStorage.setItem('aftercare_hasSeenLandingPage', 'true');
    setShowLandingPage(false);
    
    // Show onboarding if no profile exists
    if (!profile) {
      setShowOnboarding(true);
    }
  }, [profile]);

  // ============================================================================
  // ONBOARDING COMPLETION
  // ============================================================================

  const handleOnboardingComplete = useCallback(async (newProfile: AftercareProfile) => {
    setProfile(newProfile);
    await storageService.saveProfile(newProfile);
    setShowOnboarding(false);
    
    // Generate initial guidance
    try {
      const vaultRecords = await llvIntegration.loadLegacyVaultSummary();
      const result = generateAftercarePlan({
        profile: newProfile,
        vaultRecords,
      });
      
      const newPlan: AftercarePlan = {
        id: `plan_${Date.now()}`,
        profile: newProfile,
        tasks: result.tasks,
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      };
      
      setPlan(newPlan);
      await storageService.savePlan(newPlan);
      
      // Generate contacts from vault records
      const newContacts = generateContactsFromVault(vaultRecords);
      setContacts(newContacts);
      await storageService.saveContacts(newContacts);
      
      // Generate executor checklist
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
  // RENDER
  // ============================================================================

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

  // Show landing page if not seen before (show this FIRST, before license check)
  if (showLandingPage) {
    // TEMPORARY: Show marketing landing page for preview
    return <MarketingLandingPage onGetStarted={handleLandingPageDismiss} />;
    // return <LandingPage onGetStarted={handleLandingPageDismiss} />;
  }

  // TEMPORARY: Skip activation to work on landing page
  // License guard - show activation screen if not licensed (standalone mode only)
  // if (showActivation && mode === 'STANDALONE' && !isLicensed) {
  //   return (
  //     <LicenseActivationScreen
  //       onActivated={async () => {
  //         const { licenseService } = await import('./services/licenseService');
  //         const licensed = await licenseService.isLicensed();
  //         setIsLicensed(licensed);
  //         setShowActivation(false);
  //       }}
  //     />
  //   );
  // }

  if (showOnboarding || !profile) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-vault-dark">
      {/* Sidebar - LLV Style */}
      <aside className="w-60 h-screen flex flex-col bg-sidebar-bg border-r border-border-subtle">
        {/* Header */}
        <div className="p-4 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-accent-gold">
              <Heart className="w-[18px] h-[18px] text-vault-dark" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-[15px] font-semibold text-text-primary leading-tight">
                Local Aftercare Vault
              </h1>
              <p className="text-[11px] text-text-secondary mt-0.5">
                Guidance and Support
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
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2.5 pr-1.5 overflow-y-auto">
          <div className="px-4 mb-1.5">
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
              Tools
            </span>
          </div>
          <div className="flex flex-col gap-px">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
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
                  className={`nav-item-hover ${isActive ? 'nav-item-selected' : ''} flex items-center w-full h-[38px] px-4 gap-1.5 rounded-r-md border-none cursor-pointer bg-transparent relative transition-colors`}
                >
                  <span className="text-accent-gold">
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

      {/* Main Content */}
      <main ref={mainContentRef} className="flex-1 overflow-y-auto">
        <div className="min-h-full p-6">
          {/* Trial Status Banner */}
          {mode === 'STANDALONE' && (
            <TrialStatusBanner 
              onPurchase={() => {
                // Open purchase link or show purchase modal
                window.open('https://localpasswordvault.com/purchase', '_blank');
              }}
              onExport={async () => {
                // Export data functionality
                const { exportPlanToPdf } = await import('./services/exportService');
                if (plan) {
                  await exportPlanToPdf(plan);
                }
              }}
            />
          )}
          
          {/* Disclaimer Banner */}
          <DisclaimerBanner />

          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === 'guidance' && plan && (
              <>
                {!showFullChecklist ? (
                  /* Focus View - Calm, minimal first landing */
                  <FocusView 
                    onViewFullChecklist={() => setShowFullChecklist(true)}
                  />
                ) : (
                  /* Checklist View - Calm expansion */
                  <ChecklistView 
                    plan={plan}
                    onPlanUpdate={handlePlanUpdate}
                    onReturnToFocus={() => setShowFullChecklist(false)}
                  />
                )}
              </>
            )}

            {activeTab === 'documents' && (
              <DocumentsView 
                documents={documents}
                onDocumentsChange={setDocuments}
                profile={profile}
              />
            )}

            {activeTab === 'templates' && (
              <ScriptsView profile={profile} />
            )}

            {activeTab === 'executor' && (
              <ExecutorTools 
                checklist={executorChecklist}
                contacts={contacts}
                plan={plan}
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
                  // Regenerate tasks with updated profile
                  try {
                    const vaultRecords = await llvIntegration.loadLegacyVaultSummary();
                    const result = generateAftercarePlan({
                      profile: profile,
                      vaultRecords,
                    });
                    
                    const newPlan: AftercarePlan = {
                      id: `plan_${Date.now()}`,
                      profile: profile,
                      tasks: result.tasks,
                      createdAt: plan?.createdAt || new Date().toISOString(),
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
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
