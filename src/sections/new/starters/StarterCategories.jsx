import { m } from 'framer-motion';
import { BarChart3, Globe, LayoutGrid, Layers } from 'lucide-react';
import React from 'react';

import AgentsRenderer from './AgentsRenderer';
import AppsRenderer from './AppsRenderer';
import SystemsRenderer from './SystemsRenderer';
import VisualizationsRenderer from './VisualizationsRenderer';
import WebsitesRenderer from './WebsitesRenderer';
import useLocales from '../../../locales/useLocales';

// Simple Circle Icon for Agents (ChatGPT-style)
const CircleIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      fill="currentColor"
    />
  </svg>
);

const StarterCategories = ({ onSelectPrompt, selectedCategory, onCategoryChange }) => {
  const { translate } = useLocales();

  const categories = [
    {
      id: 'websites',
      label: translate('categories.websites'),
      icon: Globe,
      autofill: translate('categories.autofill.websites'),
    },
    {
      id: 'apps',
      label: translate('categories.apps'),
      icon: LayoutGrid,
      autofill: translate('categories.autofill.apps'),
    },
    {
      id: 'agents',
      label: translate('categories.agents'),
      icon: CircleIcon,
      autofill: translate('categories.autofill.agents'),
    },
    {
      id: 'systems',
      label: translate('categories.systems'),
      icon: Layers,
      autofill: translate('categories.autofill.systems'),
    },
    {
      id: 'visualizations',
      label: translate('categories.visualizations'),
      icon: BarChart3,
      autofill: translate('categories.autofill.visualizations'),
    },
  ];

  const handleCategoryClick = (categoryId) => {
    // Toggle: if clicking the same category, deselect it
    if (selectedCategory === categoryId) {
      onCategoryChange(null);
    } else {
      onCategoryChange(categoryId);
      // Auto-fill the input with the category's starter prompt
      const category = categories.find((c) => c.id === categoryId);
      if (category?.autofill) {
        onSelectPrompt(category.autofill);
      }
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Category Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryClick(category.id)}
              className={`group inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                isSelected
                  ? 'border-primary/50 bg-primary/10 text-foreground'
                  : 'border-border/50 bg-background/50 backdrop-blur-sm text-muted-foreground hover:bg-background hover:border-primary/20 hover:text-foreground'
              }`}
            >
              <Icon className={`w-4 h-4 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} />
              <span className="text-sm font-medium">{category.label}</span>
              {isSelected && (
                <span className="ml-1 text-xs">×</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Category Renderer - Only show if a category is selected */}
      {selectedCategory && (
        <m.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {selectedCategory === 'websites' && <WebsitesRenderer onSelect={onSelectPrompt} />}
          {selectedCategory === 'apps' && <AppsRenderer onSelect={onSelectPrompt} />}
          {selectedCategory === 'agents' && <AgentsRenderer onSelect={onSelectPrompt} />}
          {selectedCategory === 'systems' && <SystemsRenderer onSelect={onSelectPrompt} />}
          {selectedCategory === 'visualizations' && <VisualizationsRenderer onSelect={onSelectPrompt} />}
        </m.div>
      )}
    </div>
  );
};

export default StarterCategories;
