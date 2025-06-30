import React, { useEffect } from 'react';

const CalendlyButton = ({ calendly_link, call_to_action }) => {
  const buttonStyle = {
    background: '#6989E9',
    color: 'white',
    padding: '10px 20px 10px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (typeof window !== 'undefined' && window.Calendly) {
        window.Calendly.closePopupWidget();
      }
    };
  }, []);

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.Calendly) {
      window.Calendly.initPopupWidget({ url: calendly_link });
    }
  };

  return (
    <>
      <style>
        {`
        @import url('https://assets.calendly.com/assets/external/widget.css');

        .calendly-overlay {
          top: 10px !important;
          bottom: auto !important;
        }
        .calendly-overlay .calendly-close-overlay {
          position: fixed;
        }

        .jWSwi_R_Xl7kPjUhuQoo {
          display: none;
        }
      `}
      </style>
      <button
        onClick={handleClick}
        style={buttonStyle}
      >
        {call_to_action}
      </button>
    </>
  );
};

export { CalendlyButton };
