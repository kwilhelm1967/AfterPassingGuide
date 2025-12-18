/**
 * Onboarding Wizard - Grief-Appropriate Flow
 * 
 * Designed for emotional safety and orientation, not data collection.
 * Questions move from broad to specific, with "not sure" options throughout.
 */

import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Heart,
} from 'lucide-react';
import { 
  AftercareProfile, 
  UserRole, 
  userRoleToRelationship,
} from '../../types';

interface OnboardingWizardProps {
  onComplete: (profile: AftercareProfile) => void;
}

// Step configurations
const STEPS = [
  { title: 'Welcome', subtitle: '' },
  { title: 'Your Role', subtitle: 'Which best describes your role right now?' },
  { title: 'You\'re Not Alone', subtitle: 'We\'re here to help' },
  { title: 'Optional Details', subtitle: 'Would you like to add any details now?' },
  { title: 'Before We Begin', subtitle: 'Just so you know' },
];

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'SELF', label: "I'm handling things for myself" },
  { value: 'SPOUSE_PARTNER', label: "I'm handling things for a spouse or partner" },
  { value: 'PARENT', label: "I'm handling things for a parent" },
  { value: 'FAMILY_FRIEND', label: "I'm helping with a family member or friend" },
  { value: 'NOT_SURE', label: "I'm not sure yet" },
];



