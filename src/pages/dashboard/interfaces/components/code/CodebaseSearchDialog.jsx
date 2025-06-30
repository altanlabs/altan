import PropTypes from 'prop-types';
import { useState, useCallback, useEffect, memo } from 'react';

import Iconify from '../../../../../components/iconify';
import { useDebounce } from '../../../../../hooks/useDebounce';
import { openFile as openFileThunk } from '../../../../../redux/slices/codeEditor';
import { dispatch } from '../../../../../redux/store';
import { optimai } from '../../../../../utils/axios';

const CodebaseSearchDialog = ({ open, onClose, interfaceId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Handle result click
  const handleResultClick = (result) => {
    dispatch(openFileThunk(result.file, interfaceId));
    onClose();
  };

  // Debounced search function
  const searchCodebase = useCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await optimai.post(`/interfaces/dev/${interfaceId}/files/search`, {
          query: query,
          use_regex: false,
          case_sensitive: false,
          file_patterns: ['*.*'],
          include_line_context: true,
        });

        // Transform the results to match our UI structure
        const transformedResults = response.data.results.flatMap((fileResult) => {
          // Remove /repos/{repo_name} from the file path
          const relativePath = fileResult.file_path.split('/').slice(3).join('/');
          return fileResult.matches.map((match) => ({
            file: relativePath,
            line: match.line_number,
            line_context: match.line_text,
            match_text: match.match_text,
          }));
        });

        setSearchResults(transformedResults);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [interfaceId],
  );

  // Handle search input changes
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (event.key === 'Enter' && selectedIndex >= 0) {
      handleResultClick(searchResults[selectedIndex]);
    } else if (event.key === 'Escape') {
      onClose();
    }
  };

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedIndex(-1);
    }
  }, [open]);

  useEffect(() => {
    if (!!debouncedSearchQuery?.trim()?.length && searchQuery.trim().length) {
      searchCodebase(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl transform rounded-xl bg-gray-100 dark:bg-[#1e1e1e] shadow-2xl ring-1 ring-white/10 transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <Iconify
                icon="mdi:magnify"
                className="text-xl text-blue-400"
              />
              <h2 className="text-base font-semibold text-black dark:text-white">
                Search Codebase
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-black dark:hover:text-white"
            >
              <Iconify
                icon="mdi:close"
                className="h-5 w-5"
              />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="Search for files or content..."
                className="w-full rounded-lg bg-gray-100 dark:bg-[#2d2d2d] px-4 py-2.5 text-black dark:text-white placeholder-gray-400 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500/50"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                </div>
              )}
            </div>

            {/* Results List */}
            <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-lg bg-white ring-1 ring-black/10 dark:bg-[#2d2d2d] dark:ring-white/10">
              {searchResults.map((result, index) => (
                <div
                  key={`${result.file}-${result.line}`}
                  onClick={() => handleResultClick(result)}
                  className={`cursor-pointer border-b border-black/5 p-3 last:border-0 hover:bg-black/5 dark:border-white/5 dark:hover:bg-white/5 ${
                    index === selectedIndex ? 'bg-blue-500/10 dark:bg-blue-500/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Iconify
                      icon="mdi:file-document-outline"
                      className="h-5 w-5 text-blue-600 dark:text-blue-400"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm text-black dark:text-white">
                          {result.file}
                        </span>
                        <span className="shrink-0 rounded bg-black/10 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-white/10 dark:text-gray-300">
                          Line {result.line}
                        </span>
                      </div>
                      {result.line_context && (
                        <div className="mt-1 overflow-x-auto font-mono text-xs text-gray-500 dark:text-gray-400">
                          {result.line_context}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {searchResults.length === 0 && searchQuery.trim() !== '' && !isLoading && (
                <div className="flex items-center justify-center gap-2 p-8 text-gray-500 dark:text-gray-400">
                  <Iconify
                    icon="mdi:magnify"
                    className="h-5 w-5"
                  />
                  <span>No results found</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CodebaseSearchDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  interfaceId: PropTypes.string.isRequired,
};

export default memo(CodebaseSearchDialog);
