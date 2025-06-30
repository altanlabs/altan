import { IconButton, Stack, Typography, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { m, AnimatePresence } from 'framer-motion';
// @mui
import PropTypes from 'prop-types';

// utils
import { fData } from '../../../utils/formatNumber';
//
import { varFade } from '../../animate';
import FileThumbnail, { fileData } from '../../file-thumbnail';
import Iconify from '../../iconify';

// ----------------------------------------------------------------------

MultiFilePreview.propTypes = {
  sx: PropTypes.object,
  files: PropTypes.array,
  onRemove: PropTypes.func,
  thumbnail: PropTypes.bool,
};

export default function MultiFilePreview({
  images = false,
  thumbnail,
  files,
  onRemove,
  sx,
  minimal = false,
}) {
  if (!files?.length) {
    return null;
  }
  console.log(images);
  return (
    <AnimatePresence initial={false}>
      {files.map((file) => {
        const { key, name = '', size = 0 } = fileData(file);

        const isNotFormatFile = typeof file === 'string';

        if (thumbnail) {
          return (
            <Stack
              key={key}
              component={m.div}
              {...varFade().inUp}
              alignItems="center"
              display="inline-flex"
              justifyContent="center"
              sx={{
                width: 100,
                height: 100,
                borderRadius: 1.25,
                overflow: 'hidden',
                position: 'relative',
                border: (theme) => `solid 1px ${theme.palette.divider}`,
                ...sx,
              }}
            >
              {!images ? (
                <FileThumbnail
                  tooltip
                  imageView
                  file={file}
                  sx={{ position: 'absolute' }}
                  imgSx={{ position: 'absolute' }}
                />
              ) : (
                <>
                  <Box
                    component="img"
                    src={file}
                    sx={{
                      width: 1,
                      height: 1,
                      flexShrink: 0,
                      objectFit: 'cover',
                      position: 'absolute',
                    }}
                  />
                </>
              )}

              {onRemove && (
                <IconButton
                  size="small"
                  onClick={() => onRemove(file)}
                  sx={{
                    top: 4,
                    right: 4,
                    p: '1px',
                    position: 'absolute',
                    color: (theme) => alpha(theme.palette.common.white, 0.72),
                    bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                    },
                  }}
                >
                  <Iconify
                    icon="eva:close-fill"
                    width={16}
                  />
                </IconButton>
              )}
            </Stack>
          );
        }

        return (
          <Stack
            key={key}
            component={m.div}
            {...varFade().inUp}
            spacing={2}
            direction="row"
            alignItems="center"
            sx={{
              my: 1,
              px: 1,
              py: 0.75,
              borderRadius: 0.75,
              border: (theme) => `solid 1px ${theme.palette.divider}`,
              ...sx,
            }}
          >
            <FileThumbnail file={file} />

            <Stack
              flexGrow={1}
              sx={{ minWidth: 0 }}
            >
              <Typography
                variant="subtitle2"
                noWrap
              >
                {isNotFormatFile ? file : name}
              </Typography>

              <Typography
                variant="caption"
                sx={{ color: 'text.secondary' }}
              >
                {isNotFormatFile ? '' : fData(size)}
              </Typography>
            </Stack>

            {onRemove && (
              <IconButton
                edge="end"
                size="small"
                onClick={() => onRemove(file)}
              >
                <Iconify icon="eva:close-fill" />
              </IconButton>
            )}
          </Stack>
        );
      })}
    </AnimatePresence>
  );
}