export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  
  // Form data - grief-appropriate model
  const [userRole, setUserRole] = useState<UserRole | undefined>(undefined);
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [deceasedName, setDeceasedName] = useState('');
  const [disclaimerConfirmed, setDisclaimerConfirmed] = useState(false);

  const totalSteps = STEPS.length;

  const canProceed = () => {
    switch (step) {
      case 0: return true; // Welcome
      case 1: return true; // Role - always skippable
      case 2: return true; // Reassurance - always skippable
      case 3: return true; // Optional details - always skippable
      case 4: return disclaimerConfirmed; // Disclaimer required
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      const finalUserRole = userRole || 'NOT_SURE';
      const profile: AftercareProfile = {
        id: `profile_${Date.now()}`,
        userRole: finalUserRole,
        deceasedName: deceasedName || undefined,
        // Set relationship from userRole for Settings compatibility
        relationship: userRoleToRelationship(finalUserRole),
        country: 'United States', // Default to US for US-specific guidance
        hasConfirmedDisclaimer: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onComplete(profile);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    setStep(step + 1);
  };

  const renderOptionButton = (
    isSelected: boolean, 
    onClick: () => void, 
    label: string, 
    description?: string
  ) => (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        isSelected
          ? 'border-brand-gold bg-brand-gold/10 text-white'
          : 'border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          isSelected ? 'border-brand-gold bg-brand-gold' : 'border-slate-500'
        }`}>
          {isSelected && <Check className="w-2.5 h-2.5 text-slate-900" />}
        </div>
        <div>
          <span className="text-sm">{label}</span>
          {description && (
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
    </button>
  );

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-3 overflow-hidden">
      <div className="w-full max-w-md max-h-[95vh] flex flex-col">
        {/* Progress */}
        <div className="flex justify-center gap-1.5 mb-2 flex-shrink-0">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === step ? 'w-6 bg-brand-gold' :
                i < step ? 'w-2 bg-brand-gold/50' :
                'w-2 bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-700 text-center flex-shrink-0">
            <div className="w-8 h-8 bg-brand-gold/20 rounded-lg flex items-center justify-center mx-auto mb-1.5">
              <Heart className="w-4 h-4 text-brand-gold" />
            </div>
            <h2 className="text-base font-semibold text-white">{STEPS[step].title}</h2>
            {STEPS[step].subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{STEPS[step].subtitle}</p>
            )}
          </div>

          {/* Content */}
          <div className="px-4 py-3 flex-1 overflow-y-auto min-h-0">
            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="text-center space-y-3">
                <p className="text-slate-300 text-sm leading-relaxed">
                  You're here because there's a lot to handle, and it can feel overwhelming. 
                  This space is meant to help you keep track of the practical things, at your 
                  own pace, when you're ready.
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  We'll ask a few simple questions so we can guide you through what matters 
                  now and what can wait. Nothing is required, and you can stop or come back 
                  at any time.
                </p>
              </div>
            )}

            {/* Step 1: User Role */}
            {step === 1 && (
              <div className="space-y-2">
                {ROLE_OPTIONS.map((opt) => (
                  renderOptionButton(
                    userRole === opt.value,
                    () => setUserRole(opt.value),
                    opt.label
                  )
                ))}
              </div>
            )}

            {/* Step 2: Reassurance */}
            {step === 2 && (
              <div className="text-center space-y-3">
                <p className="text-slate-300 text-sm leading-relaxed">
                  We've created a personalized plan based on your situation. Everything is organized 
                  and ready when you are.
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  You can move at your own pace. Nothing is urgent, and you can skip anything 
                  that doesn't apply to your situation.
                </p>
              </div>
            )}

            {/* Step 3: Optional Details */}
            {step === 3 && (
              <div className="space-y-4">
                {!showOptionalDetails ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowOptionalDetails(true)}
                      className="w-full text-left p-3 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border-2 border-slate-500 flex-shrink-0" />
                        <span className="text-sm">Add some details</span>
                      </div>
                    </button>
                    <button
                      onClick={handleSkip}
                      className="w-full text-left p-3 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border-2 border-slate-500 flex-shrink-0" />
                        <span className="text-sm">Skip for now</span>
                      </div>
                    </button>
                    <p className="text-xs text-slate-500 text-center mt-2">
                      You can always add details later in Settings.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Name (optional)
                      </label>
                      <input
                        type="text"
                        value={deceasedName}
                        onChange={(e) => setDeceasedName(e.target.value)}
                        placeholder="This helps personalize templates"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      This is the only detail we'll ask for now. Everything else can wait.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Before We Begin */}
            {step === 4 && (
              <div className="space-y-2.5">
                <p className="text-slate-300 text-xs leading-relaxed">
                  This tool helps you stay organized and keep track of what may need 
                  attention. It offers general suggestions based on common situations, 
                  but every situation is different.
                </p>

                <p className="text-slate-400 text-xs leading-relaxed">
                  This is not legal, financial, or medical advice. The guidance and 
                  resources here are focused on the United States. Laws and processes 
                  vary by location. For questions about legal, financial, or tax matters, 
                  consider consulting a qualified professional in your area.
                </p>

                <p className="text-slate-400 text-[10px] leading-relaxed">
                  The items here are informational only and may not apply to your situation. 
                  Nothing is required. You can skip anything, come back anytime, and move 
                  at whatever pace feels right.
                </p>

                <label className="flex items-start gap-2.5 p-2.5 bg-slate-700/50 rounded-lg cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={disclaimerConfirmed}
                    onChange={(e) => setDisclaimerConfirmed(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 rounded border-slate-500 bg-slate-600 text-brand-gold focus:ring-brand-gold focus:ring-offset-slate-800 flex-shrink-0"
                  />
                  <span className="text-xs text-slate-300 leading-tight">
                    I understand this tool provides organizational guidance only, not professional advice.
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-700 flex justify-between flex-shrink-0">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all ${
                step === 0 
                  ? 'text-slate-500 cursor-not-allowed'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center gap-1.5 px-5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                canProceed()
                  ? 'bg-brand-gold hover:bg-brand-gold/90 text-slate-900'
                  : 'bg-slate-600 text-slate-400 cursor-not-allowed'
              }`}
            >
              {step === totalSteps - 1 ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Get Started
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Skip hint for middle steps */}
        {step > 0 && step < totalSteps - 1 && (
          <p className="text-center text-xs text-slate-500 mt-3">
            Not sure? You can continue without answering.
          </p>
        )}
      </div>
    </div>
  );
};
