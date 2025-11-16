import React, { memo, useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import CompactProjectCard from './CompactProjectCard';
import Iconify from '../../../components/iconify/Iconify';
import {
  selectAltanersList,
  selectAltanersLoading,
  selectAltanersInitialized,
} from '../../../redux/slices/altaners';
import { useSelector } from '../../../redux/store.ts';

const QuickAccessSection = () => {
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsToShow, setItemsToShow] = useState(24);
  const [showOnlyWithCloud, setShowOnlyWithCloud] = useState(false);

  // Get data from Redux
  const altaners = useSelector(selectAltanersList);
  const altanersLoading = useSelector(selectAltanersLoading);
  const altanersInitialized = useSelector(selectAltanersInitialized);

  // Filter and sort projects
  const sortedProjects = useMemo(() => {
    if (!altaners) return [];
    return [...altaners]
      .filter((altaner) => !altaner.is_deleted)
      .sort((a, b) => {
        // Pinned first
        if (a.is_pinned !== b.is_pinned) {
          return a.is_pinned ? -1 : 1;
        }
        // Then by last_modified
        const dateA = new Date(a.last_modified || a.date_creation || 0);
        const dateB = new Date(b.last_modified || b.date_creation || 0);
        return dateB.getTime() - dateA.getTime();
      });
  }, [altaners]);

  // Filter projects based on search term and cloud filter
  const filteredProjects = useMemo(() => {
    let projects = sortedProjects;

    // Apply cloud filter
    if (showOnlyWithCloud) {
      projects = projects.filter((project) => {
        // Check if project has a base component with cloud_id
        return project.components?.some((comp) => comp.type === 'base' && comp.cloud_id);
      });
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      projects = projects.filter(
        (project) =>
          project.name?.toLowerCase().includes(search) ||
          project.description?.toLowerCase().includes(search),
      );
    }

    return projects;
  }, [sortedProjects, searchTerm, showOnlyWithCloud]);

  // Get visible projects based on itemsToShow
  const visibleProjects = filteredProjects.slice(0, itemsToShow);
  const hasMore = filteredProjects.length > itemsToShow;
  const showingAll = itemsToShow > 4;

  const handleShowAll = () => {
    setItemsToShow(filteredProjects.length);
  };

  // Loading skeleton for projects
  const ProjectSkeleton = () => (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-[280px] sm:w-[320px] aspect-video rounded-xl bg-gray-200/50 dark:bg-gray-700/50 animate-pulse flex-shrink-0"
        />
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-7xl flex flex-col gap-8">
      {/* Projects Grid - Visual cards */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left side: Projects heading + Search */}
          <div className="flex items-center gap-2 flex-1">
            <h3 className="text-md font-semibold text-foreground whitespace-nowrap">Projects</h3>

            {/* Search Input */}
            <div className="relative max-w-xs flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none z-10">
                <Iconify
                  icon="mdi:magnify"
                  width={16}
                />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-white/10 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Iconify
                    icon="mdi:close"
                    width={16}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Right side: Cloud Filter + Explore Community Button */}
          <div className="flex items-center gap-2">
            {/* Cloud Filter Toggle */}
            <button
              onClick={() => setShowOnlyWithCloud(!showOnlyWithCloud)}
              className={`group flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border backdrop-blur-xl transition-all whitespace-nowrap ${
                showOnlyWithCloud
                  ? 'bg-primary/20 dark:bg-primary/30 border-primary/50 text-primary-foreground dark:text-primary'
                  : 'bg-white/40 dark:bg-white/5 border-white/10 dark:border-white/5 text-foreground hover:bg-white/60 dark:hover:bg-white/10 hover:border-primary/30'
              }`}
              title={showOnlyWithCloud ? 'Show all projects' : 'Show only projects with cloud'}
            >
              <Iconify
                icon="material-symbols:cloud"
                width={16}
                className={showOnlyWithCloud ? 'text-primary dark:text-primary' : ''}
              />
              {showOnlyWithCloud && 'Cloud only'}
            </button>

            {/* Explore Community Button */}
            <button
              onClick={() => history.push('/marketplace')}
              className="group flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-foreground rounded-lg border border-white/10 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-xl hover:bg-white/60 dark:hover:bg-white/10 hover:border-primary/30 transition-all whitespace-nowrap"
            >
              <Iconify
                icon="mdi:store"
                width={16}
              />
              Explore community
            </button>
          </div>
        </div>

        {altanersLoading || !altanersInitialized ? (
          <ProjectSkeleton />
        ) : filteredProjects.length > 0 ? (
          <>
            {/* Horizontal scroll for initial 8, grid for more */}
            <div
              className={
                showingAll
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'flex gap-4 overflow-x-auto pb-2 scrollbar-hide'
              }
            >
              {visibleProjects.map((project) => (
                <CompactProjectCard
                  key={project.id}
                  altaner={project}
                />
              ))}
            </div>

            {/* Show All Button */}
            {hasMore && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleShowAll}
                  className="group flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg border border-white/10 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-xl hover:bg-white/60 dark:hover:bg-white/10 transition-all"
                >
                  Show all
                  <Iconify
                    icon="mdi:chevron-down"
                    width={16}
                    className="group-hover:translate-y-0.5 transition-transform"
                  />
                </button>
              </div>
            )}
          </>
        ) : searchTerm || showOnlyWithCloud ? (
          <div className="relative overflow-hidden rounded-2xl border border-white/10 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-xl">
            <div className="flex flex-col items-center justify-center py-12 px-6">
              {/* Icon */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 blur-2xl rounded-full" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 dark:from-primary/20 dark:to-purple-500/20 flex items-center justify-center border border-white/20 dark:border-white/10">
                  <Iconify
                    icon={showOnlyWithCloud ? 'material-symbols:cloud' : 'mdi:magnify'}
                    width={32}
                    className="text-primary/60 dark:text-primary/80"
                  />
                </div>
              </div>

              {/* Text */}
              <h4 className="text-base font-medium text-foreground/80 mb-1">No projects found</h4>
              <p className="text-xs text-foreground/50 text-center max-w-xs">
                {showOnlyWithCloud && searchTerm
                  ? 'No projects with cloud match your search'
                  : showOnlyWithCloud
                    ? 'No projects have cloud enabled'
                    : 'Try adjusting your search term'}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-white/10 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-xl">
            <div className="flex flex-col items-center justify-center py-12 px-6">
              {/* Icon */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 blur-2xl rounded-full" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 dark:from-primary/20 dark:to-purple-500/20 flex items-center justify-center border border-white/20 dark:border-white/10">
                  <Iconify
                    icon="fluent:folder-add-24-regular"
                    width={32}
                    className="text-primary/60 dark:text-primary/80"
                  />
                </div>
              </div>

              {/* Text */}
              <h4 className="text-base font-medium text-foreground/80 mb-1">No projects yet</h4>
              <p className="text-xs text-foreground/50 text-center max-w-xs">
                Start building by describing your idea in the prompt above
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(QuickAccessSection);
