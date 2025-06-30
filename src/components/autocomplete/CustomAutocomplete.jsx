import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import {
  Typography,
  Box,
  IconButton,
  Tooltip,
  List,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Stack,
  ListItemButton,
  InputAdornment,
  useTheme,
  Select,
} from '@mui/material';
import { useState, memo } from 'react';

import { CustomTextField } from '../../components/custom-input';
import Iconify from '../iconify/Iconify';

const CustomAutocompletePopover = ({
  secondaryLabel,
  icon,
  options,
  selectedElements,
  setSelected,
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [openSearch, setOpenSearch] = useState(false);

  const handleToggle = (value) =>
    setSelected((prevSelected) => {
      const currentIndex = prevSelected.indexOf(value);
      const newSelected = [...prevSelected];

      if (currentIndex === -1) {
        newSelected.push(value);
      } else {
        newSelected.splice(currentIndex, 1);
      }

      return newSelected;
    });

  const handleCloseQuery = () => {
    setTimeout(() => {
      setSearchQuery('');
      setOpenSearch(false);
    }, 500);
  };

  const handleSelectAll = () => {
    setSelected((prevSelected) => {
      if (prevSelected.length === options.length) {
        return [];
      }
      return options.map((bot) => bot.id);
    });
  };

  const filteredOptions = options.filter((option) =>
    option?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Box sx={{ p: 0, width: 375, maxHeight: '80vh', overflow: 'auto' }}>
      <Stack
        direction="row"
        justifyContent="left"
        alignItems="center"
        spacing={3}
        sx={{
          p: 1.5,
          position: 'sticky',
          top: 0,
          backgroundColor:
            theme.palette.mode == 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
          zIndex: 1,
        }}
      >
        <IconButton
          edge="end"
          color="primary"
          onClick={handleSelectAll}
        >
          <Tooltip
            title="Select All"
            placement="top"
          >
            <SelectAllIcon />
          </Tooltip>
        </IconButton>
        {options?.length > 1 && (
          <Stack
            direction="row"
            sx={{
              display: 'flex',
              width: 300,
              overflow: 'hidden',
              justifyContent: 'left',
            }}
          >
            {!openSearch ? (
              <IconButton
                edge="end"
                color="primary"
                onClick={() => setOpenSearch(!openSearch)}
                sx={{ ml: 0.8, transition: theme.transitions.create(['transform']) }}
              >
                <SearchIcon />
              </IconButton>
            ) : null}
            {openSearch ? (
              <CustomTextField
                variant="outlined"
                size="small"
                value={searchQuery}
                onBlur={handleCloseQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roles"
                autoFocus
                sx={{
                  width: openSearch ? 250 : 0,
                  transition: theme.transitions.create(['width', 'transform']),
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            ) : null}
          </Stack>
        )}
      </Stack>
      <List
        sx={{
          pt: 0,
          pb: 0,
        }}
      >
        {filteredOptions.map((option, index) => {
          // const [isHovered, setIsHovered] = useState(false);
          return (
            <ListItemButton
              key={`${option?.id}`}
              selected={selectedElements.includes(option?.id)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggle(option?.id);
              }}
              // onMouseEnter={() => setIsHovered(true)}
              // onMouseLeave={() => setIsHovered(false)}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <ListItemAvatar>
                  <Avatar>
                    {!!selectedElements.includes(option.id) ? (
                      <CheckCircleIcon />
                    ) : (
                      <Iconify icon={icon} />
                    )}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={option?.name}
                  secondary={
                    <Typography variant="subtitle2">
                      {option?.permissions?.length} {secondaryLabel}
                    </Typography>
                  }
                />
                <Stack
                  direction="row"
                  sx={{
                    display: 'flex',
                    pl: 5,
                  }}
                  spacing={1.5}
                >
                  <Tooltip
                    title={
                      <List
                        sx={{
                          pt: 0,
                          pb: 0,
                          width: 250,
                          maxHeight: 250,
                          overflowY: 'auto',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {option.permissions.map((perm, i) => (
                          <ListItemText
                            key={perm?.id}
                            primary={perm?.name}
                            disabled
                          />
                        ))}
                      </List>
                    }
                  >
                    <Iconify icon="mdi:info" />
                  </Tooltip>
                </Stack>
              </Stack>
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
};

const CustomAutocomplete = ({ icon, label, secondaryLabel, options, selected, setSelected }) => {
  return (
    <Select
      labelId="multiple-checkbox-label"
      id="multiple-checkbox"
      multiple
      sx={{ m: 0, height: 40, width: 300, minWidth: 200 }}
      value={selected}
      displayEmpty
      renderValue={(selected) => (
        <>
          <span>{!selected?.length ? `Select ${label}` : `${selected?.length} ${label}`}</span>
          {icon && (
            <Iconify
              icon={icon}
              width={22}
              sx={{ position: 'absolute', right: 25 }}
            />
          )}
        </>
      )}
      MenuProps={{
        sx: {
          p: 0,
          m: 0,
          '.MuiList-root': {
            p: 0,
          },
        },
      }}
    >
      <CustomAutocompletePopover
        secondaryLabel={secondaryLabel}
        icon={icon}
        options={options}
        selectedElements={selected}
        setSelected={setSelected}
      />
    </Select>
  );
};

export default memo(CustomAutocomplete);
