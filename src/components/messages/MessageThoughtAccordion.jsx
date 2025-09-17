import { Stack, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { useState } from 'react';

import CustomMarkdown from './CustomMarkdown.jsx';
import MessageTaskExecutions from './wrapper/MessageTaskExecutions.jsx';
import Iconify from '../iconify/Iconify.jsx';

const MessageThoughtAccordion = ({
  textContentWithoutWidgets,
  message,
  threadId,
}) => {
  const [thoughtAccordionOpen, setThoughtAccordionOpen] = useState(false);

  return (
    <Accordion
      expanded={thoughtAccordionOpen}
      onChange={() => setThoughtAccordionOpen(!thoughtAccordionOpen)}
      className="w-full"
      sx={{
        margin: 0,
        '&.MuiAccordion-root.Mui-expanded': { margin: 0 },
        '&.MuiAccordion-root': {
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          '&:before': { display: 'none' },
        },
      }}
    >
      <AccordionSummary
        expandIcon={<Iconify icon="mdi:chevron-down" />}
        sx={{
          minHeight: 'auto',
          '& .MuiAccordionSummary-content': {
            margin: '8px 0',
            '&.Mui-expanded': { margin: '8px 0' },
          },
        }}
      >
        <div className="flex items-center gap-2">
          <Iconify
            icon="mdi:brain"
            className="text-gray-600 dark:text-gray-400"
            width={16}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Worked for a while
          </span>
        </div>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: '0 16px 16px 16px' }}>
        <Stack spacing={1}>
          {/* Show text content without commits */}
          {textContentWithoutWidgets && (
            <div>
              <CustomMarkdown
                text={textContentWithoutWidgets}
                threadId={threadId}
              />
            </div>
          )}

          {/* Show task executions in the accordion */}
          {message?.thread_id === threadId && (
            <MessageTaskExecutions
              messageId={message.id}
              date_creation={message.date_creation}
            />
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default MessageThoughtAccordion;
