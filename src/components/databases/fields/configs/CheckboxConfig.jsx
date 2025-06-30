import { Icon } from '@iconify/react';
import { Box, Typography, IconButton, Popover, Grid } from '@mui/material';
import { memo, useState } from 'react';

const ICONS = [
  'mdi:check',
  'mdi:close',
  'mdi:star',
  'mdi:heart',
  'mdi:thumb-up',
  'mdi:flag',
  'mdi:circle-small',
];
const COLORS = [
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#EAB308', // Yellow
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#EF4444', // Red
  '#6B7280', // Gray
  '#FB923C', // Orange
  '#A855F7', // Purple
];

const CheckboxConfig = ({ config, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStyleSelect = (icon, color) => {
    onChange({
      ...config,
      checkbox_options: {
        icon,
        color,
      },
    });
    handleClose();
  };

  const open = Boolean(anchorEl);
  const currentStyle = config.checkbox_options || { icon: ICONS[0], color: COLORS[0] };

  return (
    <Box>
      <Typography
        variant="body2"
        color="textSecondary"
        gutterBottom
      >
        Style
      </Typography>

      <IconButton
        onClick={handleClick}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          padding: 1,
          color: currentStyle.color,
        }}
      >
        <Icon
          icon={currentStyle.icon}
          width="20"
          height="20"
        />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 320 }}>
          {COLORS.map((color, rowIndex) => (
            <Grid
              container
              spacing={1}
              key={color}
              sx={{
                mb: rowIndex !== COLORS.length - 1 ? 1 : 0,
              }}
            >
              {ICONS.map((icon, colIndex) => (
                <Grid
                  item
                  key={`${color}-${icon}`}
                >
                  <IconButton
                    onClick={() => handleStyleSelect(icon, color)}
                    sx={{
                      color: color,
                      padding: 0.5,
                      '&:hover': {
                        backgroundColor: `${color}10`,
                      },
                    }}
                  >
                    <Icon
                      icon={icon}
                      width="20"
                      height="20"
                    />
                  </IconButton>
                </Grid>
              ))}
            </Grid>
          ))}
        </Box>
      </Popover>
    </Box>
  );
};

export default memo(CheckboxConfig);
