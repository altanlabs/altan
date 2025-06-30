import { LoadingButton } from '@mui/lab';
import { Button } from '@mui/material';
import { m, AnimatePresence } from 'framer-motion';
import { memo, useCallback, useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import Iconify from '../../../../components/iconify';
import { getFlowExecutionDetails, retriggerExecutionEvent } from '../../../../redux/slices/flows';
import { dispatch } from '../../../../redux/store';
import { fToNow } from '../../../../utils/formatTime';

SyntaxHighlighter.registerLanguage('json', json);

const EventCard = ({ event, executionId, flowId, onFullScreen, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRetrigger = useCallback(() => {
    setLoading(true);
    // dispatch(clearFlowExecution({ flowId: flow?.id }))
    dispatch(retriggerExecutionEvent(executionId)).finally(() => setLoading(false));
    onClose();
  }, [executionId, onClose]);

  const handleDebug = useCallback(() => {
    setLoading(true);
    dispatch(getFlowExecutionDetails(executionId, flowId)).finally(() => setLoading(false));
    onClose();
  }, [executionId, flowId, onClose]);

  return (
    <m.li
      className="flex flex-col border-b border-gray-200 dark:border-gray-700 p-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center w-full mb-2">
        <div className="flex-grow">
          <p className="text-md font-medium text-gray-800 dark:text-gray-100">
            {event.event_type?.name || 'Unknown Event'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{fToNow(event.date_creation)}</p>
        </div>
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="p-2 focus:outline-none"
        >
          <Iconify icon={isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
        </button>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 w-full rounded-lg shadow-lg backdrop-blur-lg bg-white dark:bg-gray-800 overflow-hidden"
          >
            <div className="flex items-center px-1 bg-gray-100/40 dark:bg-gray-700/40 w-full">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 flex-grow">
                Payload Preview
              </p>
              <button
                onClick={() => onFullScreen(event.payload)}
                className="p-1 focus:outline-none"
              >
                <Iconify icon="mdi:fullscreen" />
              </button>
            </div>
            <div className="overflow-auto max-h-52">
              <SyntaxHighlighter
                language="json"
                style={vs2015}
                customStyle={{ margin: 0, padding: 0, maxHeight: 300 }}
              >
                {JSON.stringify(event.payload, null, 2)}
              </SyntaxHighlighter>
            </div>
          </m.div>
        )}
      </AnimatePresence>
      <div className="flex justify-end space-x-2 w-full">
        <LoadingButton
          loading={loading}
          size="small"
          variant="outlined"
          onClick={handleDebug}
        >
          <span className="flex items-center space-x-1">
            <Iconify icon="mdi:bug" />
            <span>Debug</span>
          </span>
        </LoadingButton>
        <Button
          size="small"
          variant="soft"
          onClick={handleRetrigger}
        >
          <span className="flex items-center space-x-1">
            <Iconify icon="mdi:play" />
            <span>Retrigger</span>
          </span>
        </Button>
      </div>
    </m.li>
  );
};

export default memo(EventCard);
