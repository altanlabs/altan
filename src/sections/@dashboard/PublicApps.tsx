import { Grid } from '@mui/material';
import { useState, useEffect, useRef, memo } from 'react';

import PublicAppCard from '@components/PublicAppCard';

import { optimai } from '../../utils/axios';

interface Altaner {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  components?:
    | {
        items: any[];
      }
    | any[];
}

interface GetAltanersResponse {
  apps: Altaner[];
}

function PublicApps() {
  const [altaners, setAltaners] = useState<Altaner[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);
  const isFetching = useRef<boolean>(false);

  async function doFetch(append: boolean): Promise<void> {
    if (isFetching.current) return;
    if (!append) {
      setInitialLoading(true);
      setOffset(0);
      setHasMore(true);
    }
    if (!hasMore && append) {
      return;
    }

    isFetching.current = true;
    setLoading(true);

    try {
      const currentOffset = append ? offset : 0;
      const url = `/altaner/?offset=${currentOffset}`;

      const response = await optimai.get(url);
      const data = response.data as GetAltanersResponse;
      const fetched = data.apps || [];

      if (append) {
        setAltaners((prev) => [...prev, ...fetched]);
        setOffset((prev) => prev + fetched.length);
      } else {
        setAltaners(fetched);
        setOffset(fetched.length);
      }

      if (fetched.length < 24) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching altaners:', error);
      if (!append) {
        setAltaners([]);
      }
    } finally {
      isFetching.current = false;
      setLoading(false);
      if (!append) {
        setInitialLoading(false);
      }
    }
  }

  useEffect(() => {
    void doFetch(false);
  }, []);

  return (
    <div className="relative p-8">
      {initialLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : altaners.length > 0 ? (
        <>
          <Grid
            container
            spacing={2}
            marginTop={6}
          >
            {altaners.map((altaner) => (
              <Grid
                item
                key={altaner.id}
                xs={12}
                sm={6}
                md={3}
              >
                <PublicAppCard
                  key={altaner.id}
                  {...altaner}
                />
              </Grid>
            ))}
          </Grid>

          {hasMore && (
            <div className="flex justify-center py-4">
              <button
                onClick={() => void doFetch(true)}
                disabled={loading}
                className={`relative px-8 py-2 text-base font-medium rounded-xl bg-[#1a1b1e] text-white/90 border border-[#2a2b2e] transition-all duration-300 ease-out
                  ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[0_0_30px_-5px] hover:shadow-purple-500/30 hover:border-purple-500/50 hover:text-white hover:-translate-y-0.5'}
                `}
              >
                <span className="relative z-10">{loading ? 'Loading...' : 'Load More'}</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-slate-400 py-8">No public apps found</div>
      )}
    </div>
  );
}

export default memo(PublicApps);
