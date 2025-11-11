import { Icon } from '@iconify/react';
import React, { memo, useMemo, useState } from 'react';

/**
 * Get favicon URL for a domain using Google's favicon service
 */
const getFaviconUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
};

/**
 * Extract domain from URL for display
 */
const getDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
};

/**
 * Get path from URL for display
 */
const getPath = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    return '';
  }
};

/**
 * Group sources by domain
 */
const groupByDomain = (sources) => {
  const groups = {};

  sources.forEach((source) => {
    const domain = getDomain(source.url);
    if (!groups[domain]) {
      groups[domain] = {
        domain,
        faviconUrl: getFaviconUrl(source.url),
        sources: [],
      };
    }
    groups[domain].sources.push(source);
  });

  return Object.values(groups);
};

/**
 * Custom renderer for web_search tool
 * Handles both OpenAI and Anthropic web search results
 */
const WebSearchRenderer = memo(({ part }) => {
  const [expandedDomain, setExpandedDomain] = useState(null);
  const [showAllResults, setShowAllResults] = useState(false);

  // Parse the search data
  const searchData = useMemo(() => {
    if (!part) return null;

    try {
      // Get the query from arguments or result
      let query = null;
      if (part.arguments) {
        const args = typeof part.arguments === 'string' ? JSON.parse(part.arguments) : part.arguments;
        query = args.query;
      }

      // Get query from task_execution.content if not in arguments
      if (!query && part.task_execution?.content?.query) {
        query = part.task_execution.content.query;
      }

      // Get query from result if not found yet
      if (!query && part.result?.query) {
        query = part.result.query;
      }

      // Get sources/results
      let sources = [];

      // Check OpenAI format (result.sources)
      if (part.result?.sources && Array.isArray(part.result.sources)) {
        sources = part.result.sources.map((s) => ({
          url: s.url,
          title: null,
          type: s.type,
        }));
      } else if (Array.isArray(part.result)) {
        // Check Anthropic format (result is array)
        sources = part.result.map((r) => ({
          url: r.url,
          title: r.title || null,
          type: r.type,
        }));
      } else if (part.task_execution?.content?.sources && Array.isArray(part.task_execution.content.sources)) {
        // Check task_execution.content.sources (OpenAI format)
        sources = part.task_execution.content.sources.map((s) => ({
          url: s.url,
          title: null,
          type: s.type,
        }));
      }

      const domainGroups = groupByDomain(sources);

      return {
        query: query || 'Web Search',
        sources,
        domainGroups,
        hasResults: sources.length > 0,
      };
    } catch {
      return null;
    }
  }, [part]);

  const isExecuting = !part?.is_done;

  // Show max 5 domain avatars
  const visibleDomains = searchData?.domainGroups?.slice(0, 5) || [];
  const hiddenCount = Math.max(0, (searchData?.domainGroups?.length || 0) - 5);

  // Handle row click (not avatar click)
  const handleRowClick = () => {
    if (searchData.hasResults) {
      setShowAllResults(!showAllResults);
      setExpandedDomain(null); // Close domain view when showing all
    }
  };

  // Handle avatar click
  const handleAvatarClick = (e, domain) => {
    e.stopPropagation(); // Prevent row click
    setExpandedDomain(expandedDomain === domain ? null : domain);
    setShowAllResults(false); // Close all results when showing domain
  };

  // Don't render anything if there's no search data
  if (!searchData) {
    return null;
  }

  return (
    <div className="w-full px-2 py-1.5">
      {/* Query + Domain Avatars Row */}
      <div className="w-full flex items-center gap-2">
        {/* Search Icon + Query - Clickable to show all results */}
        <button
          onClick={handleRowClick}
          disabled={!searchData.hasResults}
          className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity disabled:cursor-default disabled:opacity-100"
        >
          <Icon
            icon="mdi:magnify"
            className="text-gray-400 dark:text-gray-600 text-xs flex-shrink-0"
          />
          <span className="text-[11px] text-gray-600 dark:text-gray-400 truncate flex-1 min-w-0">
            {searchData.query}
          </span>

          {/* Source count */}
          {searchData.hasResults && (
            <span className="text-[10px] text-gray-400 dark:text-gray-600 flex-shrink-0">
              {searchData.sources.length}
            </span>
          )}
        </button>

        {/* Domain Avatar Stack */}
        {searchData.hasResults && (
          <div className="flex items-center -space-x-1.5">
            {visibleDomains.map((group, idx) => (
              <button
                key={group.domain}
                onClick={(e) => handleAvatarClick(e, group.domain)}
                className="relative group/avatar"
                title={group.domain}
                type="button"
              >
                <div
                  className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center hover:scale-110 hover:z-10 transition-transform cursor-pointer"
                  style={{ zIndex: visibleDomains.length - idx }}
                >
                  {group.faviconUrl ? (
                    <img
                      src={group.faviconUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <Icon
                    icon="mdi:web"
                    className="text-[10px] text-gray-400"
                    style={{ display: group.faviconUrl ? 'none' : 'flex' }}
                  />
                </div>
                {/* Source count badge */}
                {group.sources.length > 1 && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-600 border border-white dark:border-gray-900 flex items-center justify-center">
                    <span className="text-[8px] text-white font-medium">{group.sources.length}</span>
                  </div>
                )}
              </button>
            ))}

            {/* +N More */}
            {hiddenCount > 0 && (
              <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                <span className="text-[8px] text-gray-600 dark:text-gray-400 font-medium">+{hiddenCount}</span>
              </div>
            )}
          </div>
        )}

        {/* Loading Spinner */}
        {isExecuting && (
          <Icon icon="svg-spinners:ring-resize" className="text-gray-400 dark:text-gray-600 text-xs flex-shrink-0" />
        )}
      </div>

      {/* All Results View - Flat List (Row Click) */}
      {showAllResults && searchData.sources && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800 space-y-1">
          {searchData.sources.map((source, idx) => {
            const domain = getDomain(source.url);
            const faviconUrl = getFaviconUrl(source.url);

            return (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 px-1.5 py-1.5 -mx-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
              >
                {/* Favicon */}
                <div className="w-4 h-4 rounded overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {faviconUrl ? (
                    <img
                      src={faviconUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <Icon
                    icon="mdi:web"
                    className="text-[10px] text-gray-400"
                    style={{ display: faviconUrl ? 'none' : 'flex' }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {source.title ? (
                    <>
                      <div className="text-[11px] text-gray-700 dark:text-gray-300 truncate group-hover:text-gray-900 dark:group-hover:text-gray-100">
                        {source.title}
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-600 truncate mt-0.5">
                        {domain}
                      </div>
                    </>
                  ) : (
                    <div className="text-[11px] text-gray-600 dark:text-gray-400 truncate group-hover:text-gray-900 dark:group-hover:text-gray-200">
                      {domain}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <Icon
                  icon="mdi:arrow-top-right"
                  className="text-gray-300 dark:text-gray-700 text-xs flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </a>
            );
          })}
        </div>
      )}

      {/* Expanded Domain Details (Avatar Click) */}
      {expandedDomain && searchData.domainGroups && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
          {searchData.domainGroups
            .filter((g) => g.domain === expandedDomain)
            .map((group) => (
              <div key={group.domain} className="space-y-1">
                {/* Domain Header */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-4 h-4 rounded overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {group.faviconUrl ? (
                      <img src={group.faviconUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Icon icon="mdi:web" className="text-[10px] text-gray-400" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                    {group.domain}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-600">
                    {group.sources.length} {group.sources.length === 1 ? 'result' : 'results'}
                  </span>
                </div>

                {/* URLs from this domain */}
                <div className="space-y-0.5 pl-6">
                  {group.sources.map((source, idx) => {
                    const path = getPath(source.url);
                    return (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-1.5 py-0.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <Icon
                          icon="mdi:chevron-right"
                          className="text-gray-300 dark:text-gray-700 text-xs flex-shrink-0 mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          {source.title ? (
                            <>
                              <div className="text-[11px] text-gray-700 dark:text-gray-300 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {source.title}
                              </div>
                              <div className="text-[9px] text-gray-400 dark:text-gray-600 truncate font-mono">
                                {path}
                              </div>
                            </>
                          ) : (
                            <div className="text-[11px] text-gray-600 dark:text-gray-400 truncate font-mono group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {path}
                            </div>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Loading State */}
      {isExecuting && !searchData.hasResults && (
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-600 mt-1">
          <Icon icon="svg-spinners:pulse-rings-2" className="text-xs" />
          <span className="text-[11px]">Searching...</span>
        </div>
      )}
    </div>
  );
});

WebSearchRenderer.displayName = 'WebSearchRenderer';

export default WebSearchRenderer;
