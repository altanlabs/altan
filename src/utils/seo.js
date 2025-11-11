/**
 * SEO utilities for generating meta tags and structured data
 */

/**
 * Generate SEO meta data for templates
 * @param {Object} template - Template object
 * @returns {Object} SEO meta data
 */
export const generateTemplateSEO = (template) => {
  if (!template) {
    return {
      title: 'Template · Altan Marketplace',
      description: 'Discover and clone AI-powered templates in the Altan marketplace.',
      keywords: 'AI templates, automation, workflows, agents, marketplace',
      canonicalUrl: null,
      ogImage: 'https://cdn.altan.ai/templates/default-cover.jpg',
    };
  }

  const selectedVersion = getSelectedVersion(template);
  const description = getTemplateDescription(template, selectedVersion);
  const coverUrl = getTemplateCoverUrl(template, selectedVersion);
  
  // Generate SEO-friendly title
  const title = `${template.name || template.public_name || 'Template'} by ${
    template.account?.name || 'Unknown'
  } · Altan Marketplace`;
  
  // Generate meta description
  const metaDescription = description && description !== 'No description available' 
    ? description.substring(0, 155) // Limit to 155 characters for SEO
    : `Discover "${template.name || template.public_name || 'this template'}" - an AI-powered template in the Altan marketplace. Clone and customize for your needs.`;

  // Generate keywords from template data
  const keywords = generateTemplateKeywords(template, selectedVersion);
  
  return {
    title,
    description: metaDescription,
    keywords: keywords.join(', '),
    canonicalUrl: `https://www.altan.ai/marketplace/template/${template.id}`,
    ogImage: coverUrl,
    price: template.price,
    author: template.account?.name || 'Unknown',
    templateId: template.id,
  };
};

/**
 * Generate structured data (JSON-LD) for templates
 * @param {Object} template - Template object
 * @param {Object} seoData - SEO data from generateTemplateSEO
 * @returns {Object} Structured data object
 */
export const generateTemplateStructuredData = (template, seoData) => {
  if (!template) return null;

  const selectedVersion = getSelectedVersion(template);
  const assetCounts = getTemplateAssetCounts(template, selectedVersion);
  
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: template.name || template.public_name || 'Untitled Template',
    description: seoData.description,
    url: seoData.canonicalUrl,
    image: seoData.ogImage,
    author: {
      '@type': 'Organization',
      name: template.account?.name || 'Unknown',
      url: template.account?.id ? `https://www.altan.ai/accounts/${template.account.id}` : undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Altan',
      url: 'https://www.altan.ai',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.altan.ai/logos/120x120Black.png',
      },
    },
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: template.price || 0,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      category: 'AI Template',
    },
    ...(template.preview_url && {
      screenshot: {
        '@type': 'ImageObject',
        url: template.preview_url,
      },
    }),
    additionalProperty: [
      ...(assetCounts.flows > 0 ? [{
        '@type': 'PropertyValue',
        name: 'Workflows',
        value: assetCounts.flows,
      }] : []),
      ...(assetCounts.agents > 0 ? [{
        '@type': 'PropertyValue',
        name: 'AI Agents',
        value: assetCounts.agents,
      }] : []),
      ...(assetCounts.connections > 0 ? [{
        '@type': 'PropertyValue',
        name: 'Integrations',
        value: assetCounts.connections,
      }] : []),
    ],
  };
};

/**
 * Helper function to get selected version from template
 * @param {Object} template - Template object
 * @returns {Object|null} Selected version
 */
function getSelectedVersion(template) {
  if (!template?.versions) return null;
  if (template.selected_version_id) {
    return template.versions.find((v) => v.id === template.selected_version_id);
  }
  return [...template.versions].sort(
    (a, b) => new Date(b.date_creation) - new Date(a.date_creation),
  )[0];
}

/**
 * Helper function to get template description
 * @param {Object} template - Template object
 * @param {Object} selectedVersion - Selected version object
 * @returns {string} Template description
 */
function getTemplateDescription(template, selectedVersion) {
  return (
    selectedVersion?.public_details?.description ||
    template?.meta_data?.description ||
    'No description available'
  );
}

/**
 * Helper function to get template cover URL
 * @param {Object} template - Template object
 * @param {Object} selectedVersion - Selected version object
 * @returns {string} Cover URL
 */
function getTemplateCoverUrl(template, selectedVersion) {
  // Use the cover_url directly from selected_version if available (from new backend structure)
  if (selectedVersion?.cover_url) {
    return selectedVersion.cover_url;
  }
  // Fallback to build_metadata for backward compatibility
  if (selectedVersion?.build_metadata?.meta_data?.cover_url) {
    return selectedVersion.build_metadata.meta_data.cover_url;
  }
  if (template?.versions) {
    for (const version of template.versions) {
      if (version?.build_metadata?.meta_data?.cover_url) {
        return version.build_metadata.meta_data.cover_url;
      }
    }
  }
  return template?.meta_data?.cover_url || 'https://cdn.altan.ai/templates/default-cover.jpg';
}

/**
 * Helper function to get asset counts from template
 * @param {Object} template - Template object
 * @param {Object} selectedVersion - Selected version object
 * @returns {Object} Asset counts
 */
function getTemplateAssetCounts(template, selectedVersion) {
  const assets = selectedVersion?.public_details?.assets || {};
  return {
    flows: assets?.flows ? Object.keys(assets.flows).length : 0,
    agents: assets?.agents ? Object.keys(assets.agents).length : 0,
    connections: assets?.connections ? Object.keys(assets.connections).length : 0,
  };
}

/**
 * Generate relevant keywords for the template
 * @param {Object} template - Template object
 * @param {Object} selectedVersion - Selected version object
 * @returns {Array} Array of keywords
 */
function generateTemplateKeywords(template, selectedVersion) {
  const keywords = ['AI template', 'automation', 'workflow', 'altan'];
  
  // Add template type specific keywords
  if (template.entity_type) {
    keywords.push(template.entity_type);
  }
  
  // Add asset-based keywords
  const assetCounts = getTemplateAssetCounts(template, selectedVersion);
  if (assetCounts.flows > 0) keywords.push('workflow automation', 'business process');
  if (assetCounts.agents > 0) keywords.push('AI agents', 'chatbot', 'virtual assistant');
  if (assetCounts.connections > 0) keywords.push('integrations', 'API connections');
  
  // Add price-based keywords
  if (template.price === 0) {
    keywords.push('free template', 'free automation');
  }
  
  // Add author keywords if available
  if (template.account?.name) {
    keywords.push(`${template.account.name} template`);
  }
  
  return keywords;
}

/**
 * Generate breadcrumb structured data for template pages
 * @param {Object} template - Template object
 * @returns {Object} Breadcrumb structured data
 */
export const generateTemplateBreadcrumbs = (template) => {
  const breadcrumbs = [
    { name: 'Home', url: 'https://www.altan.ai' },
    { name: 'Marketplace', url: 'https://www.altan.ai/marketplace' },
  ];
  
  if (template?.entity_type) {
    const entityTypeMap = {
      'workflow': 'Workflows',
      'agent': 'Agents',
      'altaner': 'Altaners',
    };
    
    const entityName = entityTypeMap[template.entity_type] || template.entity_type;
    breadcrumbs.push({
      name: entityName,
      url: `https://www.altan.ai/marketplace?category=${template.entity_type}`,
    });
  }
  
  if (template) {
    breadcrumbs.push({
      name: template.name || template.public_name || 'Template',
      url: `https://www.altan.ai/marketplace/template/${template.id}`,
    });
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}; 