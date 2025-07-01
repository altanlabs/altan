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
import CodeBlock from '../CodeBlock.jsx';
import MentionComponent from '../room/members/MentionComponent.tsx';
import CommitWidget from '../widgets/components/CommitWidget.jsx';
import NoCredits from '../widgets/components/NoCredits.jsx';
import VersionWidget from '../widgets/components/VersionWidget.jsx';

const isComponentTarget = (href) => /\[selected_component\]\(.*\)/.test(href);

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

const CustomLink = ({ href, children }) => {
  // Construct a markdown-style message from children and href
  const message = Array.isArray(children)
    ? `[${children.join('')}](${href})`
    : `[${children}](${href})`;
  // Check for mentions and resources first.
  const mention = extractMention(message);
  const resources = extractResources(message);
  if (mention !== null) {
    return (
      <MentionComponent mentionName={mention.name} mentionId={mention.id} />
    );
  }
  if (resources.length > 0) {
    return resources.map((resource) => {
      switch (resource.resourceName.toLowerCase()) {
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
    return (
      <ComponentTarget details={details} />
    );
  }

  // If the text of the link is exactly the URL, render a native <a> tag.
  const textContent = Array.isArray(children) ? children.join('') : children;
  if (textContent.trim() === href) {
    return (
      <a href={href} target="_blank" rel="nofollow noreferrer">
        {children}
      </a>
    );
  }

  // Fallback: render a regular link
  return (
    <a href={href} target="_blank" rel="nofollow noreferrer" className="text-blue-600 hover:text-blue-800 underline">
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

  componentDidCatch(error, info) {
    console.error('Markdown rendering error:', error, info);
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
  const handleClick = () => {
    // Extract text content from children (could be array or string)
    const textContent = Array.isArray(children)
      ? children.join('').trim()
      : (children || '').toString().trim();
    if (threadId && textContent) {
      dispatch(sendMessage({
        content: textContent,
        threadId,
      }));
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-3 py-1.5 rounded-full text-sm font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
    >
      {children}
    </button>
  );
};

// Suggestion Group Component - for compact grouped suggestions
const SuggestionGroup = ({ children }) => {
  return (
    <div className="my-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/30 dark:to-slate-900/30 border border-gray-200 dark:border-gray-700 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
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
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Suggestions
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {children}
      </div>
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
        'markdown font-light text-black dark:text-white leading-relaxed w-full',
        center && 'text-center',
        noWrap && 'overflow-hidden whitespace-nowrap',
        minified && 'text-sm',
      )}
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
            // Code blocks
            ...!!codeActive && {
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <CodeBlock
                    language={match[1]}
                    value={String(children).replace(/\n$/, '')}
                    className={className}
                    {...props}
                  />
                ) : (
                  <code className="  bg-gray-100 dark:bg-[#3E3E3E] rounded-md text-gray-800 dark:text-gray-200 text-[0.875em] font-normal px-1.5 py-0.5">
                    {String(children).trim()}
                  </code>
                );
              },
            },
            // Paragraph styling
            p: ({ children }) => (
              <p
                className={cn(
                  ' ',
                  noWrap ? 'overflow-hidden text-ellipsis whitespace-nowrap' : 'whitespace-pre-line',
                )}
              >
                {children}
              </p>
            ),
            // Bold text
            strong: ({ children }) => (
              <strong className="font-bold">{children}</strong>
            ),
            // List items
            li: ({ children }) => (
              <li className="list-outside   relative">{children}</li>
            ),
            // Ordered list with proper numbering and margin
            ol: ({ children, ...props }) => (
              <ol className="list-decimal ml-6" {...props}>
                {children}
              </ol>
            ),
            // Unordered list with proper bullet style and margin
            ul: ({ children, ...props }) => (
              <ul className="list-disc ml-6" {...props}>
                {children}
              </ul>
            ),
            // Custom Link (assumes CustomLink is defined/imported)
            a: CustomLink,
            // Custom suggestion component
            suggestion: ({ children }) => {
              return (
                <SuggestionButton threadId={threadId}>
                  {children}
                </SuggestionButton>
              );
            },
            // Custom suggestion group component
            'suggestion-group': ({ children }) => (
              <SuggestionGroup>
                {children}
              </SuggestionGroup>
            ),
            // Superscript
            sup: ({ children }) => <sup>{children}</sup>,
            // Collapsible sections
            details: ({ children, ...props }) => {
              // console.log('details props', props);
              return (
                <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded my-2" {...props}>
                  {children}
                </details>
              );
            },
            summary: ({ children, ...props }) => {
              // console.log('summary props', props);
              return (
                <summary className="cursor-pointer font-semibold" {...props}>
                  {children}
                </summary>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </MarkdownErrorBoundary>
    </div>
  );
};

export default memo(CustomMarkdown);
