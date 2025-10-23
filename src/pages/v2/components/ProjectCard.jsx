import { Box, alpha } from '@mui/material';
import React, { memo, useCallback, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import Iconify from '../../../components/iconify/Iconify';
import IconRenderer from '../../../components/icons/IconRenderer';
import { optimai } from '../../../utils/axios';
import { fToNow } from '../../../utils/formatTime';

const ProjectCard = ({ id, name, iconUrl, description, last_modified, isPinned, components = [] }) => {
  const history = useHistory();
  const [imageError, setImageError] = useState(false);
  const [coverUrl, setCoverUrl] = useState(null);

  // Find interface component if it exists
  const interfaceComponent = components.find((comp) => comp.type === 'interface');

  // Fetch cover URL when interface component exists
  useEffect(() => {
    const fetchCoverUrl = async () => {
      if (interfaceComponent?.params?.id) {
        try {
          const response = await optimai.get(`/interfaces/${interfaceComponent.params.id}/preview`);
          setCoverUrl(response.data.url);
        } catch (error) {
          console.error('Failed to fetch interface cover URL:', error);
          setCoverUrl(null);
        }
      }
    };

    fetchCoverUrl();
  }, [interfaceComponent?.params?.id]);

  const handleClick = useCallback(() => {
    history.push(`/project/${id}`);
  }, [id, history]);

  return (
    <div
      className="cursor-pointer group"
      onClick={handleClick}
    >
      {/* Cover Image */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
        {coverUrl ? (
          imageError ? (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              }}
            >
              <IconRenderer
                icon="mdi:image-off"
                size={48}
                sx={{ opacity: 0.5 }}
              />
            </Box>
          ) : (
            <img
              src={coverUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              onError={() => setImageError(true)}
            />
          )
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            }}
          >
            <IconRenderer
              icon={iconUrl || 'mdi:apps'}
              size={64}
            />
          </Box>
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        {/* Single line with all info */}
        <div className="flex items-center gap-1.5 text-xs w-full min-w-0">
          {/* Pin indicator */}
          {isPinned && (
            <Iconify
              icon="mdi:pin"
              width={11}
              sx={{ color: 'inherit' }}
            />
          )}
          {/* Name */}
          <span className="truncate flex-1 font-medium text-xs">{name}</span>
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectCard);

