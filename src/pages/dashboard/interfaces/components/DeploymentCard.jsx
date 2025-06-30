import { Card, CardContent, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useCallback, useState, useEffect, memo } from 'react';

import { HoverBorderGradient } from '../../../../components/aceternity/buttons/hover-border-gradient';
import Iconify from '../../../../components/iconify';
import { optimai } from '../../../../utils/axios';

const DeploymentCard = ({ deployment }) => {
  const [isWorking, setIsWorking] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Reset isWorking when deployment changes
  useEffect(() => {
    setIsWorking(false);
  }, [deployment]);

  // Return null if no deployment or if deployment is from dev branch

  const handleFixWithAI = useCallback(
    async (deploymentId) => {
      try {
        const response = await optimai.get(`/interfaces/deployment/${deploymentId}/fix-with-ai`);
        if (response.status === 200) {
          setIsWorking(true);
        }
      } catch (error) {
        enqueueSnackbar(`Error fixing with AI: ${error}`, { variant: 'error' });
      }
    },
    [enqueueSnackbar],
  );

  // Reset isWorking when deployment changes
  useEffect(() => {
    setIsWorking(false);
  }, [deployment]);

  if (!deployment || deployment?.meta_data?.deployment_info?.meta?.githubCommitRef === 'dev')
    return null;

  const renderDeploymentContent = () => {
    switch (deployment.status) {
      case 'ERROR':
        return (
          <div className="flex flex-col shadow-lg items-center justify-center space-y-1">
            <div className="flex flex-row items-center w-full space-x-1">
              <Iconify
                icon="mdi:alert-circle"
                className="text-red-700"
                width={17}
              />
              <span className="text-sm leading-relaxed tracking-wide">Deployment Failed</span>
            </div>

            <HoverBorderGradient
              containerClassName="group relative rounded-full p-[1px] bg-gradient-to-r from-blue-200/50 to-violet-200/50 dark:from-indigo-500/40 dark:to-violet-500/40 hover:shadow-xl hover:shadow-blue-300/20 dark:hover:shadow-indigo-500/20"
              as="button"
              className="transition-all duration-200 w-[185px] h-[40px] text-sm bg-white/80 dark:bg-black/20 text-black dark:text-gray-200 flex items-center justify-center font-medium hover:bg-gray-50 dark:hover:bg-white/5 rounded-full space-x-2"
              onClick={() => handleFixWithAI(deployment.deployment_id)}
              disabled={isWorking}
              disableAnimation
            >
              <Iconify
                icon="mdi:magic"
                width={20}
                height={20}
              />
              <Typography>{isWorking ? 'Fixing...' : 'Fix with AI'}</Typography>
            </HoverBorderGradient>
          </div>
        );
      case 'COMPLETED':
        return (
          <Card className="bg-green-50 border border-green-300 shadow-lg">
            <CardContent className="flex items-center space-x-3">
              <Iconify
                icon="mdi:check-circle"
                className="text-green-600"
                width={24}
              />
              <Typography>Deployment Completed!</Typography>
            </CardContent>
          </Card>
        );
      case 'PENDING':
        return (
          <Card className="bg-blue-50 border border-blue-300 shadow-lg">
            <CardContent className="flex items-center space-x-3">
              <Iconify
                icon="eos-icons:loading"
                className="text-yellow-600"
                width={24}
              />
              <Typography>Creating Deployment</Typography>
            </CardContent>
          </Card>
        );
      case 'BUILDING':
        return (
          <Card className="bg-yellow-50 border border-yellow-300 shadow-lg">
            <CardContent className="flex items-center space-x-3">
              <Iconify
                icon="eos-icons:loading"
                className="text-yellow-600"
                width={24}
              />
              <Typography className="text-yellow-600">Building...</Typography>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return <div className="fixed z-[1000] bottom-4 right-4">{renderDeploymentContent()}</div>;
};

export default memo(DeploymentCard);
