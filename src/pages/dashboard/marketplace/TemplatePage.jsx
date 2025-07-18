import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import TemplateDetails from './components/template/TemplateDetails';
import LoadingScreen from '../../../components/loading-screen/LoadingScreen';
import { CompactLayout } from '../../../layouts/dashboard';
import { optimai_shop } from '../../../utils/axios';
import {
  generateTemplateSEO,
  generateTemplateStructuredData,
  generateTemplateBreadcrumbs,
} from '../../../utils/seo';

// Main TemplatePage Component
const TemplatePage = () => {
  const { templateId } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTemplateForSEO = async (id) => {
    setLoading(true);
    try {
      const response = await optimai_shop.get(`/v2/templates/${id}`);
      if (response?.data?.template) {
        setTemplate(response.data.template);
      }
    } catch (err) {
      console.error('Error fetching template for SEO:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (templateId) {
      fetchTemplateForSEO(templateId);
    }
  }, [templateId]);

  // Generate SEO data
  const seoData = generateTemplateSEO(template);
  const structuredData = generateTemplateStructuredData(template, seoData);
  const breadcrumbData = generateTemplateBreadcrumbs(template);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Helmet>
        <title>{seoData.title}</title>
        <meta
          name="description"
          content={seoData.description}
        />
        <meta
          name="keywords"
          content={seoData.keywords}
        />

        {/* Canonical URL */}
        {seoData.canonicalUrl && (
          <link
            rel="canonical"
            href={seoData.canonicalUrl}
          />
        )}

        {/* Open Graph tags for social media */}
        <meta
          property="og:title"
          content={seoData.title}
        />
        <meta
          property="og:description"
          content={seoData.description}
        />
        <meta
          property="og:type"
          content="website"
        />
        <meta
          property="og:image"
          content={seoData.ogImage}
        />
        {seoData.canonicalUrl && (
          <meta
            property="og:url"
            content={seoData.canonicalUrl}
          />
        )}
        <meta
          property="og:site_name"
          content="Altan"
        />

        {/* Twitter Card tags */}
        <meta
          name="twitter:card"
          content="summary_large_image"
        />
        <meta
          name="twitter:title"
          content={seoData.title}
        />
        <meta
          name="twitter:description"
          content={seoData.description}
        />
        <meta
          name="twitter:image"
          content={seoData.ogImage}
        />

        {/* Additional SEO meta tags */}
        <meta
          name="robots"
          content="index, follow, max-image-preview:large"
        />
        <meta
          name="author"
          content={seoData.author}
        />

        {/* Price-specific meta tags for rich snippets */}
        {template && (
          <>
            <meta
              property="product:price:amount"
              content={template.price || 0}
            />
            <meta
              property="product:price:currency"
              content="EUR"
            />
          </>
        )}

        {/* Structured data */}
        {structuredData && (
          <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        )}

        {/* Breadcrumb structured data */}
        {breadcrumbData && (
          <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>
        )}
      </Helmet>

      <CompactLayout
        title={seoData.title}
        description={seoData.description}
        noPadding
      >
        <TemplateDetails templateId={templateId} />
      </CompactLayout>
    </>
  );
};

export default TemplatePage;
