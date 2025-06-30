// ProjectTemplateCard.jsx
import PropTypes from 'prop-types';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import Iconify from '../../../../../components/iconify';

const ProjectTemplateCard = ({ template }) => {
  const navigate = useNavigate();
  const name = template.name || template.public_name || 'Unnamed Template';
  const iconUrl =
    template.account?.logo_url || template.parent?.icon_url || '/assets/placeholder.svg';
  const coverUrl = getCoverUrl(template);
  const remixCount = template.remix_count || Math.floor(Math.random() * 5000) + 100;

  function getCoverUrl(template) {
    const selectedVersion = template.selected_version;
    if (selectedVersion?.build_metadata?.meta_data?.cover_url) {
      return selectedVersion.build_metadata.meta_data.cover_url;
    }

    if (template.versions && template.versions.length > 0) {
      for (const version of template.versions) {
        if (version.build_metadata?.meta_data?.cover_url) {
          return version.build_metadata.meta_data.cover_url;
        }
      }
    }

    return template.meta_data?.cover_url || '/assets/placeholder.svg';
  }

  const handleClick = () => {
    navigate(`/template/${template.id}`);
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {/* Cover Image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
        <img
          src={coverUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          onError={(e) => {
            e.target.src = '/assets/placeholder.svg';
          }}
        />
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Single line with all info */}
        <div className="flex items-center justify-between text-xs w-full min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Author Avatar */}
            <div className="w-4 h-4 rounded-full overflow-hidden  flex-shrink-0">
              <img
                src={iconUrl}
                alt={template.parent?.name || 'Author'}
                className="w-full h-full object-cover"
              />
            </div>

            <span className="text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{name}</span>

            {/* Remix Count */}
            <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
              <Iconify
                icon="carbon:fork"
                width={10}
              />
              <span>{remixCount.toLocaleString()}</span>
            </div>
          </div>

          {/* Price */}
          {template?.price !== undefined && (
            <div className="text-gray-700 dark:text-gray-300 font-medium">
              {template.price > 0
                ? `€${(template.price / 100).toFixed(0)}`
                : 'Free'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ProjectTemplateCard.propTypes = {
  template: PropTypes.object.isRequired,
};

export default ProjectTemplateCard;
