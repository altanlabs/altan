/**
 * Sitemap generation utilities for SEO
 */

/**
 * Generate sitemap XML for templates
 * @param {Array} templates - Array of template objects
 * @returns {string} XML sitemap content
 */
export const generateTemplateSitemap = (templates) => {
  const baseUrl = 'https://www.altan.ai';
  
  const urlEntries = templates.map(template => {
    const lastModified = template.updated_at || template.created_at || new Date().toISOString();
    const priority = template.price === 0 ? '0.8' : '0.7'; // Free templates get slightly higher priority
    
    return `
    <url>
        <loc>${baseUrl}/marketplace/template/${template.id}</loc>
        <lastmod>${new Date(lastModified).toISOString().split('T')[0]}</lastmod>
        <priority>${priority}</priority>
        <changefreq>weekly</changefreq>
        <pagemap:PageMap xmlns:pagemap="http://www.google.com/schemas/sitemap-pagemap/1.0">
            <pagemap:DataObject type="document">
                <pagemap:Attribute name="title" value="${escapeXml(template.name || template.public_name || 'Template')} by ${escapeXml(template.account?.name || 'Unknown')} · Altan Marketplace"/>
                <pagemap:Attribute name="description" value="${escapeXml(getTemplateDescription(template))}"/>
                <pagemap:Attribute name="price" value="${template.price || 0}"/>
                <pagemap:Attribute name="category" value="${template.entity_type || 'template'}"/>
                <pagemap:Attribute name="author" value="${escapeXml(template.account?.name || 'Unknown')}"/>
            </pagemap:DataObject>
        </pagemap:PageMap>
    </url>`.trim();
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:pagemap="http://www.google.com/schemas/sitemap-pagemap/1.0">
${urlEntries}
</urlset>`;
};

/**
 * Generate robots.txt content that includes sitemap references
 * @returns {string} robots.txt content
 */
export const generateRobotsTxt = () => {
  const baseUrl = 'https://www.altan.ai';
  
  return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-templates.xml
Sitemap: ${baseUrl}/sitemap-blog.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Disallow specific paths that shouldn't be indexed
Disallow: /api/
Disallow: /admin/
Disallow: /auth/
Disallow: /_redirects
Disallow: /private/

# Allow important static assets
Allow: /assets/
Allow: /logos/
Allow: /favicon.ico
Allow: /*.css
Allow: /*.js
Allow: /*.svg
Allow: /*.png
Allow: /*.jpg
Allow: /*.jpeg
Allow: /*.webp`;
};

/**
 * Generate marketplace category sitemap
 * @param {Array} categories - Array of template categories
 * @returns {string} XML sitemap content for categories
 */
export const generateCategorySitemap = (categories) => {
  const baseUrl = 'https://www.altan.ai';
  
  const urlEntries = categories.map(category => {
    return `
    <url>
        <loc>${baseUrl}/marketplace?category=${category.slug}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <priority>0.6</priority>
        <changefreq>daily</changefreq>
        <pagemap:PageMap xmlns:pagemap="http://www.google.com/schemas/sitemap-pagemap/1.0">
            <pagemap:DataObject type="document">
                <pagemap:Attribute name="title" value="${escapeXml(category.name)} Templates · Altan Marketplace"/>
                <pagemap:Attribute name="description" value="Discover ${escapeXml(category.name.toLowerCase())} templates in the Altan marketplace"/>
                <pagemap:Attribute name="category" value="${category.slug}"/>
            </pagemap:DataObject>
        </pagemap:PageMap>
    </url>`.trim();
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:pagemap="http://www.google.com/schemas/sitemap-pagemap/1.0">
${urlEntries}
</urlset>`;
};

/**
 * Generate template feed for search engines (JSON-LD feed)
 * @param {Array} templates - Array of template objects
 * @returns {Object} JSON-LD feed structure
 */
export const generateTemplateFeed = (templates) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Altan Template Marketplace',
    description: 'Browse and discover AI-powered templates for automation, workflows, and agents',
    url: 'https://www.altan.ai/marketplace',
    publisher: {
      '@type': 'Organization',
      name: 'Altan',
      url: 'https://www.altan.ai',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.altan.ai/logos/120x120Black.png',
      },
    },
    numberOfItems: templates.length,
    itemListElement: templates.map((template, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'SoftwareApplication',
        '@id': `https://www.altan.ai/marketplace/template/${template.id}`,
        name: template.name || template.public_name || 'Untitled Template',
        description: getTemplateDescription(template),
        url: `https://www.altan.ai/marketplace/template/${template.id}`,
        image: getTemplateCoverUrl(template),
        author: {
          '@type': 'Organization',
          name: template.account?.name || 'Unknown',
        },
        offers: {
          '@type': 'Offer',
          price: template.price || 0,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
        },
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser',
      },
    })),
  };
};

/**
 * Escape XML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Get template description for sitemap
 * @param {Object} template - Template object
 * @returns {string} Template description
 */
function getTemplateDescription(template) {
  const selectedVersion = getSelectedVersion(template);
  const description = selectedVersion?.public_details?.description ||
    template?.meta_data?.description ||
    'AI-powered template for automation and workflows';
  
  // Limit description length for XML
  return description.length > 155 ? description.substring(0, 155) + '...' : description;
}

/**
 * Get selected version from template
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
 * Get template cover URL for sitemap
 * @param {Object} template - Template object
 * @returns {string} Cover URL
 */
function getTemplateCoverUrl(template) {
  const selectedVersion = getSelectedVersion(template);
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
 * Generate hreflang alternatives for international SEO
 * @param {Object} template - Template object
 * @returns {Array} Array of hreflang objects
 */
export const generateHreflangAlternatives = (template) => {
  const baseUrl = 'https://www.altan.ai';
  const templateUrl = `/marketplace/template/${template.id}`;
  
  // For now, we'll just define the main language, but this can be expanded
  // when the platform supports multiple languages
  return [
    {
      hreflang: 'en',
      href: `${baseUrl}${templateUrl}`,
    },
    {
      hreflang: 'x-default',
      href: `${baseUrl}${templateUrl}`,
    },
  ];
}; 