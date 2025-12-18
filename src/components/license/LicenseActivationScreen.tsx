/**
 * License Activation Screen
 * 
 * Matches the UX pattern from Local Legacy Vault.
 * Supports both license activation and 14-day trial.
 * Standalone app - fully local after activation.
 */

import React, { useState, useEffect } from 'react';
import { Key, ArrowLeft, HelpCircle, Loader2, AlertCircle, Copy, Check, Clock } from 'lucide-react';
import { licenseService } from '../../services/licenseService';
import { trialService } from '../../services/trialService';

interface LicenseActivationScreenProps {
  onActivated: () => void;
  onBack?: () => void;
}

export const LicenseActivationScreen: React.FC<LicenseActivationScreenProps> = ({
  onActivated,
  onBack,
}) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresTransfer, setRequiresTransfer] = useState(false);
  const [transferKey, setTransferKey] = useState<string | null>(null);
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const [showTrialOption, setShowTrialOption] = useState(true);
  const [trialKey, setTrialKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [canStartTrial, setCanStartTrial] = useState(true);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isActivating) {
      handleActivate();
    }
  };

  useEffect(() => {
    // Check if user can start trial
    const checkTrial = async () => {
      const canStart = await trialService.canStartTrial();
      setCanStartTrial(canStart);
    };
    checkTrial();
  }, []);

  const handleActivate = async () => {
    if (!licenseKey.trim()) return;

    setIsActivating(true);
    setError(null);
    setRequiresTransfer(false);

    try {
      const result = await licenseService.activateLicense(licenseKey.trim());

      if (result.success) {
        // If it was a trial, convert trial to active
        if (result.isTrial) {
          // Trial is already activated by validateAndBindTrialKey
        }
        onActivated();
      } else if (result.requiresTransfer) {
        setRequiresTransfer(true);
        setTransferKey(licenseKey.trim());
        setError('This license is active on another device. Would you like to transfer it to this device?');
      } else {
        setError(result.error || 'Activation failed. Please check your license key and try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Activation error:', err);
    } finally {
      setIsActivating(false);
    }
  };

  const handleStartTrial = async () => {
    setError(null);
    setIsStartingTrial(true);
    setTrialKey(null);

    try {
      const result = await trialService.startTrial();
      
      if (result.success && result.trialKey) {
        setTrialKey(result.trialKey);
        setLicenseKey(result.trialKey);
        setShowTrialOption(false);
      } else {
        setError(result.error || 'Failed to start trial. Please try again.');
      }
    } catch (err) {
      console.error('Trial start failed:', err);
      setError('Failed to start trial. Please try again.');
    } finally {
      setIsStartingTrial(false);
    }
  };

  const handleCopyTrialKey = async () => {
    if (trialKey) {
      try {
        await navigator.clipboard.writeText(trialKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy trial key:', err);
      }
    }
  };

  const handleTransfer = async () => {
    if (!transferKey) return;

    setIsActivating(true);
    setError(null);

    try {
      const result = await licenseService.transferLicense(transferKey);

      if (result.success) {
        onActivated();
      } else {
        setError(result.error || 'Transfer failed. Please try again or contact support.');
        setRequiresTransfer(false);
      }
    } catch (err) {
      setError('An unexpected error occurred during transfer. Please try again.');
      console.error('Transfer error:', err);
    } finally {
      setIsActivating(false);
    }
  };

  const handleLicenseKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicenseKey(e.target.value.toUpperCase());
    setLicenseKey(formatted);
    setError(null);
    setRequiresTransfer(false);
  };

  const formatLicenseKey = (value: string): string => {
    const cleaned = value.replace(/[^A-Z0-9]/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join('-') || cleaned;
    return formatted.substring(0, 19);
  };

  return (
    <div className="h-screen flex items-center justify-center p-4 bg-vault-dark overflow-hidden">
      <div className="max-w-md w-full max-h-[100vh] overflow-hidden flex flex-col">
        <div className="bg-card-bg border border-border-subtle rounded-2xl p-6 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 bg-accent-gold/20 border border-accent-gold/40">
              <svg 
                className="w-6 h-6 text-accent-gold" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.75" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Skeleton Key - Circular bow */}
                <circle cx="6" cy="12" r="4" />
                {/* Shaft */}
                <line x1="10" y1="12" x2="18" y2="12" />
                {/* Bit with notch */}
                <rect x="18" y="9" width="4" height="6" rx="0.5" />
                <rect x="20" y="9" width="2" height="2" rx="0.25" />
              </svg>
            </div>
            <h1 className="text-sm font-semibold text-accent-gold mb-1">
              Local Aftercare Vault
            </h1>
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              Activate Your Vault
            </h2>
            <p className="text-text-secondary text-[10px]">
              Enter your license key or start a free trial
            </p>
          </div>

          {/* License Key Input */}
          <div className="space-y-2 mb-3 flex-shrink-0">
            <label className="block text-xs font-medium text-text-primary mb-1">
              Activation Key
            </label>
            <input
              type="text"
              value={licenseKey}
              onChange={handleLicenseKeyChange}
              onKeyPress={handleKeyPress}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="w-full px-3 py-2 bg-slate-700/30 border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-gold/50 focus:ring-2 focus:ring-accent-gold/20 transition-all text-center tracking-wider text-sm font-mono"
              maxLength={19}
              disabled={isActivating}
            />

            {error && (
              <div className="p-2.5 rounded-lg flex items-start gap-2 bg-orange-500/10 border border-orange-500/40">
                <AlertCircle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[10px] font-semibold mb-0.5 text-orange-400">Notice</p>
                  <p className="text-[10px] text-text-secondary">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Trial Key Display */}
          {trialKey && (
            <div className="p-2.5 bg-slate-700/30 rounded-lg border border-accent-gold/30 mb-3 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-text-primary flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent-gold" />
                  Your Trial Key
                </p>
                <button
                  onClick={handleCopyTrialKey}
                  className="flex items-center gap-1 text-xs text-accent-gold hover:text-accent-gold/80 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <code className="block text-center text-xs font-mono text-text-primary tracking-wider py-1.5">
                {trialKey}
              </code>
              <p className="text-xs text-text-secondary text-center mt-1.5">
                Click "Activate Vault" above to begin your 14-day trial
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 mb-3 flex-shrink-0">
            {requiresTransfer ? (
              <>
                <button
                  onClick={handleTransfer}
                  disabled={isActivating}
                  className="w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 bg-accent-gold hover:bg-accent-gold/90 text-vault-dark disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isActivating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transferring...</span>
                    </>
                  ) : (
                    <span>Transfer License to This Device</span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setRequiresTransfer(false);
                    setError(null);
                    setLicenseKey('');
                  }}
                  className="w-full text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-2 py-2 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleActivate}
                  disabled={isActivating || !licenseKey.trim()}
                  className="w-full py-2 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-accent-gold hover:bg-accent-gold/90 text-vault-dark disabled:opacity-60 disabled:cursor-not-allowed text-xs"
                >
                  {isActivating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Activating...</span>
                    </>
                  ) : (
                    <span>Activate Vault</span>
                  )}
                </button>

                {/* Divider */}
                {showTrialOption && !trialKey && canStartTrial && (
                  <>
                    <div className="flex items-center gap-2 my-2">
                      <div className="flex-1 h-px bg-border-subtle" />
                      <span className="text-[10px] text-text-muted font-medium">OR</span>
                      <div className="flex-1 h-px bg-border-subtle" />
                    </div>

                    <button
                      onClick={handleStartTrial}
                      disabled={isStartingTrial}
                      className="w-full py-2 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700/70 border border-border-subtle text-text-primary disabled:opacity-60 disabled:cursor-not-allowed text-xs"
                    >
                      {isStartingTrial ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Starting Trial...</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4" />
                          <span>Start 14-Day Free Trial</span>
                        </>
                      )}
                    </button>
                  </>
                )}

                {onBack && (
                  <button
                    onClick={onBack}
                    className="w-full text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-2 py-2 text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
                    <span>I Don't Have My Key</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Help Section */}
          <div className="p-2 bg-slate-700/20 rounded-lg border border-border-subtle flex-shrink-0 overflow-y-auto max-h-[80px]">
            <div className="flex items-start gap-2 text-text-muted text-[10px]">
              <HelpCircle className="w-3 h-3 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
              <div>
                <p className="font-medium mb-0.5 text-text-secondary text-[10px]">Need help?</p>
                <p className="leading-tight text-[10px]">
                  Your license key is a 16-character code in the format XXXX-XXXX-XXXX-XXXX. 
                  It was sent to your email after purchase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

