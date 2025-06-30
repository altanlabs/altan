import { Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { memo, useCallback, useState } from 'react';

import AgentVarsInput from './AgentVarsInput.jsx';
import ModuleInputVars from './ModuleInputVars.jsx';
import HelperGroups from '../../../../../components/flows/menuvars/HelperGroups.jsx';
import Iconify from '../../../../../components/iconify';
// import { useDebounce } from '../../../../../hooks/useDebounce';

const GROUPS = {
  vars: {
    icon: 'tabler:variable',
  },
  string: {
    icon: 'carbon:string-text',
  },
  object: {
    icon: 'lets-icons:json',
  },
  math: {
    icon: 'tabler:math',
  },
  date: {
    icon: 'ph:calendar-dots-duotone',
  },
  rfc: {
    icon: 'mdi:standard-definition',
  },
};

const ModuleInput = ({ onSelect = null, mode = 'flow', ...other }) => {
  // const inputRef = useRef();
  const [selectedHelperGroup, setSelectedHelperGroup] = useState('vars');

  // console.log("currentExecutions", currentExecutions)
  // const [searchTerm, setSearchTerm] = useState('');
  // const throttledSearch = useDebounce(searchTerm, 500);

  const onSelectHelerGroup = useCallback((e, opt) => setSelectedHelperGroup(opt), []);

  // useEffect(() => {
  //   if (!!searchTerm?.length) {
  //     setSelectedHelperGroup(null);
  //   } else {
  //     setSelectedHelperGroup('vars');
  //   }
  // }, [searchTerm]);

  // const setTextInputRef = (element) => {
  //   inputRef.current = element;
  // };

  // const onSearchTermChange = useCallback((e) => setSearchTerm(e.target.value), []);

  // useEffect(() => {
  //   inputRef.current?.focus();
  // }, []);

  return (
    <Stack
      width="100%"
      height="100%"
      alignItems="start"
      justifyContent="left"
      className="relative"
      sx={{ zIndex: 9999 }}
      {...other}
    >
      <Stack
        width="100%"
        spacing={0.5}
        className="rounded-lg px-1"
      >
        <Stack
          spacing={1}
          width="100%"
        >
          <ToggleButtonGroup
            size="small"
            value={selectedHelperGroup}
            exclusive
            onChange={onSelectHelerGroup}
            aria-label="Helper Group"
            sx={{
              width: '100%',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              backgroundColor: 'transparent',
            }}
          >
            {Object.entries(GROUPS).map(([key, value]) => (
              <ToggleButton
                value={key}
                aria-label={key}
                key={`group-${key}`}
              >
                <Iconify icon={value.icon} />
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {/* <TextField
            label="Search..."
            size="small"
            variant="standard"
            fullWidth
            value={searchTerm}
            onChange={onSearchTermChange}
          /> */}
        </Stack>
      </Stack>
      <Stack
        height="100%"
        width="100%"
        className="overflow-y-auto"
      >
        {(!selectedHelperGroup || selectedHelperGroup !== 'vars') && (
          <HelperGroups
            // searchTerm={throttledSearch}
            selectedGroup={selectedHelperGroup}
            onSelect={onSelect}
          />
        )}

        {(!selectedHelperGroup || selectedHelperGroup === 'vars') &&
          (mode === 'agent' ? (
            <AgentVarsInput
              // searchTerm={throttledSearch}
              onSelect={onSelect}
            />
          ) : (
            <ModuleInputVars
              // searchTerm={throttledSearch}
              onSelect={onSelect}
            />
          ))}
      </Stack>
    </Stack>
  );
};

export default memo(ModuleInput);
