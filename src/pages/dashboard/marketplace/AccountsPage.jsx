import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

import EmptyContent from '../../../components/empty-content';
import { optimai } from '../../../utils/axios';

const ITEMS_PER_PAGE = 100;

// Helper function to get cover URL from template data (same as Redux slice)
const getCoverUrlFromTemplate = (template) => {
  // Use the cover_url directly from selected_version if available
  if (template.selected_version?.cover_url) {
    return template.selected_version.cover_url;
  }
  // Fallback to build_metadata if still needed for compatibility
  if (template.selected_version?.build_metadata?.meta_data?.cover_url) {
    return template.selected_version.build_metadata.meta_data.cover_url;
  }
  // Fallback to template meta_data
  if (template.meta_data?.cover_url) {
    return template.meta_data.cover_url;
  }
  return null;
};

const SearchBar = ({ searchTerm, onSearchChange, resultsCount }) => {
  return (
    <div className="relative max-w-md mx-auto mb-8">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search templates..."
          className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/40 dark:border-gray-600/40 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 shadow-lg hover:shadow-xl"
        />
      </div>
      {searchTerm && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
          {resultsCount} template{resultsCount !== 1 ? 's' : ''} found
        </p>
      )}
    </div>
  );
};

const TemplateCard = ({ template, index }) => {
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  // Generate gradient based on template name or id
  const getGradientClasses = () => {
    const gradients = [
      'from-purple-500 to-indigo-600',
      'from-pink-500 to-rose-500',
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-teal-400',
      'from-yellow-400 to-orange-500',
      'from-indigo-400 to-purple-400',
      'from-rose-400 to-pink-400',
      'from-amber-400 to-orange-400',
    ];

    const hash = (template.name || template.id).split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    return gradients[Math.abs(hash) % gradients.length];
  };

  const gradientClasses = getGradientClasses();
  const coverUrl = getCoverUrlFromTemplate(template);

  const formatPrice = (priceInCents) => {
    if (!priceInCents && priceInCents !== 0) return 'Free';
    if (priceInCents === 0) return 'Free';
    const priceInEuros = priceInCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(priceInEuros);
  };

  return (
    <Link
      to={`/template/${template.id}`}
      className={'group block h-full transform transition-all duration-500 ease-out hover:-translate-y-2 animate-fadeInUp'}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/20 dark:border-gray-700/20 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/30">
        {/* Top gradient bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientClasses} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        />

        {/* Cover Image */}
        <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={template.name || 'Template'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradientClasses} flex items-center justify-center text-white font-semibold text-2xl`}>
              {template.name ? template.name.charAt(0).toUpperCase() : '?'}
            </div>
          )}
          
          {/* Price badge */}
          <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-lg">
            {formatPrice(template.price)}
          </div>

          {/* Arrow icon */}
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-4 h-full flex flex-col">
          {/* Template Name */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
            {template.name || 'Unnamed Template'}
          </h3>

          {/* Description if available */}
          {template.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-1">
              {template.description}
            </p>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer with metadata */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
                />
              </svg>
              <span>{formatDate(template.date_creation)}</span>
            </div>

            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {template.category || 'Uncategorized'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const LoadingCard = ({ index }) => (
  <div
    className="animate-pulse"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/20 dark:border-gray-700/20 rounded-2xl p-6 h-64">
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 bg-gray-300 dark:bg-gray-600 rounded-2xl"></div>
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mb-4"></div>
      <div className="mt-auto pt-4">
        <div className="flex justify-between">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
        </div>
      </div>
    </div>
  </div>
);

const InfiniteScrollTrigger = ({ onTrigger, loading, hasMore }) => {
  const triggerRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading && hasMore) {
          console.log('Infinite scroll triggered!'); // Debug log
          onTrigger();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      },
    );

    const currentRef = triggerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [onTrigger, loading, hasMore]);

  return (
    <div
      ref={triggerRef}
      className="h-20 flex items-center justify-center"
    >
      {loading ? (
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span>Loading more templates...</span>
        </div>
      ) : hasMore ? (
        <div className="text-gray-400 text-sm">Scroll for more...</div>
      ) : null}
    </div>
  );
};

const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTemplates = useCallback(async (currentOffset = 0, isLoadMore = false, search = '') => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE,
        offset: currentOffset,
        template_type: 'altaner',
        ...(search && { name: search }),
      });

      const response = await optimai.get(`/templates/list?${params}`);
      let fetchedTemplates = response?.data?.templates || [];
      
      // Transform templates to include cover URLs (same as Redux slice)
      const transformedTemplates = fetchedTemplates.map(template => {
        const coverUrl = getCoverUrlFromTemplate(template);
        return {
          ...template,
          cover_url: coverUrl || '/assets/placeholder.svg',
          has_cover: Boolean(coverUrl),
        };
      });

      // Filter out templates without actual cover URLs
      const templatesWithCovers = transformedTemplates.filter(template => template.has_cover);

      if (isLoadMore) {
        setTemplates((prev) => [...prev, ...templatesWithCovers]);
      } else {
        setTemplates(templatesWithCovers);
        setOffset(currentOffset);
      }

      // Check if there are more templates (we need to account for filtering)
      setHasMore(fetchedTemplates.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setError('Failed to load templates. Please try again later.');
      setTemplates([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setOffset(0);
      fetchTemplates(0, false, searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchTemplates]);

  // Initial load
  useEffect(() => {
    fetchTemplates(0, false);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const newOffset = offset + ITEMS_PER_PAGE;
      setOffset(newOffset);
      fetchTemplates(newOffset, true, searchTerm);
    }
  }, [loadingMore, hasMore, offset, fetchTemplates, searchTerm]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <EmptyContent title={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-900/20">
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out both;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}
      </style>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-4">
            Discover Templates
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Explore creative templates with stunning visuals from our community
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          resultsCount={templates.length}
        />

        {/* Content */}
        <div className="mt-8">
          {loading && !templates.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <LoadingCard
                  key={index}
                  index={index}
                />
              ))}
            </div>
          ) : templates.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {templates.map((template, index) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    index={index}
                  />
                ))}
              </div>

              {/* Infinite scroll trigger */}
              {hasMore && (
                <InfiniteScrollTrigger
                  onTrigger={handleLoadMore}
                  loading={loadingMore}
                />
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <EmptyContent
                title="No templates found"
                description={
                  searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Check back later for new templates.'
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;
