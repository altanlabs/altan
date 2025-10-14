import { useTheme, alpha } from '@mui/material/styles';

import { cn } from '@lib/utils';

// Question Option Component - individual option within a question group
const QuestionOption = ({ children, value, isSelected, isRecommended, onSelect, groupId }) => {
  const theme = useTheme();

  const handleClick = () => {
    onSelect(groupId, value || (typeof children === 'string' ? children : ''));
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full px-3 py-1.5 rounded-lg text-sm font-medium transition-all text-left',
        'hover:scale-[1.01] active:scale-[0.98] shadow-sm hover:shadow-md',
      )}
      style={{
        backgroundColor: isSelected
          ? alpha(theme.palette.primary.main, 0.12)
          : isRecommended
            ? alpha(theme.palette.success.main, 0.06)
            : 'rgba(255, 255, 255, 0.8)',
        color: theme.palette.text.primary,
        borderColor: isSelected
          ? theme.palette.primary.main
          : isRecommended
            ? alpha(theme.palette.success.main, 0.4)
            : alpha(theme.palette.grey[400], 0.3),
        border: `2px solid ${isSelected ? theme.palette.primary.main : isRecommended ? alpha(theme.palette.success.main, 0.4) : alpha(theme.palette.grey[400], 0.3)}`,
        cursor: 'pointer',
        backdropFilter: 'blur(12px)',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          if (isRecommended) {
            e.currentTarget.style.backgroundColor = alpha(theme.palette.success.main, 0.1);
            e.currentTarget.style.borderColor = alpha(theme.palette.success.main, 0.5);
          } else {
            e.currentTarget.style.backgroundColor = alpha(theme.palette.grey[500], 0.08);
            e.currentTarget.style.borderColor = alpha(theme.palette.grey[500], 0.4);
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          if (isRecommended) {
            e.currentTarget.style.backgroundColor = alpha(theme.palette.success.main, 0.06);
            e.currentTarget.style.borderColor = alpha(theme.palette.success.main, 0.4);
          } else {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            e.currentTarget.style.borderColor = alpha(theme.palette.grey[400], 0.3);
          }
        }
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex-1 leading-snug flex items-center gap-2">
          {children}
          {isRecommended && !isSelected && (
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: alpha(theme.palette.success.main, 0.15),
                color: theme.palette.success.main,
              }}
            >
              Recommended
            </span>
          )}
        </span>
        <div
          className={cn(
            'flex items-center justify-center w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all',
          )}
          style={{
            backgroundColor: isSelected ? theme.palette.primary.main : 'transparent',
            borderColor: isSelected
              ? theme.palette.primary.main
              : alpha(theme.palette.grey[400], 0.4),
          }}
        >
          {isSelected && (
            <svg
              className="w-3.5 h-3.5"
              style={{ color: '#fff' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
};

export default QuestionOption;
