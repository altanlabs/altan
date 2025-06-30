import { Stack } from '@mui/material';
import { memo, useMemo } from 'react';

import ModuleVar from './ModuleVar.jsx';
import { makeSelectModule } from '../../../redux/slices/flows';
import { useSelector } from '../../../redux/store';

const ModuleVars = ({
  moduleId,
  executions,
  searchTerm = '',
  onSelect = null,
  mustShowCurrent = false,
  disableSelection = false,
  onShowPopover,
  ...other
}) => {
  const moduleSelector = useMemo(makeSelectModule, []);
  const module = useSelector((state) => moduleSelector(state, moduleId));
  const content = useMemo(() => {
    const content = executions[0]?.content;
    if (!content) {
      return content;
    }
    if (!!mustShowCurrent) {
      delete Object.assign(content, { '[$]': content[`[${module.position}]`] })[
        `[${module.position}]`
      ];
    }
    return content;
  }, [executions, module.position, mustShowCurrent]);

  if (!content) {
    return null;
  }

  return (
    <Stack
      width="100%"
      height="100%"
      // maxHeight="70vh"
      padding={1}
      className={`bg-white dark:bg-gray-900 ${!!(disableSelection && !mustShowCurrent) && 'opacity-70'}`}
      {...other}
    >
      <ModuleVar
        obj={content}
        searchTerm={searchTerm}
        onSelect={onSelect}
        moduleType={module.type}
        disableSelection={disableSelection}
        onShowPopover={onShowPopover}
      />
    </Stack>
  );
};

export default memo(ModuleVars);
