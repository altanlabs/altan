import { memo, useEffect } from 'react';

import { Sheet, SheetContent } from '@components/ui/sheet';

import { getConnections } from '../../../../redux/slices/connections';
import { selectAccount } from '../../../../redux/slices/general/index.ts';
import { dispatch, useSelector } from '../../../../redux/store.ts';
import CreateTool from '../tools/CreateTool';

const ToolNavigator = ({ toolDrawer, setToolDrawer }) => {
  const account = useSelector(selectAccount);
  const isLoadingAccount = useSelector((state) => state.general.isLoadingAccount);

  useEffect(() => {
    if (!isLoadingAccount && !!account) {
      dispatch(getConnections(account.id));
    }
  }, [account, isLoadingAccount]);

  const handleClose = () => setToolDrawer(false);

  return (
    <Sheet open={toolDrawer} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent className="w-full sm:max-w-[600px] p-0 flex flex-col overflow-hidden">
        <CreateTool onClose={handleClose} />
      </SheetContent>
    </Sheet>
  );
};

export default memo(ToolNavigator);
