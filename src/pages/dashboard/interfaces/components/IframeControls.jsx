import { Tooltip } from '@mui/material';
import { m } from 'framer-motion';
import { truncate } from 'lodash';
import { useSnackbar } from 'notistack';
import { memo, useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { cn } from '@lib/utils';

import CustomDialog from '../../../../components/dialogs/CustomDialog';
import Iconify from '../../../../components/iconify';
import useMessageListener from '../../../../hooks/useMessageListener.ts';
import {
  selectHasDiffChanges,
  selectDiffContent,
  selectDiffIsLoading,
  acceptChanges,
  discardChanges,
} from '../../../../redux/slices/codeEditor';
import { dispatch, useSelector } from '../../../../redux/store.js';
import { optimai } from '../../../../utils/axios';

function IframeControls({
  interfaceId,
  previewIframeRef,
  chatIframeRef,
  fatalError,
  setFatalError,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const [isTargeting, setIsTargeting] = useState(false);

  // Local state for various dialogs and sending error flag
  const [openRevisionConfirm, setOpenRevisionConfirm] = useState(false);

  // NEW: State to store error notifications locally
  const [errorNotifications, setErrorNotifications] = useState([]);
  const [openErrorsDialog, setOpenErrorsDialog] = useState(false);

  // Add selectors for diff changes
  const hasDiffChanges = useSelector(selectHasDiffChanges);
  const isDiffLoading = useSelector(selectDiffIsLoading);
  const diffContent = useSelector(selectDiffContent);

  // Handler for code revision confirmation
  const handleRevisionConfirm = useCallback(async () => {
    try {
      setOpenRevisionConfirm(false);
      await optimai.post(`/interfaces/dev/${interfaceId}/revision`);
    } catch (error) {
      console.error('Error requesting revision:', error);
    }
  }, [interfaceId]);

  // Listen to messages from allowed origins
  useMessageListener(['https://*.preview.altan.ai', 'https://app.altan.ai'], async (event) => {
    const data = event.data;
    // If the message is an error notification, store it
    if (data.type === 'error_detected_boundary') {
      if (data.error_type === 'console_error') {
        return; // TODO: handle console errors
      }
      // Build a notification object from the received data
      const notification = {
        id: uuidv4(),
        timestamp: data.timestamp || new Date().toISOString(),
        error_type: data.error_type,
        message: data.data.message,
        details: data.data.stack,
        fatal: data.fatal || false,
      };

      // Log error to backend
      try {
        let filePath = data.data?.file;
        // Parse file path from URL for asset loading errors
        if (data.error_type === 'asset_loading_error' && data.file) {
          try {
            const url = new URL(data.file);
            // Extract the path after the domain, removing any leading slash
            filePath = url.pathname.replace(/^\//, '');
          } catch (e) {
            console.warn('Failed to parse asset loading error URL:', e);
          }
        }

        await optimai.post(`/interfaces/dev/${interfaceId}/log-error`, {
          error_type: data.error_type,
          file: filePath,
          line: data.data?.line,
          column: data.data?.column,
          message: data.data.message,
          stack: data.data.stack,
          url: data.data?.url,
          fatal: data.fatal || false,
          timestamp: data.timestamp || new Date().toISOString(),
        });
      } catch (err) {
        console.error('Failed to log error to backend:', err);
      }

      // Append to our notifications array
      setErrorNotifications((prev) => [...prev, notification]);
      if (notification.fatal) {
        // Assuming your ErrorDetectedBoundary shape on the client:
        setFatalError(data);
      }
    } else if (data.type === 'element_selected') {
      if (['select-component', 'select-instance'].includes(data.action) && chatIframeRef?.current) {
        // ****
        // CURRENT EXAMPLE
        // ****
        // componentRegistry[uniqueId] = {
        //   file: relativeFile,
        //   loc: {
        //     start: { line: start.line, column: start.column },
        //     end: { line: end.line, column: end.column }
        //   },
        //   ancestry, // Array of parent unique IDs (from within the file)
        //   isCustom,
        //   tagName,
        //   componentName: isCustom ? tagName : null
        // };
        // ****
        // ROOM UI EXPECTS EXAMPLE
        // ****
        // export interface ComponentTargetDetails {
        //   file: string;
        //   line: number;
        //   column: number;
        //   elementName: string;
        //   type?: string | undefined;
        //   screenPosition?: ScreenPosition | undefined;
        // }
        chatIframeRef.current.contentWindow.postMessage(
          {
            ...data,
            data: {
              file: data.data?.file,
              line: data.data?.loc?.start?.line,
              column: data.data?.loc.start.line,
              elementName: data.data?.tagName,
            },
          },
          '*',
        );
      }
      if (data.action === 'show-code') {
        // TODO: show code
      }
    } else if (data.type === 'accept_changes') {
      dispatch(acceptChanges(interfaceId)).then(() => {
        chatIframeRef.current.contentWindow.postMessage(
          {
            type: 'clear_diff_changes',
          },
          '*',
        );
      });
    } else if (data.type === 'reject_changes') {
      dispatch(discardChanges(interfaceId)).then(() => {
        chatIframeRef.current.contentWindow.postMessage(
          {
            type: 'clear_diff_changes',
          },
          '*',
        );
      });
    } else if (data.type === 'view_diffs') {
      // TODO: show file
      /**
       * data: {
       *  fileName: file.path,
       *  content: file.content,
       * }
       */
    } else if (
      [
        // 'vite-hmr:init',
        'vite-hmr:before-full-reload',
        'vite-hmr:after-update',
      ].includes(data.type)
    ) {
      setFatalError(null);
    }
  });

  // Handler to toggle targeting mode
  const handleTargetSelection = useCallback(() => {
    setIsTargeting((prev) => !prev);
  }, [setIsTargeting]);

  useEffect(() => {
    if (!!previewIframeRef?.current?.contentWindow) {
      previewIframeRef.current.contentWindow.postMessage(
        {
          action: isTargeting ? 'enable-element-overlay' : 'disable-element-overlay',
        },
        '*',
      );
    }
  }, [isTargeting, previewIframeRef]);

  // For demonstration: if a nonfatal error occurs, show a snackbar
  // (Assuming error notifications that aren't fatal are to be shown as snackbars)
  useEffect(() => {
    // Find the latest nonfatal error not already shown as a snackbar.
    const nonFatal = errorNotifications.filter((n) => !n.fatal);
    if (nonFatal.length > 0) {
      // Sort by timestamp descending and pick the most recent
      const sorted = nonFatal.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const latest = sorted[0];
      enqueueSnackbar(truncate(latest.message, { length: 100 }), {
        variant: 'error',
        content: (
          <div className="border border-red-400 rounded-xl bg-white/40 dark:bg-red-800/25 backdrop-blur-lg text-white shadow-neon p-4 md:max-w-[50vw] flex flex-row space-x-1 items-center">
            <div className="w-[20px] h-[20px]">
              <Iconify
                icon="mdi:error"
                className="w-fit"
              />
            </div>
            <div className="w-full flex flex-col p-1">
              <span className="text-sm tracking-wide">
                {latest.fatal ? 'Fatal error' : 'Error'}
              </span>
              <span className="text-xs w-full truncate">{latest.message}</span>
            </div>
          </div>
        ),
        autoHideDuration: 5000,
        anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      });
    }
  }, [errorNotifications, enqueueSnackbar]);

  // const checkDiffChanges = useCallback(() => {
  //   if (!isDiffLoading) {
  //     dispatch(fetchDiffChanges(interfaceId)).then(() => {
  //       // Once we have the diff content, send it to the chat iframe
  //       if (!!diffContent?.length) {
  //         chatIframeRef.current.contentWindow.postMessage(
  //           {
  //             type: 'diff_changes',
  //             data: {
  //               changes: diffContent,
  //               timestamp: new Date().toISOString(),
  //             },
  //           },
  //           '*',
  //         );
  //       }
  //     });
  //   }
  // }, [chatIframeRef, diffContent, interfaceId, isDiffLoading]);

  // // Add useEffect to handle diff changes
  // useEffect(() => {
  //   if (hasDiffChanges && chatIframeRef?.current) {
  //     // Fetch diff changes when hasChanges becomes true
  //     checkDiffChanges();
  //   }
  // }, [hasDiffChanges, diffContent]);

  return (
    <>


      {/* Errors Dialog */}
      <CustomDialog
        dialogOpen={openErrorsDialog}
        onClose={() => setOpenErrorsDialog(false)}
        maxWidth="md"
      >
        <div className="rounded-xl w-full bg-white/40 dark:bg-black/40">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Error Notifications
            </h2>
            <button
              onClick={() => setOpenErrorsDialog(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Iconify
                icon="mdi:close"
                width={24}
              />
            </button>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {errorNotifications.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-300">No error notifications.</p>
            ) : (
              errorNotifications
                .slice() // copy array
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((n) => (
                  <div
                    key={n.id}
                    className="mb-4 border-b border-gray-300 pb-2"
                  >
                    <p className="font-bold">
                      {n.fatal ? 'Fatal' : 'Nonfatal'} Error: {n.error_type || 'Unknown'}
                    </p>
                    <p>{n.message}</p>
                    <small className="text-gray-500">
                      {new Date(n.timestamp).toLocaleString()}
                    </small>
                    {n.details && (
                      <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                        {n.details}
                      </pre>
                    )}
                  </div>
                ))
            )}
          </div>
          <div className="px-6 py-3 border-t border-gray-300">
            <button
              onClick={() => setErrorNotifications([])}
              className="text-blue-500 underline"
            >
              Clear Notifications
            </button>
          </div>
        </div>
      </CustomDialog>

      {/* Revision Confirmation Dialog */}
      {openRevisionConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1C1C1C] rounded-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">Confirm Code Revision</h2>
              <button
                onClick={() => setOpenRevisionConfirm(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Iconify
                  icon="mdi:close"
                  width={24}
                />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-yellow-400">
                  <Iconify
                    icon="mdi:alert"
                    width={24}
                  />
                  <p className="text-sm">This action will consume credits from your account</p>
                </div>

                <p className="text-gray-300">The code revision process will:</p>

                <ul className="list-disc pl-5 space-y-2 text-gray-300">
                  <li>Analyze your entire codebase</li>
                  <li>Refactor code for better performance</li>
                  <li>Fix TypeScript errors and improve type safety</li>
                  <li>Apply best practices and patterns</li>
                </ul>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setOpenRevisionConfirm(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRevisionConfirm}
                    className="flex-1 px-4 py-2 rounded-lg bg-[#6366F1] text-white hover:bg-[#5558DD] transition-colors"
                  >
                    Proceed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(IframeControls);


// <div className="left-4 z-50 flex space-x-1">
//   {/* Errors Dialog Button */}
//   {!!errorNotifications?.length && (
//     <Tooltip
//       title="View Error Notifications"
//       placement="top"
//     >
//       <m.button
//         whileHover={{ scale: 1.1 }}
//         whileTap={{ scale: 0.95 }}
//         onClick={() => setOpenErrorsDialog(true)}
//         className="p-2 rounded-full backdrop-blur-md bg-red-500/30 hover:bg-red-500 transition-all hover:shadow-md"
//         aria-label="Open errors dialog"
//       >
//         <Iconify
//           icon="mdi:alert"
//           className="text-white text-xl"
//         />
//       </m.button>
//     </Tooltip>
//   )}

//   {/* Target Selection Button */}
//   {!fatalError && (
//     <Tooltip
//       title={isTargeting ? 'Disable target selection' : 'Select a target'}
//       placement="bottom"
//     >
//       <m.button
//         whileHover={{ scale: 1.1 }}
//         whileTap={{ scale: 0.95 }}
//         onClick={handleTargetSelection}
//         className="p-2 rounded-full backdrop-blur-md bg-white/10 dark:bg-black/10 hover:bg-white/20 transition-all hover:shadow-md"
//         aria-label="Select target"
//       >
//         <Iconify
//           icon="mdi:target-variant"
//           width={18}
//           className={cn(
//             'dark:text-white/70 text-black/50 transition-colors',
//             isTargeting
//               ? 'hover:text-red-600 dark:hover:text-red-400'
//               : 'hover:text-blue-400 dark:hover:text-blue-200',
//           )}
//         />
//       </m.button>
//     </Tooltip>
//   )}
// </div>;

// // Determine if undo/redo are available
// const canUndo = currentCommitIndex < sortedCommits.length - 1;
// const canRedo = currentCommitIndex > 0;

// // Handler for undo/redo navigation
// const handleCommitNavigation = async (direction) => {
//   if (isNavigating) return;
//   setIsNavigating(true);

//   try {
//     const targetIndex = direction === 'undo' ? currentCommitIndex + 1 : currentCommitIndex - 1;
//     const targetCommit = sortedCommits[targetIndex];

//     if (!targetCommit) {
//       throw new Error('No commit found for navigation');
//     }

//     await optimai.post(
//       `/interfaces/dev/${interfaceId}/commits/${targetCommit.commit_hash}/restore`,
//     );
//     enqueueSnackbar(`Successfully ${direction === 'undo' ? 'undid' : 'redid'} changes`, {
//       variant: 'success',
//     });
//   } catch (error) {
//     console.error(`Error during ${direction}:`, error);
//     enqueueSnackbar(`Failed to ${direction} changes`, { variant: 'error' });
//   } finally {
//     setIsNavigating(false);
//   }
// };

/* <Tooltip
    title={canUndo ? 'Undo (Cmd+Z)' : 'No previous version available'}
    placement="top"
  >
    <button
      onClick={() => canUndo && handleCommitNavigation('undo')}
      className={cn(
        'w-11 h-11 flex items-center justify-center bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900 rounded-full transition-all',
        canUndo && !isNavigating
          ? 'hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95'
          : 'opacity-50 cursor-not-allowed',
      )}
      disabled={!canUndo || isNavigating}
      aria-label="Undo"
    >
      <Iconify
        icon={isNavigating ? 'mdi:loading' : 'mdi:undo'}
        className={cn(
          'text-xl',
          isNavigating && 'animate-spin',
          canUndo && !isNavigating ? 'text-gray-700 dark:text-white' : 'text-gray-400 dark:text-gray-500',
        )}
      />
    </button>
  </Tooltip>

  <Tooltip
    title={canRedo ? 'Redo (Cmd+Shift+Z)' : 'No newer version available'}
    placement="top"
  >
    <button
      onClick={() => canRedo && handleCommitNavigation('redo')}
      className={cn(
        'w-11 h-11 flex items-center justify-center bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900 rounded-full transition-all',
        canRedo && !isNavigating
          ? 'hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95'
          : 'opacity-50 cursor-not-allowed',
      )}
      disabled={!canRedo || isNavigating}
      aria-label="Redo"
    >
      <Iconify
        icon={isNavigating ? 'mdi:loading' : 'mdi:redo'}
        className={cn(
          'text-xl',
          isNavigating && 'animate-spin',
          canRedo && !isNavigating ? 'text-gray-700 dark:text-white' : 'text-gray-400 dark:text-gray-500',
        )}
      />
    </button>
  </Tooltip> */

// const selectors = useMemo(
//   () => ({
//     currentCommitSha: makeSelectCurrentCommitSha(),
//     sortedCommits: makeSelectSortedCommits(),
//   }),
//   [],
// );
// // Get current commit and commits list
// const currentCommitSha = useSelector((state) => selectors.currentCommitSha(state, interfaceId));
// // Memoize sorted commits
// const sortedCommits = useSelector((state) => selectors.sortedCommits(state, interfaceId));

// // Find current commit index
// const currentCommitIndex = useMemo(() => {
//   return sortedCommits.findIndex((commit) => commit.commit_hash === currentCommitSha);
// }, [sortedCommits, currentCommitSha]);
