import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import { useAnalytics } from '../../hooks/useAnalytics';
import Iconify from '../iconify';

const AltanerTemplateCard = ({ template, onClick }) => {
  const { trackOpenTemplate } = useAnalytics();
  const name = template?.parent?.name || template.name || template.public_name || 'Unnamed Template';
  const coverUrl = template.cover_url || '/assets/placeholder.svg';
  const remixCount = template.remix_count || Math.floor(Math.random() * 500) + 10;

  const handleClick = () => {
    // Track template click event with Altan Analytics
    try {
      trackOpenTemplate(template.id, name, {
        template_price: template.price || 0,
        remix_count: remixCount,
        template_category: template.category,
        view_source: 'template_card',
      });
    } catch (error) {
      console.error('Error tracking template open:', error);
    }

    // Keep Google Analytics for backward compatibility
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'open_template', {
          template_id: template.id,
          template_name: name,
          template_price: template.price || 0,
          remix_count: remixCount,
        });
      }
    } catch (error) {
      console.error('Error tracking template click with GA:', error);
    }

    if (onClick) {
      onClick();
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        p: 1.5, // Increased padding for bigger cards
        '&:hover': {
          '& .template-cover': {
            transform: 'scale(1.02)',
          },
        },
      }}
    >
      {/* Cover Image */}
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '16/10',
          overflow: 'hidden',
          borderRadius: 2,
          mb: 1, // Increased margin for better spacing
        }}
      >
        <img
          src={coverUrl}
          alt={name}
          className="template-cover"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onError={(e) => {
            e.target.src = '/assets/placeholder.svg';
          }}
        />
      </Box>

      {/* Content */}
      <Box sx={{ px: 0.5 }}>
        {/* Footer with Template Name and Remix Count */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          {/* Template Name */}
          <Typography
            variant="body1" // Increased from body2 to body1
            sx={{
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.95rem', // Slightly larger font
              flex: 1, // Allow it to take available space
            }}
          >
            {name}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

AltanerTemplateCard.propTypes = {
  template: PropTypes.object.isRequired,
  onClick: PropTypes.func,
};

export default AltanerTemplateCard;
