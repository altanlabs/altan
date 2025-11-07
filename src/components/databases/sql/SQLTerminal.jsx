import Editor from '@monaco-editor/react';
import { Play, Plus, X, Code2, CheckCircle2, AlertCircle, Database, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState, useCallback, useRef, memo, useEffect, useMemo } from 'react';

import { optimai_cloud } from '../../../utils/axios';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button.tsx';
import { Input } from '../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Tabs, TabsList, TabsTrigger } from '../../ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';

const SQLTerminal = memo(({ baseId }) => {
  const editorRef = useRef();
  const executeQueryRef = useRef();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Load tabs from localStorage on mount
  const getStorageKey = useCallback(() => `sql-terminal-tabs-${baseId}`, [baseId]);
  const getActiveTabKey = useCallback(() => `sql-terminal-active-${baseId}`, [baseId]);

  const loadTabsFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      const storedActive = localStorage.getItem(getActiveTabKey());

      if (stored) {
        const parsed = JSON.parse(stored);
        // Clear results and loading states from stored tabs
        const cleanedTabs = parsed.map(tab => ({
          ...tab,
          results: null,
          error: null,
          loading: false,
          executionTime: null,
        }));
        return {
          tabs: cleanedTabs,
          activeTab: storedActive || cleanedTabs[0]?.id || '1',
          nextId: Math.max(...cleanedTabs.map(t => parseInt(t.id) || 0)) + 1,
        };
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading tabs from localStorage:', error);
    }
    return null;
  }, [getStorageKey, getActiveTabKey]);

  const initialState = loadTabsFromStorage();

  const [tabs, setTabs] = useState(
    initialState?.tabs || [
      { id: '1', name: 'Query 1', sql: '', results: null, error: null, loading: false, executionTime: null },
    ],
  );
  const [activeTab, setActiveTab] = useState(initialState?.activeTab || '1');
  const [nextTabId, setNextTabId] = useState(initialState?.nextId || 2);

  const currentTab = tabs.find((t) => t.id === activeTab);

  // Save tabs to localStorage whenever they change
  useEffect(() => {
    try {
      // Only save the sql and name, not results/errors/loading states
      const tabsToStore = tabs.map(({ id, name, sql }) => ({ id, name, sql }));
      localStorage.setItem(getStorageKey(), JSON.stringify(tabsToStore));
      localStorage.setItem(getActiveTabKey(), activeTab);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving tabs to localStorage:', error);
    }
  }, [tabs, activeTab, getStorageKey, getActiveTabKey]);

  const handleAddTab = useCallback(() => {
    const newTab = {
      id: String(nextTabId),
      name: `Query ${nextTabId}`,
      sql: '',
      results: null,
      error: null,
      loading: false,
      executionTime: null,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTab(newTab.id);
    setNextTabId((prev) => prev + 1);
  }, [nextTabId]);

  const handleCloseTab = useCallback(
    (tabId, e) => {
      e?.stopPropagation();
      if (tabs.length === 1) return;

      const tabIndex = tabs.findIndex((t) => t.id === tabId);
      const newTabs = tabs.filter((t) => t.id !== tabId);
      setTabs(newTabs);

      if (activeTab === tabId) {
        const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
        setActiveTab(newTabs[newActiveIndex].id);
      }
    },
    [tabs, activeTab],
  );

  const handleEditorChange = useCallback(
    (value) => {
      setTabs((prev) =>
        prev.map((tab) => (tab.id === activeTab ? { ...tab, sql: value || '' } : tab)),
      );
    },
    [activeTab],
  );

  const handleExecuteQuery = useCallback(async () => {
    if (!currentTab?.sql?.trim() || !baseId) return;

    const startTime = Date.now();

    // Set loading state
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab
          ? { ...tab, loading: true, error: null, results: null, executionTime: null }
          : tab,
      ),
    );

    try {
      const response = await optimai_cloud.post(`/v1/pg-meta/${baseId}/query`, {
        query: currentTab.sql.trim(),
      });

      const executionTime = Date.now() - startTime;

      // Handle successful response
      if (response.data && Array.isArray(response.data)) {
        setTabs((prev) =>
          prev.map((tab) =>
            tab.id === activeTab
              ? {
                  ...tab,
                  results: response.data,
                  error: null,
                  loading: false,
                  executionTime,
                }
              : tab,
          ),
        );
      } else {
        // Success but no data (e.g., INSERT, UPDATE, DELETE)
        setTabs((prev) =>
          prev.map((tab) =>
            tab.id === activeTab
              ? {
                  ...tab,
                  results: [],
                  error: null,
                  loading: false,
                  executionTime,
                }
              : tab,
          ),
        );
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Query execution failed';

      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTab
            ? {
                ...tab,
                error: errorMessage,
                results: null,
                loading: false,
                executionTime,
              }
            : tab,
        ),
      );
    }
  }, [activeTab, currentTab?.sql, baseId]);

  // Keep ref updated with latest execute function
  executeQueryRef.current = handleExecuteQuery;

  // Reset pagination when results change
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery('');
  }, [currentTab?.results]);

  // Get column names from results
  const columns = useMemo(() => {
    if (!currentTab?.results?.length) return [];
    return Object.keys(currentTab.results[0]);
  }, [currentTab?.results]);

  // Filter and paginate data
  const { filteredData, paginatedData, totalPages } = useMemo(() => {
    if (!currentTab?.results?.length) {
      return { filteredData: [], paginatedData: [], totalPages: 0 };
    }

    // Filter data based on search query
    const filtered = currentTab.results.filter((row) => {
      if (!searchQuery.trim()) return true;
      return Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase()),
      );
    });

    // Calculate pagination
    const total = Math.ceil(filtered.length / pageSize);
    const start = (currentPage - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return { filteredData: filtered, paginatedData: paginated, totalPages: total };
  }, [currentTab?.results, searchQuery, currentPage, pageSize]);

  // Cell renderer for different data types
  const renderCell = useCallback((value) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic text-xs">null</span>;
    }
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'} className="text-xs font-mono">
          {String(value)}
        </Badge>
      );
    }
    if (typeof value === 'object') {
      return (
        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-foreground">
          {JSON.stringify(value)}
        </code>
      );
    }
    if (typeof value === 'number') {
      return <span className="font-mono text-xs text-blue-600 dark:text-blue-400">{value}</span>;
    }
    return <span className="text-xs">{String(value)}</span>;
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Tabs Header */}
      <div className="flex items-center border-b border-border bg-transparent px-2 gap-2 min-h-9">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleAddTab}
                className="h-7 w-7 rounded-md"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>New Query</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="h-8 bg-transparent p-0 gap-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="h-8 px-4 text-[13px] font-medium rounded-t-md rounded-b-none data-[state=active]:bg-muted data-[state=active]:font-semibold border-b-2 border-b-transparent data-[state=active]:border-b-primary relative"
              >
                <span>{tab.name}</span>
                {tabs.length > 1 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    className="h-4 w-4 ml-2 p-0 hover:bg-destructive/20 hover:text-destructive rounded-sm"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* SQL Editor Section */}
      <div className="h-[40%] min-h-[200px] flex flex-col border-b border-border relative">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/20 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground">SQL Editor</span>
          </div>

          <div className="flex items-center gap-2">
            {currentTab?.executionTime !== null && (
              <Badge variant="secondary" className="h-5 text-xs font-semibold bg-blue-500/10 text-blue-500 border-0">
                {currentTab.executionTime - 150}ms
              </Badge>
            )}
            <Badge variant="secondary" className="h-5 text-xs font-semibold">
              ⌘ + ⏎
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={handleExecuteQuery}
                    disabled={!currentTab?.sql?.trim() || currentTab?.loading}
                    className="h-8 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {currentTab?.loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Execute Query</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            language="sql"
            theme={isDarkMode ? 'vs-dark' : 'light'}
            value={currentTab?.sql || ''}
            onChange={handleEditorChange}
            onMount={(editor, monaco) => {
              editorRef.current = editor;

              // Add Cmd+Enter (Mac) / Ctrl+Enter (Windows) shortcut to execute query
              editor.addAction({
                id: 'execute-sql-query',
                label: 'Execute Query',
                keybindings: [
                  monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                ],
                precondition: null,
                keybindingContext: null,
                contextMenuGroupId: 'navigation',
                contextMenuOrder: 1.5,
                run: () => {
                  if (executeQueryRef.current) {
                    executeQueryRef.current();
                  }
                  return null;
                },
              });

              // Also add a key binding listener to prevent default browser behavior
              editor.onKeyDown((e) => {
                const isModKey = e.metaKey || e.ctrlKey; // Cmd on Mac, Ctrl on Windows
                if (isModKey && e.keyCode === monaco.KeyCode.Enter) {
                  e.preventDefault();
                  e.stopPropagation();
                  // eslint-disable-next-line no-console
                  console.log('🚀 Executing query via keyboard shortcut');
                  if (executeQueryRef.current) {
                    executeQueryRef.current();
                  }
                }
              });
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              padding: { top: 12, bottom: 12 },
            }}
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Results Display */}
        <div className="flex-1 overflow-hidden">
          {currentTab?.error ? (
            <div className="flex items-center justify-center h-full p-6">
              <div className="flex flex-col items-center gap-4 max-w-2xl">
                <div className="p-4 rounded-xl bg-destructive/10">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-destructive">Query Error</h3>
                <div className="text-sm text-muted-foreground text-center font-mono bg-destructive/5 p-4 rounded-lg max-w-full break-words">
                  {currentTab.error}
                </div>
              </div>
            </div>
          ) : currentTab?.results ? (
            currentTab.results.length === 0 ? (
              <div className="flex items-center justify-center h-full p-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-xl bg-green-500/10">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-500">Query Executed Successfully</h3>
                  <p className="text-sm text-muted-foreground">No rows returned</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Table Toolbar */}
                <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-muted/30 backdrop-blur-sm">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search in results..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 bg-background/50 border-border/50"
                      />
                    </div>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {filteredData.length} {filteredData.length === 1 ? 'row' : 'rows'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Rows per page:</span>
                    <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                      <SelectTrigger className="h-9 w-[70px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="200">200</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto relative">
                  <div className="min-w-full inline-block align-middle">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background border-b-2 border-border z-20 shadow-sm">
                        <TableRow className="hover:bg-transparent">
                          {columns.map((column) => (
                            <TableHead key={column} className="h-12 px-4 font-semibold text-xs uppercase tracking-wider text-foreground bg-muted/80 backdrop-blur-sm">
                              {column}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedData.length > 0 ? (
                          paginatedData.map((row, rowIndex) => (
                            <TableRow
                              key={rowIndex}
                              className="hover:bg-muted/50 transition-colors border-b border-border/50"
                            >
                              {columns.map((column) => (
                                <TableCell key={column} className="px-4 py-3">
                                  {renderCell(row[column])}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                              No results found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30 backdrop-blur-sm">
                  <div className="text-xs text-muted-foreground">
                    Page {currentPage} of {totalPages || 1} • Showing{' '}
                    {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} to{' '}
                    {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} results
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="h-8 w-8"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full p-6">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-xl bg-primary/10">
                  <Database className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Ready to Execute</h3>
                <p className="text-sm text-muted-foreground">Write your SQL query above and click Run</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

SQLTerminal.propTypes = {
  baseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

SQLTerminal.displayName = 'SQLTerminal';

export default SQLTerminal;
