import { IconButton, Stack, Tooltip, alpha, useTheme } from '@mui/material';
import { useState, useCallback, useEffect, useMemo } from 'react';

import { makeSelectMessageChildrenThreads } from '../../../hooks/useSortedThreads.js';
import { makeSelectHasMessageCreatedParentThreads } from '../../../redux/slices/room/selectors';
import { useSelector } from '../../../redux/store.ts';
import { areSameDay } from '../../../utils/dateUtils.js';
import Iconify from '../../iconify/Iconify.jsx';
import ThreadMinified from '../../tabs/ThreadMinified.jsx';

const createConnectorPath = (posnA, posnB, arcRadius) => {
  const initialLineLength = posnB.y > posnA.y ? posnB.y - arcRadius : posnA.y - arcRadius;
  const arcSweep = posnB.y > posnA.y ? '0 0' : '0 1';

  return `M${posnA.x} ${posnA.y} V${initialLineLength} A${arcRadius} ${arcRadius} 0 ${arcSweep} ${posnA.x + arcRadius} ${initialLineLength + (posnB.y > posnA.y ? arcRadius : -arcRadius)} H${posnB.x}`;
};

const drawPath = (elementId, yAdjustment, avatar, svgRect, svg, contrastColor) => {
  const element = document.getElementById(elementId);
  if (!element) {
    return;
  }

  const rect = element.getBoundingClientRect();
  const posnA = {
    x: avatar.left + avatar.width / 2 - svgRect.left,
    y: avatar.top - svgRect.top + yAdjustment,
  };
  const posnB = {
    x: rect.left - svgRect.left,
    y: rect.top + rect.height / 2 - svgRect.top,
  };
  const dStr = createConnectorPath(posnA, posnB, 10);

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', dStr);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', alpha(contrastColor, 0.5));
  path.setAttribute('stroke-width', '1');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(path);
};

