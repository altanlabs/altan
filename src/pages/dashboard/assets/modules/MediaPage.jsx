import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import React, { useState } from 'react';

import Iconify from '../../../../components/iconify/Iconify';
import { CompactLayout } from '../../../../layouts/dashboard';
import MediaSection from '../../../../sections/@dashboard/media/MediaSection';
import ModelSection from '../../../../sections/@dashboard/media/ModelSection';

function MediaType({ value, onChange, ...other }) {
  return (
    <ToggleButtonGroup
      size="large"
      color="primary"
      value={value}
      exclusive
      onChange={onChange}
      {...other}
    >
      <ToggleButton value="2d">
        <Iconify icon="material-symbols:perm-media" />
      </ToggleButton>

      <ToggleButton value="3d">
        <Iconify icon="iconamoon:3d-fill" />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

const MediaPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaType, setMediaType] = useState('2d');
  return (
    <CompactLayout
      title={'Media · Altan'}
      breadcrumb={{
        title: 'Media',
        links: [
          {
            name: 'Assets',
          },
          {
            name: 'Media',
          },
        ],
      }}
      toolbarChildren={
        <MediaType
          value={mediaType}
          onChange={(e, newValue) => setMediaType(newValue)}
        />
      }
    >
      {mediaType === '2d' ? (
        <MediaSection
          searchTerm={searchTerm}
          mode="default"
        />
      ) : (
        <ModelSection />
      )}
    </CompactLayout>
  );
};

export default MediaPage;
