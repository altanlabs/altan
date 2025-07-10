import { Icon } from '@iconify/react';
import { memo } from 'react';
import { useHistory } from 'react-router-dom';

const randomImages = [
  'https://api.altan.ai/platform/media/4b0be24e-ff99-4b7c-8226-d799c95d8efe?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
  'https://api.altan.ai/platform/media/c152dd89-b1ff-4b2f-a9b5-4ba8022143d8?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
  'https://api.altan.ai/platform/media/d5615068-d32b-44aa-a543-a7f12fa6c383?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
  'https://api.altan.ai/platform/media/7b9ff380-5942-4358-8e04-cbbbdf07a65b?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
];

const NoCredits = () => {
  const history = useHistory();
  const randomImage = randomImages[Math.floor(Math.random() * randomImages.length)];

  return (
    <div className="text-center">
      <img
        src={randomImage}
        alt="Altan Meme"
        className="mx-auto mb-4 max-w-[300px] w-full h-auto rounded-lg"
      />
      <div className="space-y-4">
        <p className="text-lg font-medium mb-6">You don&apos;t have any credits</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => history.push('/contact')}
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
    </div>
  );
};

export default memo(NoCredits);