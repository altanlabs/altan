// Import necessary dependencies
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useDebounce } from './useDebounce';
import { selectConnectionTypes } from '../redux/slices/connections';
import { selectCustomConnectionTypes } from '../redux/slices/general';

// Define types for better type safety and readability
interface ActionItem {
  id: string;
  name: string;
  method: string;
}

interface WebhookItem {
  id: string;
  name: string;
}

interface ConnectionType {
  id: string;
  name: string;
  description: string;
  actions: { items: ActionItem[] };
  webhooks?: { items: WebhookItem[] };
  icon: string;
}

interface State {
  general: {
    account: {
      webhooks: WebhookItem[];
    };
  };
}

type Mode = 'webhook' | 'search' | 'action' | 'all_actions' | 'custom_apps';

interface UseFilteredConnectionEntitiesProps {
  mode: Mode;
  searchTerm: string;
  selected?: ConnectionType | null;
  filterOutEmpty?: boolean;
  featured?: string[];
}

type ConnectionSubItem = ActionItem | WebhookItem;


// Constants for filtering methods
const FILTER_CONNS_BY_METHOD: Record<string, string[]> = {
  search: ['get', 'post'],
  action: ['put', 'patch', 'post', 'delete'],
};

// Helper function to filter actions by mode
const filterActionsByMode = (actions: ActionItem[], mode: string): ActionItem[] =>
  actions.filter((a) => FILTER_CONNS_BY_METHOD[mode].includes(a.method.toLowerCase()));

// Selector to get webhooks from the Redux store
const selectWebhooks = (state: State): WebhookItem[] => state.general.account.webhooks;

// Hook to compute full types based on mode
function useFullTypes(
  mode: Mode = "all_actions",
  types: ConnectionType[],
  webhooks: WebhookItem[],
  customConnectionTypes: ConnectionType[]
): ConnectionType[] {
  return useMemo(() => {
    if (mode === 'custom_apps') {
      return customConnectionTypes;
    }

    if (!types?.length) {
      return types;
    }

    if (mode === 'webhook') {
      const myWebhooksType: ConnectionType = {
        id: 'my_webhooks',
        name: 'AA My Webhooks',
        description: 'My custom webhooks',
        webhooks: { items: webhooks },
        actions: { items: [] },
        icon: 'material-symbols:webhook',
      };
      return [myWebhooksType, ...types];
    }
    return types;
  }, [types, mode, webhooks, customConnectionTypes]);
}

// Helper function to filter actions by search term
function filterSubItemsBySearchTerm(subItems: ConnectionSubItem[], searchTerm: string): ConnectionSubItem[] {
  if (!searchTerm) return subItems;
  const lowerSearchTerm = searchTerm.toLowerCase();
  return subItems.filter((sub) => sub.name.toLowerCase().includes(lowerSearchTerm));
}

