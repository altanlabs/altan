import { ArrowRight } from 'lucide-react';
import { sendMessage } from '../../redux/slices/room';
import { dispatch } from '../../redux/store.js';
import { Button } from '../ui/button.tsx';

// Suggestion Button Component
const SuggestionButton = ({ children, threadId }) => {
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
    <Button
      onClick={handleClick}
      variant="outline"
      className="w-full justify-between text-left h-auto py-2.5 px-4 hover:bg-accent hover:translate-x-1 transition-all group"
    >
      <span className="text-sm font-medium flex-1 whitespace-normal break-words">{children}</span>
      <ArrowRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </Button>
  );
};

export default SuggestionButton;

