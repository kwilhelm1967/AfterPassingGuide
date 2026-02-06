/**
 * Simple solid underline under top-level page titles only.
 * 40–50% of title width, 1–2px, brand gold. No blur, glow, or gradient.
 */

import React from 'react';

interface TitleBarProps {
  /** Optional extra class for spacing (e.g. mt-1.5) */
  className?: string;
}

export const TitleBar: React.FC<TitleBarProps> = ({ className = '' }) => (
  <div
    role="presentation"
    className={`w-[45%] min-w-[60px] mx-auto flex-shrink-0 bg-accent-gold ${className}`}
    style={{ height: '2px' }}
    aria-hidden
  />
);
