import { Icon } from '@iconify/react';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import { memo, useState } from 'react';

import { selectAccount } from '../../../redux/slices/room';
import { useSelector } from '../../../redux/store';
import { optimai_shop } from '../../../utils/axios';

const CREDIT_PACKAGES = [
  {
    price: '5€',
    credits: '100',
    priceId: 'price_1Qr6FbKUsA7CGHPxwrmc0m1I',
    popular: false,
  },
  {
    price: '10€',
    credits: '250',
    priceId: 'price_1Qr6FbKUsA7CGHPx2phx9KQS',
    popular: false,
  },
  {
    price: '20€',
    credits: '750',
    priceId: 'price_1Qr6FbKUsA7CGHPxHYMOIVD9',
    popular: true,
  },
];

const randomImages = [
  'https://api.altan.ai/platform/media/4b0be24e-ff99-4b7c-8226-d799c95d8efe?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
  'https://api.altan.ai/platform/media/c152dd89-b1ff-4b2f-a9b5-4ba8022143d8?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
  'https://api.altan.ai/platform/media/d5615068-d32b-44aa-a543-a7f12fa6c383?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
  'https://api.altan.ai/platform/media/7b9ff380-5942-4358-8e04-cbbbdf07a65b?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
];

const NoCredits = () => {
  const [isOpen, setIsOpen] = useState(false);
  const randomImage = randomImages[Math.floor(Math.random() * randomImages.length)];
  const accountId = useSelector(selectAccount)?.id;


  const handleBuyCredits = async (priceId) => {
    try {
      const response = await optimai_shop.get(
        `/stripe/buy-credits?account_id=${accountId}&price_id=${priceId}`,
      );
      console.log('response', response);
      const data = response.data;
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  return (
    <div className="text-center">
      <img
        src={randomImage}
        alt="Altan Meme"
        className="mx-auto mb-4 max-w-[300px] w-full h-auto rounded-lg"
      />
      <div className="space-y-4">
        <p className="text-lg font-medium mb-6">You don't have any credits</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm inline-flex items-center gap-2"
          >
            <Icon icon="material-symbols:support-agent" className="text-lg" />
            Talk to an expert
          </button>
          <a
            href="https://www.altan.ai/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm ring-1 ring-blue-500/50 hover:ring-blue-600/50 inline-flex items-center gap-2"
          >
            <Icon icon="material-symbols:upgrade" className="text-lg" />
            Upgrade subscription
          </a>
        </div>
      </div>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        fullWidth
        maxWidth="sm"
        className="fixed z-50"
      >
        <DialogTitle className="text-center">Talk to an expert</DialogTitle>
        <DialogContent className="!pt-4 !pb-6">
          <div className="space-y-4">
            <a
              href="https://calendly.com/albert-altan/strategy-call?month=2025-03&date=2025-03-13"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full p-4 text-left border rounded-xl transition-all duration-200 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
            >
              <div className="flex items-center gap-3">
                <Icon icon="mdi:calendar-clock" className="text-2xl text-blue-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Book a call</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Book a call with an expert</p>
                </div>
              </div>
              <span className="text-blue-500">→</span>
            </a>

            <a
              href="https://wa.me/34662039902"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full p-4 text-left border rounded-xl transition-all duration-200 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
            >
              <div className="flex items-center gap-3">
                <Icon icon="ri:whatsapp-fill" className="text-2xl text-green-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Chat on WhatsApp</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Chat on WhatsApp with an expert</p>
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
                <Icon icon="ri:discord-fill" className="text-2xl text-indigo-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Join Discord</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Join our Discord community</p>
                </div>
              </div>
              <span className="text-blue-500">→</span>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default memo(NoCredits);