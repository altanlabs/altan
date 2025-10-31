import { Box, alpha } from '@mui/material';
import React, { memo, useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import Iconify from '../../../components/iconify/Iconify';
import IconRenderer from '../../../components/icons/IconRenderer';
import { optimai_pods } from '../../../utils/axios';
import { fToNow } from '../../../utils/formatTime';

const CompactProjectCard = ({ id, name, icon_url, is_pinned, components = [], last_modified }) => {
  const history = useHistory();
  const [coverUrl, setCoverUrl] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Find interface component for preview
  const interfaceComponent = components.find((comp) => comp.type === 'interface');

  useEffect(() => {
    const fetchCoverUrl = async () => {
      if (interfaceComponent?.params?.id) {
        try {
          const response = await optimai_pods.get(`/interfaces/${interfaceComponent.params.id}/preview`);
          setCoverUrl(response.data.url);
        } catch (error) {
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
      className="cursor-pointer group w-[280px] sm:w-[320px] flex-shrink-0"
      onClick={handleClick}
    >
      {/* Cover Image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
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
              icon={icon_url || 'mdi:apps'}
              size={64}
            />
          </Box>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-center justify-between text-xs w-full min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Pin indicator */}
            {is_pinned && (
              <div className="flex items-center">
                <Iconify
                  icon="mdi:pin"
                  width={14}
                  sx={{ color: 'inherit' }}
                />
              </div>
            )}
            {/* Name */}
            <span className="truncate max-w-[140px] font-semibold text-sm">{name}</span>
          </div>

          {/* Last modified */}
          {last_modified && (
            <div className="text-gray-400 dark:text-gray-500 text-xs">
              {fToNow(last_modified)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(CompactProjectCard);

