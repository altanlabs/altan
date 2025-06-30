import PropTypes from 'prop-types';
import { useState, useEffect, useRef, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import FileIcon from './FileIcon';
import FileTreeContextMenu from './FileTreeContextMenu';
import Iconify from '../../../../../components/iconify';
import {
  selectExpandedFolders,
  selectActiveFile,
  toggleFolder,
  openFile as openFileThunk,
} from '../../../../../redux/slices/codeEditor';
import { optimai } from '../../../../../utils/axios';

function countFiles(node) {
  if (!node || node.type !== 'directory') {
    return 0;
  }

  let fileCount = 0;

  for (const child of node.children || []) {
    if (child.type === 'directory') {
      fileCount += countFiles(child);
    } else if (child.type) {
      fileCount++;
    }
  }

  return fileCount;
}

const FileTree = ({ treeData, interfaceId, chatIframeRef }) => {
  const dispatch = useDispatch();
  const [contextMenu, setContextMenu] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(null);
  const newItemInputRef = useRef(null);

  // Get state from Redux
  const expandedFolders = useSelector(selectExpandedFolders);
  const selectedFile = useSelector(selectActiveFile);

  // Initialize expanded state
  useEffect(() => {
    if (treeData && treeData.type === 'directory' && !expandedFolders.has(treeData.path)) {
      dispatch(toggleFolder(treeData.path));
    }
  }, [treeData, expandedFolders, dispatch]);

  const handleFileSelect = (path) => {
    dispatch(openFileThunk(path, interfaceId));
  };

  const handleFolderToggle = (path) => {
    dispatch(toggleFolder(path));
  };

  const handleContextMenu = (e, node) => {
    e.preventDefault();
    setContextMenu({
      anchorEl: e.target,
      node,
    });
  };

  const updateTreeWithNewNode = (parentPath, newNode) => {
    const updateNode = (node) => {
      if (node.path === parentPath) {
        return {
          ...node,
          children: [...(node.children || []), newNode].sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'directory' ? -1 : 1;
          }),
        };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map((child) => updateNode(child)),
        };
      }
      return node;
    };

    const updatedTree = parentPath
      ? updateNode(treeData)
      : {
          ...treeData,
          children: [...(treeData.children || []), newNode].sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'directory' ? -1 : 1;
          }),
        };

    return updatedTree;
  };

  const handleNewItemKeyDown = async (e, parentPath, type) => {
    if (e.key === 'Enter') {
      const fileName = e.target.value.trim();
      if (!fileName) {
        setIsCreatingNew(null);
        return;
      }

      const filePath = parentPath ? `${parentPath}/${fileName}` : fileName;
      try {
        if (type === 'file') {
          await optimai.post(`/interfaces/dev/${interfaceId}/files/create`, {
            name: filePath,
            content: '',
          });

          const newNode = {
            name: fileName,
            path: filePath,
            type: 'file',
          };
          updateTreeWithNewNode(parentPath, newNode);
          handleFileSelect(filePath);
        } else {
          await optimai.post(`/interfaces/dev/${interfaceId}/files/create-directory`, {
            path: filePath,
          });

          const newNode = {
            name: fileName,
            path: filePath,
            type: 'directory',
            children: [],
          };
          updateTreeWithNewNode(parentPath, newNode);
          handleFolderToggle(filePath);
        }
      } catch (error) {
        console.error('Error creating new item:', error);
      }
      setIsCreatingNew(null);
    } else if (e.key === 'Escape') {
      setIsCreatingNew(null);
    }
  };

  const handleDelete = async (node) => {
    try {
      await optimai.post(`/interfaces/dev/${interfaceId}/files/delete`, {
        file_name: node.path,
      });
      setContextMenu(null);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleRename = async (node) => {
    const newName = window.prompt('Enter new name:', node.name);
    if (!newName || newName === node.name) return;

    try {
      await optimai.post(`/interfaces/dev/${interfaceId}/files/rename`, {
        old_name: node.path,
        new_name: newName,
      });
      setContextMenu(null);
    } catch (error) {
      console.error('Error renaming file:', error);
    }
  };

  const handleAddToChat = (node) => {
    const data = {
      type: 'repo_file_selected',
      action: 'add-to-chat',
      data: {
        file: node.path,
        type: node.type,
        total: node.type === 'directory' ? countFiles(node) : 1,
        interfaceId,
      },
    };
    if (chatIframeRef?.current?.contentWindow) {
      chatIframeRef.current.contentWindow.postMessage(data, '*');
    } else {
      console.debug('invalid room iframe detected');
    }
    setContextMenu(null);
  };

  const renderTree = (node) => {
    const isExpanded = expandedFolders.has(node.path);
    const isDirectory = node.type === 'directory';
    const hasChildren =
      isDirectory && (node.children?.length > 0 || isCreatingNew?.path === node.path);
    const isSelected = selectedFile === node.path;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center py-0.5 pl-1 pr-2 cursor-pointer select-none group transition-colors duration-100 \
            ${isSelected 
              ? 'bg-[#094771] dark:bg-[#094771] text-white' 
              : 'hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
            }`}
          onClick={() => {
            if (isDirectory) {
              handleFolderToggle(node.path);
            } else {
              handleFileSelect(node.path);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, node)}
        >
          <div className="flex items-center min-w-0 flex-1">
            {/* Chevron for folders only */}
            <div className="w-4 h-4 flex items-center justify-center mr-1">
              {isDirectory && (
                <Iconify
                  icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
                  className={`w-3.5 h-3.5 transition-transform duration-100 \
                    ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}
                />
              )}
            </div>

            {/* File Icon only (no folder icons) */}
            {!isDirectory && (
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <FileIcon
                  fileName={node.name}
                  width={16}
                  className={isSelected ? 'brightness-110' : ''}
                />
              </div>
            )}

            {/* File/Folder Name */}
            <span
              className={`truncate text-[13px] font-normal \
                ${isSelected 
                  ? 'text-white' 
                  : 'text-gray-800 dark:text-gray-200'
                } \
                ${isDirectory ? (isExpanded ? '' : '') : ''}`}
            >
              {node.name}
            </span>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {node.children?.map((childNode) => renderTree(childNode))}
            {isCreatingNew?.path === node.path && (
              <div className="flex items-center py-[3px] px-2">
                <div className="w-4 h-4 mr-0.5" />
                <div className="w-5 h-5 flex items-center justify-center mr-1.5">
                  <Iconify
                    icon={
                      isCreatingNew.type === 'directory'
                        ? 'fluent:folder-24-filled'
                        : 'mdi:file-document-outline'
                    }
                    className={`w-[18px] h-[18px] ${isCreatingNew.type === 'directory' ? 'text-[#64D2FF]' : 'text-gray-400'}`}
                  />
                </div>
                <input
                  ref={newItemInputRef}
                  type="text"
                  className="bg-transparent border-none outline-none text-sm text-gray-300 w-full"
                  placeholder={`New ${isCreatingNew.type}...`}
                  onKeyDown={(e) => handleNewItemKeyDown(e, node.path, isCreatingNew.type)}
                  autoFocus
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderContextMenu = () => {
    if (!contextMenu) return null;

    const menuItems = [
      ...(contextMenu.node.type === 'directory'
        ? [
            {
              label: 'New File',
              icon: 'mdi:file-plus-outline',
              action: () => {
                setIsCreatingNew({ path: contextMenu.node.path, type: 'file' });
                setContextMenu(null);
                if (!expandedFolders.has(contextMenu.node.path)) {
                  handleFolderToggle(contextMenu.node.path);
                }
              },
            },
            {
              label: 'New Folder',
              icon: 'mdi:folder-plus-outline',
              action: () => {
                setIsCreatingNew({ path: contextMenu.node.path, type: 'folder' });
                setContextMenu(null);
                if (!expandedFolders.has(contextMenu.node.path)) {
                  handleFolderToggle(contextMenu.node.path);
                }
              },
            },
          ]
        : []),
      {
        label: 'Add to Chat',
        icon: 'mdi:message-plus-outline',
        action: () => handleAddToChat(contextMenu.node),
        shortcut: '⌘K',
      },
      {
        label: 'Rename',
        icon: 'mdi:pencil-outline',
        action: () => handleRename(contextMenu.node),
      },
      {
        label: 'Delete',
        icon: 'mdi:delete-outline',
        action: () => handleDelete(contextMenu.node),
        className: 'text-red-400 hover:text-red-300',
      },
    ];

    return (
      <FileTreeContextMenu
        open={Boolean(contextMenu.anchorEl)}
        anchorEl={contextMenu.anchorEl}
        menuItems={menuItems}
        onClose={() => setContextMenu(null)}
      />
    );
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (contextMenu && !e.target.closest('.context-menu')) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  // Focus input when creating new item
  useEffect(() => {
    if (isCreatingNew && newItemInputRef.current) {
      newItemInputRef.current.focus();
    }
  }, [isCreatingNew]);

  if (!treeData) {
    return <div className="p-2 text-gray-400">No file tree data available</div>;
  }

  return (
    <div className="h-full overflow-y-auto pb-16">
      {renderTree(treeData)}
      {contextMenu && renderContextMenu()}
    </div>
  );
};

FileTree.propTypes = {
  treeData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['directory', 'file']).isRequired,
    path: PropTypes.string.isRequired,
    children: PropTypes.arrayOf(PropTypes.object),
  }),
  interfaceId: PropTypes.string.isRequired,
  chatIframeRef: PropTypes.object,
};

export default memo(FileTree);
