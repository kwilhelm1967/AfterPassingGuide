/**
 * Fave icon: heart outline inside a borderless circle.
 * Light, minimal; used for Guidance / favorite in the app.
 */

import React from 'react';
import { Heart } from 'lucide-react';

interface FaveIconProps {
  /** Size of the icon container (circle). */
  size?: number;
  /** Heart color (default: light silver/grey). */
  heartClassName?: string;
  /** Circle background (default: subtle fill, no border). */
  circleClassName?: string;
  className?: string;
}

const DEFAULT_SIZE = 36;

export const FaveIcon: React.FC<FaveIconProps> = ({
  size = DEFAULT_SIZE,
  heartClassName = 'text-slate-400',
  circleClassName = 'bg-white/[0.06]',
  className = '',
}) => {
  const heartSize = Math.round(size * 0.5);
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 border-0 border-none ${circleClassName} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Heart
        className={heartClassName}
        style={{ width: heartSize, height: heartSize }}
        strokeWidth={1.75}
        fill="none"
      />
    </div>
  );
};