const useMessageThreads = ({
  message,
  threadId,
  mode,
  previousMessage,
  avatarRef,
  connectorRef,
}) => {
  const [viewAllThreads, setViewAllThreads] = useState(false);
  const theme = useTheme();
  const contrastColor = theme.palette.mode === 'light' ? '#000000' : '#ffffff';

  // THREADS CREATED
  const threadsCreatedSelector = useMemo(makeSelectMessageChildrenThreads, []);
  const threadsCreated = useSelector((state) => threadsCreatedSelector(state, message?.id, threadId, mode));
  // PREVIOUS MESSAGE CREATED THREADS
  const hasPreviousMessageCreatedThreadsSelector = useMemo(makeSelectHasMessageCreatedParentThreads, []);
  const hasPreviousMessageCreatedThreads = useSelector((state) => hasPreviousMessageCreatedThreadsSelector(state, previousMessage?.id));

  const previousDate = previousMessage?.date_creation;
  const previousMember = previousMessage?.member_id;
  const shouldShowDateSeparator = !previousDate ||
    !areSameDay(new Date(message.date_creation), new Date(previousDate));

  const shouldShowMember = useMemo(() => (
    !!shouldShowDateSeparator
    || previousMember !== message.member_id
    || !!hasPreviousMessageCreatedThreads
    || !!threadsCreated?.length
    || !!message.replied
  ), [shouldShowDateSeparator, previousMember, message.member_id, message.replied, hasPreviousMessageCreatedThreads, threadsCreated?.length]);

  const renderMessageThreads = useMemo(() => {
    if (!threadsCreated?.length) return null;

    const threadsToDisplayDirectly = !viewAllThreads && threadsCreated.length > 3 ? threadsCreated.slice(0, 2) : threadsCreated;
    const hasMoreThreads = threadsCreated.length > 3;

    return (
      <div
        style={{
          position: 'relative',
          width: 'min-content',
        }}
      >
        <Stack
          {...viewAllThreads ? { id: `thread-minified-${message.id}-${threadsCreated[0].id}` } : {}}
          sx={{
            paddingTop: 0,
            paddingLeft: 3,
            maxHeight: 300,
            overflowY: 'auto',
            ...viewAllThreads && {
              paddingLeft: 0,
              paddingRight: 0,
              paddingBottom: 0,
              paddingTop: 0,
              marginTop: 1,
              marginLeft: 4,
              border: '1px dashed rgba(100, 100, 100, 0.5)',
              borderRadius: 1,
              width: 'min-content',
            },
          }}
        >
          <Stack
            padding={1}
            spacing={1}
          >
            {threadsToDisplayDirectly.map((threadId, i) => (
              <div
                key={`thread-message-mini-${message.id}-${i}`}
                style={{
                  maxWidth: 250,
                }}
              >
                <ThreadMinified
                  threadId={threadId}
                  theme={theme}
                  message={message}
                  gradientDirection="right"
                  disableConnector={viewAllThreads}
                />
              </div>
            ))}
          </Stack>
          {hasMoreThreads && (
            <Tooltip
              arrow
              followCursor
              title={`${!viewAllThreads ? 'View All' : 'Collapse'} Threads`}
            >
              <IconButton
                {...!viewAllThreads ? { id: `thread-minified-${message.id}-${threadsCreated[2].id}` } : {}}
                sx={{
                  ...!!viewAllThreads && {
                    position: 'absolute',
                    right: -8,
                    top: -8,
                  },
                  width: 20,
                  padding: 0,
                }}
                onClick={() => setViewAllThreads(prev => !prev)}
              >
                <Iconify
                  icon={`ph:${!viewAllThreads ? 'plus' : 'minus'}-circle-duotone`}
                  sx={{
                    pointerEvents: 'none',
                  }}
                />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </div>
    );
  }, [threadsCreated, theme, message?.id, viewAllThreads]);

  // Callback to draw connectors
  const drawConnector = useCallback(() => {
    if (!(shouldShowMember || message?.replied && !threadsCreated?.length) || !avatarRef.current || !connectorRef.current) {
      return;
    }

    const avatar = avatarRef.current.getBoundingClientRect();
    const svg = connectorRef.current;
    const svgRect = svg.getBoundingClientRect();
    svg.innerHTML = '';
    svg.style.zIndex = '-1';

    if (message?.replied) {
      drawPath(`reply-message-minified-${message.replied.id}`, 0, avatar, svgRect, svg, contrastColor);
    }

    if (threadsCreated?.length) {
      threadsCreated.forEach((thread) => {
        drawPath(`thread-minified-${message.id}-${thread.id}`, avatar.height, avatar, svgRect, svg, contrastColor);
      });
    }
  }, [
    shouldShowMember,
    message,
    threadsCreated,
    contrastColor,
    avatarRef,
    connectorRef,
  ]);

  // Effect to handle connector drawing and window resize
  useEffect(() => {
    drawConnector();
    window.addEventListener('resize', drawConnector);
    return () => window.removeEventListener('resize', drawConnector);
  }, [drawConnector]);

  return {
    shouldShowMember,
    shouldShowDateSeparator,
    renderMessageThreads,
  };
};

export default useMessageThreads;

// const drawConnector = useCallback(() => {
//   if (!(shouldShowMember || message?.replied) || !avatarRef.current || !connectorRef.current) {
//     return;
//   }

//   const avatar = avatarRef.current.getBoundingClientRect();
//   const svg = connectorRef.current;
//   const svgRect = svg.getBoundingClientRect();
//   svg.innerHTML = '';
//   svg.style.zIndex = '-1';

//   if (message?.replied) {
//     drawPath(`reply-message-minified-${message.replied.id}`, 0, avatar, svgRect, svg, contrastColor);
//   }

//   threadsCreated.forEach((thread) => {
//     drawPath(`thread-minified-${message.id}-${thread.id}`, avatar.height, avatar, svgRect, svg, contrastColor);
//   });

// }, [threadId, message, shouldShowMember, threadsCreated]);

// useEffect(() => {
//   drawConnector();
//   window.addEventListener('resize', drawConnector);
//   return () => window.removeEventListener('resize', drawConnector);
// }, [drawConnector]);

// useEffect(() => {
//   drawConnector();
//   window.addEventListener('resize', drawConnector);
//   return () => window.removeEventListener('resize', drawConnector);
// }, [threadsCreated, message?.replied]);
