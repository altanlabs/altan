import React, { memo, useEffect, useRef, useCallback, useState } from 'react';
// import { openMenu } from './menuSlice';

// Escape HTML to prevent XSS attacks
const escapeHtml = (text) => {
  return text.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#039;';
      default:
        return m;
    }
  });
};

const ChipTextField = ({ fieldKey, title, value, onChange, theme = 'light' }) => {
  const contentRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [contentEmpty, setContentEmpty] = useState(true);

  const placeholderText = `write ${title || fieldKey}...`;

  // Parse initial content to replace {{...}} with chips
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = parseTextToChips(value || '');
    }
  }, [value]);

  // Handle content changes
  const handleInput = useCallback(() => {
    if (onChange) {
      const content = serializeContent(contentRef.current);
      onChange(content);
    }
    checkContentEmpty();
  }, [onChange]);

  // Check if content is empty to manage placeholder visibility
  const checkContentEmpty = () => {
    const isEmpty =
      contentRef.current.textContent.trim() === '' && contentRef.current.children.length === 0;
    setContentEmpty(isEmpty);
  };

  // Listen for menu selection events
  useEffect(() => {
    const handleMenuSelect = (event) => {
      insertChipAtCursor(event.detail.value);
    };
    window.addEventListener('menuSelect', handleMenuSelect);

    return () => {
      window.removeEventListener('menuSelect', handleMenuSelect);
    };
  }, []);

  // Parse text to replace {{...}} with chips
  const parseTextToChips = (text) => {
    const regex = /{{(.*?)}}/g;
    let lastIndex = 0;
    let result = '';
    let match;

    while ((match = regex.exec(text)) !== null) {
      const [fullMatch, innerText] = match;
      result += escapeHtml(text.slice(lastIndex, match.index));
      result += `<span contenteditable="false" data-type="chip" class="mx-1 px-2 py-1 rounded ${
        theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'
      }">${escapeHtml(innerText)}</span>`;
      lastIndex = regex.lastIndex;
    }
    result += escapeHtml(text.slice(lastIndex));
    return result;
  };

  // Serialize content from the contentEditable div back to string
  const serializeContent = (container) => {
    let content = '';
    const childNodes = container.childNodes;
    childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        content += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.getAttribute('data-type') === 'chip') {
          const chipText = node.textContent;
          content += `{{${chipText}}}`;
        } else {
          content += node.textContent;
        }
      }
    });
    return content;
  };

  // Handle focus events
  const handleFocus = () => {
    setIsFocused(true);
    checkContentEmpty();
  };

  // Handle blur events
  const handleBlur = () => {
    setIsFocused(false);
    checkContentEmpty();
  };

  // Handle click events to open the global menu
  const handleClick = () => {
    // dispatch(
    //   openMenu({
    //     mode: 'insert',
    //     context: { fieldKey, title },
    //   })
    // );
    console.log('opening menu');
  };

  // Insert chip at the cursor position
  const insertChipAtCursor = (value) => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);

    // Create the chip element
    const chip = document.createElement('span');
    chip.contentEditable = 'false';
    chip.innerText = value;
    chip.setAttribute('data-type', 'chip');
    chip.className = `mx-1 px-2 py-1 rounded ${
      theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'
    }`;

    // Insert the chip at the cursor position
    range.deleteContents();
    range.insertNode(chip);

    // Move the cursor after the chip
    range.setStartAfter(chip);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    contentRef.current.focus();

    // Trigger onChange
    if (onChange) {
      const content = serializeContent(contentRef.current);
      onChange(content);
    }
    checkContentEmpty();
  };

  useEffect(() => {
    checkContentEmpty();
  }, []);
  // Determine whether to show the placeholder
  const shouldShowPlaceholder = contentEmpty && !isFocused;

  return (
    <div className="relative w-full">
      <div
        contentEditable
        ref={contentRef}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        className="border rounded p-1 w-full min-h-[20px] focus:outline-none dark:bg-black dark:text-white dark:border-gray-600 bg-white text-black border-gray-400 whitespace-pre-wrap break-words"
        aria-label={placeholderText}
      >
      </div>
      {shouldShowPlaceholder && (
        <div
          className="absolute top-0 left-0 p-2 pointer-events-none text-gray-500 italic opacity-70"
          style={{
            fontSize: '0.8rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {placeholderText}
        </div>
      )}
    </div>
  );
};

export default memo(ChipTextField);
