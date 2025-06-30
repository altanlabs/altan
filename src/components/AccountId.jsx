import { memo, useEffect } from 'react';

import { selectAccountId } from '../redux/slices/general';
import { useSelector } from '../redux/store';

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
