import { useEffect, useMemo, useState } from 'react';

import { useDebounce } from './useDebounce';

const useDebouncedSearch = ({ searchTerm, queryMethod, async = false, enabled = true }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const throttledSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchResults = async () => {
      if (!enabled) {
        return;
      }
      if (throttledSearchTerm.length < 3) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        let results;
        if (async) {
          results = await queryMethod(searchTerm);
        } else {
          results = queryMethod(searchTerm);
        }
        setResults(results);
      } catch (error) {
        console.error('Debounced search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [throttledSearchTerm]);

  return useMemo(() => [results, isLoading], [isLoading, results]);
};

export default useDebouncedSearch;
