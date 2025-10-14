import { useTheme, alpha } from '@mui/material/styles';
import { sendMessage } from '../../redux/slices/room';
import { dispatch } from '../../redux/store.js';

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
      className="w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left hover:scale-[1.01] active:scale-[0.99]"
      style={{
        backgroundColor: alpha(theme.palette.grey[500], 0.05),
        color: theme.palette.text.primary,
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = alpha(theme.palette.grey[500], 0.12);
        e.target.style.borderColor = alpha(theme.palette.grey[500], 0.24);
        e.target.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = alpha(theme.palette.grey[500], 0.05);
        e.target.style.borderColor = alpha(theme.palette.grey[500], 0.12);
        e.target.style.transform = 'translateX(0)';
      }}
    >
      {children}
    </button>
  );
};

export default SuggestionButton;

