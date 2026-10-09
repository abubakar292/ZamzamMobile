import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  onClear,
  disabled = false,
  autoFocus = false,
}: SearchBarProps) {
  const handleClear = () => {
    onChange('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className={`relative flex-1 min-w-[200px] ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Search className="h-5 w-5" />
      </div>
      <input
        type="text"
        disabled={disabled}
        autoFocus={autoFocus}
        className="block w-full pl-10 pr-10 py-2 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow disabled:bg-slate-50 disabled:cursor-not-allowed"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {Boolean(value) && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
