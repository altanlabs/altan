import { Typography } from '@mui/material';
import React, { memo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { cn } from '@lib/utils';

import ActionsEditor from './ActionsEditor';
import OverallConfig from './OverallConfig';
import ResourcesEditor from './ResourcesEditor';
import WebhooksEditor from './WebhooksEditor';
import {
  selectAccount,
  selectAccountAssetsInitialized,
  selectAccountAssetsLoading,
} from '../../redux/slices/general';
import { HoverBorderGradient } from '../aceternity/buttons/hover-border-gradient';
import { TextShimmer } from '../aceternity/text/text-shimmer';
import Iconify from '../iconify/Iconify';
import CustomAppCard from '../integrator/customapp/CustomAppCard';

const selectAccountApps = (state) => selectAccount(state).apps;

function CustomAppEditor({ connectionTypeId }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const history = useHistory();;
  const appsLoading = useSelector(selectAccountAssetsLoading('apps'));
  const appsInitialized = useSelector(selectAccountAssetsInitialized('apps'));

  const connectionType = useSelector((state) =>
    selectAccountApps(state)
      .flatMap((app) => app.connection_types.items)
      .find((ct) => ct.id === connectionTypeId),
  );

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleBack = () => {
    history.push('/integration?tab=custom_apps'); // Adjust the path as needed
  };

  if (!appsInitialized || appsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <TextShimmer>Loading custom connectors...</TextShimmer>
      </div>
    );
  }

  if (!connectionType) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-lg font-semibold text-red-600">Connection type not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2 w-full h-full">
      <div className="flex flex-col space-y-2 w-full">
        <div className="flex items-center space-x-2 w-full">
          <HoverBorderGradient
            containerClassName="group rounded-full bg-white dark:bg-black border-transparent"
            as="button"
            className="transition-all duration-200 w-[30px] h-[25px] group-hover:w-[130px] px-2 py-1 text-sm bg-slate-400 dark:opacity-40 group-hover:opacity-80 dark:bg-slate-300 text-black dark:text-white flex items-center space-x-2"
            onClick={handleBack}
            disableAnimation
          >
            <Iconify
              className="text-white dark:text-black"
              icon="mdi:arrow-left"
            />
            <Typography
              noWrap
              variant="body"
              className="flex-no-wrap duration-200 hidden group-hover:flex text-white dark:text-black"
            >
              Back to Apps
            </Typography>
          </HoverBorderGradient>
          <CustomAppCard
            item={connectionType}
            mini
          />
        </div>
        <div className="flex space-x-2 p-1">
          {['Overall Config', 'Actions', 'Resources', 'Webhooks'].map((label, index) => (
            <HoverBorderGradient
              key={index}
              containerClassName={`group rounded-full ${selectedTab === index ? 'bg-white dark:bg-black' : 'bg-white dark:bg-transparent border-transparent'}`}
              as="button"
              className={cn(
                'transition-all duration-200 px-4 py-1 text-sm rounded-full',
                selectedTab === index
                  ? 'bg-white dark:bg-slate-900 opacity-80'
                  : 'bg-white opacity-100 hover:opacity-80 dark:bg-[#121212]',
                'text-black dark:text-white',
              )}
              onClick={() => handleTabChange(null, index)}
              disableAnimation
            >
              {label}
            </HoverBorderGradient>
          ))}
        </div>
      </div>
      {selectedTab === 0 && <OverallConfig connectionType={connectionType} />}
      {selectedTab === 1 && <ActionsEditor connectionType={connectionType} />}
      {selectedTab === 2 && <ResourcesEditor connectionType={connectionType} />}
      {selectedTab === 3 && <WebhooksEditor connectionType={connectionType} />}
    </div>
  );
}

export default memo(CustomAppEditor);
