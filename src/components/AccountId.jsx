import { memo, useEffect } from 'react';

import { selectAccountId } from '../redux/slices/general/index.ts';
import { useSelector } from '../redux/store.ts';

const AccountId = ({ onChange, value }) => {
  const accountId = useSelector(selectAccountId);

  useEffect(() => {
    if (!value || value !== accountId) {
      onChange(accountId);
    }
  }, [accountId, onChange, value]);

  return <></>;
};

export default memo(AccountId);
