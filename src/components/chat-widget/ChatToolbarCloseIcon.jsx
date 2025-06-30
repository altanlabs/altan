import React from 'react';

const ChatToolbarCloseIcon = ({ theme }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill={theme === 'light' ? '#363636' : '#fff'}
    viewBox="0 0 32 32"
    width="32"
    height="32"
  >
    <path
      transform="translate(-0.5, -0.5) scale(1.02, 1.02)"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18.3 5.71a.996.996 0 00-1.41 0L12 10.59 7.11 5.7A.996.996 0 105.7 7.11L10.59 12 5.7 16.89a.996.996 0 101.41 1.41L12 13.41l4.89 4.89a.996.996 0 101.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"
    />
  </svg>
);

export default ChatToolbarCloseIcon;
