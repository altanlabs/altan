/**
 * Deployment Operations
 * Contains all deployment event handlers
 */

import {
  addInterfaceDeployment,
  updateInterfaceDeployment,
  deleteInterfaceDeployment,
} from '../../../../redux/slices/general';
import { dispatch } from '../../../../redux/store';

/**
 * Extract and validate deployment event data
 */
export const extractDeploymentEventData = (data) => {
  if (!data || !data.type || !data.data) {
    console.warn('Hermes WS: Invalid deployment event structure:', data);
    return null;
  }

  const eventType = data.type;
  const eventData = data.data;

  return { eventData, eventType };
};

/**
 * Handle deployment.created event (from DeploymentNew)
 */
export const handleDeploymentCreated = (eventData) => {
  dispatch(
    addInterfaceDeployment({
      id: eventData.id,
      interface_id: eventData.interface_id,
      ...eventData,
    }),
  );
};

/**
 * Handle deployment.updated event (from DeploymentUpdate)
 */
export const handleDeploymentUpdated = (eventData) => {
  const deploymentId = eventData.id;
  const vercelDeploymentId = eventData.deployment_id;
  const interfaceId = eventData.interface_id;

  // If interface_id is not provided, we need to find it by searching all interfaces
  if (!interfaceId) {
    console.warn(
      'Interface ID not found in deployment update, searching existing deployments...',
    );
    dispatch(
      updateInterfaceDeployment({
        id: deploymentId,
        interface_id: null,
        vercel_deployment_id: vercelDeploymentId,
        search_all_interfaces: true,
        status: eventData.status,
        url: eventData.url,
        commit_sha: eventData.commit_sha,
        meta_data: eventData.meta_data,
        interface_name: eventData.interface_name,
        date_creation: eventData.date_creation,
      }),
    );
  } else {
    dispatch(
      updateInterfaceDeployment({
        id: deploymentId,
        interface_id: interfaceId,
        vercel_deployment_id: vercelDeploymentId,
        status: eventData.status,
        url: eventData.url,
        commit_sha: eventData.commit_sha,
        meta_data: eventData.meta_data,
        interface_name: eventData.interface_name,
        date_creation: eventData.date_creation,
      }),
    );
  }

  // Show success notification for completed deployments
  if (eventData.status === 'COMPLETED') {
    setTimeout(() => {
      const event = new CustomEvent('deployment-completed', {
        detail: { message: 'Deployment completed successfully! 🚀' },
      });
      window.dispatchEvent(event);
    }, 100);
  }
};

/**
 * Handle deployment.deleted event (from DeploymentDelete)
 */
export const handleDeploymentDeleted = (eventData) => {
  const deploymentId = eventData.id || (eventData.ids && eventData.ids[0]);
  dispatch(deleteInterfaceDeployment(deploymentId));
};

/**
 * Operation registry for deployment events
 */
export const DEPLOYMENT_OPERATIONS = {
  'deployment.created': handleDeploymentCreated,
  'deployment.updated': handleDeploymentUpdated,
  'deployment.deleted': handleDeploymentDeleted,
};
