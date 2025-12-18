/**
 * Disclaimer Banner
 * 
 * Displays a prominent reminder that this is organizational guidance only.
 * Maintains legal safety without adding emotional burden.
 */

import React from 'react';
import { Info } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-card-bg/50 border border-border-subtle rounded-lg px-4 py-2.5">
      <div className="flex items-start gap-2.5">
        <Info className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
        <div className="text-xs text-text-muted leading-relaxed">
          <span className="text-text-secondary">This tool provides organizational guidance for the United States only.</span>
          {' '}It does not provide legal, financial, or medical advice. Laws and processes vary by state. 
          For decisions about legal, financial, or tax matters, consider consulting a qualified professional.
        </div>
      </div>
    </div>
  );
};

