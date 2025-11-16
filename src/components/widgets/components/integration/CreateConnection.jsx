import { Skeleton } from '@mui/material';
import { memo, useEffect } from 'react';
import { useSelector } from 'react-redux';

import ConnectionCreator from '../../../components/integration/ConnectionCreator';
import { fetchConnectionType } from '../../../redux/slices/connections';
import { dispatch } from '../../../redux/store.ts';

function CreateConnection({ id, accountId = null, external_id = null, popup = true }) {
  const { types } = useSelector((state) => state.connections);
  useEffect(() => {
    const connType = types.some(connType => connType.id === id);
    if (!connType) {
      dispatch(fetchConnectionType(id));
    }
  }, [dispatch, types, id]);

  const connType = types.find(connType => connType.id === id);

  return connType ? (
    <ConnectionCreator
      connectionType={connType}
      accountId={accountId}
      external_id={external_id}
      popup={popup}
    />
  ) : (
    <Skeleton sx={{ width: '100%', height: 50 }} />
  );
}

export default memo(CreateConnection);
