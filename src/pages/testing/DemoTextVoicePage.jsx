import {
  Send as SendIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  IconButton,
} from '@mui/material';
import React, { memo, useState, useCallback, useRef, useEffect } from 'react';

import { CompactLayout } from '../../layouts/dashboard';
import { useVoiceConversation } from '../../providers/voice/VoiceConversationProvider';

const DemoTextVoicePage = () => {
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [userTranscripts, setUserTranscripts] = useState([]);
  const [agentResponses, setAgentResponses] = useState([]);
  const [connectionEvents, setConnectionEvents] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const {
    isConnected,
    isConnecting,
    startConversation,
    stopConversation,
    conversation,
  } = useVoiceConversation();

  // Demo agent ID provided by user
  const DEMO_AGENT_ID = 'agent_01k0a970cgfm498b82mfv4y5jp';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, userTranscripts, agentResponses]);

  const addMessage = useCallback((type, content, timestamp = new Date()) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      type,
      content,
      timestamp,
    }]);
  }, []);

  const addConnectionEvent = useCallback((event) => {
    setConnectionEvents(prev => [...prev, {
      id: Date.now() + Math.random(),
      event,
      timestamp: new Date(),
    }]);
  }, []);

  const handleStartConversation = useCallback(async () => {
    try {
      addMessage('system', 'Starting voice conversation...');
      addConnectionEvent('Starting conversation');

      const success = await startConversation({
        agentId: DEMO_AGENT_ID,
        onConnect: () => {
          addMessage('system', '🟢 Voice conversation connected');
          addConnectionEvent('Connected to voice conversation');

          // Try to get conversation ID if available
          if (conversation?.conversation_id) {
            setConversationId(conversation.conversation_id);
          }
        },
        onDisconnect: () => {
          addMessage('system', '🔴 Voice conversation disconnected');
          addConnectionEvent('Disconnected from voice conversation');
        },
        onMessage: (message) => {
          addMessage('voice_event', `Voice Event: ${JSON.stringify(message, null, 2)}`);

          // Handle different message types
          if (message.type === 'user_transcript') {
            const transcript = message.user_transcription_event?.user_transcript;
            if (transcript) {
              setUserTranscripts((prev) => [
                ...prev,
                {
                  id: Date.now() + Math.random(),
                  text: transcript,
                  timestamp: new Date(),
                },
              ]);
              addMessage('user_speech', transcript);
            }
          } else if (message.type === 'agent_response') {
            const response = message.agent_response_event?.agent_response;
            if (response) {
              setAgentResponses((prev) => [
                ...prev,
                {
                  id: Date.now() + Math.random(),
                  text: response,
                  timestamp: new Date(),
                },
              ]);
              addMessage('agent_response', response);
            }
          } else if (message.type === 'interruption') {
            addMessage(
              'system',
              `🟡 Interruption: ${message.interruption_event?.reason || 'Unknown reason'}`,
            );
          }
        },
        onError: (error) => {
          console.error('❌ Voice conversation error:', error);
          addMessage('error', `Voice Error: ${error.message || error}`);
          addConnectionEvent(`Error: ${error.message || error}`);
        },
      });

      if (!success) {
        addMessage('error', 'Failed to start voice conversation');
        addConnectionEvent('Failed to start conversation');
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      addMessage('error', `Failed to start: ${error.message}`);
      addConnectionEvent(`Failed to start: ${error.message}`);
    }
  }, [startConversation, addMessage, addConnectionEvent, conversation]);

  const handleStopConversation = useCallback(async () => {
    try {
      addMessage('system', 'Stopping voice conversation...');
      addConnectionEvent('Stopping conversation');
      await stopConversation();
    } catch (error) {
      console.error('Failed to stop conversation:', error);
      addMessage('error', `Failed to stop: ${error.message}`);
    }
  }, [stopConversation, addMessage, addConnectionEvent]);

  const sendTextMessage = useCallback(async () => {
    if (!textInput.trim()) return;

    try {
      addMessage('text_sent', textInput);
      
      if (!isConnected) {
        addMessage('error', 'Voice conversation must be active to send text messages');
        return;
      }

      // Use the ElevenLabs SDK's built-in methods
      try {
        if (conversation?.sendUserMessage) {
          // Use sendUserMessage for direct conversation (agent will respond)
          console.log('🚀 Sending user message via SDK method:', textInput);
          await conversation.sendUserMessage(textInput);
          addMessage('system', `📤 Sent user message: "${textInput}"`);
          console.log('✅ User message sent successfully');
        } else if (conversation?.sendContextualUpdate) {
          // Fallback to contextual update (background context only)
          console.log('🚀 Sending contextual update via SDK method:', textInput);
          await conversation.sendContextualUpdate(textInput);
          addMessage('system', `📤 Sent contextual update: "${textInput}"`);
          console.log('✅ Contextual update sent successfully');
        } else {
          addMessage('error', 'No send methods available on conversation object');
          console.error('❌ Neither sendUserMessage nor sendContextualUpdate available');
        }
      } catch (sendError) {
        console.error('Error sending message via SDK:', sendError);
        addMessage('error', `Send error: ${sendError.message}`);
      }
      
      setTextInput('');
    } catch (error) {
      console.error('Failed to send text message:', error);
      addMessage('error', `Failed to send text: ${error.message}`);
    }
  }, [textInput, isConnected, conversation, addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setUserTranscripts([]);
    setAgentResponses([]);
    setConnectionEvents([]);
    setConversationId(null);
  }, []);

  const exportTranscript = useCallback(() => {
    const transcript = {
      conversationId,
      timestamp: new Date().toISOString(),
      agentId: DEMO_AGENT_ID,
      messages: messages.map(msg => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      })),
      userTranscripts: userTranscripts.map(t => ({
        text: t.text,
        timestamp: t.timestamp.toISOString(),
      })),
      agentResponses: agentResponses.map(r => ({
        text: r.text,
        timestamp: r.timestamp.toISOString(),
      })),
      connectionEvents: connectionEvents.map(e => ({
        event: e.event,
        timestamp: e.timestamp.toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(transcript, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-conversation-transcript-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [conversationId, messages, userTranscripts, agentResponses, connectionEvents]);

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString();
  };

  const getMessageColor = (type) => {
    switch (type) {
      case 'user_speech': return '#e3f2fd';
      case 'agent_response': return '#f3e5f5';
      case 'text_sent': return '#e8f5e8';
      case 'system': return '#fff3e0';
      case 'error': return '#ffebee';
      case 'voice_event': return '#f5f5f5';
      default: return '#fafafa';
    }
  };

  return (
    <CompactLayout title="Demo Text & Voice Page">
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            ElevenLabs Text & Voice Demo
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Test both text messaging and voice conversation capabilities with transcripts.
            Using Altan Agent ID: <code>{DEMO_AGENT_ID}</code>
          </Typography>

          <Alert severity="info" sx={{ mb: 2 }}>
            This demo shows:
            • Voice conversation with real-time transcripts
            • Text message sending via contextual updates
            • Complete conversation history and analytics
          </Alert>

          {conversationId && (
            <Alert severity="success">
              Active Conversation ID: <code>{conversationId}</code>
            </Alert>
          )}
        </Paper>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left Column - Controls */}
          <Paper sx={{ p: 3, minWidth: 320, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom>
              Controls
            </Typography>

            {/* Voice Controls */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Voice Conversation
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                <Button
                  variant={isConnected ? 'outlined' : 'contained'}
                  startIcon={isConnected ? <MicOffIcon /> : <MicIcon />}
                  onClick={isConnected ? handleStopConversation : handleStartConversation}
                  disabled={isConnecting}
                  color={isConnected ? 'error' : 'primary'}
                  fullWidth
                >
                  {isConnecting ? 'Connecting...' : isConnected ? 'Stop Voice' : 'Start Voice'}
                </Button>
                
                <Chip 
                  label={isConnected ? 'Connected' : 'Disconnected'} 
                  color={isConnected ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </Box>

            {/* Text Message Controls */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Send Text Message
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
                  disabled={!isConnected}
                />
                <IconButton 
                  onClick={sendTextMessage}
                  disabled={!isConnected || !textInput.trim()}
                  color="primary"
                >
                  <SendIcon />
                </IconButton>
              </Box>
              {!isConnected && (
                <Typography variant="caption" color="text.secondary">
                  Voice conversation must be active to send text messages
                </Typography>
              )}
            </Box>

            {/* Utility Controls */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Utilities
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                <Button
                  startIcon={<ClearIcon />}
                  onClick={clearMessages}
                  size="small"
                  variant="outlined"
                >
                  Clear History
                </Button>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={exportTranscript}
                  size="small"
                  variant="outlined"
                  disabled={messages.length === 0}
                >
                  Export Transcript
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Right Column - Messages & Transcripts */}
          <Box sx={{ flexGrow: 1 }}>
            {/* Real-time Messages */}
            <Paper sx={{ p: 3, mb: 3, height: 500, overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Live Conversation Feed
              </Typography>
              
              {messages.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                  Start a voice conversation or send a text message to see activity here
                </Typography>
              ) : (
                <List>
                  {messages.map((message, index) => (
                    <React.Fragment key={message.id}>
                      <ListItem 
                        sx={{ 
                          bgcolor: getMessageColor(message.type),
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip 
                                label={message.type.replace('_', ' ')} 
                                size="small" 
                                variant="outlined"
                              />
                              <Typography variant="caption" color="text.secondary">
                                {formatTimestamp(message.timestamp)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                mt: 1,
                                fontFamily: message.type === 'voice_event' ? 'monospace' : 'inherit',
                                whiteSpace: message.type === 'voice_event' ? 'pre' : 'normal',
                              }}
                            >
                              {message.content}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < messages.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                  <div ref={messagesEndRef} />
                </List>
              )}
            </Paper>

            {/* Transcript Summary */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* User Transcripts */}
              <Paper sx={{ p: 2, flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  User Speech Transcripts ({userTranscripts.length})
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {userTranscripts.length === 0 ? (
                    <Typography color="text.secondary" variant="body2">
                      No speech detected yet
                    </Typography>
                  ) : (
                    userTranscripts.map((transcript) => (
                      <Box key={transcript.id} sx={{ mb: 1, p: 1, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                        <Typography variant="body2">
                          {transcript.text}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(transcript.timestamp)}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Paper>

              {/* Agent Responses */}
              <Paper sx={{ p: 2, flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom color="secondary">
                  Agent Text Responses ({agentResponses.length})
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {agentResponses.length === 0 ? (
                    <Typography color="text.secondary" variant="body2">
                      No agent responses yet
                    </Typography>
                  ) : (
                    agentResponses.map((response) => (
                      <Box key={response.id} sx={{ mb: 1, p: 1, bgcolor: '#f3e5f5', borderRadius: 1 }}>
                        <Typography variant="body2">
                          {response.text}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(response.timestamp)}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Container>
    </CompactLayout>
  );
};

export default memo(DemoTextVoicePage);