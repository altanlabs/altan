import { Card, Typography, Box, IconButton } from '@mui/material';
import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useAudioRecorder } from 'react-audio-voice-recorder';
import { LiveAudioVisualizer } from 'react-audio-visualize';

import { getBase64FromFile } from '@lib/utils';

import { getTimestamp } from '../../modules/utils/utils';
import Iconify from '../iconify/Iconify.jsx';

// import { AudioVisualizer } from 'react-audio-visualize';

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const AudioRecorder = ({ setAttachment }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [stream, setStream] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const audioContextRef = useRef(new (window.AudioContext || window.webkitAudioContext)());
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const timerRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioChunksRef = useRef([]);

  const resetRecordingState = () => {
    setRecordingDuration(0);
    setIsRecording(false);
    setAudioChunks([]);
    setMediaRecorder(null);
    setStream(null);
    clearInterval(timerRef.current);
  };

  const handleRecordingComplete = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.onstop = async () => {
        const chunks = audioChunksRef.current;
        if (chunks.length > 0) {
          const recordedAudioFile = new File(chunks, 'recordedaudio.mp3', { type: 'audio/mp3' });
          setAttachment({
            file_content: (await getBase64FromFile(recordedAudioFile)).split(',')[1],
            file_name: `recordedaudio-${getTimestamp()}.mp3`,
            mime_type: 'audio/mp3',
            preview: URL.createObjectURL(recordedAudioFile),
          });
        }
        resetRecordingState();
      };
      mediaRecorder.stop();
    } else {
      console.error('Media recorder not set or already inactive');
    }
  }, [setAttachment, mediaRecorder]);

  const startMediaRecorder = (mediaStream) => {
    const newMediaRecorder = new MediaRecorder(mediaStream);
    newMediaRecorder.ondataavailable = (event) => {
      setAudioChunks((prevChunks) => [...prevChunks, event.data]);
    };
    newMediaRecorder.start();
    newMediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        const updatedChunks = [...audioChunksRef.current, event.data];
        audioChunksRef.current = updatedChunks;
        setAudioChunks(updatedChunks);
      }
    };
    setMediaRecorder(newMediaRecorder);
    setIsRecording(true);
    timerRef.current = setInterval(() => setRecordingDuration((prev) => prev + 1), 1000);
  };

  const handleStartRecording = async () => {
    if (!stream) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(mediaStream);
        startMediaRecorder(mediaStream);
      } catch (error) {
        console.error('Error getting media stream:', error);
      }
    } else {
      startMediaRecorder(stream);
    }
  };

  const handleTogglePauseResume = () => {
    if (mediaRecorder) {
      if (isPaused) {
        mediaRecorder.resume();
        timerRef.current = setInterval(() => setRecordingDuration((prev) => prev + 1), 1000);
      } else {
        mediaRecorder.pause();
        clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    } else {
      console.error('MediaRecorder not initialized');
    }
  };

  const handleDiscardRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
    }
    resetRecordingState();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      cancelAnimationFrame(animationFrameIdRef.current);
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stream, audioUrl]);

  return (
    <div className="audio-recorder-interface">
      {!isRecording &&
        <button
          onClick={handleStartRecording}
          className="absolute bottom-2 right-2 p-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-500 transform scale-95 transition-all duration-300 ease-in-out cursor-pointer border-none bg-transparent"
        >
          <Iconify icon="fluent:mic-pulse-24-filled" />
        </button>}

      {isRecording && (
        <Card sx={{ width: '275px', p: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" component="div" sx={{ mr: 2 }}>
              {formatTime(recordingDuration)}
            </Typography>
            {isPaused ? (
              <>
                {/* {isPaused && audioUrl && (
                      <audio controls src={audioUrl} />
                    )} */}
                <Typography>Audio paused</Typography>
              </>
            ) : (
              <div style={{ paddingRight: 2 }}>
                {mediaRecorder && (
                  <LiveAudioVisualizer
                    mediaRecorder={mediaRecorder}
                    width={150}
                    height={50}
                    barWidth={10}
                  />
                )}
              </div>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <IconButton onClick={handleDiscardRecording} color="error">
              <Iconify icon="mdi:trash" />
            </IconButton>
            <IconButton onClick={handleTogglePauseResume} color={isPaused ? 'success' : 'error'}>
              <Iconify icon={isPaused ? 'carbon:play-filled' : 'material-symbols:pause'} />
            </IconButton>
            <IconButton onClick={handleRecordingComplete}>
              <Iconify icon="fluent:save-copy-24-filled" color="primary" />
            </IconButton>
          </Box>
        </Card>
      )}
    </div>
  );
};

// const AudioRecorder = ({ setPreview, setFileName, setFileType, uploadMedia }) => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   const [recordingDuration, setRecordingDuration] = useState(0);
//   const timerRef = useRef();
//   const [audioUrl, setAudioUrl] = useState(null); // Add a state to hold the audio URL

//   const {
//     startRecording,
//     stopRecording,
//     togglePauseResume,
//     recordingBlob,
//   } = useAudioRecorder();

//   const handleRecordingComplete = useCallback(() => {
//     if (recordingBlob) {
//       setIsRecording(false);
//       const recordedAudioFile = new File([recordingBlob], "RecordedAudio.mp3", { type: "audio/mp3" });
//       setPreview(URL.createObjectURL(recordedAudioFile));
//       setFileName("RecordedAudio.mp3");
//       setFileType("audio/mp3");
//       uploadMedia(recordedAudioFile);
//     }
//   }, [recordingBlob, setPreview, setFileName, setFileType, uploadMedia]);

//   const handleStartRecording = () => {
//     startRecording();
//     setIsRecording(true);
//     timerRef.current = setInterval(() => setRecordingDuration((prev) => prev + 1), 1000);
//   };

//   const handleStopRecording = () => {
//     stopRecording();
//     setIsRecording(false);
//     clearInterval(timerRef.current);
//   };

//   const handleDiscardRecording = () => {
//     setIsRecording(false);
//     setIsPaused(false);
//     setRecordingDuration(0);
//     clearInterval(timerRef.current);
//     if (audioUrl) {
//       URL.revokeObjectURL(audioUrl);
//       setAudioUrl(null);
//     }
//   };

//   const formatTime = (totalSeconds) => {
//     const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
//     const seconds = (totalSeconds % 60).toString().padStart(2, '0');
//     return `${minutes}:${seconds}`;
//   };

//   const handleTogglePauseResume = () => {
//     // When pausing, stop the recording to generate the blob for preview
//     if (!isPaused) {
//       stopRecording(); // This should trigger the useEffect that creates the audio URL
//       clearInterval(timerRef.current);
//     } else {
//       // When resuming, first check if there's an existing blob and create a URL for it
//       if (recordingBlob) {
//         const url = URL.createObjectURL(recordingBlob);
//         setAudioUrl(url);
//       }
//       // Start a new recording session
//       startRecording();
//       timerRef.current = setInterval(() => setRecordingDuration((prev) => prev + 1), 1000);
//     }
//     setIsPaused(!isPaused);
//   };

//   useEffect(() => {
//     // Create the audio URL for playback when the recording is stopped
//     if (!isRecording && recordingBlob) {
//       const url = URL.createObjectURL(recordingBlob);
//       setAudioUrl(url); // Set URL for preview
//     }

//     return () => {
//       if (audioUrl) {
//         URL.revokeObjectURL(audioUrl);
//       }
//     };
//   }, [isRecording, recordingBlob]);

//   return (
//     <div className="audio-recorder-interface">
//       {!isRecording &&
//         <SendButton isSendButton onClick={handleStartRecording}>
//             <Iconify icon= "fluent:mic-pulse-24-filled"/>
//         </SendButton>
//       }

//       {isRecording && (
//         <Card sx={{width:'275px', p:1}}>
//           <Box sx={{ display: 'flex', alignItems: 'center' }}>
//             <Typography variant="subtitle1" component="div">
//               {formatTime(recordingDuration)}
//             </Typography>
//             {isPaused ? (
//                   <>
//                   {isPaused && audioUrl && (
//                       <audio controls src={audioUrl} />
//                     )}
//                   </>
//             ) : (
//               <Typography variant="subtitle2" component="div" sx={{ ml: 1 }}>
//                 Recording...
//               </Typography>
//             )}
//           </Box>
//           <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
//             <IconButton onClick={handleDiscardRecording} color="error">
//               <Iconify icon="mdi:trash" />
//             </IconButton>
//             <IconButton onClick={handleTogglePauseResume} color={isPaused ? 'success' : 'error'}>
//               <Iconify icon={isPaused ? 'carbon:play-filled' : 'material-symbols:pause'} />
//             </IconButton>
//             <IconButton onClick={handleRecordingComplete}>
//               <Iconify icon="fluent:save-copy-24-filled" color="primary"/>
//             </IconButton>
//           </Box>
//         </Card>
//       )}
//     </div>
//   );
// };

export default AudioRecorder;
