/**
 * LockedFeatureIndicator
 * 
 * Small, unobtrusive indicator for locked/preview-only features.
 * Shows a lock icon and "Available with Full Access" text.
 */

import React from 'react';
import { Lock } from 'lucide-react';

interface LockedFeatureIndicatorProps {
  className?: string;
}

export const LockedFeatureIndicator: React.FC<LockedFeatureIndicatorProps> = ({ 
  className = '' 
}) => {
  return (
    <div className={`flex items-center gap-1.5 text-text-muted text-xs ${className}`}>
      <Lock className="w-3 h-3" strokeWidth={1.75} />
      <span>Available with Full Access</span>
    </div>
  );
};
