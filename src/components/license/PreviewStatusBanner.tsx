/**
 * Preview Status Banner
 *
 * Shown on non-guidance tabs when the app is in Preview edition.
 * De-emphasized so it does not compete with guidance content.
 * Upgrade and export actions live in Settings.
 */

import { Settings } from "lucide-react";

interface PreviewStatusBannerProps {
  /** Navigate to Settings where full app and export are available. */
  onGoToSettings?: () => void;
}

export const PreviewStatusBanner = ({ onGoToSettings }: PreviewStatusBannerProps) => {
  return (
    <div className="flex items-center justify-between gap-3 py-2 mb-3 text-text-muted border-b border-border-subtle/60">
      <p className="text-xs leading-relaxed">
        You're viewing a limited version. Full access is available in Settings whenever you're ready.
      </p>
      {onGoToSettings && (
        <button
          type="button"
          onClick={onGoToSettings}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-text-secondary hover:text-text-primary rounded transition-colors shrink-0"
        >
          <Settings className="w-3.5 h-3.5" />
          Settings
        </button>
      )}
    </div>
  );
};
