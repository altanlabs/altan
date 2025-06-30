import { Icon } from '@iconify/react';
import { Box, Typography, IconButton, Popover, Grid, TextField, MenuItem } from '@mui/material';
import { memo, useState } from 'react';

const ICONS = ['mdi:star', 'mdi:heart', 'mdi:circle', 'mdi:thumb-up', 'mdi:flag', 'mdi:diamond'];
const COLORS = [
  '#EAB308', // Yellow (default)
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#EF4444', // Red
  '#6B7280', // Gray
  '#FB923C', // Orange
  '#A855F7', // Purple
];

const RatingConfig = ({ config, onChange }) => {
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
      rating_options: {
        ...config.rating_options,
        icon,
        color,
      },
    });
    handleClose();
  };

  const handleMaxValueChange = (event) => {
    onChange({
      ...config,
      rating_options: {
        ...config.rating_options,
        max_value: event.target.value,
      },
    });
  };

  const open = Boolean(anchorEl);
  const currentStyle = config.rating_options || {
    icon: 'mdi:star',
    color: '#EAB308',
    max_value: 5,
  };

  return (
    <Box className="space-y-4">
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
      </Box>

      <Box>
        <Typography
          variant="body2"
          color="textSecondary"
          gutterBottom
        >
          Maximum value
        </Typography>
        <TextField
          select
          fullWidth
          size="small"
          value={currentStyle.max_value || 5}
          onChange={handleMaxValueChange}
        >
          {[3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <MenuItem
              key={value}
              value={value}
            >
              {value}
            </MenuItem>
          ))}
        </TextField>
      </Box>

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
              {ICONS.map((icon) => (
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

export default memo(RatingConfig);
