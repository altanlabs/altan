import { Grid, Typography } from '@mui/material';
import React, { memo } from 'react';

import AssetCard from './AssetCard';
import { Tabs } from '../../aceternity/tabs';

const AssetsCard = ({ assets }) => {
  // const theme = useTheme()?.palette?.mode ?? 'dark';
  if (!assets) return null;
  const assetTypes = Object.keys(assets);

  const tabs = assetTypes
    .filter((type) => !!Object.keys(assets[type]).length && type !== 'connections')
    .map((type) => ({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} (${Object.keys(assets[type]).length})`,
      value: type,
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold transition-all duration-300 text-gray-900 bg-gradient-to-br from-transparent via-[rgb(255,255,255)]/50 to-gray-200 backdrop-blur-md hover:from-white dark:text-white dark:via-[rgb(0,0,0)]/50 dark:to-black dark:backdrop-blur-lg dark:bg-opacity-40 dark:hover:bg-opacity-90 shadow-lg hover:backdrop-blur-md gap-10 border-gray-300 dark:border-gray-700">
          <Typography
            sx={{ color: (theme) => (theme.palette.mode === 'dark' ? '#fff' : 'inherit') }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Typography>
          <Grid
            container
            spacing={1}
            className="overflow-y-auto h-full"
          >
            {Object.entries(assets[type]).map(([id, asset]) => (
              <Grid
                item
                sm={12}
                md={6}
                key={id}
              >
                <AssetCard
                  type={type}
                  asset={asset}
                />
              </Grid>
            ))}
          </Grid>
        </div>
      ),
    }));

  return (
    <div className="h-[20rem] md:h-[30rem] [perspective:1000px] relative b flex flex-col max-w-5xl mx-auto w-full  items-start justify-start my-5">
      <Tabs tabs={tabs} />
    </div>
  );
};

export default memo(AssetsCard);
