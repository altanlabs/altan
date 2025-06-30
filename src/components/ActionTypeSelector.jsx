import {
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { memo, useState, useEffect, useRef } from 'react';

import Iconify from './iconify';
import ExternalConnectionTypes from '../sections/@dashboard/flows/modulespanel/ExternalConnectionTypes';
import PanelRow from '../sections/@dashboard/flows/modulespanel/PanelRow';

const ActionTypeSelector = ({ value, onChange }) => {
  const inputRef = useRef();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConnectionType, setSelectedConnectionType] = useState(null);

  const setTextInputRef = (element) => {
    inputRef.current = element;
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedConnectionType]);

  return (
    <Paper
      sx={{
        width: '100%',
        height: '100%',
        background: 'none',
        py: 1,
        m: 2,
        px: 2,
        border: (theme) => `dashed 1px ${theme.palette.divider}`,
      }}
    >
      {value ? (
        <Stack spacing={1}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
          >
            <IconButton
              onClick={() => onChange(null)}
              sx={{ position: 'absolute', top: -5, right: -5 }}
            >
              <Iconify icon="maki:cross" />
            </IconButton>
            <PanelRow
              icon={value.action.connection_type.icon}
              name={value.action.name.slice(0, 50)}
              description={value.action.description}
              hideArrow
            />
          </Stack>
          <ToggleButtonGroup
            exclusive
            value={value.type}
            onChange={(e, v) => onChange({ ...value, type: v })}
            fullWidth
          >
            <Tooltip
              arrow
              title="Queries third-party applications for specific data, essential for workflows that depend on external information."
            >
              <ToggleButton value="search">
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                >
                  <Iconify icon="icon-park-solid:search" />
                  <Typography>Search</Typography>
                </Stack>
              </ToggleButton>
            </Tooltip>
            <Tooltip
              arrow
              title="Performs actions within third-party applications, automating external processes as part of the workflow."
            >
              <ToggleButton value="action">
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                >
                  <Iconify icon="carbon:api-1" />
                  <Typography>Action</Typography>
                </Stack>
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </Stack>
      ) : (
        <>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            {!!selectedConnectionType && (
              <Tooltip
                arrow
                followCursor
                title={'Go back to connection selection'}
              >
                <IconButton
                  size="small"
                  onClick={() => setSelectedConnectionType(null)}
                >
                  <Iconify icon="mdi:chevron-left" />
                </IconButton>
              </Tooltip>
            )}

            <TextField
              inputRef={setTextInputRef}
              placeholder="Search action..."
              // value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="mdi:search" />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
          <div style={{ height: '300px' }}>
            <ExternalConnectionTypes
              delegateSelect={true}
              searchTerm={searchTerm}
              selected={selectedConnectionType}
              onSelect={(value) => {
                if (!selectedConnectionType) {
                  setSelectedConnectionType(value);
                  setSearchTerm('');
                } else {
                  console.log('value', value);
                  onChange({
                    type: value.method.toLowerCase() === 'get' ? 'search' : 'action',
                    action: {
                      ...value,
                      connection_type_id: selectedConnectionType?.id,
                      connection_type: {
                        id: selectedConnectionType?.id,
                        icon: selectedConnectionType?.icon,
                      },
                    },
                  });
                  // onChange([{webhook_id: value.id}])
                }
              }}
              filterOutEmpty={true}
            />
          </div>
        </>
      )}
    </Paper>
  );
};

export default memo(ActionTypeSelector);
