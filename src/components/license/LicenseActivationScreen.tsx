/**
 * License Activation Screen
 *
 * License activation only. Standalone app - fully local after activation.
 */

import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, Loader2, AlertCircle } from 'lucide-react';
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isActivating) {
      handleActivate();
    }
  };

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
        setError(result.error || 'Activation failed. Please check your license and try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Activation error:', err);
    } finally {
      setIsActivating(false);
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
            <div className="flex justify-center mb-2">
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
              AfterPassing Guide
            </h1>
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              Activate
            </h2>
            <p className="text-text-secondary text-[10px]">
              Enter your license
            </p>
          </div>

          {/* License Input */}
          <div className="space-y-2 mb-3 flex-shrink-0">
            <label className="block text-xs font-medium text-text-primary mb-1">
              License
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
                    <span>Activate</span>
                  )}
                </button>

                {onBack && (
                  <button
                    onClick={onBack}
                    className="w-full text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-2 py-2 text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
                    <span>I Don't Have My License</span>
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
                  Your license is a 16-character code in the format XXXX-XXXX-XXXX-XXXX. 
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

