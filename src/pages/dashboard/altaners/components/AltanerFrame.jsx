import { memo } from 'react';

const AltanerFrame = ({ url, title = null }) => {
  return (
    <iframe
      title={title ?? `iframe-${url}`}
      src={url}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
      }}
    />
  );
};

export default memo(AltanerFrame);
