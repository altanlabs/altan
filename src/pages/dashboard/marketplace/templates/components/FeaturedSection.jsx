import React from 'react';

import SkeletonCard from './SkeletonCard';
import Iconify from '../../../../../components/iconify';
import TemplateCard from '../../components/card/TemplateCard';

const FeaturedSection = ({ templates, switchingType, onViewDetails, templateType }) => {
  const scrollLeft = () => {
    const container = document.getElementById('featured-scroll');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('featured-scroll');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (!templates.length && !switchingType) return null;

  return (
    <div className="py-4">
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-primary">Featured Templates</h2>
          <div className="flex gap-1">
            <button
              onClick={scrollLeft}
              className="p-2 bg-divider rounded-lg hover:bg-action-hover text-gray-600"
              disabled={switchingType}
            >
              <Iconify icon="eva:arrow-left-fill" width={16} />
            </button>
            <button
              onClick={scrollRight}
              className="p-2 bg-divider rounded-lg hover:bg-action-hover text-gray-600"
              disabled={switchingType}
            >
              <Iconify icon="eva:arrow-right-fill" width={16} />
            </button>
          </div>
        </div>
      </div>

      <div
        id="featured-scroll"
        className="flex overflow-x-auto gap-4 px-4 scrollbar-thin scrollbar-thumb-divider scrollbar-track-gray-100"
      >
        {switchingType
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-featured-${index}`} className="min-w-80 max-w-80 flex-shrink-0">
                <SkeletonCard />
              </div>
            ))
          : templates.map((template) => (
              <div key={template.id} className="min-w-80 max-w-80 flex-shrink-0">
                <TemplateCard
                  template={template}
                  onViewDetails={onViewDetails}
                  templateType={templateType}
                />
              </div>
            ))}
      </div>
    </div>
  );
};

export default FeaturedSection;
