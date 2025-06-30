import { Chip, Stack, Tooltip, Typography } from '@mui/material';
import { memo } from 'react';

import Iconify from '../../../../components/iconify';
import IconRenderer from '../../../../components/icons/IconRenderer.jsx';

const PanelRow = ({
  icon,
  name,
  description,
  options = null,
  onClick = null,
  hideArrow = false,
  disabled = false,
  sx = {},
}) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="left"
    height={50}
    sx={{
      ...(!disabled
        ? {
            cursor: 'pointer',
            opacity: 1,
            '&:hover': {
              opacity: 0.8,
              borderLeft: '5px solid #aaa',
              '& .right-arrow-icon': {
                opacity: 1,
              },
              '& .panel-icon': {
                transform: 'scale(1.2)',
              },
            },
          }
        : {
            cursor: 'not-allowed',
            opacity: 0.7,
          }),
      position: 'relative',
      transition: 'all 300ms ease',
      ...sx,
      '& .panel-icon': {
        transition: 'transform 300ms ease',
      },
      '& .right-arrow-icon': {
        transition: 'all 300ms ease',
        opacity: 0,
        position: 'absolute',
        right: 5,
        top: '50%',
        transform: 'translateY(-50%)',
      },
      borderLeft: '5px solid transparent',
      maxWidth: '100%',
    }}
    spacing={2.5}
    paddingX={2}
    paddingY={1}
    width="100%"
    onClick={onClick}
  >
    <IconRenderer
      icon={icon}
      size={32}
      className="panel-icon"
    />
    <Tooltip
      title={description}
      arrow
      placement="left"
      enterDelay={800}
      enterNextDelay={800}
    >
      <Stack
        sx={{
          maxWidth: '100%',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 'bold', fontSize: '0.9rem', transition: 'all 300ms ease' }}
        >
          {name.replace(/\[.*?\]\s*/, '')}
        </Typography>
      </Stack>
    </Tooltip>

    {/* <Typography variant="caption" sx={{ fontWeight: 'light', fontSize: '0.7rem', maxWidth: '100%', paddingRight: 5 }} noWrap>{description}</Typography> */}

    <Stack
      className="right-arrow-icon"
      direction="row"
      alignItems="center"
      justifyContent="left"
      spacing={1}
    >
      {options !== null && (
        <Chip
          size="small"
          label={`${options.length} options`}
        />
      )}
      {!hideArrow && <Iconify icon="mdi:chevron-right" />}
    </Stack>
  </Stack>
);

export default memo(PanelRow);
