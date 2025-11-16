export interface Account {
  id: string;
  name: string;
  logo_url?: string;
  owner_email?: string;
}

export interface SearchParams {
  id?: string;
  name?: string;
  owner_email?: string;
}

export interface WorkspaceSearchState {
  searchById: string;
  searchByName: string;
  searchByEmail: string;
  searchResults: Account[];
  isSearching: boolean;
}

export interface UseWorkspaceSearchReturn extends WorkspaceSearchState {
  setSearchById: (value: string) => void;
  setSearchByName: (value: string) => void;
  setSearchByEmail: (value: string) => void;
  performSearch: () => Promise<void>;
  clearSearch: () => void;
  hasAnySearchTerm: boolean;
}

export interface UseWorkspaceSwitcherReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

