import { memo, useMemo } from 'react';

import { getDomain, getFaviconUrl } from './CitationHoverCard.jsx';
import CustomMarkdown from './CustomMarkdown.jsx';
import SourcesSection from './SourcesSection.jsx';

/**
 * Group annotations by domain
 */
const groupAnnotationsByDomain = (annotations) => {
  const groups = {};

  annotations.forEach((annotation) => {
    const domain = getDomain(annotation.url);
    if (!groups[domain]) {
      groups[domain] = {
        domain,
        faviconUrl: getFaviconUrl(annotation.url),
        annotations: [],
      };
    }
    groups[domain].annotations.push(annotation);
  });

  return Object.values(groups);
};

/**
 * Process text with inline citation placeholders for rehype-raw
 */
const processTextWithCitations = (text, annotations) => {
  if (!text || !annotations.length) return text;

  let processedText = text;

  // Sort by descending start_index to process from end to start (avoid index shifting)
  const sortedCitations = [...annotations].sort((a, b) => b.start_index - a.start_index);

  sortedCitations.forEach((citation) => {
    const citationIndex = annotations.indexOf(citation);

    // Extract the cited text segment
    const citedText = text.substring(citation.start_index, citation.end_index);
    const cleanCitedText = citedText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Extract the original link text from current position
    const linkText = processedText.substring(citation.start_index, citation.end_index);
    const linkMatch = linkText.match(/\[([^\]]+)\]\(([^)]+)\)/);

    if (linkMatch) {
      // Escape attributes for HTML
      const escapedExcerpt = cleanCitedText.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      const escapedTitle = (citation.title || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      const escapedUrl = citation.url.replace(/"/g, '&quot;');

      // Create citation placeholder that will be handled by CustomMarkdown
      const placeholder = `<citation data-index="${citationIndex}" data-url="${escapedUrl}" data-title="${escapedTitle}" data-excerpt="${escapedExcerpt}"></citation>`;

      processedText =
        processedText.substring(0, citation.start_index) +
        placeholder +
        processedText.substring(citation.end_index);
    }
  });

  return processedText;
};

/**
 * Main Text Part Renderer Component
 */
const TextPartRenderer = memo(({ part, threadId, mode }) => {
  // Extract and group annotations
  const citationData = useMemo(() => {
    const annotations = part?.meta_data?.annotations || [];
    const urlCitations = annotations.filter((a) => a.type === 'url_citation');

    if (urlCitations.length === 0) return null;

    const domainGroups = groupAnnotationsByDomain(urlCitations);

    return {
      annotations: urlCitations,
      domainGroups,
      hasAnnotations: urlCitations.length > 0,
    };
  }, [part?.meta_data?.annotations]);

  // Process text with citation placeholders
  const processedText = useMemo(() => {
    if (!citationData?.hasAnnotations) return part.text;
    return processTextWithCitations(part.text, citationData.annotations);
  }, [part.text, citationData]);

  return (
    <div className="message-part-text">
      {/* Main Content */}
      {part.text && (
        <CustomMarkdown
          text={processedText || part.text}
          threadId={threadId}
          minified={mode === 'mini'}
          citationAnnotations={citationData?.annotations}
        />
      )}

      {/* Citations Sources Section */}
      {citationData?.hasAnnotations && (
        <SourcesSection
          domainGroups={citationData.domainGroups}
          annotations={citationData.annotations}
        />
      )}
    </div>
  );
}, arePropsEqual);

/**
 * Custom comparison function for React.memo
 */
function arePropsEqual(prevProps, nextProps) {
  const prevPart = prevProps.part;
  const nextPart = nextProps.part;

  // If part ID changed, need to re-render
  if (!prevPart || !nextPart || prevPart.id !== nextPart.id) {
    return false;
  }

  // Check if context props changed
  if (prevProps.threadId !== nextProps.threadId || prevProps.mode !== nextProps.mode) {
    return false;
  }

  // For text parts, check both text content and is_done status
  const textChanged =
    prevPart.text !== nextPart.text ||
    (prevPart.text?.length || 0) !== (nextPart.text?.length || 0);
  const statusChanged = prevPart.is_done !== nextPart.is_done;

  // Check if annotations changed
  const annotationsChanged =
    JSON.stringify(prevPart.meta_data?.annotations) !==
    JSON.stringify(nextPart.meta_data?.annotations);

  // Return true only if nothing changed (memo should skip render)
  return !textChanged && !statusChanged && !annotationsChanged;
}

TextPartRenderer.displayName = 'TextPartRenderer';

export default TextPartRenderer;
