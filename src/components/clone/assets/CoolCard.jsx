import { useTheme, Stack, Typography, IconButton, Tooltip } from '@mui/material';
import Button from '@mui/material/Button';
import React, { memo } from 'react';

import IconRenderer from '../../icons/IconRenderer';

const CoolCard = ({
  name = 'unknown',
  icon = null,
  description = null,
  subDescription = null,
  actions = null,
  flat = false,
  sx = null,
}) => {
  const theme = useTheme();
  return (
    <Stack
      direction="row"
      spacing={2}
      padding={1}
      width="100%"
      sx={{
        ...(!flat && {
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '12px',
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 4px 15px rgba(0, 255, 255, 0.1)' // Neon glow in dark mode
              : '0 2px 10px rgba(0, 0, 0, 0.1)', // Subtle shadow in light mode
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 4px 25px rgba(0, 255, 255, 0.2)'
                : '0 4px 15px rgba(0, 0, 0, 0.2)', // Slightly more shadow on hover
          },
        }),
        ...(sx || {}),
      }}
    >
      {!(actions || icon) ? null : (
        <Stack
          alignItems="center"
          justifyContent="center"
        >
          {!!icon && (
            <IconRenderer
              icon={icon}
              size={30}
              sx={{
                filter:
                  theme.palette.mode === 'dark'
                    ? 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.5))' // Glow for icons in dark mode
                    : 'none',
                // color: '#ccc'
              }}
            />
          )}
          {!!actions &&
            actions.map((a, index) => (
              <Tooltip
                title={a.tooltip}
                key={`tooltip-${index}-${a.label}`}
              >
                {!!a.label ? (
                  <Button
                    size="small"
                    onClick={a.onClick}
                  >
                    {a.label}
                  </Button>
                ) : (
                  <IconButton
                    size="small"
                    onClick={a.onClick}
                  >
                    <IconRenderer
                      icon={a.icon}
                      sx={{
                        filter:
                          theme.palette.mode === 'dark'
                            ? 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.5))' // Glow for icons in dark mode
                            : 'none',
                        // color: '#ccc'
                      }}
                    />
                  </IconButton>
                )}
              </Tooltip>
            ))}
        </Stack>
      )}

      <Stack
        spacing={0}
        width="100%"
      >
        <Typography
          variant="h6"
          sx={{
            // color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#eee',
            // textShadow: theme.palette.mode === 'dark' ? '0 0 10px rgba(0, 255, 255, 0.5)' : 'none',
            fontFamily: 'Inter Tight, sans-serif',
          }}
          noWrap
        >
          {name}
        </Typography>
        {!!description?.length && (
          <Tooltip
            arrow
            followCursor
            title={description}
          >
            <Typography
              variant="body2"
              sx={{
                // color: theme.palette.mode === 'dark' ? '#eee' : '#ccc',
                fontFamily: 'Inter Tight, sans-serif',
              }}
              noWrap
            >
              {description}
            </Typography>
          </Tooltip>
        )}
        {!!subDescription?.length && (
          <Tooltip
            arrow
            followCursor
            title={subDescription}
          >
            <Typography
              variant="caption"
              sx={{
                // color: theme.palette.mode === 'dark' ? '#eee' : '#ccc',
                fontFamily: 'Inter Tight, sans-serif',
              }}
              noWrap
            >
              {subDescription}
            </Typography>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
};

export default memo(CoolCard);
