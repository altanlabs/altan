import { memo } from 'react';
import { useParams } from 'react-router-dom';

// Legacy room implementation
import { RoomContainer } from '../components/new-room';

const RoomPage = () => {
  const { roomId } = useParams();

  return (
    <div className="w-full h-screen flex flex-col">
      <RoomContainer
        key={roomId}
        roomId={roomId}
        mode="ephemeral"
        showHeader={true}
        showConversationHistory={true}
        showMembers={true}
        showSettings={true}
        title="How can I help you today?"
        description="Start a conversation or choose a suggestion below"
        suggestions={[
          'Create a todo app',
          'Explain React hooks',
          'Help me debug this code',
          'Write a function to sort an array',
        ]}
        showModeSelector={false}
        renderCredits={false}
        renderFeedback={false}
      />
    </div>
  );
};

export default memo(RoomPage);
