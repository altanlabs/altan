import { Skeleton } from '@mui/material';
import { createSelector } from '@reduxjs/toolkit';
import { memo, useMemo } from 'react';

import ConnectionCreator from './ConnectionCreator';
import { selectConnectionTypes } from '../../redux/slices/connections';
import { selectCustomConnectionTypes } from '../../redux/slices/general/index.ts';
import { useSelector } from '../../redux/store.ts';

const selectAllConnectionTypes = createSelector(
  [selectConnectionTypes, selectCustomConnectionTypes],
  (conns, myConns) => [...conns, ...(myConns ?? [])],
);

const CreateConnection = ({ id, accountId = null, external_id = null, popup = true, setIsCreatingNewConnection = null }) => {
  const types = useSelector(selectAllConnectionTypes);
  const connType = useMemo(() => types.find((connType) => connType.id === id), [types, id]);
  return connType ? (
    <ConnectionCreator
      connectionType={connType}
      setIsCreatingNewConnection={setIsCreatingNewConnection}
      accountId={accountId}
      external_id={external_id}
      popup={popup}
    />
  ) : (
    <Skeleton sx={{ width: '100%', height: 50 }} />
  );
};

export default memo(CreateConnection);
