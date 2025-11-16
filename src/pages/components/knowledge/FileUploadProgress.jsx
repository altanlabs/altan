import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Table,
  Typography,
  TableRow,
  TableBody,
  TableCell,
  TableContainer,
  Box,
  Tooltip,
  Collapse,
  IconButton,
  Toolbar,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import CircularProgressWithChildren from '../../../components/progress/CircularProgressWithChildren';
// @mui

// components
import { checkUploadFinished, resetFilesUploading } from '../../../redux/slices/files';
import { dispatch } from '../../../redux/store.ts';
import { bgBlur } from '../../../utils/cssStyles';

// ----------------------------------------------------------------------

function formatBytes(bytes) {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  } else if (bytes < 1024 * 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  } else {
    return (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2) + ' TB';
  }
}

const truncateWithEllipses = (text, max) =>
  text.substr(0, max - 1) + (text.length > max ? '...' : '');

const CircularUploadProgress = (props) =>
  props.value < 100 && !props?.error ? (
    <CircularProgressWithChildren {...props}>
      <Typography
        variant="caption"
        component="div"
        color="text.secondary"
      >
        {`${Math.round(props.value)}%`}
      </Typography>
    </CircularProgressWithChildren>
  ) : props?.error ? (
    <Tooltip
      title={error?.data?.detail}
      arrow
    >
      <CancelTwoToneIcon color={'error'} />
    </Tooltip>
  ) : (
    <CheckCircleIcon color={'success'} />
  );

// ----------------------------------------------------------------------

export const FileUploadProgressAbsolute = () => {
  const theme = useTheme();
  const { filesUploading, filesIdsUploading } = useSelector((state) => state.files);
  const [open, setOpen] = useState(true);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const filesUploadedNum = Object.values(filesUploading).filter(
    (file) => file.progress === 100,
  ).length;
  const filesUploadingNum = Object.keys(filesUploading).length;
  const allFilesuploaded = filesUploadedNum === filesUploadingNum;

  const handleCloseUploadCart = () => {
    if (allFilesuploaded) {
      dispatch(resetFilesUploading());
    } else {
      const remainingFiles = dispatch(checkUploadFinished());
    }
  };

  const uploadProgress =
    Object.values(filesUploading).reduce((sum, file) => sum + file.progress, 0) /
    Object.keys(filesUploading).length;

  return (
    filesUploading &&
    !!Object.keys(filesUploading).length && (
      <Box
        sx={{
          display: 'flex',
          p: 0,
          left: 10,
          bottom: 10,
          borderRadius: '10px',
          maxWidth: isMobile ? '95vw' : 400,
          width: 400 - isMobile * 90,
          overflow: 'hidden',
          zIndex: 999,
          position: 'fixed',
          boxShadow: `-12px 12px 32px -4px ${alpha(
            theme.palette.mode === 'light' ? theme.palette.grey[600] : theme.palette.common.black,
            0.36,
          )}`,
          ...bgBlur({ color: theme.palette.background.default, opacity: 0.9 }),
        }}
      >
        <TableContainer
          sx={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'unset',
            maxHeight: 300,
            maxWidth: isMobile ? '95vw' : 400,
            borderRadius: '10px',
          }}
        >
          <Toolbar
            sx={{
              pl: { sm: 2 },
              pr: { xs: 1, sm: 1 },
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 2,
            }}
          >
            <Tooltip
              title={`${filesUploadedNum}/${filesUploadingNum} files successfully uploaded`}
              arrow
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <CircularUploadProgress value={uploadProgress} />
              </Box>
            </Tooltip>
            <Box
              component="div"
              sx={{ flex: 1, marginLeft: 2 }}
            >
              {allFilesuploaded
                ? 'Upload Success'
                : `${filesUploadedNum}/${filesUploadingNum} uploads completed`}
            </Box>
            <IconButton
              size="small"
              aria-label="toggle table body"
              onClick={() => setOpen(!open)}
            >
              <ExpandMoreIcon sx={{ transform: open ? 'rotate(0deg)' : 'rotate(-180deg)' }} />
            </IconButton>
            <IconButton
              size="small"
              aria-label="toggle table body"
              onClick={handleCloseUploadCart}
            >
              <CloseIcon sx={{ transform: open ? 'rotate(0deg)' : 'rotate(-180deg)' }} />
            </IconButton>
          </Toolbar>
          <Collapse
            in={open}
            timeout="auto"
            unmountOnExit
          >
            <Table
              stickyHeader
              aria-label="file uploading table"
            >
              <TableBody
                sx={{
                  maxHeight: 236,
                  display: 'block',
                  overflow: 'auto',
                }}
              >
                {[...filesIdsUploading].reverse().map((fileId) => (
                  <TableRow
                    key={fileId}
                    hover
                    sx={{ padding: 1 }}
                  >
                    <TableCell
                      sx={{
                        width: 225 - isMobile * 110,
                        padding: 1,
                      }}
                      align="center"
                    >
                      <Tooltip
                        title={filesUploading[fileId].file.name}
                        arrow
                      >
                        <span>
                          {truncateWithEllipses(
                            filesUploading[fileId].file.name,
                            isMobile ? 17 : 25,
                          )}
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell
                      sx={{
                        width: 100,
                        padding: 1,
                        paddingLeft: 2,
                      }}
                      align="center"
                    >
                      {formatBytes(filesUploading[fileId].file.size)}
                    </TableCell>
                    <TableCell
                      sx={{
                        padding: 1,
                        paddingLeft: 3,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 75 - isMobile * 20,
                      }}
                      align="center"
                    >
                      <CircularUploadProgress
                        value={filesUploading[fileId].progress}
                        error={filesUploading[fileId]?.error}
                        size={25}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Collapse>
        </TableContainer>
      </Box>
    )
  );
};
