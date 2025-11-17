import React, { useEffect, memo } from 'react';
import { useParams } from 'react-router';

import CloudLayout from './CloudLayout.jsx';
import { fetchCloud, selectCloudById, selectIsCloudStopped } from '../../redux/slices/cloud';
import { dispatch, useSelector } from '../../redux/store.ts';
import LoadingFallback from '../LoadingFallback.jsx';

function Cloud() {
  const { cloudId, section, tableId } = useParams();

  // Determine active section from URL
  // sections: overview (default), tables, users, services, storage, auth, logs, sql-editor, realtime
  const activeSection = section || (tableId ? 'tables' : 'overview');

  // Get cloudId from URL params
  const cloud = useSelector((state) => selectCloudById(state, cloudId));
  const isCloudStopped = useSelector((state) => selectIsCloudStopped(state, cloudId));
  const isLoading = useSelector((state) => state.cloud.isLoading);

  // Fetch cloud data on mount
  useEffect(() => {
    if (cloudId && !cloud) {
      dispatch(fetchCloud(cloudId));
    }
  }, [cloudId, cloud]);
  console.log('cloud', cloudId);

  if (isLoading && !cloud) {
    return <LoadingFallback />;
  }

  return (
    <CloudLayout
      cloudId={cloudId}
      tableId={tableId}
      activeSection={activeSection}
      isCloudStopped={isCloudStopped}
    />
  );
}

export default memo(Cloud);
