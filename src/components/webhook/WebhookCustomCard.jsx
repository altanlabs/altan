import { OpenInNew as OpenInNewIcon, Edit as EditIcon } from '@mui/icons-material';
import { Typography, Box, IconButton, Tooltip, Stack, Paper } from '@mui/material';
import { createSelector } from '@reduxjs/toolkit';
import React, { memo, useCallback, useMemo, useState } from 'react';

import { selectExtendedResources } from '../../redux/slices/general';
import { useSelector } from '../../redux/store';
import InteractiveButton from '../buttons/InteractiveButton';
import FloatingWindow from '../floating/FloatingWindow';
import { getNested } from '../tools/dynamic/utils';

const FormCard = ({ formId }) => {
  const handleOpenInNewTab = useCallback(() => {
    window.open(`https://app.altan.ai/form/${formId}`, '_blank');
  }, [formId]);

  const handleEditInNewTab = useCallback(() => {
    window.open(`/forms/${formId}`, '_blank');
  }, [formId]);

  return (
    <>
      <Box className="flex flex-row justify-between">
        <Stack
          direction="row"
          width="100%"
          alignItems="center"
          justifyContent="right"
        >
          <Tooltip title="Edit in a new tab">
            <IconButton
              size="small"
              onClick={handleEditInNewTab}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Open in a new tab">
            <IconButton
              size="small"
              onClick={handleOpenInNewTab}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      <iframe
        title={`form-fill-${formId}`}
        src={`https://app.altan.ai/form/${formId}`}
        className="w-full h-full border-none pb-15"
      />
    </>
  );
};

// Configuración de eventos para definir el comportamiento dinámico
const EVENT_CONFIG = {
  // Configuración específica para el evento "FormResponseCompleted"
  FormResponseCompleted: {
    requiresFloatingWindow: true, // Indica si el evento necesita una ventana flotante
    component: (subscription) => <FormCard formId={subscription.external_id} />, // Componente que se renderiza para este evento
    buttonText: 'Test Form Response', // Texto del botón para este evento
    windowName: 'Form', // Nombre de la ventana flotante
  },
  // Configuración por defecto para eventos no especificados
  Default: {
    requiresFloatingWindow: false, // No requiere ventana flotante
    component: (subscription, resource) => (
      <Paper
        elevation={3}
        className="rounded-lg backdrop-blur-lg py-1"
        sx={{
          backgroundColor: 'transparent',
        }}
      >
        <Typography
          variant="h6"
          textAlign="center"
        >
          {subscription.event_type?.name ?? 'Event'}@
          {resource.details?.name ?? subscription.external_id}
        </Typography>
        {/* <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
          >
            This event does not require additional details. Please refer to the
            documentation for more information.
          </Typography> */}
      </Paper>
    ),
  },
};

export const selectAccountConnectionsByTypeParam = createSelector(
  (state, connectionTypeId) => connectionTypeId,
  (state, connectionTypeId) => state.connections[connectionTypeId] || [],
  (connectionTypeId, connections) => connections,
);

// Parametric selector for extended resources.
// If necessary, break out the logic that determines "specialness".
const isAltanWebhook = (webhookId) => webhookId === 'e05685ee-de4c-4602-9e34-08d2fb23d5fc';

export const selectWebhookAvailableResources = createSelector(
  // Input selectors:
  (state, webhook) => selectAccountConnectionsByTypeParam(state, webhook.connection_type_id),
  (state, webhook) => selectExtendedResources(state, isAltanWebhook(webhook.id)),

  // Result function:
  (connections, extraResources) => {
    const availableConnectionResources = connections.flatMap(
      (connection) => connection?.resources?.items || [],
    );

    return [...availableConnectionResources, ...extraResources];
  },
);

const WebhookCustomCard = ({ subscription }) => {
  // Estado para controlar si la ventana flotante está abierta
  const [isWindowOpen, setIsWindowOpen] = useState(false);

  const availableResources = useSelector((state) =>
    selectWebhookAvailableResources(state, subscription.webhook),
  );

  const resource = useMemo(
    () =>
      availableResources.find((r) => {
        const externalPath = subscription.event_type.details.relationship.path;
        return getNested(r.details, externalPath) === subscription.external_id;
      }),
    [
      availableResources,
      subscription.event_type.details.relationship.path,
      subscription.external_id,
    ],
  );

  // Función para abrir la ventana flotante
  const handleOpenWindow = useCallback(() => setIsWindowOpen(true), []);
  // Función para cerrar la ventana flotante
  const handleCloseWindow = useCallback(() => setIsWindowOpen(false), []);

  // Obtiene la configuración del evento actual o usa la configuración por defecto
  const eventConfig = useMemo(
    () => EVENT_CONFIG[subscription.event_type?.name ?? 'Event'] || EVENT_CONFIG.Default,
    [subscription.event_type?.name],
  );

  // Genera el contenido del evento basado en su configuración
  const content = useMemo(
    () => eventConfig.component(subscription, resource),
    [eventConfig, resource, subscription],
  );

  // Si el evento no requiere ventana flotante, renderiza el contenido directamente
  if (!eventConfig.requiresFloatingWindow) {
    return content;
  }

  // Renderiza un botón para abrir la ventana flotante y la ventana si está activa
  return (
    <>
      <InteractiveButton
        icon="mdi:eye"
        title={eventConfig.buttonText || 'Open Details'}
        loading={isWindowOpen}
        loadingIcon="svg-spinners:pulse-2"
        onClick={handleOpenWindow}
        iconClassName="text-black dark:text-white"
        titleClassName="text-sm font-bold"
        containerClassName="bg-white dark:bg-black border-transparent"
      />

      {isWindowOpen && (
        <FloatingWindow
          name={eventConfig.windowName || 'Event Details'} // Nombre dinámico de la ventana
          offsetX={window.innerWidth / 2 - 200} // Posición horizontal inicial
          offsetY={100} // Posición vertical inicial
          baseWidth={400} // Ancho base de la ventana
          baseHeight={700} // Altura base de la ventana
          additionalClasses="floating-window" // Clases adicionales para estilos
          onClose={handleCloseWindow} // Cierra la ventana al hacer clic en cerrar
          enableExpand={true} // Permite expandir la ventana
          enableMinimize={true} // Permite minimizar la ventana
          usePortal={true} // Usa un portal para renderizar la ventana
        >
          {content}
        </FloatingWindow>
      )}
    </>
  );
};

export default memo(WebhookCustomCard);
