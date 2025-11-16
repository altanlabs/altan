import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';
import { AnimatePresence, m } from 'framer-motion';
import { memo, useMemo, useState } from 'react';

import ExecutionCard from './ExecutionCard.jsx';
import { makeSelectExecution } from '../../redux/slices/room/selectors/messageSelectors';
import { useSelector } from '../../redux/store.ts';
import CustomDialog from '../dialogs/CustomDialog.jsx';
import Iconify from '../iconify/Iconify.jsx';

/* ------------------------------------------------------------------
  Helper functions
------------------------------------------------------------------ */

function fDate(date, newFormat) {
  const fm = newFormat || 'HH:mm:ss';
  return date ? format(new Date(date), fm) : '';
}

function calculateDuration(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const durationMs = endDate - startDate;

  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
  const milliseconds = durationMs % 1000;

  return [
    hours > 0 ? `${hours}h` : '',
    minutes > 0 ? `${minutes}m` : '',
    seconds > 0 ? `${seconds}s` : '',
    milliseconds > 0 ? `${milliseconds}ms` : '',
  ]
    .filter(Boolean)
    .join(' ') || '0ms';
}

/* ------------------------------------------------------------------
  JSON Viewer (for large JSON data)
------------------------------------------------------------------ */

function JSONViewer({ data }) {
  if (!data) {
    return <Typography className="text-sm text-gray-500">{'<EMPTY>'}</Typography>;
  }
  return (
    <pre
      className="
        m-0 p-2
        rounded-md
        bg-gray-100
        text-gray-800
        dark:bg-gray-800
        dark:text-gray-100
        overflow-auto
        max-h-60
        text-sm
      "
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

/* ------------------------------------------------------------------
  ExecutionTimes: Display Start, Duration, Finish
------------------------------------------------------------------ */

function ExecutionTimes({ execution }) {
  return (
    <m.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="flex justify-between items-center w-full gap-6"
    >
      <div className="flex flex-col space-y-1 text-left">
        <span className="cursor-default text-xs text-gray-700 dark:text-gray-300">Started at</span>
        <span className="text-xs text-gray-700 dark:text-gray-200">{fDate(execution.date_creation)}</span>
      </div>

      <div className="flex flex-col space-y-1 text-left">
        <span className="cursor-default text-xs text-gray-700 dark:text-gray-300">It took</span>
        <span className="text-xs text-gray-700 dark:text-gray-200">
          {calculateDuration(execution.date_creation, execution.finished_at)}
        </span>
      </div>

      <div className="flex flex-col space-y-1 text-right">
        <span className="cursor-default text-xs text-gray-700 dark:text-gray-300">Finished at</span>
        <span className="text-xs text-gray-700 dark:text-gray-200">{fDate(execution.finished_at)}</span>
      </div>
    </m.div>
  );
}

/* ------------------------------------------------------------------
  Main Dialog Component
------------------------------------------------------------------ */

const ExecutionDetailDialog = ({ executionId, open, onClose }) => {
  const executionSelector = useMemo(makeSelectExecution, []);
  const execution = useSelector((state) => executionSelector(state, executionId));

  // Tracks which section is expanded for viewing large content
  const [expanded, setExpanded] = useState('');

  const toggleExpand = (section) => {
    setExpanded((prev) => (prev === section ? '' : section));
  };

  if (!execution) return null;

  return (
    <CustomDialog
      fullWidth
      maxWidth="md"
      dialogOpen={open}
      onClose={onClose}
    >
      <button className="visible md:hidden w-full text-center p-3 border-b" onClick={onClose}>
        Close
      </button>
      <AnimatePresence>
        {open && (
          <m.div
            key="execution-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="
              relative
              w-full
              p-5
              md:p-2
              flex
              flex-col
              gap-4
              text-gray-800
              dark:text-gray-200
            "
          >

            {/* Title & Close Button */}
            <ExecutionCard
              executionId={executionId}
              noClick
              noDuration

            >
              <ExecutionTimes execution={execution} />
            </ExecutionCard>
            {/* Glassmorphic Container for Argument/Input/Result/Error */}
            <Box
              className="
                rounded-xl
                p-4
                border
                border-dashed
                shadow-sm
                bg-white/10
                backdrop-blur-md
                border-white/20
                flex
                flex-col
                gap-3
              "
            >
              {/* We will list out these items in order with separate expansions */}
              {['arguments', 'input', 'result', 'error'].map((section) => {
                const sectionTitle = section.charAt(0).toUpperCase() + section.slice(1);
                const data =
                  section === 'arguments'
                    ? execution.arguments
                    : section === 'input'
                      ? execution.input
                      : section === 'result'
                        ? execution.content
                        : execution.error;

                // We can optionally hide "result" if there's error, or vice versa:
                // For a simpler approach, we always show them if present:
                if (section === 'error' && !execution.error) return null;
                if (section === 'result' && execution.error) return null;

                return (
                  <m.div key={section} layout>
                    <div
                      onClick={() => toggleExpand(section)}
                      className="
                        text-sm
                        text-gray-700
                        dark:text-gray-300
                        cursor-pointer
                        hover:text-blue-600
                        dark:hover:text-blue-400
                        transition-colors
                        flex flex-row space-x-1
                        py-1
                      "
                    >
                      <span>{sectionTitle}</span>
                      <Iconify icon={expanded === section ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
                    </div>

                    <AnimatePresence>
                      {expanded === section && (
                        <m.div
                          key={`${section}-content`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <JSONViewer data={data} />
                        </m.div>
                      )}
                    </AnimatePresence>
                  </m.div>
                );
              })}
            </Box>
          </m.div>
        )}
      </AnimatePresence>
    </CustomDialog>
  );
};

export default memo(ExecutionDetailDialog);