// Helper function to get filtered items for a connection
function getFilteredItemsForConnection(
  conn: ConnectionType,
  mode: Mode,
  debouncedSearchTerm: string
): ConnectionType {
  let subItemsFilteredByMode: ConnectionSubItem[] = conn.actions?.items ?? [];
  if (mode && mode !== 'custom_apps') {
    if (mode === 'webhook') {
      subItemsFilteredByMode = conn.webhooks?.items ?? [];
    } else {
      subItemsFilteredByMode = filterActionsByMode(subItemsFilteredByMode as ActionItem[], mode);
    }
  }

  let subItemsFilteredBySearchTerm = subItemsFilteredByMode;
  if (debouncedSearchTerm?.length) {
    subItemsFilteredBySearchTerm = filterSubItemsBySearchTerm(subItemsFilteredBySearchTerm, debouncedSearchTerm);
  }

  const items =
    (debouncedSearchTerm?.length && !conn.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      ? subItemsFilteredBySearchTerm
      : subItemsFilteredByMode;

  return {
    ...conn,
    ...(mode === 'webhook'
      ? {
          webhooks: { items: items as WebhookItem[] },
        }
      : {
          actions: { items: items as ActionItem[] },
        }),
  };
}

// Helper function to filter connections
function filterConnections(
  connections: ConnectionType[],
  debouncedSearchTerm: string,
  filterOutEmpty: boolean,
  mode: Mode
): ConnectionType[] {
  if (!debouncedSearchTerm?.length && !filterOutEmpty) {
    return connections;
  }

  const lowerSearchTerm = debouncedSearchTerm.toLowerCase();

  return connections.filter((conn) => {
    if ((debouncedSearchTerm?.length || !filterOutEmpty) && conn.name.toLowerCase().includes(lowerSearchTerm)) {
      return true;
    }
    const subItems = mode === 'webhook' ? conn.webhooks?.items : conn.actions?.items;
    if (!!subItems?.length) {
      return true;
    }
    if (!debouncedSearchTerm?.length && !filterOutEmpty) {
      return true;
    }
    return false;
  });
}

// Helper function to sort connections
function sortConnections(connections: ConnectionType[], featured: string[]): ConnectionType[] {
  // First deduplicate connections based on ID
  const uniqueConnections = Array.from(new Map(connections.map(conn => [conn.id, conn])).values());
  
  const stripBrackets = (name: string) => name.replace(/\[.*?\]\s*/g, '').trim();
  
  const sorted = uniqueConnections.sort((a, b) => {
    // First sort alphabetically, removing any [alpha] or similar tags
    const nameA = stripBrackets((a.name || '')).toLowerCase().trim();
    const nameB = stripBrackets((b.name || '')).toLowerCase().trim();
    
    // Check if either name starts with "altan"
    const aStartsWithAltan = nameA.startsWith('altan');
    const bStartsWithAltan = nameB.startsWith('altan');
    
    // If one starts with "altan" and the other doesn't, prioritize the "altan" one
    if (aStartsWithAltan && !bStartsWithAltan) return -1;
    if (!aStartsWithAltan && bStartsWithAltan) return 1;
    
    // If both start with "altan" or neither does, use normal alphabetical order
    const nameCompare = nameA.localeCompare(nameB);
    
    // If names are different, use alphabetical order
    if (nameCompare !== 0) return nameCompare;
    
    // If names are the same, prioritize featured items
    const aFeatured = featured.includes(a.id);
    const bFeatured = featured.includes(b.id);
    if (aFeatured && !bFeatured) return -1;
    if (!aFeatured && bFeatured) return 1;
    
    return 0;
  });

  return sorted;
}

type ConnectionEntity = ConnectionType | ActionItem | WebhookItem;

// Main hook
const useFilteredConnectionEntities = ({
  mode,
  searchTerm,
  selected,
  filterOutEmpty = false,
  featured = [],
}: UseFilteredConnectionEntitiesProps): ConnectionEntity[] => {
  const types = useSelector(selectConnectionTypes) as ConnectionType[];
  const webhooks = useSelector(selectWebhooks);
  const debouncedSearchTerm = useDebounce(searchTerm, 300) as string;
  const customConnectionTypes = useSelector(selectCustomConnectionTypes) as ConnectionType[];

  const fullTypes = useFullTypes(mode, types, webhooks, customConnectionTypes);

  const filteredConnectionTypes = useMemo(() => {
    if (!fullTypes?.length) {
      return fullTypes;
    }

    let filteredTypes = fullTypes.map((conn) => getFilteredItemsForConnection(conn, mode, debouncedSearchTerm));
    filteredTypes = filterConnections(filteredTypes, debouncedSearchTerm, filterOutEmpty, mode);
    filteredTypes = sortConnections(filteredTypes, featured);

    return filteredTypes;
  }, [fullTypes, debouncedSearchTerm, filterOutEmpty, mode, featured]);

  // Helper function to get final actions or webhooks based on the selected connection
  function getFinalActions(): ActionItem[] | WebhookItem[] | ConnectionType[] {
    if (!selected) {
      return filteredConnectionTypes ?? [];
    }

    if (selected.id === 'my_webhooks') {
      return webhooks.filter((webhook) =>
        webhook.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    let subItems = selected?.[mode === 'webhook' ? 'webhooks' : 'actions']?.items ?? [];
    if (debouncedSearchTerm?.length) {
      subItems = subItems.filter((sub) => sub.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
    }
    if (!mode || ['trigger', 'custom_apps'].includes(mode)) {
      return subItems;
    }
    return filterActionsByMode(subItems as ActionItem[], mode);
  }

  return useMemo(() => getFinalActions(), [selected, mode, filteredConnectionTypes, debouncedSearchTerm, webhooks]);
};

export default useFilteredConnectionEntities;
