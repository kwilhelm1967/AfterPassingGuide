/**
 * DateInput – shared expandable date picker with ivory background and branding colors.
 * Clicking the input or the calendar icon opens the native date picker.
 */

import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';

const IVORY = '#FFF6E9';
const VAULT_DARK = '#274B62';
const ACCENT_GOLD = '#C9AE66';
const BORDER = 'rgba(39, 75, 98, 0.5)';

export interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  error?: boolean;
}

export function DateInput({
  value = '',
  onChange,
  className = '',
  error,
  id,
  ...props
}: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    inputRef.current?.showPicker?.();
    inputRef.current?.focus();
  };

  return (
    <div className="date-input-wrapper relative flex items-stretch w-full">
      <input
        ref={inputRef}
        type="date"
        id={id}
        value={value}
        onChange={onChange}
        className={`date-input-ivory flex-1 min-w-0 pl-3 pr-11 py-2.5 rounded-lg text-sm transition-all focus:outline-none ${className}`}
        style={{
          backgroundColor: IVORY,
          color: VAULT_DARK,
          border: `1px solid ${error ? '#b91c1c' : BORDER}`,
        }}
        aria-invalid={error}
        {...props}
      />
      <button
        type="button"
        onClick={openPicker}
        className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center rounded-r-lg transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
        style={{ color: ACCENT_GOLD }}
        tabIndex={-1}
        aria-label="Open date picker"
      >
        <Calendar className="w-5 h-5" strokeWidth={1.75} />
      </button>
    </div>
  );
}
