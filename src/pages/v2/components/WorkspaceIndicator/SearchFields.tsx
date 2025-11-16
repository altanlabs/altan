import { Search, Mail, Hash, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchFieldsProps {
  isSuperAdmin: boolean;
  showAllAccounts: boolean;
  isSearching: boolean;
  searchTerm?: string;
  searchById?: string;
  searchByName?: string;
  searchByEmail?: string;
  onSearchTermChange?: (value: string) => void;
  onSearchByIdChange?: (value: string) => void;
  onSearchByNameChange?: (value: string) => void;
  onSearchByEmailChange?: (value: string) => void;
}

const SearchField = ({
  icon: Icon,
  placeholder,
  value,
  onChange,
  isLoading,
}: {
  icon: typeof Search;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}) => (
  <div className="relative">
    <Icon
      className={cn(
        'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
        isLoading && 'animate-pulse'
      )}
    />
    <Input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pl-9 h-9 border-border/50 focus-visible:ring-1 bg-background"
    />
  </div>
);

export const SearchFields = ({
  isSuperAdmin,
  showAllAccounts,
  isSearching,
  searchTerm = '',
  searchById = '',
  searchByName = '',
  searchByEmail = '',
  onSearchTermChange,
  onSearchByIdChange,
  onSearchByNameChange,
  onSearchByEmailChange,
}: SearchFieldsProps) => {
  if (isSuperAdmin && showAllAccounts) {
    return (
      <div className="space-y-2">
        <SearchField
          icon={Hash}
          placeholder="Search by ID..."
          value={searchById}
          onChange={(value) => onSearchByIdChange?.(value)}
        />
        <SearchField
          icon={User}
          placeholder="Search by name..."
          value={searchByName}
          onChange={(value) => onSearchByNameChange?.(value)}
        />
        <SearchField
          icon={Mail}
          placeholder="Search by owner email..."
          value={searchByEmail}
          onChange={(value) => onSearchByEmailChange?.(value)}
          isLoading={isSearching}
        />
      </div>
    );
  }

  return (
    <SearchField
      icon={Search}
      placeholder="Search workspaces..."
      value={searchTerm}
      onChange={(value) => onSearchTermChange?.(value)}
    />
  );
};

