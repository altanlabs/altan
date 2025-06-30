import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import EmptyContent from '../../../../../components/empty-content';
import Iconify from '../../../../../components/iconify';
import { selectAccount } from '../../../../../redux/slices/general';
import { optimai_shop } from '../../../../../utils/axios';

const formatPrice = (priceInCents) => {
  if (!priceInCents && priceInCents !== 0) return 'Price not available';
  if (priceInCents === 0) return 'Free';
  const priceInEuros = priceInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(priceInEuros);
};

const TemplateDetails = ({ templateId = null }) => {
  const navigate = useNavigate();
  const account = useSelector(selectAccount);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canClone, setCanClone] = useState(false);
  const [isClonabilityLoading, setIsClonabilityLoading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const containerRef = useRef(null);

  const checkTemplateClonability = useCallback(async (templateId, accountId) => {
    setIsClonabilityLoading(true);
    try {
      const { data } = await optimai_shop.get(
        `/v2/templates/${templateId}/can-clone?account_id=${accountId}`,
      );
      setCanClone(data.can_clone);
    } catch (e) {
      console.error('Error checking template clonability:', e);
      setCanClone(false);
    } finally {
      setIsClonabilityLoading(false);
    }
  }, []);

  const fetchTemplateDetails = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await optimai_shop.get(`/v2/templates/${id}`);
        if (response?.data?.template) {
          setTemplate(response.data.template);
          if (account?.id) {
            checkTemplateClonability(id, account.id);
          }
        } else {
          setError('Template details not found');
        }
      } catch (err) {
        console.error('Error fetching template details:', err);
        setError('Failed to load template details. Please try again later.');
      } finally {
        setLoading(false);
      }
    },
    [account, checkTemplateClonability],
  );

  useEffect(() => {
    if (templateId) {
      fetchTemplateDetails(templateId);
    }
  }, [templateId, fetchTemplateDetails]);

  useEffect(() => {
    if (template && account?.id && !template.clonabilityChecked) {
      checkTemplateClonability(template.id, account.id);
      setTemplate((prev) => ({ ...prev, clonabilityChecked: true }));
    }
  }, [account, template, checkTemplateClonability]);

  const handleBackClick = () => {
    navigate(`/${template?.entity_type}`);
  };

  const handleTemplateAction = async () => {
    // Check if user is authenticated
    if (!account?.id) {
      navigate('/auth/register');
      return;
    }

    try {
      setLoading(true);

      if (canClone) {
        navigate(`/?template=${template.selected_version_id}`, { replace: true });
      } else {
        const response = await optimai_shop.post(
          `/v2/stripe/checkout/template?template_id=${templateId}&account_id=${account.id}`,
        );

        if (response?.data?.url) {
          window.location.href = response.data.url;
        } else {
          throw new Error('Invalid response from checkout endpoint');
        }
      }
    } catch (err) {
      console.error('Error with template action:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedVersion = () => {
    if (!template?.versions) return null;
    if (template.selected_version_id) {
      return template.versions.find((v) => v.id === template.selected_version_id);
    }
    return [...template.versions].sort(
      (a, b) => new Date(b.date_creation) - new Date(a.date_creation),
    )[0];
  };

  const getCoverUrl = () => {
    const selectedVersion = getSelectedVersion();
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
  };

  const getAssetCounts = () => {
    const selectedVersion = getSelectedVersion();
    const assets = selectedVersion?.public_details?.assets || {};
    return {
      flows: assets?.flows ? Object.keys(assets.flows).length : 0,
      agents: assets?.agents ? Object.keys(assets.agents).length : 0,
      forms: assets?.forms ? Object.keys(assets.forms).length : 0,
      connections: assets?.connections ? Object.keys(assets.connections).length : 0,
    };
  };

  const handleOpenPreviewInNewTab = () => {
    if (template?.preview_url) {
      window.open(template.preview_url, '_blank', 'noopener,noreferrer');
    }
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  if (loading && !template) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading template details...</p>
      </div>
    );
  }

  if (error || !template) {
    return (
      <EmptyContent
        title={error || 'Template details not found'}
        description="Try again later or contact support"
        img="/assets/illustrations/illustration_error.svg"
        className="py-5"
        action={
          <button
            onClick={handleBackClick}
            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Iconify
              icon="eva:arrow-back-fill"
              width={16}
              className="mr-2"
            />
            Back to Marketplace
          </button>
        }
      />
    );
  }

  const selectedVersion = getSelectedVersion();
  const description =
    selectedVersion?.public_details?.description ||
    template?.meta_data?.description ||
    'No description available';
  const coverUrl = getCoverUrl();

  return (
    <div
      ref={containerRef}
      className="h-full flex flex-col overflow-hidden"
    >
      {/* Compact header */}
      <header className="px-4 py-3 flex items-center justify-between flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <button
            onClick={handleBackClick}
            className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors mr-2"
          >
            <Iconify
              icon="eva:arrow-back-fill"
              width={16}
            />
          </button>
          <h1
            className="text-lg font-semibold text-gray-900 dark:text-white truncate cursor-pointer"
            onClick={() => setShowDetails(true)}
          >
            {template?.name || template?.public_name || 'Untitled Template'}
          </h1>

          <div className="flex items-center text-gray-600 dark:text-gray-400 space-x-2 px-2">
            <span>
              @{' '}
              <button
                onClick={() => navigate(`/accounts/${template?.account?.id}`)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                {template?.account?.name || 'Unknown'}
              </button>
            </span>
          </div>
        </div>

        <button
          onClick={handleTemplateAction}
          disabled={loading || isClonabilityLoading}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded transition-colors flex items-center"
        >
          {isClonabilityLoading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white mr-1"></div>
          ) : (
            <Iconify
              icon={
                canClone
                  ? 'eva:copy-outline'
                  : template?.price === 0
                    ? 'eva:download-outline'
                    : 'eva:shopping-cart-fill'
              }
              width={14}
              className="mr-1"
            />
          )}
          {canClone ? 'Clone' : template?.price === 0 ? 'Get Free' : 'Buy'}
        </button>
      </header>

      {/* Preview section that takes remaining space */}
      <div
        className="p-2 flex-1 min-h-0"
      >
        <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
          {template?.preview_url ? (
            <iframe
              src={template.preview_url}
              title={`${template.name || 'Template'} Preview`}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center">
              <img
                src={coverUrl}
                alt={template.name}
                className="max-w-full max-h-[300px] object-contain rounded-lg shadow-md mb-6"
              />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Preview Not Available
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                A live preview is not currently available for this template.
              </p>
            </div>
          )}

          <div className="absolute top-3 right-3 flex space-x-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full shadow-lg transition-colors"
              title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              <Iconify
                icon={fullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'}
                width={20}
              />
            </button>

            {template?.preview_url && (
              <button
                type="button"
                onClick={handleOpenPreviewInNewTab}
                className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full shadow-lg transition-colors"
                title="Open in new tab"
              >
                <Iconify
                  icon="mdi:open-in-new"
                  width={20}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Template Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setShowDetails(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3 overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img
                      src={template?.account?.logo_url || coverUrl}
                      alt={template?.name || 'Template'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://cdn.altan.ai/templates/default-cover.jpg';
                      }}
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {template?.name || template?.public_name || 'Untitled Template'}
                  </h2>
                  <span className="text-gray-400 px-2">•</span>
                  <button
                    onClick={() => {
                      navigate(`/wp/${template?.account?.id}`);
                      setShowDetails(false);
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors text-sm"
                  >
                    By {template?.account?.name || 'Unknown'}
                  </button>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Iconify
                    icon="eva:close-fill"
                    width={24}
                  />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Price
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        template?.price === 0
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}
                    >
                      {formatPrice(template?.price)}
                    </span>
                  </div>
                </div>

                {description && description !== 'No description available' && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {description}
                    </p>
                  </div>
                )}

                {(() => {
                  const assetCounts = getAssetCounts();
                  const hasAssets = Object.values(assetCounts).some((count) => count > 0);

                  return (
                    hasAssets && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Included Assets
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {assetCounts.flows > 0 && (
                            <div className="flex items-center">
                              <Iconify
                                icon="eva:git-branch-outline"
                                width={16}
                                className="mr-1 text-gray-500"
                              />
                              <span>
                                {assetCounts.flows} Flow{assetCounts.flows !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                          {assetCounts.agents > 0 && (
                            <div className="flex items-center">
                              <Iconify
                                icon="eva:person-outline"
                                width={16}
                                className="mr-1 text-gray-500"
                              />
                              <span>
                                {assetCounts.agents} Agent{assetCounts.agents !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                          {assetCounts.forms > 0 && (
                            <div className="flex items-center">
                              <Iconify
                                icon="eva:file-text-outline"
                                width={16}
                                className="mr-1 text-gray-500"
                              />
                              <span>
                                {assetCounts.forms} Form{assetCounts.forms !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                          {assetCounts.connections > 0 && (
                            <div className="flex items-center">
                              <Iconify
                                icon="eva:link-outline"
                                width={16}
                                className="mr-1 text-gray-500"
                              />
                              <span>
                                {assetCounts.connections} Connection
                                {assetCounts.connections !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  );
                })()}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      handleTemplateAction();
                      setShowDetails(false);
                    }}
                    disabled={loading || isClonabilityLoading}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded transition-colors flex items-center justify-center"
                  >
                    {isClonabilityLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Iconify
                        icon={
                          canClone
                            ? 'eva:copy-outline'
                            : template?.price === 0
                              ? 'eva:download-outline'
                              : 'eva:shopping-cart-fill'
                        }
                        width={16}
                        className="mr-2"
                      />
                    )}
                    {canClone
                      ? 'Clone Template'
                      : template?.price === 0
                        ? 'Get Template'
                        : 'Purchase Template'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateDetails;
