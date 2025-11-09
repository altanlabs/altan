// CustomMessage.js
import { getWidgetTranslation } from '@assets/translations';
import { Typography, Card, Stack } from '@mui/material';
import React from 'react';

import WidgetRenderer from '../WidgetRenderer.jsx';
import RenderPreview from './extra/RenderPreview.tsx';

const CustomMessage = ({ widget }) => {
  const data = widget.meta_data;
  const { text, attachment } = data;

  const renderAttachment = !!attachment?.type && (!!widget.child || !!widget.media?.length) && (!!widget.child ? (
    <Card sx={{ mt: 3, p: 0, backgroundColor: 'transparent' }} elevation={5}>
      <WidgetRenderer message={widget.child} isChild={true} />
    </Card>
  ) : (
    <RenderPreview
      file={{
        name: widget.media[0].media.name,
        url: `https://platform-api.altan.ai/media/${widget.media[0].media.id}`,
        type: widget.media[0].media.type.split('/').pop(),
      }}
    // onDelete={handleDeleteMedia}
    // isEditMode={isEdit}
    />
  ));

  return (
    <Stack spacing={1}>
      <Typography variant="p" gutterBottom>
        {getWidgetTranslation(widget, navigator.language || navigator.userLanguage) || text}
      </Typography>
      {renderAttachment}
    </Stack>
  );
};

export default CustomMessage;
