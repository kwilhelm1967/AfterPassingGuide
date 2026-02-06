/**
 * Preview pill + modal — single entry point for preview messaging.
 * Pill in top-right of content; modal on click. No upgrade copy elsewhere.
 */

import { useState } from 'react';
import { X } from 'lucide-react';

interface PreviewPillModalProps {
  onStartTrial?: () => void;
  onEnterLicense?: () => void;
}

export function PreviewPillModal({ onStartTrial, onEnterLicense }: PreviewPillModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute top-4 right-6 px-3 py-1.5 text-sm text-text-muted border border-border rounded-full hover:border-borderStrong hover:text-text transition-colors z-10"
      >
        Preview
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-modal-title"
        >
          <div
            className="bg-surface border border-borderStrong rounded-lg shadow-xl max-w-sm w-full p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-3 mb-4">
              <h2 id="preview-modal-title" className="text-base font-semibold text-text">
                Preview
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-text-muted hover:text-text p-1 rounded transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-text-muted leading-relaxed mb-5">
              You are using the preview. Full access is available anytime.
            </p>
            <div className="flex flex-col gap-2">
              {onStartTrial && (
                <button
                  type="button"
                  onClick={() => {
                    onStartTrial();
                    setOpen(false);
                  }}
                  className="btn-primary w-full py-2.5 px-4 text-sm font-medium"
                >
                  Start trial
                </button>
              )}
              {onEnterLicense && (
                <button
                  type="button"
                  onClick={() => {
                    onEnterLicense();
                    setOpen(false);
                  }}
                  className="btn-secondary w-full py-2.5 px-4 text-sm font-medium"
                >
                  Enter license
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full py-2.5 px-4 text-sm text-text-muted hover:text-text transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
