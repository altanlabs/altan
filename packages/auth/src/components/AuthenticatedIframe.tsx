import React, { useRef, useEffect, memo } from "react";
import { authAxios } from "@/api";

// Define the props for our reusable AuthenticatedIframe component.
export interface AuthenticatedIframeProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  src: string;
  refreshUrl?: string;
  targetOrigin?: string;
  onRefreshError?: (error: any) => void;
}

const AuthenticatedIframe: React.FC<AuthenticatedIframeProps> = ({
  src,
  refreshUrl = "/auth/refresh",
  targetOrigin = "*",
  onRefreshError,
  ...iframeProps
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Flags to prevent duplicate refreshes.
  const isRefreshingRef = useRef<boolean>(false);
  const refreshPromiseRef = useRef<Promise<string> | null>(null);

  // Handle messages coming from the child.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin.
      if (targetOrigin !== "*" && event.origin !== targetOrigin) return;

      const { type } = event.data;
      if (type === "refresh_token") {
        // If a refresh is already in progress, do not initiate another one.
        if (!isRefreshingRef.current) {
          isRefreshingRef.current = true;
          refreshPromiseRef.current = authAxios
            .post(refreshUrl)
            .then((response) => {
              const token = response.data.access_token;
              isRefreshingRef.current = false;
              refreshPromiseRef.current = null;
              return token;
            })
            .catch((error) => {
              isRefreshingRef.current = false;
              refreshPromiseRef.current = null;
              if (onRefreshError) onRefreshError(error);
              return Promise.reject(error);
            });
        }
        // Once the promise resolves, send the new token to the child.
        refreshPromiseRef.current
          ?.then((token: string) => {
            iframeRef.current?.contentWindow?.postMessage(
              { type: "new_access_token", token },
              targetOrigin
            );
          })
          .catch((err) => {
            console.error("Refresh error in ParentCommunicator:", err);
          });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [refreshUrl, onRefreshError, targetOrigin]);

  // Send activation message when the iframe has loaded.
  useEffect(() => {
    const handleIframeLoad = () => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "activate_interface_parenthood" },
        targetOrigin
      );
    };

    const currentIframe = iframeRef.current;
    currentIframe?.addEventListener("load", handleIframeLoad);
    return () => currentIframe?.removeEventListener("load", handleIframeLoad);
  }, [targetOrigin]);

  return <iframe ref={iframeRef} src={src} {...iframeProps} />;
};

export default memo(AuthenticatedIframe);
