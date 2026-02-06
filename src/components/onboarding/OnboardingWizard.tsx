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
  ArrowLeft,
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
  { title: 'Before We Begin', subtitle: 'Just so you know' },
];



export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onBackToOverview }) => {
  const [step, setStep] = useState(0);
  
  // Form data - grief-appropriate model (role defaults to NOT_SURE; no role step)
  const [userRole] = useState<UserRole | undefined>(undefined);
  const [disclaimerConfirmed, setDisclaimerConfirmed] = useState(false);

  const totalSteps = STEPS.length;

  const canProceed = () => {
    switch (step) {
      case 0: return true; // Welcome
      case 1: return disclaimerConfirmed; // Disclaimer required
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
        deceasedName: undefined,
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
          <div className="px-4 py-3 border-b border-slate-700 text-center flex-shrink-0 relative">
            {onBackToOverview && (
              <button
                type="button"
                onClick={onBackToOverview}
                className="absolute left-3 top-3 flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" strokeWidth={1.75} />
                Back to overview
              </button>
            )}
            <div className="flex justify-center mb-1.5">
              <Heart className="w-4 h-4 text-brand-gold" />
            </div>
            <h2 className="text-base font-semibold text-text-primary">{STEPS[step].title}</h2>
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
                  There's a lot to handle. This space helps you keep track of the practical things.
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  A few questions. You can stop or come back anytime.
                </p>
              </div>
            )}

            {/* Step 1: Before We Begin */}
            {step === 1 && (
              <div className="space-y-2.5">
                <p className="text-slate-400 text-xs leading-relaxed">
                  This is not legal, financial, or medical advice. The guidance and 
                  resources here are focused on the United States. Laws and processes 
                  vary by location. For questions about legal, financial, or tax matters, 
                  consider consulting a qualified professional in your area.
                </p>

                <p className="text-slate-400 text-[10px] leading-relaxed">
                  Items may not apply to your situation.
                </p>

                <label className="flex items-start gap-2.5 p-2.5 bg-slate-700/50 rounded-lg cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={disclaimerConfirmed}
                    onChange={(e) => setDisclaimerConfirmed(e.target.checked)}
                    aria-required
                    className="mt-0.5 w-3.5 h-3.5 rounded border-slate-500 bg-slate-600 text-brand-gold focus:ring-brand-gold focus:ring-offset-slate-800 flex-shrink-0"
                  />
                  <span className="text-xs text-slate-300 leading-tight">
                    I understand this tool provides organizational guidance only, not professional advice.
                    <span className="text-brand-gold ml-0.5" aria-hidden>*</span>
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
                  : 'text-slate-300 hover:text-text-primary'
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

      </div>
    </div>
  );
};
