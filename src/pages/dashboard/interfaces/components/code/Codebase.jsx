import PropTypes from 'prop-types';
import { useEffect, useRef, useState, memo } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import CodebaseSearchDialog from './CodebaseSearchDialog';
import CodeEditor from './CodeEditor';
import FilesToolbar from './FilesToolbar';
import FileTree from './FileTree';
import Iconify from '../../../../../components/iconify';
import { useCodeEditorPersistence } from '../../../../../hooks/useCodeEditorPersistence';
import {
  selectFileTree,
  selectActiveFile,
  selectIsLoading,
  selectHasUnsavedChanges,
  saveFile,
  fetchFileTree,
  createFile,
} from '../../../../../redux/slices/codeEditor';
import { dispatch, useSelector } from '../../../../../redux/store';

const Codebase = ({ interfaceId, chatIframeRef }) => {
  const editorRef = useRef(null);
  const [isCreatingNew, setIsCreatingNew] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  // Persist editor state
  useCodeEditorPersistence(interfaceId);

  // Redux state
  const fileTree = useSelector(selectFileTree);
  const selectedFile = useSelector(selectActiveFile);
  const loading = useSelector(selectIsLoading);
  const hasChanges = useSelector((state) => selectHasUnsavedChanges(state, selectedFile));

  // Fetch file tree
  useEffect(() => {
    dispatch(fetchFileTree(interfaceId));
  }, [interfaceId]);

  // Auto-expand root
  useEffect(() => {
    if (fileTree && !expandedNodes.has(fileTree.path)) {
      setExpandedNodes((prev) => new Set(prev).add(fileTree.path));
    }
  }, [fileTree]);

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        if (hasChanges && selectedFile && editorRef.current) {
          handleSave();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasChanges, selectedFile]);

  const handleSave = async () => {
    if (!selectedFile || !editorRef.current) return;
    const content = editorRef.current.getValue();
    await dispatch(saveFile(interfaceId, selectedFile, content));
  };

  const handleCreateNew = (type) => {
    if (!fileTree) return;
    setIsCreatingNew({ path: fileTree.path, type });
    if (!expandedNodes.has(fileTree.path)) {
      setExpandedNodes((prev) => new Set(prev).add(fileTree.path));
    }
  };

  const handleCreateFile = async (path, type) => {
    await dispatch(createFile(interfaceId, path, type));
    setIsCreatingNew(null);
  };

  if (loading && !fileTree) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <span>Loading file tree...</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col h-full bg-gray-100 dark:bg-[#1d1d1d]">
        {/* Resizable panels */}
        <PanelGroup
          direction="horizontal"
          defaultSizes={[25, 75]}
        >
          {/* File Tree Panel */}
          <Panel
            minSize={15}
            defaultSize={20}
            maxSize={50}
            className="flex flex-col bg-gray-100/50 dark:bg-[#131313]"
          >
            <div className="px-2 py-2 flex items-center justify-between border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                Explorer
              </span>
              <div className="flex items-center gap-1">
                <button
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded transition-colors"
                  onClick={() => setSearchDialogOpen(true)}
                  title="Search in Files"
                >
                  <Iconify
                    icon="mdi:magnify"
                    className="w-4 h-4"
                  />
                </button>
                <button
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded transition-colors"
                  onClick={() => handleCreateNew('file')}
                  title="New File"
                >
                  <Iconify
                    icon="mdi:file-plus-outline"
                    className="w-4 h-4"
                  />
                </button>
                <button
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded transition-colors"
                  onClick={() => handleCreateNew('folder')}
                  title="New Folder"
                >
                  <Iconify
                    icon="mdi:folder-plus-outline"
                    className="w-4 h-4"
                  />
                </button>
                <button
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded transition-colors"
                  onClick={() => dispatch(fetchFileTree(interfaceId))}
                  title="Refresh"
                >
                  <Iconify
                    icon="mdi:refresh"
                    className="w-4 h-4"
                  />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto pt-1.5">
              {fileTree && (
                <FileTree
                  treeData={fileTree}
                  interfaceId={interfaceId}
                  isCreatingNew={isCreatingNew}
                  setIsCreatingNew={setIsCreatingNew}
                  expandedNodes={expandedNodes}
                  setExpandedNodes={setExpandedNodes}
                  onCreateFile={handleCreateFile}
                  chatIframeRef={chatIframeRef}
                />
              )}
            </div>
          </Panel>

          <PanelResizeHandle className="bg-transparent hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-1 cursor-ew-resize" />

          {/* Editor Panel */}
          <Panel className="flex-1 flex flex-col bg-gray-100 dark:bg-[#1d1d1d]">
            <FilesToolbar interfaceId={interfaceId} />
            <div className="flex-1 relative">
              {selectedFile ? (
                <>
                  <CodeEditor
                    ref={editorRef}
                    interfaceId={interfaceId}
                    filePath={selectedFile}
                    chatIframeRef={chatIframeRef}
                  />
                  {/* Bottom Toast Notification for Unsaved Changes */}
                  {hasChanges && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
                      <div className="flex items-center gap-3 px-4 py-2 bg-gray-800 dark:bg-gray-900 text-white rounded-lg shadow-lg border border-gray-600">
                        <Iconify
                          icon="mdi:alert-circle-outline"
                          className="w-4 h-4 text-orange-400"
                        />
                        <span className="text-sm">Unsaved Changes</span>
                        <div className="flex items-center gap-2 ml-2">
                          <button
                            className="px-3 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                            onClick={() => {
                              // Reset functionality - you might want to implement this
                              if (editorRef.current && selectedFile) {
                                // Reload original content or reset to last saved state
                                window.location.reload(); // Simple reset for now
                              }
                            }}
                          >
                            Reset
                          </button>
                          <button
                            className={`px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors \
                              ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                            onClick={handleSave}
                            disabled={loading}
                          >
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-600">
                  <span>Select a file to edit</span>
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>
      {/* Search Dialog */}
      <CodebaseSearchDialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        interfaceId={interfaceId}
      />
    </>
  );
};

Codebase.propTypes = {
  interfaceId: PropTypes.string.isRequired,
  chatIframeRef: PropTypes.object,
};

export default memo(Codebase);
