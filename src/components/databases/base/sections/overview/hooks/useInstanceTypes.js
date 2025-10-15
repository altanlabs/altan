import { useState, useEffect } from 'react';

import { setSession } from '../../../../../../utils/auth';
import { optimai_cloud } from '../../../../../../utils/axios';

export const useInstanceTypes = () => {
  const [instanceTypes, setInstanceTypes] = useState([]);
  const [instanceTypesLoading, setInstanceTypesLoading] = useState(true);

  const fetchInstanceTypes = async () => {
    setInstanceTypesLoading(true);
    try {
      // Ensure token is set
      const authData = localStorage.getItem('oaiauth');
      if (authData) {
        try {
          const { access_token: accessToken } = JSON.parse(authData);
          if (accessToken) {
            setSession(accessToken, optimai_cloud);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

      const response = await optimai_cloud.get('/v1/instances/types');
      setInstanceTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching instance types:', error);
      setInstanceTypes([]);
    } finally {
      setInstanceTypesLoading(false);
    }
  };

  useEffect(() => {
    fetchInstanceTypes();
  }, []);

  return {
    instanceTypes,
    instanceTypesLoading,
    fetchInstanceTypes,
  };
};
