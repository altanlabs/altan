import React, { memo, useMemo, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { m } from 'framer-motion';

import ProjectCard from './ProjectCard';
import { useAuthContext } from '../../../auth/useAuthContext';

const selectAccountAltaners = (state) => state.general.account?.altaners;
const selectAltanersLoading = (state) => state.general.accountAssetsLoading.altaners;

const MAX_VISIBLE_APPS = 9;

// Demo/template projects for unauthenticated users
const DEMO_PROJECTS = [
  {
    id: 'demo-1',
    name: 'CRM System',
    iconUrl: 'https://api.altan.ai/platform/media/2262e664-dc6a-4a78-bad5-266d6b836136?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
    isDemo: true,
  },
  {
    id: 'demo-2',
    name: 'Task Manager',
    iconUrl: 'https://api.altan.ai/platform/media/2262e664-dc6a-4a78-bad5-266d6b836136?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
    isDemo: true,
  },
  {
    id: 'demo-3',
    name: 'Analytics Dashboard',
    iconUrl: 'https://api.altan.ai/platform/media/2262e664-dc6a-4a78-bad5-266d6b836136?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
    isDemo: true,
  },
];

const VirtualDesktop = ({ searchQuery = '', currentPage = 0, onPageChange }) => {
  const { isAuthenticated } = useAuthContext();
  const altaners = useSelector(selectAccountAltaners);
  const isLoading = useSelector(selectAltanersLoading);
  const containerRef = useRef(null);

  // Use demo projects for unauthenticated users, real projects for authenticated
  const projects = isAuthenticated ? (altaners || []) : DEMO_PROJECTS;

  // Sort and filter projects: pinned first, then by last modified, then filter by search
  const sortedProjects = useMemo(() => {
    let filtered = [...projects];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.name?.toLowerCase().includes(searchLower) ||
          project.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort: pinned first, then by last modified
    return filtered.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) {
        return a.is_pinned ? -1 : 1;
      }
      const dateA = new Date(a.last_modified || 0);
      const dateB = new Date(b.last_modified || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [projects, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedProjects.length / MAX_VISIBLE_APPS);
  const startIndex = currentPage * MAX_VISIBLE_APPS;
  const endIndex = startIndex + MAX_VISIBLE_APPS;
  const visibleApps = sortedProjects.slice(startIndex, endIndex);

  // Handle scroll-based pagination
  useEffect(() => {
    const container = containerRef.current;
    if (!container || totalPages <= 1 || !onPageChange) return;

    let scrollTimeout;
    const handleScroll = (e) => {
      const deltaY = e.deltaY;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (deltaY > 50 && currentPage < totalPages - 1) {
          onPageChange(currentPage + 1);
        } else if (deltaY < -50 && currentPage > 0) {
          onPageChange(currentPage - 1);
        }
      }, 50);
    };

    container.addEventListener('wheel', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('wheel', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [currentPage, totalPages, onPageChange]);

  return (
    <>
      <div 
        ref={containerRef}
        className="w-full h-full pt-16 pb-48 px-8 sm:px-16 lg:px-24 overflow-hidden flex items-center justify-center"
      >
        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full max-w-4xl">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full aspect-[16/9] bg-white/10 dark:bg-white/5 rounded-lg mb-2" />
                <div className="w-3/4 h-3 bg-white/10 dark:bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : sortedProjects.length === 0 ? (
          // Empty state
          <m.div 
            className="flex flex-col items-center justify-center w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="text-center">
              <m.div
                className="mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <p className="text-sm text-foreground/60 tracking-wide mb-2">
                  Nothing yet.
                </p>
                <p className="text-2xl font-light text-foreground/80 tracking-tight">
                  The canvas is waiting.
                </p>
              </m.div>
              
              <m.div
                className="flex items-center justify-center gap-2 text-xs text-foreground/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs">⌘</kbd>
                <span>+</span>
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs">K</kbd>
                <span className="ml-2">to begin</span>
              </m.div>
            </div>
          </m.div>
        ) : (
          <div className="w-full max-w-4xl">
            {/* Desktop grid - Clean 3x3 layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {visibleApps.map((project, index) => (
                <m.div
                  key={`${project.id}-${currentPage}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <ProjectCard
                    id={project.id}
                    name={project.name}
                    iconUrl={project.icon_url || project.iconUrl}
                    description={project.description}
                    last_modified={project.last_modified}
                    isPinned={project.is_pinned}
                    components={project.components?.items || []}
                  />
                </m.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default memo(VirtualDesktop);

