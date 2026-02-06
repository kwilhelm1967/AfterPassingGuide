/**
 * UpgradePrompt
 *
 * Inline upgrade prompt (not a modal).
 * - default: "Preview shows how this works. Full Access lets you use it."
 * - atLimit: subtle suggestion when they hit the preview limit — upgrade for $ or start free trial.
 */

import React from 'react';
import { Lock } from 'lucide-react';

interface UpgradePromptProps {
  onUpgrade: () => void;
  onContinue: () => void;
  /** When at limit, show subtle $ + trial suggestion for users without Legacy */
  variant?: 'default' | 'atLimit';
  /** When atLimit, set true to hide "Maybe later" (e.g. inline suggestion) */
  hideMaybeLater?: boolean;
  className?: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  onUpgrade,
  onContinue,
  variant = 'default',
  hideMaybeLater = false,
  className = '',
}) => {
  if (variant === 'atLimit') {
    return (
      <div className={`card p-3 ${className}`}>
        <p className="text-textMuted text-sm mb-2">
          You've reached the preview limit. Start a free 14-day trial, or purchase Legacy for a discount on the full app.
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={onUpgrade} className="btn-primary px-3 py-1.5 text-xs font-medium">
            Purchase Legacy (discount)
          </button>
          <button onClick={onUpgrade} className="btn-secondary px-3 py-1.5 text-xs font-medium">
            Start free trial
          </button>
          {!hideMaybeLater && (
            <button onClick={onContinue} className="px-3 py-1.5 text-textMuted hover:text-text text-xs transition-colors duration-base">
              Maybe later
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`card p-4 border-primaryOutline/40 ${className}`}>
      <div className="flex items-start gap-3 mb-3">
        <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={1.75} />
        <div className="flex-1">
          <p className="text-text text-sm mb-3">
            Preview shows how this works. Full Access lets you use it.
          </p>
          <div className="flex gap-2">
            <button onClick={onUpgrade} className="btn-primary px-4 py-2 text-sm font-medium">
              Upgrade to Full Access
            </button>
            <button onClick={onContinue} className="btn-secondary px-4 py-2 text-sm font-medium">
              Continue with Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
