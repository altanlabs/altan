import { Editor } from '@monaco-editor/react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { Resizable } from 're-resizable';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';

import CodeWorkflowSidebar from './CodeWorkflowSidebar';
import Iconify from '../../../components/iconify';
import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import {
  selectFlow,
  selectFlowModules,
  selectFlowExecutions,
  activateFlow,
  editModule,
  getFlowExecutionDetails,
} from '../../../redux/slices/flows';
import { dispatch } from '../../../redux/store.ts';

const CodeWorkflow = () => {
  const [dispatchWithFeedback] = useFeedbackDispatch();
  const flow = useSelector(selectFlow);
  const modules = useSelector(selectFlowModules);
  const executions = useSelector(selectFlowExecutions);

  // Find the three main modules: trigger -> code -> response
  const moduleArray = useMemo(() => {
    if (!modules || Object.keys(modules).length === 0)
      return { trigger: null, code: null, response: null };

    const moduleList = Object.values(modules);
    const trigger = moduleList.find((m) => m.type === 'trigger');
    const code = moduleList.find((m) => m.type === 'internal' && m.internal_type === 'code');
    const response = moduleList.find(
      (m) => m.type === 'internal' && m.internal_type === 'response',
    );

    return { trigger, code, response };
  }, [modules]);

  // State management
  const [selectedPayload, setSelectedPayload] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [dependencies, setDependencies] = useState([]);
  const [inputVars, setInputVars] = useState([]);
  const [outputVars, setOutputVars] = useState([]);

  // Monaco editor ref
  const editorRef = useRef(null);

  // Load code module data
  useEffect(() => {
    if (moduleArray.code?.logic) {
      setCodeContent(moduleArray.code.logic.code || '# Write your Python code here\n');
      setDependencies(moduleArray.code.logic.dependencies || []);
      setInputVars(moduleArray.code.logic.input_vars_schema || []);
      setOutputVars(moduleArray.code.logic.output_vars_schema || []);
    }
  }, [moduleArray.code]);

  // Save code changes
  const handleSaveCode = useCallback(async () => {
    if (!moduleArray.code?.id) return;

    const moduleData = {
      module: {
        ...moduleArray.code,
        logic: {
          ...moduleArray.code.logic,
          code: codeContent,
          dependencies,
          input_vars_schema: inputVars,
          output_vars_schema: outputVars,
        },
      },
    };

    try {
      await dispatchWithFeedback(editModule({ id: moduleArray.code.id, data: moduleData }), {
        successMessage: 'Code saved successfully',
        errorMessage: 'Failed to save code',
        useSnackbar: true,
      });
    } catch {
      // Error saving code - handled by dispatchWithFeedback
    }
  }, [moduleArray.code, codeContent, dependencies, inputVars, outputVars, dispatchWithFeedback]);

  // Execute flow with selected payload
  const handleExecute = useCallback(async () => {
    if (!flow?.id || isExecuting) return;

    setIsExecuting(true);
    try {
      // Save current code changes first
      await handleSaveCode();

      // Execute the flow with payload
      const executionArgs = selectedPayload ? { payload: selectedPayload } : null;
      const response = await dispatch(activateFlow(flow.id, executionArgs));

      // Get execution details
      if (response?.data?.execution_id) {
        setTimeout(() => {
          dispatch(getFlowExecutionDetails(response.data.execution_id, flow.id));
        }, 1000);
      }

      // Execution completed successfully
    } catch {
      // Execution failed - error handled by dispatchWithFeedback
    } finally {
      setIsExecuting(false);
    }
  }, [flow?.id, selectedPayload, isExecuting, handleSaveCode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        handleExecute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExecute]);

  // Track if code has changes
  const hasCodeChanges = useMemo(() => {
    return codeContent !== moduleArray.code?.logic?.code;
  }, [codeContent, moduleArray.code?.logic?.code]);

  // Handle code module updates from sidebar
  const handleCodeModuleUpdate = useCallback(
    (updates) => {
      if (!moduleArray.code?.id) return;

      // Update local state
      if (updates.dependencies) setDependencies(updates.dependencies);
      if (updates.output_vars_schema) setOutputVars(updates.output_vars_schema);

      // Save to backend
      const moduleData = {
        module: {
          ...moduleArray.code,
          logic: {
            ...moduleArray.code.logic,
            code: codeContent,
            dependencies: updates.dependencies || dependencies,
            output_vars_schema: updates.output_vars_schema || outputVars,
          },
        },
      };

      dispatchWithFeedback(editModule({ id: moduleArray.code.id, data: moduleData }), {
        successMessage: 'Code settings saved successfully',
        errorMessage: 'Failed to save code settings',
        useSnackbar: true,
      }).catch(() => {
        // Error handled by dispatchWithFeedback
      });
    },
    [moduleArray.code, codeContent, dependencies, outputVars, dispatchWithFeedback],
  );

  // Handle trigger module updates from sidebar
  const handleTriggerUpdate = useCallback((updates) => {
    if (!moduleArray.trigger?.id) return;

    const moduleData = {
      module: {
        ...moduleArray.trigger,
        ...updates,
      },
    };

    dispatchWithFeedback(editModule({ id: moduleArray.trigger.id, data: moduleData }), {
      successMessage: 'Trigger settings saved successfully',
      errorMessage: 'Failed to save trigger settings',
      useSnackbar: true,
    }).catch(() => {
      // Error handled by dispatchWithFeedback
    });
  }, [moduleArray.trigger, dispatchWithFeedback]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Add custom keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleExecute();
    });

    // Add command palette commands
    editor.addAction({
      id: 'run-code',
      label: 'Run with Selected Payload',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => handleExecute(),
    });
  };

  // Show loading only if we don't have the flow yet, not if modules are missing
  if (!flow) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Loading code workflow...
        </Typography>
      </Box>
    );
  }

  // If we have flow but modules are missing, show a different message
  if (!moduleArray.trigger && !moduleArray.code && !moduleArray.response) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
        flexDirection="column"
        gap={2}
      >
        <Iconify
          icon="mdi:code-not-equal"
          width={48}
          color="text.secondary"
        />
        <Typography
          variant="h6"
          color="text.primary"
        >
          No Code Flow Structure Found
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
        >
          This flow doesn&apos;t have the required trigger → code → response structure
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* Main Content - 3 Pane Layout */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <Resizable
          defaultSize={{ width: '25%', height: '100%' }}
          minWidth="20%"
          maxWidth="40%"
          enable={{ right: true }}
        >
          <CodeWorkflowSidebar
            trigger={moduleArray.trigger}
            selectedPayload={selectedPayload}
            onPayloadSelect={setSelectedPayload}
            executions={executions}
            codeModule={moduleArray.code}
            onCodeModuleUpdate={handleCodeModuleUpdate}
            onTriggerUpdate={handleTriggerUpdate}
          />
        </Resizable>

        {/* Center Editor - Now takes remaining space */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
          {/* Monaco Editor */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {moduleArray.code ? (
              <Editor
                height="100%"
                defaultLanguage="python"
                value={codeContent}
                onChange={(value) => setCodeContent(value || '')}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  tabSize: 4,
                  insertSpaces: true,
                  renderWhitespace: 'boundary',
                  bracketPairColorization: { enabled: true },
                  suggest: {
                    showKeywords: true,
                    showSnippets: true,
                    showFunctions: true,
                    showVariables: true,
                  },
                }}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  flexDirection: 'column',
                  gap: 2,
                  bgcolor: 'grey.900',
                  color: 'grey.400',
                }}
              >
                <Iconify
                  icon="mdi:code"
                  width={48}
                />
                <Typography variant="body2">No code module found in this flow</Typography>
              </Box>
            )}
          </Box>

          {/* Floating Save Button */}
          {hasCodeChanges && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                zIndex: 1000,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="mdi:content-save" />}
                onClick={handleSaveCode}
                sx={{
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
              >
                Save Code
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CodeWorkflow;
