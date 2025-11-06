import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { optimai_cloud } from '../../../utils/axios';

export const useProductStats = (cloudId, cloud, isPaused) => {
  const [userCount, setUserCount] = useState(0);
  const [bucketCount, setBucketCount] = useState(0);

  const functionsData = useSelector((state) => state.functions?.functions?.[cloudId]);
  const functionCount = functionsData?.items?.length || 0;

  useEffect(() => {
    const fetchCounts = async () => {
      if (!cloud || isPaused || !cloudId) return;

      try {
        const [usersRes, bucketsRes] = await Promise.all([
          optimai_cloud.post(`/v1/pg-meta/${cloudId}/query`, {
            query: 'SELECT COUNT(*) as count FROM auth.users',
          }),
          optimai_cloud.post(`/v1/pg-meta/${cloudId}/query`, {
            query: 'SELECT COUNT(*) as count FROM storage.buckets',
          }),
        ]);

        if (usersRes.data?.[0]?.count) {
          setUserCount(parseInt(usersRes.data[0].count, 10) || 0);
        }
        if (bucketsRes.data?.[0]?.count) {
          setBucketCount(parseInt(bucketsRes.data[0].count, 10) || 0);
        }
      } catch (error) {
        // Silently handle errors
      }
    };

    fetchCounts();
  }, [cloudId, cloud, isPaused]);

  const tableCount =
    cloud?.tables?.items?.filter((table) => table.schema === 'public').length || 0;

  const getProductStats = (productId) => {
    switch (productId) {
      case 'database':
        return `${tableCount} tables`;
      case 'users':
        return `${userCount} users`;
      case 'storage':
        return `${bucketCount} buckets`;
      case 'functions':
        return `${functionCount} functions`;
      default:
        return '';
    }
  };

  return {
    userCount,
    bucketCount,
    tableCount,
    functionCount,
    getProductStats,
  };
};

