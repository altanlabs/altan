import { memo, useState } from 'react';
import UpgradeDialog from '../../dialogs/UpgradeDialog';
import Iconify from '../../iconify/Iconify';

const randomImages = [
  'https://api.altan.ai/platform/media/4b0be24e-ff99-4b7c-8226-d799c95d8efe?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
  // 'https://api.altan.ai/platform/media/c152dd89-b1ff-4b2f-a9b5-4ba8022143d8?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
  // 'https://api.altan.ai/platform/media/d5615068-d32b-44aa-a543-a7f12fa6c383?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
  'https://api.altan.ai/platform/media/7b9ff380-5942-4358-8e04-cbbbdf07a65b?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
];

// If you have a translation hook, use it. Otherwise, fallback to a string.
import useLocales from '../../../locales/useLocales';
import { Button } from '@mui/material';

const NoCredits = () => {
  const [open, setOpen] = useState(false);
  const randomImage = randomImages[Math.floor(Math.random() * randomImages.length)];
  const { translate } = useLocales();

  const handleUpgrade = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className="flex flex-col items-center justify-center max-w-[400px]">
      <div className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-100">
        {translate
          ? translate('creditWallet.noCreditsTitle', 'You’re out of credits!')
          : 'You’re out of credits!'}
      </div>
      <img
        src={randomImage}
        alt="Altan Meme"
        className="mx-auto mb-4  w-full h-auto rounded-lg shadow"
        style={{ background: 'rgba(255,255,255,0.2)' }}
      />

      {/* <Button
        size="small"
        variant="contained"
        color="primary"
        fullWidth
        startIcon={<Iconify icon="material-symbols:crown" />}
        onClick={handleUpgrade}
      >
        {translate('creditWallet.upgradeButton')}
      </Button> */}
      <UpgradeDialog
        open={open}
        onClose={handleClose}
      />
    </div>
  );
};

export default memo(NoCredits);