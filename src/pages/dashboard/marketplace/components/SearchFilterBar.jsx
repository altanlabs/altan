import PropTypes from 'prop-types';

import Iconify from '../../../../components/iconify';

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'updated_at', label: 'Updated Date' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'price', label: 'Price' },
];

const TEMPLATE_TYPE_NAMES = {
  altaner: 'Project',
  workflow: 'Workflow',
  database: 'Database',
  agent: 'Agent',
};

const SearchFilterBar = ({
  searchTerm,
  onSearchChange,
  sorting,
  onSortChange,
  templateType,
  onTemplateTypeChange,
  templateTypeOptions,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-8">
      {/* Search Input - Takes up more space */}
      <div className="flex-1 relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Iconify
            icon="eva:search-fill"
            width={20}
            height={20}
          />
        </div>
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={onSearchChange}
          className="w-full h-12 pl-12 pr-4 bg-gray-600 dark:bg-gray-700 border-0 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 lg:gap-3">
        {/* Sort Dropdown */}
        <div className="relative min-w-[160px]">
          <select
            value={sorting}
            onChange={onSortChange}
            className="w-full h-12 px-4 pr-10 bg-gray-600 dark:bg-gray-700 border-0 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 appearance-none cursor-pointer"
          >
            {!sorting && (
              <option
                value=""
                disabled
              >
                Sort by
              </option>
            )}
            {SORT_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-gray-700 text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
            <Iconify
              icon="eva:chevron-down-fill"
              width={20}
              height={20}
            />
          </div>
        </div>

        {/* Template Type Dropdown */}
        <div className="relative min-w-[160px]">
          <select
            value={templateType}
            onChange={(e) => onTemplateTypeChange(e.target.value)}
            className="w-full h-12 px-4 pr-10 bg-gray-600 dark:bg-gray-700 border-0 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 appearance-none cursor-pointer"
          >
            {!templateType && (
              <option
                value=""
                disabled
              >
                Type
              </option>
            )}
            {templateTypeOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-gray-700 text-white"
              >
                {TEMPLATE_TYPE_NAMES[option.value] || option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
            <Iconify
              icon="eva:chevron-down-fill"
              width={20}
              height={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

SearchFilterBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  sorting: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
  templateType: PropTypes.string.isRequired,
  onTemplateTypeChange: PropTypes.func.isRequired,
  templateTypeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default SearchFilterBar;
