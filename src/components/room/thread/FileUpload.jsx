import { LinearProgress, Typography, Box } from '@mui/material';
import { memo, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { clearUploadState } from '../../../redux/slices/room';
import { dispatch } from '../../../redux/store.js';
import Iconify from '../../iconify/Iconify.jsx';

const handleCloseUploadStatus = () => dispatch(clearUploadState());

function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', pr: 3, pl: 2 }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value,
        )}%`}
        </Typography>
      </Box>
    </Box>
  );
};

const selectFileIsUploading = (state) => state.room.isUploading;
const selectFileUploadProgress = (state) => state.room.uploadProgress;

function FileUpload({ threadId }) {
  const isUploading = useSelector(selectFileIsUploading);
  const uploadProgress = useSelector(selectFileUploadProgress);

  useEffect(() => {
    if (uploadProgress?.threadId === threadId && uploadProgress?.percentCompleted === 100) {
      const timer = setTimeout(() => {
        dispatch(clearUploadState());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [uploadProgress, threadId]);

  return (
    <>
      {
        (uploadProgress?.threadId === threadId) && (isUploading.threadId === threadId) && uploadProgress?.percentCompleted && (
          <div className="relative w-full max-w-[800px] mx-16 xl:mx-10 lg:mx-7 md:mx-7 sm:mx-4 rounded-t-xl border border-gray-300/50 dark:border-gray-700/50 border-b-0 p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
            <LinearProgressWithLabel value={uploadProgress?.percentCompleted} />
            <Iconify
              sx={{
                cursor: 'pointer',
                position: 'absolute',
                right: 5,
                top: 9,
                opacity: 0.5,
              }}
              icon="mdi:close-circle-outline"
              onClick={() => handleCloseUploadStatus()}
            />
          </div>
        )
      }
    </>
  );
}

export default memo(FileUpload);
