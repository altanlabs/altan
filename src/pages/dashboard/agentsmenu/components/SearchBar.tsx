/**
 * SearchBar Component
 * Following Single Responsibility Principle - handles only search input
 */

import { memo, ChangeEvent } from 'react';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
// @ts-ignore - JSX component without types
import Iconify from '../../../../components/iconify/Iconify';
import type { SearchBarProps } from '../types';

export const SearchBar = memo<SearchBarProps>(({ value, onChange, onClear }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="px-3 py-2 border-b border-border/50">
      <div className="relative">
        <Iconify
          icon="mdi:magnify"
          width={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
        />
        <Input
          type="text"
          placeholder="Search agents..."
          value={value}
          onChange={handleChange}
          className="w-full pl-9 pr-9 bg-background/40 border border-border/30 focus-visible:ring-1 focus-visible:ring-ring"
        />
        {value && (
          <Button
            onClick={onClear}
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          >
            <Iconify icon="mdi:close" width={14} />
          </Button>
        )}
      </div>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

