import { IconButton, Dialog, DialogTitle, DialogContent } from '@mui/material';
import React, { useState, memo, useCallback } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import Iconify from '../../../../../components/iconify/index.js';
import VirtualizedList from '../../../../../components/virtualized/VirtualizedList.jsx';
import { selectExecutionsEventsHistory } from '../../../../../redux/slices/flows.js';
import { useSelector } from '../../../../../redux/store.js';
import EventCard from '../../events/EventCard.jsx';

SyntaxHighlighter.registerLanguage('json', json);

const selectExecutionsInitialized = (state) => state.flows.initialized.executions;

const EventRetriggerCard = ({ onClose }) => {
  const eventHistory = useSelector(selectExecutionsEventsHistory);
  const initializedExecutions = useSelector(selectExecutionsInitialized);
  const [fullscreenPayload, setFullscreenPayload] = useState(null);

  const renderEvent = useCallback(
    (index, exec) => (
      <EventCard
        key={`event-card-${exec.executionId}-${exec.event.id}`}
        event={exec.event}
        executionId={exec.executionId}
        flowId={exec.flowId}
        onClose={onClose}
        onFullScreen={setFullscreenPayload}
      />
    ),
    [onClose],
  );

  return (
    <>
      <VirtualizedList
        listId="execution-event-triggers"
        data={eventHistory}
        renderItem={renderEvent}
        initialized={initializedExecutions}
        noDataMessage="No previous events found."
      />
      {!!eventHistory?.length && (
        <Dialog
          fullScreen
          open={!!fullscreenPayload}
          onClose={() => setFullscreenPayload(null)}
        >
          <DialogTitle>
            Full Payload
            <IconButton
              aria-label="close"
              onClick={() => setFullscreenPayload(null)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Iconify icon="mdi:close" />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <SyntaxHighlighter
              language="json"
              style={vs2015}
              customStyle={{
                margin: 0,
                padding: '16px',
                height: 'calc(100vh - 64px)', // Adjust based on DialogTitle height
              }}
            >
              {JSON.stringify(fullscreenPayload, null, 2)}
            </SyntaxHighlighter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default memo(EventRetriggerCard);
