import { Tooltip, Chip } from '@mui/material';
import { memo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import CustomDialog from './dialogs/CustomDialog';
import HeaderIconButton from './HeaderIconButton';
import Iconify from './iconify';
import { selectAccountId, selectHasGrowthSubscription } from '../redux/slices/general/index.ts';
import { optimai_shop } from '../utils/axios'; // Adjust the import path as needed

function HireAnExpert({ open, setOpen, iconSize = 20 }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showExpertPackages, setShowExpertPackages] = useState(false);
  const accountId = useSelector(selectAccountId);
  const hasGrowthSubscription = useSelector(selectHasGrowthSubscription);
  const history = useHistory();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handlePurchase = async (productId) => {
    try {
      setIsLoading(true);
      const response = await optimai_shop.get('/stripe/buy', {
        params: {
          account_id: accountId,
          product_id: productId,
        },
      });

      // Open Stripe checkout in a new tab
      window.open(response.data.url, '_blank');
      handleClose();
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const expertOptions = [
    {
      price: '1499€',
      originalPrice: '1999€',
      title: 'Prototype Accelerator',
      description:
        'Get your prototype built fast with expert development and iterative feedback sessions',
      product_id: 'prod_RlMGUkOsOkr49i',
      recommended: true,
    },
    {
      price: '4999€',
      originalPrice: '10000',
      title: 'Full MVP Development',
      description:
        'Complete development of your product from ideation to launch, with comprehensive expert guidance',
      product_id: 'prod_RlMHNXwgIgOwAc',
    },
  ];

  const renderSupportOptions = () => (
    <div className="space-y-4">
      <a
        href="https://altan.ai/support"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between w-full p-4 text-left border rounded-xl transition-all duration-200 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
      >
        <div className="flex items-center gap-3">
          <Iconify
            icon="mdi:chat-processing"
            width={24}
            className="text-blue-500"
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Chat Support</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Get quick support via our chat support</p>
          </div>
        </div>
        <span className="text-blue-500">→</span>
      </a>
      <a
        href="https://discord.com/invite/2zPbKuukgx"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between w-full p-4 text-left border rounded-xl transition-all duration-200 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
      >
        <div className="flex items-center gap-3">
          <Iconify
            icon="ri:discord-fill"
            width={24}
            className="text-indigo-500"
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Discord Community</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Join our Discord community</p>
          </div>
        </div>
        <span className="text-blue-500">→</span>
      </a>

      <a
        href="https://docs.altan.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between w-full p-4 text-left border rounded-xl transition-all duration-200 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
      >
        <div className="flex items-center gap-3">
          <Iconify
            icon="mdi:book-open-page-variant"
            width={24}
            className="text-orange-500"
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Docs & Guides</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Browse our documentation and guides
            </p>
          </div>
        </div>
        <span className="text-blue-500">→</span>
      </a>

      {hasGrowthSubscription ? (
        <a
          href="https://chat.whatsapp.com/Jx3X3vP9A6i5pZerCq8xUl?mode=ac_t"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full p-4 text-left border rounded-xl transition-all duration-200 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
        >
          <div className="flex items-center gap-3">
            <Iconify
              icon="ri:whatsapp-fill"
              width={24}
              className="text-green-500"
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Chat on WhatsApp</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get quick support via WhatsApp
              </p>
            </div>
          </div>
          <span className="text-blue-500">→</span>
        </a>
      ) : (
        <button
          onClick={() => {
            history.push('/pricing');
            handleClose();
          }}
          className="flex items-center justify-between w-full p-4 text-left border rounded-xl transition-all duration-200 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
        >
          <div className="flex items-center gap-3">
            <Iconify
              icon="ri:whatsapp-fill"
              width={24}
              className="text-gray-400"
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Chat on WhatsApp</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get quick support via WhatsApp
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Chip
              label="Growth Required"
              size="small"
              sx={{
                backgroundColor: 'rgba(139, 69, 19, 0.1)',
                color: '#8B4513',
                fontSize: '0.75rem',
                height: '20px',
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />
            <span className="text-blue-500">→</span>
          </div>
        </button>
      )}

      <a
        href="https://partners.altan.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between w-full p-4 text-left border rounded-xl transition-all duration-200 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
      >
        <div className="flex items-center gap-3">
          <Iconify
            icon="mdi:account-tie"
            width={24}
            className="text-purple-500"
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Hire an Expert</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View our expert development packages
            </p>
          </div>
        </div>
        <span className="text-blue-500">→</span>
      </a>
    </div>
  );

  return (
    <>
      <Tooltip
        title="Get Help"
        placement="bottom"
        arrow
      >
        <HeaderIconButton onClick={handleOpen}>
          <Iconify
            icon="mdi:help"
            width={iconSize}
          />
        </HeaderIconButton>
      </Tooltip>

      <CustomDialog
        dialogOpen={open}
        onClose={handleClose}
      >
        <div className="w-full bg-white/40 dark:bg-black/40">
          <div className="flex justify-between items-center px-8 py-6 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">
                {showExpertPackages ? 'Choose Your Expert Package' : 'Get Support'}
              </h2>
              {showExpertPackages && (
                <div className="relative">
                  <Tooltip
                    title={
                      <div className="text-sm">
                        <p className="mb-2">How it works:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Select and purchase your preferred package</li>
                          <li>Choose from available time slots</li>
                          <li>Work with an expert to complete your app</li>
                        </ol>
                      </div>
                    }
                  >
                    <Iconify
                      icon="mdi:information-outline"
                      width={20}
                      className="text-gray-400 hover:text-white transition-colors cursor-help"
                    />
                  </Tooltip>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {showExpertPackages && (
                <HeaderIconButton
                  onClick={() => setShowExpertPackages(false)}
                  sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
                >
                  <Iconify
                    icon="mdi:arrow-left"
                    width={20}
                  />
                </HeaderIconButton>
              )}
            </div>
          </div>

          <div className="p-4 w-full">
            {showExpertPackages ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {expertOptions.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => handlePurchase(option.product_id)}
                    disabled={isLoading}
                    className={`backdrop-blur-lg bg-white/80 dark:bg-black/80 group rounded-xl flex flex-col h-full w-full hover:shadow-lg p-4 cursor-pointer ${
                      option.recommended ? 'border-2 border-[#5558DD] relative' : ''
                    }`}
                  >
                    {option.recommended && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#5558DD] text-white px-4 py-1 rounded-full text-sm">
                        Recommended
                      </div>
                    )}
                    <div className="p-6 flex-grow">
                      <div className="mb-6">
                        <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                          {option.hours}
                        </div>
                        <h3 className="text-3xl font-semibold text-black dark:text-white mb-3">
                          {option.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="text-xl text-gray-600 dark:text-gray-400">
                            {option.price}
                          </div>
                          {option.originalPrice && (
                            <>
                              <div className="text-sm text-gray-400 line-through">
                                {option.originalPrice}
                              </div>
                              <div className="text-sm text-green-500">
                                Save{' '}
                                {option.title === 'Full MVP Development'
                                  ? '50%'
                                  : option.title === 'Extended Expert Support'
                                    ? '16%'
                                    : '25%'}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-700 dark:text-gray-400">{option.description}</p>
                    </div>

                    <div className="p-6 pt-0">
                      <button className="w-full h-11 border border-gray-400/20 text-gray-200 dark:text-gray-800 transition-colors group-hover:text-black dark:group-hover:text-white rounded-lg group-hover:bg-[#b8f8ee] dark:group-hover:bg-[#5558DD] font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? 'Processing...' : 'Select Plan'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              renderSupportOptions()
            )}
          </div>
        </div>
      </CustomDialog>
    </>
  );
}

export default memo(HireAnExpert);
