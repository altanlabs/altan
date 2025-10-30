import React, { memo } from 'react';
import { useHistory } from 'react-router-dom';

import CompactProjectCard from './CompactProjectCard';
import Iconify from '../../../components/iconify/Iconify';

const QuickAccessSection = ({ projects = [], isLoading = false }) => {
  const history = useHistory();

  const handleViewAllProjects = () => {
    history.push('/v2');
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
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Projects</h3>
          <button
            onClick={handleViewAllProjects}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
            <Iconify icon="mdi:arrow-right" width={14} />
          </button>
        </div>

        {isLoading ? (
          <ProjectSkeleton />
        ) : projects.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {projects.slice(0, 8).map((project) => (
              <CompactProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                icon_url={project.icon_url}
                is_pinned={project.is_pinned}
                components={project.components?.items || []}
                last_modified={project.last_modified}
              />
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-white/10 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-xl">
            <div className="flex flex-col items-center justify-center py-12 px-6">
              {/* Icon */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 blur-2xl rounded-full" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 dark:from-primary/20 dark:to-purple-500/20 flex items-center justify-center border border-white/20 dark:border-white/10">
                  <Iconify icon="fluent:folder-add-24-regular" width={32} className="text-primary/60 dark:text-primary/80" />
                </div>
              </div>
              
              {/* Text */}
              <h4 className="text-base font-medium text-foreground/80 mb-1">
                No projects yet
              </h4>
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
