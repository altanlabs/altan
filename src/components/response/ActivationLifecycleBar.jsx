import { m, AnimatePresence } from 'framer-motion';
import { memo, useMemo, useState } from 'react';

import { selectActivationLifecycles, selectMembers } from '../../redux/slices/room.js';
import { useSelector } from '../../redux/store.js';
import AgentOrbAvatar from '../agents/AgentOrbAvatar.jsx';
import CustomAvatar from '../custom-avatar/CustomAvatar.jsx';

// Status colors - activation phase states
const statusColors = {
  acknowledged: '#6366F1',
  enqueued: '#8B5CF6',
  dequeued: '#8B5CF6',
  scheduled: '#10B981',
  rescheduled: '#F59E0B',
};

const ActivationLifecycleBar = ({ threadId, className = '' }) => {
  const activationLifecycles = useSelector(selectActivationLifecycles);
  const members = useSelector(selectMembers);
  const [isHovered, setIsHovered] = useState(false);

  // Get active pending activations (before response starts)
  const activeActivations = useMemo(() => {
    const activeActivationIds = activationLifecycles.activeByThread[threadId] || [];

    return activeActivationIds
      .map((responseId) => {
        const lifecycle = activationLifecycles.byId[responseId];
        if (!lifecycle) return null;

        // Filter out discarded activations
        if (lifecycle.discarded) return null;

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
  }, [activationLifecycles, members, threadId]);

  if (!activeActivations || activeActivations.length === 0) {
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
    <div className={`flex justify-start ${className}`}>
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
              {activeActivations.map((activation, index) => {
                const statusColor = getStatusColor(activation.status);
                const isProcessing = ['enqueued', 'dequeued'].includes(activation.status);

                return (
                  <m.div
                    key={activation.response_id}
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
                    style={{ zIndex: activeActivations.length - index }}
                  >
                    <m.div
                      animate={{
                        scale: isProcessing ? [1, 1.15, 1] : 1,
                      }}
                      transition={{
                        duration: 2,
                        repeat: isProcessing ? Infinity : 0,
                        ease: 'easeInOut',
                      }}
                    >
                      {!activation.agent?.avatar ? (
                        <AgentOrbAvatar
                          size={20}
                          agentId={activation.agent?.id}
                          agentState={isProcessing ? 'thinking' : null}
                          sx={{
                            border: '2px solid',
                            borderColor: 'background.paper',
                            boxShadow: `0 0 0 1px ${statusColor}40`,
                          }}
                        />
                      ) : (
                        <CustomAvatar
                          src={activation.agent?.avatar}
                          name={activation.agent?.name || 'Agent'}
                          sx={{
                            width: 20,
                            height: 20,
                            fontSize: '0.6rem',
                            border: '2px solid',
                            borderColor: 'background.paper',
                            boxShadow: `0 0 0 1px ${statusColor}40`,
                          }}
                        />
                      )}
                    </m.div>

                    <m.div
                      className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full"
                      style={{ backgroundColor: statusColor }}
                      animate={{
                        opacity: isProcessing ? [0.6, 1, 0.6] : 1,
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: isProcessing ? Infinity : 0,
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
              {activeActivations.map((activation) => {
                const statusColor = getStatusColor(activation.status);
                const isProcessing = ['enqueued', 'dequeued'].includes(activation.status);

                return (
                  <m.div
                    key={activation.response_id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    {/* Agent header */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        {!activation.agent?.avatar ? (
                          <AgentOrbAvatar
                            size={28}
                            agentId={activation.agent?.id}
                            agentState={isProcessing ? 'thinking' : null}
                          />
                        ) : (
                          <CustomAvatar
                            src={activation.agent?.avatar}
                            name={activation.agent?.name || 'Agent'}
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: '0.7rem',
                            }}
                          />
                        )}
                        <m.div
                          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900"
                          style={{ backgroundColor: statusColor }}
                          animate={{
                            scale: isProcessing ? [1, 1.2, 1] : 1,
                            opacity: isProcessing ? [0.6, 1, 0.6] : 1,
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: isProcessing ? Infinity : 0,
                            ease: 'easeInOut',
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {activation.agent?.name || 'Agent'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {activation.status}
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    {activation.events && activation.events.length > 0 && (
                      <div className="pl-2 space-y-1">
                        {activation.events.slice(-3).map((event, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: getStatusColor(
                                  event.type.replace('activation.', ''),
                                ),
                              }}
                            />
                            <span className="text-gray-600 dark:text-gray-400 truncate flex-1">
                              {event.type.replace('activation.', '')}
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

export default memo(ActivationLifecycleBar);
