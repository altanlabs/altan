import { ToggleButton, ToggleButtonGroup, TextField, InputAdornment, Stack, Chip, Box } from '@mui/material';
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

function MediaFilters({ searchTerm, setSearchTerm, selectedFilters, onFilterChange }) {
  const mediaTypes = [
    { id: 'image', label: 'Images', icon: 'material-symbols:image-outline' },
    { id: 'video', label: 'Videos', icon: 'material-symbols:videocam-outline' },
    { id: 'audio', label: 'Audio', icon: 'material-symbols:audio-file-outline' },
    { id: 'document', label: 'Documents', icon: 'material-symbols:description-outline' },
  ];

  return (
    <Stack spacing={2} sx={{ mb: 3 }}>
      <TextField
        size="small"
        placeholder="Search media files..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }}
      />

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {mediaTypes.map((type) => (
          <Chip
            key={type.id}
            label={type.label}
            icon={<Iconify icon={type.icon} />}
            variant={selectedFilters.includes(type.id) ? 'filled' : 'outlined'}
            onClick={() => onFilterChange(type.id)}
            sx={{
              backgroundColor: selectedFilters.includes(type.id)
                ? 'primary.main'
                : 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: selectedFilters.includes(type.id)
                  ? 'primary.dark'
                  : 'rgba(255, 255, 255, 0.2)',
              },
            }}
          />
        ))}
      </Box>
    </Stack>
  );
}

const MediaPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaType, setMediaType] = useState('2d');
  const [selectedFilters, setSelectedFilters] = useState([]);

  const handleFilterChange = (filterId) => {
    setSelectedFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId],
    );
  };

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
        <>
          <MediaFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
          />
          <MediaSection
            searchTerm={searchTerm}
            selectedFilters={selectedFilters}
            mode="default"
          />
        </>
      ) : (
        <ModelSection />
      )}
    </CompactLayout>
  );
};

export default MediaPage;
