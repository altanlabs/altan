import { useEffect, useRef, useState, useCallback } from 'react';

const useCompactMode = (threshold = 600) => {
  const [isCompact, setIsCompact] = useState(false);
  const toolbarRef = useRef(null);

  const updateCompactMode = useCallback(
    (entry) => {
      const shouldBeCompact = entry.contentRect.width < threshold;
      setIsCompact((prev) => (prev !== shouldBeCompact ? shouldBeCompact : prev));
    },
    [threshold],
  );

  useEffect(() => {
    const toolbarNode = toolbarRef.current;
    if (!toolbarNode) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        updateCompactMode(entry);
      }
    });

    resizeObserver.observe(toolbarNode);

    return () => resizeObserver.disconnect();
  }, [updateCompactMode]);

  return { isCompact, toolbarRef };
};

export default useCompactMode;
