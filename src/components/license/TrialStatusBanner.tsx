import { useState, useEffect } from "react";
import { Clock, AlertTriangle, ShoppingCart, X, Download } from "lucide-react";
import { trialService, TrialStatus } from "../../services/trialService";

interface TrialStatusBannerProps {
  onPurchase?: () => void;
  onDismiss?: () => void;
  onExport?: () => void;
}

export const TrialStatusBanner = ({ onPurchase, onDismiss, onExport }: TrialStatusBannerProps) => {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [warning, setWarning] = useState<{ show: boolean; message?: string }>({ show: false });

  useEffect(() => {
    const loadStatus = async () => {
      await trialService.loadTrialStatus();
      const status = trialService.getTrialStatus();
      setTrialStatus(status);

      const warningCheck = trialService.shouldShowWarning();
      if (warningCheck.show) {
        setWarning({ show: true, message: warningCheck.message });
      }
    };

    loadStatus();
    
    const initialStatus = trialService.getTrialStatus();
    setTrialStatus(initialStatus);

    const interval = setInterval(() => {
      trialService.updateTimeRemaining();
      const status = trialService.getTrialStatus();
      setTrialStatus(status);
      
      const warningCheck = trialService.shouldShowWarning();
      setWarning({ show: warningCheck.show, message: warningCheck.message });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!trialStatus || !trialStatus.isTrial) {
    return null;
  }

  if (trialStatus.isExpired) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-400 mb-1">Trial Expired</h3>
              <p className="text-sm text-text-secondary mb-3">
                Your 14-day trial has ended. To continue using AfterPassing Guide, please purchase a license.
              </p>
              <div className="flex gap-2">
                {onPurchase && (
                  <button
                    onClick={onPurchase}
                    className="px-4 py-2 bg-accent-gold hover:bg-accent-gold/90 text-vault-dark rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Purchase License
                  </button>
                )}
                {onExport && (
                  <button
                    onClick={onExport}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-text-primary rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export Data
                  </button>
                )}
              </div>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  const formatTimeRemaining = () => {
    if (trialStatus.daysRemaining > 0) {
      return `${trialStatus.daysRemaining} day${trialStatus.daysRemaining !== 1 ? 's' : ''} remaining`;
    }
    if (trialStatus.hoursRemaining > 0) {
      return `${trialStatus.hoursRemaining} hour${trialStatus.hoursRemaining !== 1 ? 's' : ''} remaining`;
    }
    return `${trialStatus.minutesRemaining} minute${trialStatus.minutesRemaining !== 1 ? 's' : ''} remaining`;
  };

  const isUrgent = trialStatus.daysRemaining <= 3;

  return (
    <>
      {/* Warning Banner (expiring soon) */}
      {warning.show && (
        <div className={`${isUrgent ? 'bg-orange-900/20 border-orange-500/50' : 'bg-yellow-900/20 border-yellow-500/50'} border rounded-lg p-3 mb-3`}>
          <div className="flex items-start gap-2">
            <AlertTriangle className={`w-4 h-4 ${isUrgent ? 'text-orange-400' : 'text-yellow-400'} flex-shrink-0 mt-0.5`} />
            <p className={`text-sm ${isUrgent ? 'text-orange-300' : 'text-yellow-300'}`}>
              {warning.message}
            </p>
          </div>
        </div>
      )}

      {/* Trial Status Banner (active trial) */}
      <div className="bg-slate-700/30 border border-border-subtle rounded-lg p-2.5 mb-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent-gold" />
            <span className="text-sm text-text-primary font-medium">
              Trial: {formatTimeRemaining()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onPurchase && (
              <button
                onClick={onPurchase}
                className="px-3 py-1.5 bg-accent-gold hover:bg-accent-gold/90 text-vault-dark rounded-lg font-medium text-xs transition-colors flex items-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Purchase
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-text-primary rounded-lg font-medium text-xs transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

