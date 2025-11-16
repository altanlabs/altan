import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useHistory } from 'react-router-dom';

import { useAuthContext } from '../../../auth/useAuthContext.ts';
import { useAnalytics } from '../../../hooks/useAnalytics';

const BottomCommandInput = () => {
  const { isAuthenticated } = useAuthContext();
  const history = useHistory();
  const analytics = useAnalytics();
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const plusMenuRef = useRef(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(120, Math.max(40, textarea.scrollHeight))}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue, adjustTextareaHeight]);

  // Close plus menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target)) {
        setShowPlusMenu(false);
      }
    };

    if (showPlusMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPlusMenu]);

  const handleFocus = () => {
    setIsFocused(true);
    setIsExpanded(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Don't collapse if there's content
    if (!inputValue && files.length === 0) {
      setTimeout(() => {
        if (!document.activeElement?.closest('.command-input-container')) {
          setIsExpanded(false);
        }
      }, 200);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const filePromises = selectedFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            name: file.name,
            url: event.target.result,
            file: file,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then((newFiles) => {
      setFiles([...files, ...newFiles]);
    });
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!inputValue.trim() && files.length === 0) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Create the idea first to get an ID, then redirect to signup
      setLoading(true);
      try {
        const attachments = await Promise.all(
          files.map(async (file) => {
            const fileType = file.file.type;
            const extension = fileType.split('/')[1] || fileType.split('.').pop() || 'bin';
            return {
              file_name: file.name || `file.${extension}`,
              mime_type: fileType,
              file_content: file.url.split(',')[1],
            };
          }),
        );

        const response = await fetch('https://platform-api.altan.ai/idea', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'New Project',
            idea: inputValue,
            icon: 'https://platform-api.altan.ai/media/2262e664-dc6a-4a78-bad5-266d6b836136?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
            attachments,
            is_public: true,
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Track project creation
        if (analytics.trackCreateProject) {
          analytics.trackCreateProject('New Project', 'App', {
            has_attachments: files.length > 0,
            attachment_count: files.length,
            user_authenticated: false,
            prompt_length: inputValue.length,
            creation_source: 'v2_desktop',
          });
        }

        // Redirect to signup with the idea ID
        history.push(`/auth/register?idea=${data.id}`);
      } catch (error) {
        console.error('Error creating idea:', error);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const attachments = await Promise.all(
        files.map(async (file) => {
          const fileType = file.file.type;
          const extension = fileType.split('/')[1] || fileType.split('.').pop() || 'bin';
          return {
            file_name: file.name || `file.${extension}`,
            mime_type: fileType,
            file_content: file.url.split(',')[1],
          };
        }),
      );

      const response = await fetch('https://platform-api.altan.ai/idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Project',
          idea: inputValue,
          icon: 'https://platform-api.altan.ai/media/2262e664-dc6a-4a78-bad5-266d6b836136?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
          attachments,
          is_public: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // Track project creation
      if (analytics.trackCreateProject) {
        analytics.trackCreateProject('New Project', 'App', {
          has_attachments: files.length > 0,
          attachment_count: files.length,
          user_authenticated: true,
          prompt_length: inputValue.length,
          creation_source: 'v2_desktop',
        });
      }

      // Trigger the bubble convergence animation
      history.push(`/v2?idea=${data.id}`);
    } catch (error) {
      console.error('Error creating idea:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleCreate();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-center pb-6 px-4 pointer-events-none">
      <m.div
        className="w-full max-w-3xl pointer-events-auto command-input-container"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Files Preview */}
          <AnimatePresence>
            {files.length > 0 && (
              <m.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-white/10 p-3"
              >
                <div className="flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white/10 dark:bg-white/5 rounded-lg px-3 py-1.5"
                    >
                      <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-gray-900 dark:text-white truncate max-w-[150px]">
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </m.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div className="p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              {/* Plus Menu Button */}
              <div className="relative">
                <button
                  onClick={() => setShowPlusMenu(!showPlusMenu)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mt-1"
                  title="Add attachments"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>

                {/* Plus Menu Dropdown */}
                <AnimatePresence>
                  {showPlusMenu && (
                    <m.div
                      ref={plusMenuRef}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[180px] z-50"
                    >
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowPlusMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white flex items-center gap-3 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        Upload Files
                      </button>
                      <button
                        onClick={() => setShowPlusMenu(false)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white flex items-center gap-3 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        GitHub Repo
                      </button>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 min-w-0">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder={isAuthenticated ? "What would you like to build?" : "Describe your project idea..."}
                  className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none outline-none text-sm sm:text-base leading-relaxed"
                  style={{ minHeight: '40px', maxHeight: '120px' }}
                />
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreate}
                disabled={loading || (!inputValue.trim() && files.length === 0)}
                className="p-2 sm:p-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl mt-1"
                title={loading ? "Creating..." : "Create project"}
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* Hint Text */}
            <AnimatePresence>
              {(isFocused || isExpanded) && (
                <m.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 pl-11"
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span>Press</span>
                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs font-mono">⌘</kbd>
                    <span>+</span>
                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs font-mono">Enter</kbd>
                    <span>to create</span>
                  </p>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </m.div>
    </div>
  );
};

export default memo(BottomCommandInput);

