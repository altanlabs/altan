import { debounce } from 'lodash-es';
import { Plus, Download, Search } from 'lucide-react';
import PropTypes from 'prop-types';
import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { cn } from '../../../lib/utils';
import {
  selectQuickFilter,
  setQuickFilter,
  selectSearchResults,
  searchTableRecords,
  selectTableState,
  selectTablesByCloudId,
} from '../../../redux/slices/cloud';
import { dispatch } from '../../../redux/store';
import { optimai_cloud } from '../../../utils/axios.js';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button.tsx';
import { Input } from '../../ui/input';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../../ui/tooltip';
import CreateRecordDrawer from '../records/CreateRecordDrawer.jsx';

function DatabaseNavigationBar({ disabled = false }) {
  const inputRef = useRef(null);
  const { cloudId, tableId } = useParams();
  const [openCreateRecord, setOpenCreateRecord] = useState(false);

  // Get values from Redux - using cloud.js selectors
  const quickFilter = useSelector(selectQuickFilter);
  const searchResults = useSelector((state) =>
    tableId ? selectSearchResults(state, tableId) : null,
  );
  const tableState = useSelector((state) =>
    tableId ? selectTableState(state, tableId) : null,
  );
  const tables = useSelector((state) => selectTablesByCloudId(state, cloudId));

  const validTables = useMemo(() => {
    if (!Array.isArray(tables)) return [];
    return tables.filter((table) => table && table.id);
  }, [tables]);

  // Use internal state for better performance
  const actualRecordCount = tableState?.total || 0;

  // Create debounced search function to avoid excessive API calls
  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      // eslint-disable-next-line no-console
      console.log('🎯 DatabaseNavigationBar debouncedSearch triggered:', { cloudId, tableId, searchQuery });

      if (cloudId && tableId && searchQuery.trim()) {
        // eslint-disable-next-line no-console
        console.log('🔍 Dispatching searchTableRecords...');
        // Trigger database search across all records
        dispatch(searchTableRecords(cloudId, tableId, searchQuery.trim()));
      } else if (cloudId && tableId && !searchQuery.trim()) {
        // eslint-disable-next-line no-console
        console.log('🧹 Clearing search...');
        // Clear search when query is empty
        dispatch(searchTableRecords(cloudId, tableId, ''));
      }
    }, 300), // 300ms delay for better UX
    [cloudId, tableId],
  );

  const handleFilterChange = (e) => {
    const value = e.target.value;
    // eslint-disable-next-line no-console
    console.log('📝 DatabaseNavigationBar handleFilterChange:', { value, tableId });

    // Update Redux state directly for immediate UI feedback
    dispatch(setQuickFilter(value));

    // Trigger debounced database search
    // eslint-disable-next-line no-console
    console.log('🚀 Calling debouncedSearch with value:', value);
    debouncedSearch(value);
  };

  const handleExportCSV = useCallback(async () => {
    if (!cloudId || !tableId) return;

    const currentTable = validTables.find((t) => t.id === Number(tableId));
    if (!currentTable) return;

    try {
      const tableName = currentTable.db_name || currentTable.name;
      const response = await optimai_cloud.post(
        `/v1/instances/${cloudId}/export-csv`,
        { table_name: tableName },
        { responseType: 'blob' },
      );

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${tableName}_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Error handled silently
    }
  }, [cloudId, tableId, validTables]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <TooltipProvider>
      <div className="flex items-center h-[42px] px-4 gap-3">
        {/* Search Bar - Glassmorphic Container */}
        <div className="flex items-center flex-1 h-[38px] rounded-xl bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-md border border-border/10 overflow-hidden px-3 gap-3 transition-all duration-200">
          {/* Search Icon */}
          <Search className="w-[18px] h-[18px] text-muted-foreground/60 shrink-0" />

          {/* Search Input */}
          <Input
            ref={inputRef}
            value={quickFilter}
            onChange={handleFilterChange}
            placeholder="Search records..."
            disabled={disabled}
            className={cn(
              'flex-1 min-w-[100px] sm:min-w-[180px] h-8 text-sm border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
              quickFilter && 'text-primary font-medium',
            )}
          />

          {/* Record Count - Inside search bar */}
          <div className="hidden sm:block">
            {searchResults && quickFilter ? (
              <Badge
                variant="secondary"
                className="h-[22px] text-[0.7rem] font-semibold bg-primary/15 text-primary border-0 px-2"
              >
                {searchResults.newRecordsFound > 0
                  ? `+${searchResults.newRecordsFound} new`
                  : searchResults.totalSearchResults > 0
                    ? `${searchResults.totalSearchResults} found`
                    : 'No matches'}
              </Badge>
            ) : actualRecordCount > 0 ? (
              <Badge
                variant="secondary"
                className="h-[22px] text-[0.7rem] font-semibold bg-muted/50 text-muted-foreground border-0 px-2"
              >
                {actualRecordCount.toLocaleString()}
              </Badge>
            ) : null}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExportCSV}
                disabled={disabled || !tableId}
                className="w-8 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <Download className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export CSV</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenCreateRecord(true)}
                disabled={disabled || !tableId}
                className="w-8 h-8 text-primary bg-primary/10 hover:bg-primary/20"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Record</TooltipContent>
          </Tooltip>
        </div>

        {/* Create Record Drawer */}
        {tableId && (
          <CreateRecordDrawer
            baseId={cloudId}
            tableId={tableId}
            open={openCreateRecord}
            onClose={() => setOpenCreateRecord(false)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

DatabaseNavigationBar.propTypes = {
  disabled: PropTypes.bool,
};

export default DatabaseNavigationBar;
