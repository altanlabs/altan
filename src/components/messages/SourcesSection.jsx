import { Icon } from '@iconify/react';
import { memo, useState } from 'react';

import { getDomain, getFaviconUrl } from './CitationHoverCard';

/**
 * Individual Citation Item Component
 */
const CitationItem = memo(({ annotation, citationNumber }) => {
  const domain = getDomain(annotation.url);
  const faviconUrl = getFaviconUrl(annotation.url);

  return (
    <a
      href={annotation.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-2 px-1.5 py-1 -mx-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
    >
      {/* Citation Number */}
      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium flex-shrink-0 mt-[3px] min-w-[14px]">
        [{citationNumber}]
      </span>

      {/* Favicon */}
      <div className="w-3 h-3 rounded flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center mt-[3px]">
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
          className="text-[7px] text-gray-400"
          style={{ display: faviconUrl ? 'none' : 'flex' }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-gray-700 dark:text-gray-300 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
          {annotation.title || domain}
        </div>
        {annotation.title && (
          <div className="text-[10px] text-gray-500 dark:text-gray-500 truncate mt-0.5">
            {domain}
          </div>
        )}
      </div>

      {/* Arrow */}
      <Icon
        icon="mdi:arrow-top-right"
        className="text-gray-400 dark:text-gray-600 text-[11px] flex-shrink-0 mt-[3px] opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </a>
  );
});

CitationItem.displayName = 'CitationItem';

/**
 * Domain Group Component
 */
const DomainGroup = memo(({ group, annotations }) => {
  return (
    <div className="space-y-1.5">
      {/* Domain Header */}
      <div className="flex items-center gap-2 mb-2 opacity-70">
        <div className="w-3.5 h-3.5 rounded overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {group.faviconUrl ? (
            <img src={group.faviconUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <Icon icon="mdi:web" className="text-[8px] text-gray-400" />
          )}
        </div>
        <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
          {group.domain}
        </span>
        <span className="text-[9.5px] text-gray-400 dark:text-gray-600">
          {group.annotations.length}
        </span>
      </div>

      {/* Citations from this domain */}
      <div className="space-y-0.5 pl-6">
        {group.annotations.map((annotation, idx) => {
          const citationNumber = annotations.indexOf(annotation) + 1;
          return (
            <a
              key={idx}
              href={annotation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2 py-1 px-1.5 -mx-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-all duration-150"
            >
              <span className="text-[9.5px] text-blue-600 dark:text-blue-400 font-semibold flex-shrink-0 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                {citationNumber}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-gray-700 dark:text-gray-300 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {annotation.title || annotation.url}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
});

DomainGroup.displayName = 'DomainGroup';

/**
 * Sources Section Component
 * Displays all citations with expandable views
 */
const SourcesSection = memo(({ domainGroups, annotations }) => {
  const [expandedDomain, setExpandedDomain] = useState(null);
  const [showAllCitations, setShowAllCitations] = useState(false);

  const visibleDomains = domainGroups.slice(0, 5);
  const hiddenCount = Math.max(0, domainGroups.length - 5);

  const handleRowClick = () => {
    setShowAllCitations(!showAllCitations);
    setExpandedDomain(null);
  };

  const handleAvatarClick = (e, domain) => {
    e.stopPropagation();
    setExpandedDomain(expandedDomain === domain ? null : domain);
    setShowAllCitations(false);
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
      {/* Citation Header Row - Clickable */}
      <button
        onClick={handleRowClick}
        className="w-full flex items-center gap-1.5 text-left group/sources transition-colors flex-wrap mb-2"
      >
        {/* Icon + Label */}
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-500 group-hover/sources:text-gray-700 dark:group-hover/sources:text-gray-300 transition-colors">
          <Icon
            icon="mdi:link-variant"
            className="text-[10px] flex-shrink-0"
          />
          <span className="text-[10px] font-medium">
            Sources
          </span>
        </div>

        {/* Domain Pills */}
        {visibleDomains.map((group) => (
          <button
            key={group.domain}
            onClick={(e) => handleAvatarClick(e, group.domain)}
            className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title={group.domain}
            type="button"
          >
            <span className="font-normal">{group.domain}</span>
            {group.annotations.length > 1 && (
              <span className="text-[9px] text-gray-400 dark:text-gray-600">({group.annotations.length})</span>
            )}
          </button>
        ))}

        {/* +N More */}
        {hiddenCount > 0 && (
          <span className="text-[10px] text-gray-400 dark:text-gray-600">
            +{hiddenCount} more
          </span>
        )}
      </button>

      {/* All Citations View - Numbered List (Row Click) */}
      {showAllCitations && (
        <div className="space-y-0">
          {annotations.map((annotation, idx) => (
            <CitationItem
              key={idx}
              annotation={annotation}
              citationNumber={idx + 1}
            />
          ))}
        </div>
      )}

      {/* Expanded Domain Details (Avatar Click) */}
      {expandedDomain && (
        <div className="mt-2">
          {domainGroups
            .filter((g) => g.domain === expandedDomain)
            .map((group) => (
              <DomainGroup
                key={group.domain}
                group={group}
                annotations={annotations}
              />
            ))}
        </div>
      )}
    </div>
  );
});

SourcesSection.displayName = 'SourcesSection';

export default SourcesSection;
