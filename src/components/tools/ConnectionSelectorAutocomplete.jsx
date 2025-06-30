import { Stack, Typography, TextField, Tooltip, Autocomplete } from '@mui/material';
import { memo, useMemo } from 'react';

import { CustomAvatar } from '../custom-avatar';
import ConnectionCard from './ConnectionCard';
import useAccountUser from '../../hooks/useAccountUser';
import Iconify from '../iconify';

// const renderOption = useCallback((props, option) => {
//   const src = option.user_id && `https://storage.googleapis.com/logos-chatbot-optimai/user/${option.user_id}`;
//   return (
//     <li {...props} key={`connection-${option.id}`}>
//       <Stack
//         direction="row"
//         spacing={1}
//         alignItems="center"
//       >
//         {connectionType?.icon && (
//           <IconRenderer
//             sx={{ width: 20, height: 20 }}
//             variant="circular"
//             icon={connectionType?.icon}
//             color={connectionType?.meta_data?.color || 'inherit'}
//           />
//         )}
//         <Typography color="text.primary">{option.name}</Typography>
//         {src && <CustomAvatar sx={{ width: 20, height: 20 }} variant="circular" src={src} />}
//       </Stack>
//     </li>
//   );
// }, [connectionType?.icon, connectionType?.meta_data?.color]);

const renderOption = ({ key, ...props }, option) => (
  <Stack
    direction="row"
    alignItems="center"
    padding={0}
    key={key}
    sx={{ justifyContent: 'space-between' }}
    {...props}
  >
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
    >
      {option.id !== 'add-conn' && (
        <Tooltip
          title={<ConnectionCard connection={option} />}
          componentsProps={{
            tooltip: {
              sx: {
                backgroundColor: 'transparent',
                boxShadow: 1,
                borderRadius: 1,
                p: 0,
                maxWidth: 'none',
              },
            },
          }}
          placement="left"
          enterDelay={700}
          enterNextDelay={700}
        >
          <Iconify
            icon="ph:info-duotone"
            className="cursor-help"
            width={15}
          />
        </Tooltip>
      )}
      <Typography variant="caption">{option.name}</Typography>
    </Stack>
  </Stack>
);

const getOptionKey = (option) => option.id;
const getOptionLabel = (option) => (typeof option.name === 'string' ? option.name : '');
const isOptionEqualToValue = (option, value) => option.id === value?.id;

const ConnectionSelectorAutocomplete = ({
  connection,
  connections,
  onChange,
  variant = 'filled',
}) => {
  const selectedUser = useAccountUser(connection?.user_id);

  const options = useMemo(
    () => [...(connections ?? []), { name: '+ Create connection', id: 'add-conn' }],
    [connections],
  );

  return (
    <Autocomplete
      fullWidth
      options={options}
      getOptionKey={getOptionKey}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Connection"
          variant={variant}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                {selectedUser && (
                  <Tooltip
                    title={<ConnectionCard connection={connection} />}
                    componentsProps={{
                      tooltip: {
                        // className: "before:backdrop-blur-sm before:backdrop-hack p-0",
                        sx: {
                          backgroundColor: 'transparent',
                          boxShadow: 1,
                          borderRadius: 1,
                          p: 0,
                          maxWidth: 'none',
                        },
                      },
                    }}
                    placement="left"
                    enterDelay={700}
                    enterNextDelay={700}
                  >
                    <span>
                      <CustomAvatar
                        sx={{ width: 20, height: 20, cursor: 'help' }}
                        name={selectedUser?.user?.person?.first_name}
                        src={selectedUser?.user?.person?.avatar_url}
                      />
                    </span>
                  </Tooltip>
                )}
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={renderOption}
      value={connection}
      onChange={onChange} // {handleConnectionChange}
      size="small"
    />
  );
};

export default memo(ConnectionSelectorAutocomplete);
