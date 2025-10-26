import { Icon } from '@iconify/react';
import { createPortal } from 'react-dom';

/**
 * Get favicon URL for a domain using Google's favicon service
 */
export const getFaviconUrl = (url) => {
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
export const getDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
};

/**
 * Citation Hover Card Component - Renders in a portal for proper z-index
 */
const CitationHoverCard = ({ citation, position }) => {
  if (!citation) return null;

  const domain = getDomain(citation.url);
  const faviconUrl = getFaviconUrl(citation.url);

  return createPortal(
    <div
      className="fixed z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, calc(-100% - 12px))',
      }}
    >
      {/* Card */}
      <div className="w-[340px] bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
          <div className="w-3.5 h-3.5 rounded overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
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
              className="text-[9px] text-gray-400"
              style={{ display: faviconUrl ? 'none' : 'flex' }}
            />
          </div>
          <span className="text-[10.5px] font-medium text-gray-700 dark:text-gray-300 truncate">
            {domain}
          </span>
        </div>

        {/* Content */}
        <div className="px-3 py-2.5 space-y-1.5">
          {/* Title */}
          {citation.title && (
            <div className="text-[12px] font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
              {citation.title}
            </div>
          )}

          {/* Cited Text Excerpt */}
          {citation.excerpt && (
            <div className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {citation.excerpt}
            </div>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-200 dark:border-t-gray-800" />
    </div>,
    document.body,
  );
};

export default CitationHoverCard;
