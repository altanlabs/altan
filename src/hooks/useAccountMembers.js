import { throttle } from 'lodash';
import { useState, useCallback, useEffect } from 'react';

import { optimai } from '../utils/axios';

// selectedAccount.id
export const useAccountMembers = ({ accountId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllMembers = useCallback(
    throttle(async () => {
      setLoading(true);
      setError(null);
      try {
        if (!accountId) {
          throw new Error('Cannot fetch members: accountId is undefined');
        }
        const response = await optimai.get(`/account/${accountId}/members`);
        const data = response.data;
        if (data?.members) {
          setMembers(data.members);
        } else {
          // Handle cases where data.members might be missing or not an array
          setMembers([]); // Or handle as an error, depending on expected API behavior
        }
      } catch (e) {
        console.error('Failed to fetch account members:', e);
        setError(e);
        setMembers([]); // Clear members on error or keep stale data, as per desired UX
      } finally {
        setLoading(false);
      }
    }, 1000),
    [accountId, setMembers],
  );

  useEffect(() => {
    if (!!accountId) {
      fetchAllMembers();
    }
  }, [fetchAllMembers]);

  return { members, loading, error };
};
