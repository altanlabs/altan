import { Search, X } from 'lucide-react';
import { memo } from 'react';

interface PlanSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const PlanSearchBar = memo<PlanSearchBarProps>(
  ({ value, onChange, placeholder = 'Search plans by title or description...' }) => {
    const handleClear = () => {
      onChange('');
    };

    return (
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
        </div>
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 pl-10 pr-10 text-sm bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 transition-all"
        />

        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

PlanSearchBar.displayName = 'PlanSearchBar';

