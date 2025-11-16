import { useMemo } from 'react';

import { selectAccount } from '../redux/slices/general/index.ts';
import { useSelector } from '../redux/store.ts';

const selectAccountOwner = (state) => selectAccount(state)?.owner;
const selectAccountMembers = (state) => selectAccount(state)?.members;

const useAccountUser = (userId) => {
  const owner = useSelector(selectAccountOwner);
  const members = useSelector(selectAccountMembers);

  return useMemo(() => {
    if (!!owner && owner.id === userId) {
      return owner;
    }
    if (Array.isArray(members)) {
      for (const member of members) {
        if (member.user.id === userId) {
          return member;
        }
      }
    }
    return null;
  }, [owner, userId, members]);
};

export default useAccountUser;
