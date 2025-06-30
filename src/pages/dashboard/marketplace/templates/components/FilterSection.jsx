import React from 'react';

import MultiSelectDropdown from './MultiSelectDropdown';
import Iconify from '../../../../../components/iconify';
import { verticalOptions, featureOptions, useCaseOptions, categoryOptions } from '../constants';

const FilterSection = ({
  searchTerm,
  setSearchTerm,
  selectedVerticals,
  setSelectedVerticals,
  selectedFeatures,
  setSelectedFeatures,
  selectedUseCases,
  setSelectedUseCases,
  selectedCategories,
  setSelectedCategories,
  sorting,
  setSorting,
  sortedTemplatesCount,
  hasActiveFilters,
  clearAllFilters,
  sortOptions,
}) => {
  return (
    <div className="rounded-lg p-4 border border-divider">
      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <Iconify
            icon="eva:search-fill"
            width={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
          />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-divider rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <MultiSelectDropdown
          options={verticalOptions}
          selectedValues={selectedVerticals}
          onChange={setSelectedVerticals}
          placeholder="All Industries"
        />
        <MultiSelectDropdown
          options={featureOptions}
          selectedValues={selectedFeatures}
          onChange={setSelectedFeatures}
          placeholder="All Features"
        />
        <MultiSelectDropdown
          options={useCaseOptions}
          selectedValues={selectedUseCases}
          onChange={setSelectedUseCases}
          placeholder="All Use Cases"
        />
        <MultiSelectDropdown
          options={categoryOptions}
          selectedValues={selectedCategories}
          onChange={setSelectedCategories}
          placeholder="All Categories"
        />
      </div>

      {/* Filter Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={sorting}
            onChange={(e) => setSorting(e.target.value)}
            className="px-3 py-2 bg-input border border-divider rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <span className="text-sm text-secondary">
            {sortedTemplatesCount} template{sortedTemplatesCount !== 1 ? 's' : ''}
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-1 text-sm text-secondary border border-divider rounded-lg hover:bg-action-hover"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterSection;
