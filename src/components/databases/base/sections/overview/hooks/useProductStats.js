import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { optimai_cloud } from '../../../../../../utils/axios';

export const useProductStats = (baseId, base, isPaused) => {
  const [userCount, setUserCount] = useState(0);
  const [bucketCount, setBucketCount] = useState(0);

  // Get functions from Redux store
  const functionsData = useSelector((state) => state.functions?.functions?.[baseId]);
  const functionCount = functionsData?.items?.length || 0;

  const fetchUserCount = async () => {
    try {
      const response = await optimai_cloud.post(`/v1/pg-meta/${baseId}/query`, {
        query: 'SELECT COUNT(*) as count FROM auth.users',
      });
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setUserCount(parseInt(response.data[0].count, 10) || 0);
      }
    } catch (error) {
      console.error('Error fetching user count:', error);
      setUserCount(0);
    }
  };

  const fetchBucketCount = async () => {
    try {
      const response = await optimai_cloud.post(`/v1/pg-meta/${baseId}/query`, {
        query: 'SELECT COUNT(*) as count FROM storage.buckets',
      });
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setBucketCount(parseInt(response.data[0].count, 10) || 0);
      }
    } catch (error) {
      console.error('Error fetching bucket count:', error);
      setBucketCount(0);
    }
  };

  useEffect(() => {
    if (base && !isPaused) {
      fetchUserCount();
      fetchBucketCount();
    }
  }, [baseId, base, isPaused]);

  // Only count tables in the public schema
  const tableCount =
    base?.tables?.items?.filter((table) => table.schema === 'public').length || 0;

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
      case 'secrets':
        return '0 secrets';
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

