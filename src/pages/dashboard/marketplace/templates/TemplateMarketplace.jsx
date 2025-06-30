import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import FeaturedSection from './components/FeaturedSection';
import FilterSection from './components/FilterSection';
import SkeletonCard from './components/SkeletonCard';
import { categoryOptions as importedCategoryOptions } from './constants';
import EmptyContent from '../../../../components/empty-content';
import { PATH_DASHBOARD } from '../../../../routes/paths';
import { optimai_shop } from '../../../../utils/axios';
import TemplateCard from '../components/card/TemplateCard';

const ITEMS_PER_PAGE = 25;

const TemplateMarketplace = ({ type = 'altaner', hideFilters = false }) => {
  const history = useHistory();
  const location = useLocation();
  
  // Parse search params manually for React Router v5
  const searchParams = new URLSearchParams(location.search);
  const setSearchParams = (newParams) => {
    history.replace({
      pathname: location.pathname,
      search: newParams.toString()
    });
  };
  const loadMoreRef = useRef(null);

  // Separate state for featured and community templates
  const [featuredTemplates, setFeaturedTemplates] = useState([]);
  const [communityTemplates, setCommunityTemplates] = useState([]);

  // Loading states
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [switchingType, setSwitchingType] = useState(false);

  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState('featured');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Get template type from URL or default to 'altaner'
  const [templateType, setTemplateType] = useState(type);

  // Filter states - arrays for multi-select
  const [selectedVerticals, setSelectedVerticals] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedUseCases, setSelectedUseCases] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const allCategoryOptions = [{ value: 'all', label: 'All' }, ...importedCategoryOptions];

  const handleCategoryChipClick = (categoryValue) => {
    if (categoryValue === 'all') {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([categoryValue]);
    }
    // Reset offset and hasMore for pagination when filters change
    setOffset(0);
    setHasMore(true);
  };

  // Fetch featured templates
  const fetchFeaturedTemplates = useCallback(
    async (type, isTypeSwitch = false) => {
      if (isTypeSwitch) {
        setSwitchingType(true);
      } else {
        setLoadingFeatured(true);
      }
      setError(null);

      try {
        const response = await optimai_shop.get(
          `/v2/templates/list?limit=100&offset=0&template_type=${type}&is_featured=true`,
        );

        const newFeaturedTemplates = response?.data?.templates || [];
        setFeaturedTemplates(newFeaturedTemplates);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setFeaturedTemplates([]);
        } else {
          setError('Failed to load featured templates. Please try again later');
          setFeaturedTemplates([]);
        }
      } finally {
        setLoadingFeatured(false);
      }
    },
    [setLoadingFeatured, setError, setFeaturedTemplates, setSwitchingType],
  );

  // Fetch community templates (non-featured)
  const fetchCommunityTemplates = useCallback(
    async (type, currentOffset = 0, isTypeSwitch = false, isLoadMore = false) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoadingCommunity(true);
      }
      setError(null);

      try {
        const response = await optimai_shop.get(
          `/v2/templates/list?limit=${ITEMS_PER_PAGE}&offset=${currentOffset}&template_type=${type}&is_featured=false`,
        );

        const newTemplates = response?.data?.templates || [];

        if (isLoadMore) {
          // Append new templates to existing ones
          setCommunityTemplates((prev) => [...prev, ...newTemplates]);
        } else {
          // Replace templates (initial load or type switch)
          setCommunityTemplates(newTemplates);
        }

        // Check if there are more templates to load
        setHasMore(newTemplates.length === ITEMS_PER_PAGE);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          if (isLoadMore) {
            setHasMore(false);
          } else {
            setCommunityTemplates([]);
          }
        } else {
          setError('Failed to load community templates. Please try again later');
          if (!isLoadMore) {
            setCommunityTemplates([]);
          }
        }
      } finally {
        setLoadingCommunity(false);
        setLoadingMore(false);
        if (isTypeSwitch) {
          setSwitchingType(false);
        }
      }
    },
    [
      setLoadingCommunity,
      setLoadingMore,
      setError,
      setCommunityTemplates,
      setHasMore,
      setSwitchingType,
    ],
  );

  // Load more community templates
  const loadMoreTemplates = useCallback(() => {
    if (!loadingMore && !loadingCommunity && hasMore) {
      const newOffset = offset + ITEMS_PER_PAGE;
      setOffset(newOffset);
      fetchCommunityTemplates(templateType, newOffset, false, true);
    }
  }, [fetchCommunityTemplates, templateType, offset, loadingMore, loadingCommunity, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          loadMoreTemplates();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px', // Start loading 100px before the element comes into view
      },
    );

    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      observer.observe(currentLoadMoreRef);
    }

    return () => {
      if (currentLoadMoreRef) {
        observer.unobserve(currentLoadMoreRef);
      }
    };
  }, [loadMoreTemplates]);

  // Update URL when template type changes
  const updateTemplateType = (newType) => {
    setTemplateType(newType);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('type', newType);
    setSearchParams(newSearchParams);
  };

  useEffect(() => {
    // Sync URL param with state on mount
    const urlType = searchParams.get('type');
    if (urlType && urlType !== templateType) {
      setTemplateType(urlType);
    }
  }, [location.search, templateType]);

  useEffect(() => {
    // When template type changes, fetch both featured and community templates
    const isTypeSwitch = featuredTemplates.length > 0 || communityTemplates.length > 0;

    // Clear existing data
    setFeaturedTemplates([]);
    setCommunityTemplates([]);
    setOffset(0);
    setHasMore(true);

    // Fetch featured templates first
    fetchFeaturedTemplates(templateType, isTypeSwitch);

    // Then fetch community templates
    fetchCommunityTemplates(templateType, 0, isTypeSwitch, false);
  }, [templateType, fetchFeaturedTemplates, fetchCommunityTemplates]);

  const templateTypes = [
    { value: 'altaner', label: 'Projects' },
    { value: 'workflow', label: 'Workflows' },
    { value: 'agent', label: 'Agents' },
  ];

  const handleTemplateTypeChange = (newValue) => {
    updateTemplateType(newValue);
    setError(null);
    // Reset filters when changing template type
    setSelectedVerticals([]);
    setSelectedFeatures([]);
    setSelectedUseCases([]);
    setSelectedCategories([]);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedVerticals([]);
    setSelectedFeatures([]);
    setSelectedUseCases([]);
    setSelectedCategories([]);
  };

  const filterTemplates = (templateList) => {
    if (!templateList || !Array.isArray(templateList)) return [];

    return templateList.filter((template) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        template.name.toLowerCase().includes(searchLower) ||
        template.details?.landing?.locales?.some(
          (locale) =>
            locale.content?.title?.toLowerCase().includes(searchLower) ||
            locale.content?.description?.toLowerCase().includes(searchLower),
        );

      // Metadata filters - check if any selected value matches
      const matchesVertical =
        selectedVerticals.length === 0 ||
        selectedVerticals.some((v) => (template.meta_data?.verticals || []).includes(v));
      const matchesFeature =
        selectedFeatures.length === 0 ||
        selectedFeatures.some((f) => (template.meta_data?.features || []).includes(f));
      const matchesUseCase =
        selectedUseCases.length === 0 ||
        selectedUseCases.some((u) => (template.meta_data?.useCases || []).includes(u));
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(template.meta_data?.category);

      return (
        matchesSearch && matchesVertical && matchesFeature && matchesUseCase && matchesCategory
      );
    });
  };

  const sortTemplates = (templateList) => {
    return [...templateList].sort((a, b) => {
      switch (sorting) {
        case 'featured':
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        case 'newest':
          return new Date(b.date_creation) - new Date(a.date_creation);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };

  const handleViewTemplateDetails = (templateId) => {
    history.push(`${PATH_DASHBOARD.marketplace.templates}/${templateId}`);
  };

  // Apply filters to both featured and community templates
  const filteredFeaturedTemplates = filterTemplates(featuredTemplates);
  const filteredCommunityTemplates = filterTemplates(communityTemplates);
  const sortedCommunityTemplates = sortTemplates(filteredCommunityTemplates);

  const hasActiveFilters =
    selectedVerticals.length > 0 ||
    selectedFeatures.length > 0 ||
    selectedUseCases.length > 0 ||
    selectedCategories.length > 0 ||
    searchTerm;

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'name', label: 'Name' },
  ];

  // Show skeleton cards when switching types or initial loading
  const skeletonCount = 8;
  const showMainSkeleton =
    (loadingCommunity && communityTemplates.length === 0 && !loadingMore) || switchingType;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-divider px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <h1 className="text-xl sm:text-2xl font-semibold text-primary">From the community</h1>
          {/* Category Chips */}
          {type === 'altaner' && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              <div className="flex gap-2 min-w-max">
                {allCategoryOptions.map((category) => {
                  const isActive =
                    (category.value === 'all' && selectedCategories.length === 0) ||
                    (selectedCategories.length === 1 && selectedCategories[0] === category.value);
                  return (
                    <button
                      key={category.value}
                      onClick={() => handleCategoryChipClick(category.value)}
                      className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded-full transition-colors border whitespace-nowrap ${
                        isActive
                          ? 'bg-primary-lighter bg-opacity-30 border-primary-lighter'
                          : 'bg-white/5 hover:bg-white/10 border-white/10'
                      }`}
                    >
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {/* Template Type Selection */}

        {/* Filters Section */}
        {!hideFilters && (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {templateTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTemplateTypeChange(type.value)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    templateType === type.value
                      ? 'bg-primary text-white'
                      : 'text-primary hover:bg-action-hover'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <FilterSection
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedVerticals={selectedVerticals}
              setSelectedVerticals={setSelectedVerticals}
              selectedFeatures={selectedFeatures}
              setSelectedFeatures={setSelectedFeatures}
              selectedUseCases={selectedUseCases}
              setSelectedUseCases={setSelectedUseCases}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              sorting={sorting}
              setSorting={setSorting}
              sortedTemplatesCount={sortedCommunityTemplates.length}
              hasActiveFilters={hasActiveFilters}
              clearAllFilters={clearAllFilters}
              sortOptions={sortOptions}
            />
          </>
        )}
      </div>

      {/* Featured Section */}
      <FeaturedSection
        templates={filteredFeaturedTemplates}
        switchingType={switchingType || loadingFeatured}
        onViewDetails={handleViewTemplateDetails}
        templateType={templateType}
      />

      {/* Results */}
      <div className="px-2 sm:px-4 py-4">
        {error ? (
          <EmptyContent
            title={error}
            description="Please try again later"
            img="/assets/illustrations/illustration_error.svg"
            action={
              <button
                onClick={() => {
                  setOffset(0);
                  setHasMore(true);
                  fetchFeaturedTemplates(templateType);
                  fetchCommunityTemplates(templateType, 0);
                }}
                className="mt-4 px-4 py-2 bg-action text-action-text rounded-lg hover:bg-action-hover"
              >
                Try again
              </button>
            }
          />
        ) : showMainSkeleton ? (
          // Show skeleton grid during initial load or type switching
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} />
            ))}
          </div>
        ) : sortedCommunityTemplates.length === 0 &&
          !loadingCommunity &&
          !loadingMore &&
          !switchingType ? (
        // Show EmptyContent only if no community templates found and not loading
              <EmptyContent
                title="No templates found"
                description="Try adjusting your search or filters"
                img="/assets/illustrations/illustration_empty_content.svg"
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {sortedCommunityTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onViewDetails={handleViewTemplateDetails}
                  templateType={templateType}
                />
              ))}
                </div>

                {/* Load More Trigger */}
                {hasMore && (
                  <div
                    ref={loadMoreRef}
                    className="flex justify-center py-8"
                  >
                    {loadingMore && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                        {Array.from({ length: 4 }).map((_, index) => (
                      <SkeletonCard key={`loading-skeleton-${index}`} />
                    ))}
                      </div>
                    )}
                  </div>
                )}

                {/* End of results message */}
                {!hasMore && !hasActiveFilters && communityTemplates.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-secondary">You&apos;ve reached the end of the templates</p>
                  </div>
                )}
              </>
            )}
      </div>
    </div>
  );
};

export default TemplateMarketplace;
