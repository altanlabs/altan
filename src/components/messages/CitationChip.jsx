import { Icon } from '@iconify/react';
import { Tooltip } from '@mui/material';
import { memo } from 'react';

import { getDomain, getFaviconUrl } from './CitationHoverCard.jsx';

/**
 * Citation Tooltip Content Component
 */
const CitationTooltipContent = ({ citation, excerpt }) => {
  const domain = getDomain(citation.url);
  const faviconUrl = getFaviconUrl(citation.url);

  return (
    <div className="w-[300px]">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-gray-700">
        <div className="w-3 h-3 rounded flex-shrink-0 bg-gray-700 flex items-center justify-center">
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
            className="text-[8px] text-gray-400"
            style={{ display: faviconUrl ? 'none' : 'flex' }}
          />
        </div>
        <span className="text-[10px] font-medium text-gray-300 truncate">
          {domain}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-1">
        {/* Title */}
        {citation.title && (
          <div className="text-[11px] font-medium text-white line-clamp-2 leading-snug">
            {citation.title}
          </div>
        )}

        {/* Cited Text Excerpt */}
        {excerpt && (
          <div className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
            {excerpt}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Citation Chip Component with MUI Tooltip
 */
const CitationChip = memo(({ citation, citationNumber, excerpt }) => {
  const domain = getDomain(citation.url);

  return (
    <Tooltip
      title={<CitationTooltipContent citation={citation} excerpt={excerpt} />}
      arrow
      placement="top"
      enterDelay={200}
      leaveDelay={0}
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'rgb(31 41 55)',
            borderRadius: '8px',
            padding: '8px 10px',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
            maxWidth: 'none',
            '.MuiTooltip-arrow': {
              color: 'rgb(31 41 55)',
            },
          },
        },
      }}
    >
      <a
        href={citation.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded transition-colors no-underline align-middle"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="leading-none">{domain}</span>
        <span className="text-[9px] text-blue-500 dark:text-blue-500 leading-none">[{citationNumber}]</span>
      </a>
    </Tooltip>
  );
});

CitationChip.displayName = 'CitationChip';

export default CitationChip;

