import { useState, useEffect, useCallback } from 'react';

export function useFetchSubscription(subscriptionIds) {
  console.log('Fetching subsc... ', subscriptionIds);
  const [planGroups, setPlanGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscriptionData = useCallback(async () => {
    if (subscriptionIds.length === 0 || planGroups.length > 0) return;

    try {
      setIsLoading(true);
      const groupPromises = subscriptionIds.map((id) =>
        fetch(`https://api.altan.ai/shop/subscriptions/plans/groups/${id}`).then((res) =>
          res.json(),
        ),
      );
      const groupResults = await Promise.all(groupPromises);
      setPlanGroups(groupResults.map((result) => result.group));
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
      setError('Failed to load subscription data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [subscriptionIds, planGroups]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  return { planGroups, isLoading, error };
}
