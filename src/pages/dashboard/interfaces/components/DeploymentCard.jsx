import { useSnackbar } from 'notistack';
import React, { useCallback, useState, useEffect, memo } from 'react';

import { HoverBorderGradient } from '../../../../components/aceternity/buttons/hover-border-gradient';
import Iconify from '../../../../components/iconify';
import { optimai, optimai_pods } from '../../../../utils/axios';

const DeploymentCard = ({ deployment }) => {
  const [isWorking, setIsWorking] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleFixWithAI = useCallback(
    async (deploymentId) => {
      try {
        const response = await optimai_pods.post(`/interfaces/deployment/${deploymentId}/fix-with-ai`);
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

  // Return null if no deployment, if deployment is from dev branch, or if completed
  if (!deployment ||
      deployment?.meta_data?.deployment_info?.meta?.githubCommitRef === 'dev' ||
      deployment?.status === 'COMPLETED') {
    return null;
  }

  const renderDeploymentContent = () => {
    switch (deployment.status) {
      case 'ERROR':
        return (
          <div className="backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl shadow-red-500/10 p-4 min-w-[280px]">
            {/* Header with error status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-sm">
                  <Iconify
                    icon="mdi:alert-circle"
                    className="text-red-500 dark:text-red-400"
                    width={18}
                  />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Deployment Failed
                  </span>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                    {deployment?.created_at && new Date(deployment.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Action button */}
            <HoverBorderGradient
              containerClassName="group relative rounded-xl p-[1px] bg-gradient-to-r from-red-200/30 via-pink-200/30 to-purple-200/30 dark:from-red-500/20 dark:via-pink-500/20 dark:to-purple-500/20 hover:shadow-lg hover:shadow-red-300/20 dark:hover:shadow-red-500/10"
              as="button"
              className="transition-all duration-300 w-full h-10 text-sm bg-white/80 dark:bg-white/20 text-gray-800 dark:text-white flex items-center justify-center font-medium hover:bg-white/90 dark:hover:bg-white/30 rounded-xl space-x-2 backdrop-blur-sm"
              onClick={() => handleFixWithAI(deployment.deployment_id)}
              disabled={isWorking}
              disableAnimation
            >
              {isWorking ? (
                <>
                  <Iconify
                    icon="eos-icons:loading"
                    width={16}
                    height={16}
                    className="text-purple-500"
                  />
                  <span className="text-purple-500">Fixing...</span>
                </>
              ) : (
                <>
                  <Iconify
                    icon="mdi:auto-fix"
                    width={16}
                    height={16}
                    className="text-gray-700 dark:text-white"
                  />
                  <span>Fix with AI</span>
                </>
              )}
            </HoverBorderGradient>
          </div>
        );
      // case 'COMPLETED':
      //   return (
      //     <Card className="bg-green-50 border border-green-300 shadow-lg">
      //       <CardContent className="flex items-center space-x-3">
      //         <Iconify
      //           icon="mdi:check-circle"
      //           className="text-green-600"
      //           width={24}
      //         />
      //         <Typography>Deployment Completed!</Typography>
      //       </CardContent>
      //     </Card>
      //   );
      case 'PENDING':
        return (
          <div className="backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl shadow-blue-500/10 p-4 min-w-[280px]">
            {/* Header with pending status */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm">
                <Iconify
                  icon="eos-icons:loading"
                  className="text-blue-500 dark:text-blue-400"
                  width={18}
                />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Creating Deployment
                </span>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                  {deployment?.created_at && new Date(deployment.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        );
      case 'BUILDING':
        return (
          <div className="backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl shadow-yellow-500/10 p-4 min-w-[280px]">
            {/* Header with building status */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm">
                <Iconify
                  icon="eos-icons:loading"
                  className="text-yellow-500 dark:text-yellow-400"
                  width={18}
                />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Building...</span>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                  {deployment?.created_at && new Date(deployment.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="fixed z-[1000] bottom-4 right-4">{renderDeploymentContent()}</div>;
};

export default memo(DeploymentCard);
