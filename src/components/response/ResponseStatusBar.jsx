import { m, AnimatePresence } from 'framer-motion';
import { memo, useMemo, useState } from 'react';

import { selectResponseLifecycles, selectMembers } from '../../redux/slices/room.js';
import { useSelector } from '../../redux/store.js';
import CustomAvatar from '../custom-avatar/CustomAvatar.jsx';

// Status colors - only active states
const statusColors = {
  submitted: '#6366F1',
  scheduled: '#6366F1',
  enqueued: '#8B5CF6',
  dequeued: '#8B5CF6',
  started: '#8B5CF6',
  generating: '#8B5CF6',
  suspended: '#F59E0B',
  resumed: '#8B5CF6',
  requeued: '#8B5CF6',
};

const ResponseStatusBar = ({ threadId, className = '' }) => {
  const responseLifecycles = useSelector(selectResponseLifecycles);
  const members = useSelector(selectMembers);
  const [isHovered, setIsHovered] = useState(false);

  // Get active running responses (ones without message_id yet, or still active)
  const activeResponses = useMemo(() => {
    const activeResponseIds = responseLifecycles.activeByThread[threadId] || [];

    return activeResponseIds
      .map((responseId) => {
        const lifecycle = responseLifecycles.byId[responseId];
        if (!lifecycle) return null;

        // Get agent details from members
        const roomMember = Object.values(members.byId || {}).find(
          (member) =>
            member?.member?.member_type === 'agent' &&
            member?.member?.agent_id === lifecycle.agent_id,
        );

        return {
          ...lifecycle,
          agent: roomMember
            ? {
                id: roomMember.member.agent_id,
                name: roomMember.member?.agent?.name || 'Agent',
                avatar: roomMember.member?.agent?.avatar_url,
              }
            : null,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, [responseLifecycles, members, threadId]);

  if (!activeResponses || activeResponses.length === 0) {
    return null;
  }

  const getStatusColor = (status) => {
    return statusColors[status] || '#8B5CF6';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <m.div
        layout
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={false}
        animate={{
          width: isHovered ? 'auto' : 'auto',
          height: isHovered ? 'auto' : 'auto',
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
        className="relative"
      >
        {!isHovered ? (
          // Minimalistic view - just avatars
          <m.div
            layout
            className="flex gap-1"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnimatePresence mode="popLayout">
              {activeResponses.map((response, index) => {
                const statusColor = getStatusColor(response.status);
                const isGenerating = response.status === 'generating' || response.status === 'started';

                return (
                  <m.div
                    key={response.response_id}
                    layout
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                      layout: { type: 'spring', stiffness: 400, damping: 30 },
                      opacity: { duration: 0.2 },
                      scale: { duration: 0.2 },
                    }}
                    className="relative"
                    style={{ zIndex: activeResponses.length - index }}
                  >
                    <m.div
                      animate={{
                        scale: isGenerating ? [1, 1.15, 1] : 1,
                      }}
                      transition={{
                        duration: 2,
                        repeat: isGenerating ? Infinity : 0,
                        ease: 'easeInOut',
                      }}
                    >
                      <CustomAvatar
                        src={response.agent?.avatar}
                        name={response.agent?.name || 'Agent'}
                        sx={{
                          width: 20,
                          height: 20,
                          fontSize: '0.6rem',
                          border: '2px solid',
                          borderColor: 'background.paper',
                          boxShadow: `0 0 0 1px ${statusColor}40`,
                        }}
                      />
                    </m.div>

                    <m.div
                      className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full"
                      style={{ backgroundColor: statusColor }}
                      animate={{
                        opacity: isGenerating ? [0.6, 1, 0.6] : 1,
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: isGenerating ? Infinity : 0,
                        ease: 'easeInOut',
                      }}
                    />
                  </m.div>
                );
              })}
            </AnimatePresence>
          </m.div>
        ) : (
          // Expanded view - detailed info
          <m.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-3 py-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
            style={{ minWidth: 280, maxWidth: 400 }}
          >
            <div className="space-y-3">
              {activeResponses.map((response) => {
                const statusColor = getStatusColor(response.status);
                const isGenerating = response.status === 'generating' || response.status === 'started';

                return (
                  <m.div
                    key={response.response_id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    {/* Agent header */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <CustomAvatar
                          src={response.agent?.avatar}
                          name={response.agent?.name || 'Agent'}
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: '0.7rem',
                          }}
                        />
                        <m.div
                          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900"
                          style={{ backgroundColor: statusColor }}
                          animate={{
                            scale: isGenerating ? [1, 1.2, 1] : 1,
                            opacity: isGenerating ? [0.6, 1, 0.6] : 1,
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: isGenerating ? Infinity : 0,
                            ease: 'easeInOut',
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {response.agent?.name || 'Agent'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {response.status}
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    {response.events && response.events.length > 0 && (
                      <div className="pl-2 space-y-1">
                        {response.events.slice(-3).map((event, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: getStatusColor(
                                  event.type.replace(/^(activation|response)\./, ''),
                                ),
                              }}
                            />
                            <span className="text-gray-600 dark:text-gray-400 truncate flex-1">
                              {event.type.replace(/^(activation|response)\./, '')}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500 text-[10px]">
                              {formatTimestamp(event.timestamp)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </m.div>
                );
              })}
            </div>
          </m.div>
        )}
      </m.div>
    </div>
  );
};

export default memo(ResponseStatusBar);
