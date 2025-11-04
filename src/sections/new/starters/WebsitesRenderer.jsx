import React from 'react';

import AltanerSectionCategory from '../../../components/templates/AltanerSectionCategory';
import useLocales from '../../../locales/useLocales';

const WebsiteTemplatesGrid = ({ onSelect }) => {
  const handleTemplateClick = (template) => {
    // Dispatch custom event to add template as chip
    window.dispatchEvent(
      new CustomEvent('selectHeroTemplate', {
        detail: {
          templateId: template.id,
          templateName: template.name || template.public_name || 'Template',
        },
      }),
    );
  };

  return (
    <AltanerSectionCategory
      category="sites"
      title="Templates"
      initialExpanded={true}
      onTemplateClick={handleTemplateClick}
    />
  );
};

const WebsitesRenderer = ({ onSelect }) => {
  const { translate } = useLocales();

  const starters = [
    {
      title: translate('starters.websites.showWork.title'),
      description: translate('starters.websites.showWork.description'),
      prompt:
        'Create a modern portfolio website with projects showcase, about section, and contact form',
    },
    {
      title: translate('starters.websites.launchProduct.title'),
      description: translate('starters.websites.launchProduct.description'),
      prompt:
        'Create a landing page for a SaaS product with hero section, features, pricing, and CTA',
    },
    {
      title: translate('starters.websites.promoteEvent.title'),
      description: translate('starters.websites.promoteEvent.description'),
      prompt:
        'Create an event page with event details, schedule, speakers section, and registration form',
    },
    {
      title: translate('starters.websites.publishBlog.title'),
      description: translate('starters.websites.publishBlog.description'),
      prompt: 'Create a blog website with article listing, individual posts, and author profiles',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Get Started Section */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Start with an example:</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {starters.map((starter) => (
            <button
              key={starter.title}
              type="button"
              onClick={() => onSelect(starter.prompt)}
              className="flex-shrink-0 w-72 p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background hover:border-primary/20 transition-all duration-200 text-left"
            >
              <div className="space-y-2">
                <div className="text-base font-semibold text-foreground">{starter.title}</div>
                <div className="text-sm text-muted-foreground">{starter.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Templates Section */}
      <div>
        <WebsiteTemplatesGrid onSelect={onSelect} />
      </div>
    </div>
  );
};

export default WebsitesRenderer;
