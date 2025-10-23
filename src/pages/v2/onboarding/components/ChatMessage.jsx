import { m } from 'framer-motion';
import React, { memo, useMemo } from 'react';

import { TextGenerateEffect } from '../../../../components/elevenlabs/ui/text-generate-effect';
import { useAudio } from '../hooks/useAudio';
import { AGENT_AVATARS } from '../mockData';

const ChatMessage = ({
  message,
  isUser = false,
  showAvatar = true,
  useTypewriter = false,
  delay = 0,
  onComplete,
  agentName,
  audioFile = null,
}) => {
  // Play audio when message appears (if provided)
  useAudio(audioFile, !!audioFile, null);

  // Determine which avatar to show and agent name based on message content or agentName prop
  const { avatarUrl, displayName } = useMemo(() => {
    let name = agentName;
    let url = AGENT_AVATARS.Altan;

    if (agentName && AGENT_AVATARS[agentName]) {
      url = AGENT_AVATARS[agentName];
    } else {
      // Detect agent from message
      if (message.startsWith('Genesis here.')) {
        url = AGENT_AVATARS.Genesis;
        name = 'Genesis';
      } else if (message.startsWith('Cloud here.')) {
        url = AGENT_AVATARS.Cloud;
        name = 'Cloud';
      } else if (message.startsWith('Interface here.')) {
        url = AGENT_AVATARS.Interface;
        name = 'Interface';
      } else if (message.startsWith('Services here.')) {
        url = AGENT_AVATARS.Services;
        name = 'Services';
      } else {
        name = 'Altan';
      }
    }

    return { avatarUrl: url, displayName: name };
  }, [message, agentName]);

  if (isUser) {
    // User messages keep the bubble style
    return (
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="flex gap-3 flex-row-reverse items-start"
      >
        <div className="max-w-[80%] px-5 py-3 rounded-2xl bg-white text-black">
          <p className="text-base leading-relaxed">{message}</p>
        </div>
      </m.div>
    );
  }

  // Agent messages - Discord-like format
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex gap-3 items-start group hover:bg-gray-900/30 -mx-2 px-2 py-1 rounded transition-colors"
    >
      {/* Avatar */}
      {showAvatar ? (
        <div className="flex-shrink-0 mt-0.5">
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-10 h-10 rounded-full"
          />
        </div>
      ) : (
        <div className="w-10 flex-shrink-0" />
      )}

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {/* Name + timestamp row */}
        {showAvatar && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-sm font-medium text-white">{displayName}</span>
            <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
              just now
            </span>
          </div>
        )}

        {/* Message text */}
        <div className="text-gray-200 text-base leading-relaxed">
          {useTypewriter ? (
            <TextGenerateEffect
              words={message}
              duration={0.3}
              onComplete={onComplete}
            />
          ) : (
            <p>{message}</p>
          )}
        </div>
      </div>
    </m.div>
  );
};

export default memo(ChatMessage);
