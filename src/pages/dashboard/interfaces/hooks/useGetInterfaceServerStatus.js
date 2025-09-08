import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// import usePageVisibility from '@hooks/usePageVisibility.ts';

import { optimai } from '../../../../utils/axios';

/**
 * Custom hook to manage the status and starting of a dev server.
 *
 * @param {string} interfaceId - The id of the interface.
 * @param {boolean} isDev - Whether the dev mode is enabled.
 * @returns {Object} status and isStarting flag.
 */
const useGetInterfaceServerStatus = (interfaceId, isDev) => {
  const [status, setStatus] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [intervalTime, setIntervalTime] = useState(60 * 1000); // Default polling: 1 min

  const intervalRef = useRef(null);
  const prevStatusRef = useRef(null);
  const isStartingRef = useRef(false); // Avoid multiple start requests

  // const isPollingActive = useMemo(() => isDev && isPageVisible, [isDev, isPageVisible]);
  const isPollingActive = useMemo(() => isDev, [isDev]);

  /**
   * Pings the backend for server status.
   */
  const pingBackend = useCallback(async () => {
    // if (!interfaceId || !isPollingActive) return;
    if (!interfaceId || !isDev) return;

    try {
      const { data } = await optimai.get(`/interfaces/dev/${interfaceId}/status`);
      setStatus(data.status);
      prevStatusRef.current = data.status;

      // Adjust polling interval and starting flags based on status.
      if (data.status === 'running') {
        setIsStarting(false);
        isStartingRef.current = false;
        setIntervalTime(30 * 1000); // faster polling if running
      } else if (data.status === 'server_error') {
        setIntervalTime(10 * 1000); // poll more frequently on error
      }
    } catch {
      // console.error('Error pinging backend:', error);
      setStatus('server_error');
      setIntervalTime(10 * 1000);
    }
  }, [interfaceId, isDev]);

  /**
   * Starts the dev server if not already running or starting.
   */
  const startDevServer = useCallback(async () => {
    if (status === 'running' || isStartingRef.current || !interfaceId) return;

    isStartingRef.current = true;
    setIsStarting(true);

    try {
      await optimai.post(`/interfaces/dev/${interfaceId}/start`);
      setIntervalTime(2 * 1000); // poll more frequently on starting
    } catch {
      // console.error('Error starting dev server:', error);
      setIsStarting(false);
      isStartingRef.current = false;
    }
  }, [status, interfaceId]);

  /**
   * Sets up polling to periodically ping the backend.
   * Clears and resets the interval when dependencies change.
   */
  useEffect(() => {
    if (!isPollingActive) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    // Immediately ping backend and then set up polling interval.
    pingBackend();
    clearInterval(intervalRef.current); // Clear any existing interval
    intervalRef.current = setInterval(pingBackend, intervalTime);

    // Cleanup interval on unmount or if dependencies change.
    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isPollingActive, intervalTime, pingBackend]);

  /**
   * Effect to automatically start the dev server when the status indicates
   * a transition that suggests it should be started.
   */
  useEffect(() => {
    // For example, if the previous status was 'stopped' and remains 'stopped',
    // we trigger starting the server if polling is active.
    if (prevStatusRef.current === 'stopped' && status === 'stopped' && isPollingActive) {
      startDevServer();
    }
  }, [status, isPollingActive, startDevServer]);

  return { status, isStarting };
};

export default useGetInterfaceServerStatus;
