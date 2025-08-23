import { useTheme, alpha } from '@mui/material/styles';
import React, { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw'; // Re-enabled for suggestion components
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
// import sanitizeHtml from 'sanitize-html';

import { cn } from '@lib/utils';

import { ComponentTarget } from '../../components/editor/nodes/ComponentTargetNode.tsx';
import { useDebounce } from '../../hooks/useDebounce';
import { makeSelectMessageContent, sendMessage } from '../../redux/slices/room';
import { useSelector, dispatch } from '../../redux/store.js';
import StripeConnect from '../../sections/@dashboard/user/account/AccountStripeSetup.jsx';
import CodeBlock from '../CodeBlock.jsx';
import MermaidDiagram from '../MermaidDiagram.jsx';
import MentionComponent from '../room/members/MentionComponent.tsx';
import AuthorizationWidget from '../widgets/AuthorizationWidget.jsx';
import CommitWidget from '../widgets/components/CommitWidget.jsx';
import DatabaseVersionWidget from '../widgets/components/DatabaseVersionWidget.jsx';
import MediaWidget from '../widgets/components/MediaWidget.jsx';
import NoCredits from '../widgets/components/NoCredits.jsx';
import VersionWidget from '../widgets/components/VersionWidget.jsx';

const isComponentTarget = (href) => /\[selected_component\]\(.*\)/.test(href);

// YouTube URL detection and processing
const isYouTubeUrl = (url) => {
  const youtubePattern =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  return youtubePattern.test(url);
};

const extractYouTubeVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
    /youtube\.com\/watch\?v=([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

// Custom Iframe Component with header and controls
const CustomIframe = ({ src, title = 'Embedded content', style, ...props }) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const iframeRef = React.useRef(null);
  const containerRef = React.useRef(null);

  // Extract domain from URL for display
  const getDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const handleOpenInNewTab = () => {
    window.open(src, '_blank', 'noopener,noreferrer');
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current?.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current?.mozRequestFullScreen) {
        containerRef.current.mozRequestFullScreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Check if custom height is provided
  const hasCustomHeight = !!(style?.height || props.height);
  const customHeight = hasCustomHeight ? style?.height || props.height : null;

  return (
    <>
      {/* Add styles for fullscreen mode */}
      {isFullscreen && (
        <style>
          {`
            body { overflow: hidden; }
            :fullscreen { 
              width: 100vw !important; 
              height: 100vh !important; 
              margin: 0 !important;
              padding: 0 !important;
            }
            :-webkit-full-screen { 
              width: 100vw !important; 
              height: 100vh !important; 
              margin: 0 !important;
              padding: 0 !important;
            }
            :-moz-full-screen { 
              width: 100vw !important; 
              height: 100vh !important; 
              margin: 0 !important;
              padding: 0 !important;
            }
            :-ms-fullscreen { 
              width: 100vw !important; 
              height: 100vh !important; 
              margin: 0 !important;
              padding: 0 !important;
            }
          `}
        </style>
      )}
      <div
        ref={containerRef}
        className={`relative w-full mx-auto my-4 rounded-xl overflow-hidden shadow-lg border border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm ${
          isFullscreen
            ? '!fixed !inset-0 !z-50 !m-0 !rounded-none !h-screen !w-screen !border-none !shadow-none'
            : ''
        }`}
        style={
          isFullscreen
            ? {
                width: '100vw',
                height: '100vh',
                margin: 0,
                padding: 0,
                borderRadius: 0,
                background: '#000',
              }
            : {}
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
          {/* URL Display */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <svg
              className="w-3 h-3 text-gray-500 dark:text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <span className="text-xs text-gray-600 dark:text-gray-300 truncate font-mono">
              {getDomain(src)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleOpenInNewTab}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
              title="Open in new tab"
            >
              <svg
                className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
            <button
              onClick={handleFullscreen}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <svg
                className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isFullscreen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Iframe Content */}
        <div
          className={`relative ${isFullscreen ? 'h-[calc(100vh-60px)]' : 'h-[250px]'}`}
          style={
            isFullscreen
              ? {}
              : hasCustomHeight
                ? { height: customHeight }
                : { height: '250px', minHeight: '250px', maxHeight: '400px' }
          }
        >
          <iframe
            ref={iframeRef}
            src={src}
            title={title}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            {...props}
          />
        </div>
      </div>
    </>
  );
};

// YouTube Embed Component
const YouTubeEmbed = ({ videoId, title = 'YouTube video' }) => {
  return (
    <CustomIframe
      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
      title={title}
    />
  );
};

// const isTwitterTweetLink = (url) => {
//   const twitterTweetPattern = /(?:twitter\.com|x\.com)\/i\/web\/status\/(\d+)/;
//   return twitterTweetPattern.test(url);
// };

// const extractTweetId = (url) => {
//   const match = url.match(/(?:twitter\.com|x\.com)\/i\/web\/status\/(\d+)/);
//   return match ? match[1] : null;
// };

export function extractMention(message) {
  const pattern = /\[@([^]+)]\(\/member\/([0-9a-fA-F\-]{36})\)/;
  const match = message.match(pattern);

  if (match && match[1] && match[2]) {
    return {
      id: match[2],
      name: match[1],
    };
  }

  return null;
}

// function sanitizeMarkdownDetailsBlocks(markdown) {
//   return markdown.replace(
//     /<details>\s*<summary>\s*View Error\s*<\/summary>\s*({[\s\S]*?})\s*<\/details>/g,
//     (match, jsonBlock) => {
//       // Try to pretty-print JSON if valid
//       let prettyJson = jsonBlock;
//       try {
//         prettyJson = JSON.stringify(eval(`(${jsonBlock})`), null, 2);
//       } catch (e) {
//         // leave as-is if it's not valid JSON
//       }

//       return `<details>\n<summary>View Error</summary>\n\n\`\`\`json\n${prettyJson}\n\`\`\`\n\n</details>`;
//     },
//   );
// }

function parseDetailsFromText(input) {
  const match = input.match(/\(([^:@\s]+)(?::([^@\s]+))? @ ([^:]+):(\d+):(\d+)\)/);

  if (!match) {
    throw new Error('Invalid input format');
  }

  const [, elementName, type, file, line, column] = match;

  return {
    elementName,
    type: type || null,
    file,
    line: parseInt(line, 10),
    column: parseInt(column, 10),
  };
}

function extractResources(message) {
  // Updated pattern to handle resource paths without requiring UUID
  const pattern = /\[(.*?)\]\((?:\/)?([^/]+)(?:\/([^/)]+))?\)/g;
  let match;
  const resources = [];

  while ((match = pattern.exec(message))) {
    const [, name, resourceType, resourceId] = match;
    if (name && resourceType) {
      resources.push({
        id: resourceId || resourceType, // Use resourceId if available, otherwise use resourceType
        name: name,
        resourceName: resourceType,
      });
    }
  }
  return resources;
}

const CustomLink = ({ href, children, threadId }) => {
  // Check for YouTube URLs first
  if (isYouTubeUrl(href)) {
    const videoId = extractYouTubeVideoId(href);
    if (videoId) {
      return (
        <YouTubeEmbed
          videoId={videoId}
          title="YouTube Video"
        />
      );
    }
  }

  // Construct a markdown-style message from children and href
  const message = Array.isArray(children)
    ? `[${children.join('')}](${href})`
    : `[${children}](${href})`;
  // Check for mentions and resources first.
  const mention = extractMention(message);
  const resources = extractResources(message);
  if (mention !== null) {
    return (
      <MentionComponent
        mentionName={mention.name}
        mentionId={mention.id}
      />
    );
  }
  if (resources.length > 0) {
    return resources.map((resource) => {
      switch (resource.resourceName.toLowerCase()) {
        case 'media':
          return (
            <MediaWidget
              key={resource.id}
              id={resource.id}
            />
          );
        case 'database-version':
          return (
            <DatabaseVersionWidget
              key={resource.id}
              id={resource.id}
            />
          );
        case 'authorize':
          return (
            <AuthorizationWidget
              key={resource.id}
              connectionTypeId={resource.id}
              threadId={threadId}
            />
          );
        case 'version':
          return (
            <VersionWidget
              key={resource.id}
              id={resource.id}
            />
          );
        case 'commit':
          return (
            <CommitWidget
              key={resource.id}
              hash={resource.id}
            />
          );
        case 'no_credits':
          return <NoCredits key={resource.id} />;
        case 'project':
        case 'app':
          return (
            <span
              key={resource.id}
              className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-sm"
            >
              {resource.name}
            </span>
          );
        case 'workflow':
        case 'flow':
        case 'database':
        case 'base':
          const urlMap = {
            workflow: 'workflow',
            flow: 'workflow',
            database: 'database',
            base: 'database',
          };

          const resourceType = urlMap[resource.resourceName.toLowerCase()];
          const baseUrl = `https://www.altan.ai/${resourceType}`;

          return (
            <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
              <iframe
                src={`${baseUrl}/${resource.id}?hideChat=true&hideHeader=true`}
                className="w-full h-full"
                title={`${resourceType} Preview`}
                allow="fullscreen"
              />
              <a
                href={`${baseUrl}/${resource.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 right-3 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200"
                title="Open in new tab"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line
                    x1="10"
                    y1="14"
                    x2="21"
                    y2="3"
                  />
                </svg>
              </a>
            </div>
          );
        default:
          return (
            <span
              key={resource.id}
              className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm"
            >
              {resource.name}
            </span>
          );
      }
    });
  }

  if (isComponentTarget(href)) {
    const details = parseDetailsFromText(href);
    return <ComponentTarget details={details} />;
  }

  // If the text of the link is exactly the URL, render a native <a> tag.
  const textContent = Array.isArray(children) ? children.join('') : children;
  if (textContent && typeof textContent === 'string' && textContent.trim() === href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="nofollow noreferrer"
      >
        {children}
      </a>
    );
  }

  // Fallback: render a regular link
  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow noreferrer"
      className="text-blue-600 hover:text-blue-800 underline"
    >
      {children}
    </a>
  );
};

const useMessageContent = (messageId) => {
  const messageContentSelector = useMemo(makeSelectMessageContent, []);
  const messageContent = useSelector((state) => messageContentSelector(state, messageId));
  return useDebounce(messageContent, 100);
};

// Error boundary to catch rendering errors and display the problematic content
class MarkdownErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // Markdown rendering error logged to browser console
  }

  render() {
    const { hasError, error } = this.state;
    const { content } = this.props;

    if (hasError) {
      return (
        <div className="bg-red-100 text-red-800 p-4 rounded">
          <strong>Markdown Error:</strong>
          <p>{error?.message}</p>
          <details className="mt-2 p-2 bg-white text-sm rounded">
            <summary className="cursor-pointer font-semibold">Show content causing error</summary>
            <pre className="whitespace-pre-wrap break-all">{content}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Suggestion Button Component
const SuggestionButton = ({ children, threadId }) => {
  const theme = useTheme();
  const handleClick = () => {
    // Extract text content from children (could be array or string)
    let textContent = '';

    try {
      if (typeof children === 'string') {
        textContent = children.trim();
      } else if (typeof children === 'number') {
        textContent = String(children).trim();
      } else if (Array.isArray(children)) {
        // Handle array of children - filter out non-string elements
        textContent = children
          .filter((child) => typeof child === 'string' || typeof child === 'number')
          .join('')
          .trim();
      } else if (
        children &&
        typeof children === 'object' &&
        children.props &&
        children.props.children
      ) {
        // Handle React element with text content
        textContent = String(children.props.children || '').trim();
      } else {
        textContent = String(children || '').trim();
      }
    } catch {
      // Error extracting text content from children
      textContent = '';
    }

    if (threadId && textContent) {
      dispatch(
        sendMessage({
          content: textContent,
          threadId,
        }),
      );
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
      style={{
        backgroundColor: alpha(theme.palette.grey[500], 0.08),
        color: theme.palette.text.primary,
        border: 'none',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: alpha(theme.palette.grey[500], 0.16),
        },
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = alpha(theme.palette.grey[500], 0.16);
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = alpha(theme.palette.grey[500], 0.08);
      }}
    >
      {children}
    </button>
  );
};

// Suggestion Group Component - for compact grouped suggestions
const SuggestionGroup = ({ children }) => {
  return (
    <div className="my-2 p-2.5 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/30 dark:to-slate-900/30 border border-gray-200 dark:border-gray-700 rounded-xl">
      <div className="flex items-center gap-2 mb-1.5">
        <svg
          className="w-4 h-4 text-gray-600 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Next steps</span>
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
};

const CustomMarkdown = ({
  text = null,
  messageId = null,
  threadId = null,
  codeActive = true,
  minified = false,
  noWrap = false,
  center = false,
}) => {
  const messageContent = useMessageContent(messageId);
  const content = messageContent || text;

  if (!content?.length && !messageId) {
    return null;
  }

  return (
    <div
      className={cn(
        'markdown font-light text-slate-800 dark:text-slate-100 leading-relaxed w-full prose prose-slate dark:prose-invert max-w-none pb-0',
        center && 'text-center',
        noWrap && 'overflow-hidden whitespace-nowrap',
        minified && 'text-sm prose-sm',
      )}
      style={{
        '--tw-prose-body': 'rgb(51 65 85)',
        '--tw-prose-headings': 'rgb(15 23 42)',
        '--tw-prose-links': 'rgb(59 130 246)',
        '--tw-prose-bold': 'rgb(15 23 42)',
        '--tw-prose-counters': 'rgb(107 114 128)',
        '--tw-prose-bullets': 'rgb(107 114 128)',
        '--tw-prose-hr': 'rgb(226 232 240)',
        '--tw-prose-quotes': 'rgb(71 85 105)',
        '--tw-prose-quote-borders': 'rgb(226 232 240)',
        '--tw-prose-captions': 'rgb(107 114 128)',
        '--tw-prose-code': 'rgb(51 65 85)',
        '--tw-prose-pre-code': 'rgb(226 232 240)',
        '--tw-prose-pre-bg': 'rgb(51 65 85)',
        '--tw-prose-th-borders': 'rgb(226 232 240)',
        '--tw-prose-td-borders': 'rgb(226 232 240)',
        '--tw-prose-invert-body': 'rgb(203 213 225)',
        '--tw-prose-invert-headings': 'rgb(248 250 252)',
        '--tw-prose-invert-links': 'rgb(96 165 250)',
        '--tw-prose-invert-bold': 'rgb(248 250 252)',
        '--tw-prose-invert-counters': 'rgb(148 163 184)',
        '--tw-prose-invert-bullets': 'rgb(148 163 184)',
        '--tw-prose-invert-hr': 'rgb(51 65 85)',
        '--tw-prose-invert-quotes': 'rgb(148 163 184)',
        '--tw-prose-invert-quote-borders': 'rgb(51 65 85)',
        '--tw-prose-invert-captions': 'rgb(148 163 184)',
        '--tw-prose-invert-code': 'rgb(226 232 240)',
        '--tw-prose-invert-pre-code': 'rgb(226 232 240)',
        '--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
        '--tw-prose-invert-th-borders': 'rgb(51 65 85)',
        '--tw-prose-invert-td-borders': 'rgb(51 65 85)',
      }}
    >
      <MarkdownErrorBoundary content={content}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[
            rehypeKatex,
            rehypeRaw, // Re-enabled for suggestion components
            [rehypeExternalLinks, { target: '_blank', rel: ['nofollow'] }],
          ]}
          components={{
            // Enhanced headings with better hierarchy - ultra compact
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3 mt-4 pb-1.5 border-b-2 border-gradient-to-r from-blue-500 to-purple-500 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-2 mt-4 pb-1 border-b border-slate-200 dark:border-slate-700">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-2 mt-3">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1.5 mt-3">
                {children}
              </h4>
            ),
            h5: ({ children }) => (
              <h5 className="text-base font-medium text-slate-700 dark:text-slate-300 mb-1.5 mt-2.5">
                {children}
              </h5>
            ),
            h6: ({ children }) => (
              <h6 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 mt-2.5 uppercase tracking-wide">
                {children}
              </h6>
            ),
            // Enhanced blockquotes - ultra compact
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 pr-3 py-1.5 my-3 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/20 dark:to-transparent rounded-r-lg italic text-slate-700 dark:text-slate-300 relative">
                <div className="absolute -left-2 top-1.5 w-4 h-4 bg-blue-500 rounded-full opacity-30"></div>
                {children}
              </blockquote>
            ),
            // Enhanced horizontal rules - ultra compact
            hr: () => (
              <hr className="my-3 border-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
            ),
            // Enhanced tables - ultra compact
            table: ({ children }) => (
              <div className="my-3 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-slate-50 dark:bg-slate-800">{children}</thead>
            ),
            tbody: ({ children }) => (
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                {children}
              </tbody>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150">
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300">{children}</td>
            ),
            // Code blocks
            ...(!!codeActive && {
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                const codeValue = String(children || '').replace(/\n$/, '');

                // Handle mermaid diagrams - ultra compact
                if (!inline && language === 'mermaid') {
                  return (
                    <div className="my-3 rounded-lg overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                      <MermaidDiagram
                        chart={codeValue}
                        className="bg-white dark:bg-slate-900"
                      />
                    </div>
                  );
                }
                return !inline && match ? (
                  <div className="my-3">
                    <CodeBlock
                      language={language}
                      value={codeValue}
                      className={cn(
                        className,
                        'rounded-lg shadow-sm border border-slate-200 dark:border-slate-700',
                      )}
                      {...props}
                    />
                  </div>
                ) : (
                  <code className="bg-slate-100 dark:bg-slate-800 rounded-md text-slate-800 dark:text-slate-200 text-[0.875em] font-mono px-2 py-0.5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                    {(() => {
                      try {
                        if (typeof children === 'string') {
                          return children.trim();
                        } else if (typeof children === 'number') {
                          return String(children).trim();
                        } else if (Array.isArray(children)) {
                          return children.join('').trim();
                        } else {
                          return String(children || '').trim();
                        }
                      } catch {
                        // Error processing inline code children
                        return String(children || '');
                      }
                    })()}
                  </code>
                );
              },
            }),
            // Enhanced paragraph styling - standard spacing
            p: ({ children }) => (
              <p
                className={cn(
                  'mb-1 leading-6 text-slate-700 dark:text-slate-300',
                  noWrap
                    ? 'overflow-hidden text-ellipsis whitespace-nowrap'
                    : 'whitespace-pre-line',
                )}
              >
                {children}
              </p>
            ),
            // Enhanced emphasis and strong text
            em: ({ children }) => (
              <em className="italic text-slate-700 dark:text-slate-300">{children}</em>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-slate-900 dark:text-slate-100">
                {children}
              </strong>
            ),
            // Enhanced list styling - better spacing like ChatGPT
            li: ({ children }) => (
              <li className="mb-1.5 leading-6 text-slate-700 dark:text-slate-300">{children}</li>
            ),
            // Enhanced ordered list - better spacing
            ol: ({ children, ...props }) => (
              <ol
                className="list-decimal ml-5 mb-4 space-y-1"
                {...props}
              >
                {children}
              </ol>
            ),
            // Enhanced unordered list - better spacing
            ul: ({ children, ...props }) => (
              <ul
                className="list-disc ml-5 mb-4 space-y-1"
                {...props}
              >
                {children}
              </ul>
            ),
            // Enhanced links
            a: (props) => {
              const href = props.href;
              if (isYouTubeUrl(href)) {
                const videoId = extractYouTubeVideoId(href);
                if (videoId) {
                  return (
                    <YouTubeEmbed
                      videoId={videoId}
                      title={props.title || 'YouTube Video'}
                    />
                  );
                }
              }
              return (
                <CustomLink
                  {...props}
                  threadId={threadId}
                />
              );
            },
            // Custom suggestion component
            suggestion: ({ children }) => {
              return <SuggestionButton threadId={threadId}>{children}</SuggestionButton>;
            },
            // Custom suggestion group component
            'suggestion-group': ({ children }) => <SuggestionGroup>{children}</SuggestionGroup>,
            // Custom stripe component
            stripe: () => {
              return <StripeConnect />;
            },
            // Custom iframe component
            iframe: ({ src, title, style, ...props }) => {
              // Remove any height-related styles to prevent conflicts
              const { height, ...cleanStyle } = style || {};
              const { height: propsHeight, ...cleanProps } = props;

              return (
                <CustomIframe
                  src={src}
                  title={title}
                  style={cleanStyle}
                  {...cleanProps}
                />
              );
            },
            // Hide component - doesn't render children
            hide: () => {
              return null;
            },
            // Enhanced superscript
            sup: ({ children }) => (
              <sup className="text-xs text-slate-600 dark:text-slate-400">{children}</sup>
            ),
            // Enhanced collapsible sections - ultra compact
            details: ({ children, ...props }) => (
              <details
                className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg my-3 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                {...props}
              >
                {children}
              </details>
            ),
            summary: ({ children, ...props }) => (
              <summary
                className="cursor-pointer font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 select-none"
                {...props}
              >
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="w-4 h-4 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  {children}
                </span>
              </summary>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </MarkdownErrorBoundary>
    </div>
  );
};

export default memo(CustomMarkdown);
