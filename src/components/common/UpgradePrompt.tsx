/**
 * UpgradePrompt
 *
 * Inline upgrade prompt (not a modal).
 * - default: "Preview shows how this works. Full Access lets you use it."
 * - atLimit: subtle suggestion when they hit the preview limit — upgrade for full access.
 */

import React from 'react';
import { Lock } from 'lucide-react';

interface UpgradePromptProps {
  onUpgrade: () => void;
  onContinue: () => void;
  /** When at limit, show subtle upgrade suggestion */
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
  /* AfterPassing Guide colors only */
  const cardClass = `bg-card-bg border border-border-subtle rounded-xl p-4 ${className}`;
  const cardClassCompact = `bg-card-bg border border-border-subtle rounded-xl p-3 ${className}`;
  const primaryBtnClass = 'bg-accent-gold hover:bg-accent-gold-hover text-vault-dark font-medium rounded-lg transition-colors';
  const secondaryBtnClass = 'bg-white/10 hover:bg-white/15 text-text-primary border border-border-subtle font-medium rounded-lg transition-colors';

  if (variant === 'atLimit') {
    return (
      <div className={cardClassCompact}>
        <p className="text-text-muted text-sm mb-2">
          You've reached the preview limit. Purchase for full access.
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={onUpgrade} className={`${primaryBtnClass} px-3 py-1.5 text-xs`}>
            Purchase for full access
          </button>
          {!hideMaybeLater && (
            <button onClick={onContinue} className="px-3 py-1.5 text-text-muted hover:text-text-primary text-xs transition-colors">
              Maybe later
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <div className="flex items-start gap-3 mb-3">
        <Lock className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5" strokeWidth={1.75} />
        <div className="flex-1">
          <p className="text-text-primary text-sm mb-3">
            Preview shows how this works. Full Access lets you use it.
          </p>
          <div className="flex gap-2">
            <button onClick={onUpgrade} className={`${primaryBtnClass} px-4 py-2 text-sm`}>
              Upgrade to Full Access
            </button>
            <button onClick={onContinue} className={`${secondaryBtnClass} px-4 py-2 text-sm`}>
              Continue with Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
