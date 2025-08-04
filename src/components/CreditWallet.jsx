import { Button } from '@mui/material';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import UpgradeDialog from './dialogs/UpgradeDialog';
import Iconify from './iconify';
import { useLocales } from '../locales';
import { selectIsAccountFree } from '../redux/slices/general';

const CreditWallet = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const isAccountFree = useSelector(selectIsAccountFree);
  const { translate } = useLocales();

  if (!isAccountFree) {
    return null;
  }

  const handleUpgrade = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between mx-4 py-1 mt-[-10px] backdrop-blur-sm border-b border-gray-200/30 dark:border-gray-700/30">
        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
          {translate('creditWallet.upgradeText')}
        </span>
        <Button
          size="small"
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="material-symbols:crown" />}
          onClick={handleUpgrade}
        >
          {translate('creditWallet.upgradeButton')}
        </Button>
      </div>

      <UpgradeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};

export default CreditWallet;
