import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import Editor from '@monaco-editor/react';
import { Box, Tabs, Tab, IconButton, Tooltip, CircularProgress, Chip, Stack, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useState, useCallback, useRef, memo, useEffect } from 'react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import { optimai_pg_meta } from '../../../utils/axios';
import Iconify from '../../iconify';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const SQLTerminal = memo(({ baseId }) => {
  const theme = useTheme();
  const gridRef = useRef();
  const editorRef = useRef();
  const executeQueryRef = useRef();

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

  const handleTabChange = useCallback((_, newValue) => {
    setActiveTab(newValue);
  }, []);

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
      const response = await optimai_pg_meta.post(`/${baseId}/query`, {
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

  // Generate column definitions from results
  const columnDefs = currentTab?.results?.length > 0
    ? Object.keys(currentTab.results[0]).map((key) => ({
      field: key,
      headerName: key,
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 100,
    }))
    : [];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Tabs Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: 'transparent',
          px: 1,
          gap: 1,
          minHeight: 36,
        }}
      >
        <Tooltip title="New Query">
          <IconButton
            size="small"
            onClick={handleAddTab}
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              padding: '6px',
              color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
              backgroundColor: 'transparent',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                transform: 'scale(1.05)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
            }}
          >
            <Iconify icon="mdi:plus" sx={{ width: 18, height: 18 }} />
          </IconButton>
        </Tooltip>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            flex: 1,
            minHeight: 30,
            position: 'relative',
            backgroundColor: 'transparent',
            minWidth: 0,
            maxWidth: '100%',
            '& .MuiTabs-indicator': {
              display: 'none',
            },
            '& .MuiTabs-flexContainer': {
              gap: '0px',
              minWidth: 0,
            },
            '& .MuiTabs-scroller': {
              overflow: 'auto !important',
              flexGrow: 1,
              minWidth: 0,
              maxWidth: '100%',
            },
            '& .MuiTab-root': {
              height: 30,
              minHeight: 30,
              padding: '0 16px',
              textTransform: 'none',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '0.01em',
              color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
              borderRadius: '6px 6px 0 0',
              margin: '0',
              minWidth: 'auto',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              backgroundColor: 'transparent',
              position: 'relative',
              '&:not(:last-child)::after': {
                content: '""',
                position: 'absolute',
                right: 0,
                top: '25%',
                height: '50%',
                width: '1px',
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.08)',
              },
              '&.Mui-selected::after': {
                display: 'none',
              },
              '&.Mui-selected + .MuiTab-root::after': {
                display: 'none',
              },
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.03)',
                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
              },
              '&.Mui-selected': {
                color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(255, 255, 255, 0.9)',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
                borderBottom: theme.palette.mode === 'dark'
                  ? '2px solid rgba(255, 255, 255, 0.2)'
                  : '2px solid rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(255, 255, 255, 1)',
                },
              },
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '13px' }}>
                  <span>{tab.name}</span>
                  {tabs.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleCloseTab(tab.id, e)}
                      sx={{
                        width: 16,
                        height: 16,
                        padding: 0,
                        ml: 0.25,
                        color: 'inherit',
                        opacity: 0.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                          opacity: 1,
                          backgroundColor: alpha(theme.palette.error.main, 0.15),
                          color: theme.palette.error.main,
                        },
                      }}
                    >
                      <Iconify icon="mdi:close" sx={{ width: 12, height: 12 }} />
                    </IconButton>
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* SQL Editor Section */}
      <Box
        sx={{
          height: '40%',
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: 'relative',
        }}
      >
        {/* Editor Toolbar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 0.75,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify
              icon="mdi:code-braces"
              sx={{ width: 18, height: 18, color: theme.palette.text.secondary }}
            />
            <Typography variant="body2" fontWeight={600} color="text.secondary" fontSize="0.8rem">
              SQL Editor
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            {currentTab?.executionTime !== null && (
              <Chip
                label={`${currentTab.executionTime}ms`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                  color: theme.palette.info.main,
                }}
              />
            )}
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mr: 1 }}>
              <Chip
                icon={<Iconify icon="mdi:apple-keyboard-command" sx={{ fontSize: '0.75rem' }} />}
                label="⏎"
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.text.secondary, 0.08),
                  color: theme.palette.text.secondary,
                  '& .MuiChip-icon': {
                    marginLeft: '6px',
                    marginRight: '-4px',
                  },
                }}
              />
            </Stack>
            <Tooltip title="Execute Query">
              <IconButton
                size="small"
                onClick={handleExecuteQuery}
                disabled={!currentTab?.sql?.trim() || currentTab?.loading}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  color: '#fff',
                  backgroundColor: theme.palette.success.main,
                  '&:hover': {
                    backgroundColor: theme.palette.success.dark,
                  },
                  '&:disabled': {
                    backgroundColor: alpha(theme.palette.success.main, 0.3),
                  },
                }}
              >
                {currentTab?.loading ? (
                  <CircularProgress size={16} sx={{ color: '#fff' }} />
                ) : (
                  <Iconify icon="mdi:play" sx={{ width: 18, height: 18 }} />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Monaco Editor */}
        <Box sx={{ flex: 1 }}>
          <Editor
            height="100%"
            language="sql"
            theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
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
        </Box>
      </Box>

      {/* Results Section */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Results Display */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {currentTab?.error ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 3,
              }}
            >
              <Stack spacing={2} alignItems="center">
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                  }}
                >
                  <Iconify
                    icon="mdi:alert-circle"
                    sx={{ width: 48, height: 48, color: theme.palette.error.main }}
                  />
                </Box>
                <Typography variant="h6" color="error">
                  Query Error
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    maxWidth: 600,
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    backgroundColor: alpha(theme.palette.error.main, 0.05),
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  {currentTab.error}
                </Typography>
              </Stack>
            </Box>
          ) : currentTab?.results ? (
            currentTab.results.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  p: 3,
                }}
              >
                <Stack spacing={2} alignItems="center">
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                    }}
                  >
                    <Iconify
                      icon="mdi:check-circle"
                      sx={{ width: 48, height: 48, color: theme.palette.success.main }}
                    />
                  </Box>
                  <Typography variant="h6" color="success.main">
                    Query Executed Successfully
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No rows returned
                  </Typography>
                </Stack>
              </Box>
            ) : (
              <div
                className={`ag-theme-quartz${theme.palette.mode === 'dark' ? '-dark' : ''}`}
                style={{
                  height: '100%',
                  width: '100%',
                  '--ag-foreground-color': theme.palette.text.primary,
                  '--ag-background-color':
                    theme.palette.mode === 'dark'
                      ? theme.palette.grey[900]
                      : theme.palette.background.paper,
                  '--ag-header-background-color':
                    theme.palette.mode === 'dark'
                      ? theme.palette.grey[800]
                      : theme.palette.background.paper,
                  '--ag-border-color': theme.palette.divider,
                  '--ag-header-foreground-color': theme.palette.text.primary,
                  '--ag-font-family': theme.typography.fontFamily,
                  '--ag-font-size': theme.typography.body2.fontSize,
                  '--ag-border-radius': '0px',
                  '--ag-wrapper-border-radius': '0px',
                }}
              >
                <AgGridReact
                  ref={gridRef}
                  rowData={currentTab.results}
                  columnDefs={columnDefs}
                  defaultColDef={{
                    sortable: true,
                    filter: true,
                    resizable: true,
                    minWidth: 100,
                  }}
                  rowHeight={40}
                  headerHeight={42}
                  pagination={true}
                  paginationPageSize={50}
                  paginationPageSizeSelector={[25, 50, 100, 200]}
                />
              </div>
            )
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 3,
              }}
            >
              <Stack spacing={2} alignItems="center">
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <Iconify
                    icon="mdi:database-search"
                    sx={{ width: 48, height: 48, color: theme.palette.primary.main }}
                  />
                </Box>
                <Typography variant="h6" color="text.primary">
                  Ready to Execute
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Write your SQL query above and click Run
                </Typography>
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
});

SQLTerminal.propTypes = {
  baseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

SQLTerminal.displayName = 'SQLTerminal';

export default SQLTerminal;
