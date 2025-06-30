import { useEffect, useMemo } from "react";

type KeyEventCondition = (event: KeyboardEvent) => boolean;
type KeyEventHandler = () => void;

interface EventMapping {
  type: string;
  condition: KeyEventCondition;
  handler: KeyEventHandler;
}

interface MemoizedMapping {
  up: EventMapping[];
  down: EventMapping[];
}

interface UseKeyShortcutListenerProps {
  eventsMapping: EventMapping[];
  disabled?: boolean;
  debounceTime?: number; // Debounce time in milliseconds
  stopPropagation?: boolean; // Enable stopping propagation
}

function useKeyShortcutListener({
  eventsMapping,
  disabled = false,
  debounceTime = 0, // Default to no debounce
  stopPropagation = false,
}: UseKeyShortcutListenerProps) {
  // const timerRef = useRef<number | null>(null);

  // Memoize the event mappings to prevent unnecessary recomputation.
  const memoizedMappings: MemoizedMapping = useMemo(() => {
    const res: MemoizedMapping = {
      up: [],
      down: []
    };
    if (!Array.isArray(eventsMapping)) {
      console.warn("Invalid eventsMapping: Expected an array of mappings.");
      return res;
    }
    return eventsMapping.reduce((acc, curr) => {
      acc[curr.type ?? 'down'].push(curr);
      return acc;
    }, res);
  }, [eventsMapping]);

  useEffect(() => {
    if (disabled) return;

    const handleKeyEvent = (event: KeyboardEvent, type: string) => {
      if (stopPropagation && event.defaultPrevented) {
        return; // Skip if already handled by a more nested component
      }

      // if (debounceTime > 0) {
      //   if (timerRef.current) {
      //     clearTimeout(timerRef.current);
      //   }
      //   timerRef.current = window.setTimeout(() => executeHandlers(event, type), debounceTime);
      // } else {
        executeHandlers(event, type);
      // }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      handleKeyEvent(event, 'down');
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      handleKeyEvent(event, 'up');
    };


    const executeHandlers = (event: KeyboardEvent, type: string) => {
      for (const { condition, handler } of memoizedMappings[type]) {
        try {
          if (condition(event)) {
            if (stopPropagation) {
              event.preventDefault();
              event.stopPropagation(); // Prevent bubbling up
            } else {
              event.preventDefault();
            }
            handler();
            // break; // Ensure only one handler is executed
          }
        } catch (error) {
          console.error("Error executing handler for event:", error);
        }
      }
    };
    if (memoizedMappings.down.length) {
      window.addEventListener("keydown", handleKeyDown);
    }
    if (memoizedMappings.up.length) {
      window.addEventListener("keyup", handleKeyUp);
    }
    return () => {
      if (memoizedMappings.down.length) {
        window.removeEventListener("keydown", handleKeyDown);
      }
      if (memoizedMappings.up.length) {
        window.removeEventListener("keyup", handleKeyUp);
      }
      // if (timerRef.current) clearTimeout(timerRef.current); // Cleanup timer on unmount
    };
  }, [memoizedMappings, disabled, debounceTime, stopPropagation]); // Dependencies include all config options

  // useEffect(() => {
  //   return () => {
  //     if (timerRef.current) clearTimeout(timerRef.current); // Cleanup timer on unmount
  //   };
  // }, []);
}

export default useKeyShortcutListener;
