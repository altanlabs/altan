import Stack from '@mui/material/Stack';
import { AnimatePresence, m } from 'framer-motion';
import React, { useState, useCallback, useEffect, useMemo, useId, memo } from 'react';
// @mui
// import {
//   Box,
//   Stack,
//   Grid
// } from '@mui/material';
// _mock
import { useSelector } from 'react-redux';

import { TextShimmer } from '../../components/aceternity/text/text-shimmer';
import SearchField from '../../components/custom-input/SearchField';
import { DynamicIsland } from '../../components/dynamic-island/DynamicIsland';
import InvitationMenuPopover from '../../components/invitations/InvitationMenuPopover';
import ExpandedMemberCard from '../../components/members/ExpandedMemberCard';
import MemberCard from '../../components/members/MemberCard';
import {
  getRoles,
  selectAccount,
  selectAccountAssetsInitialized,
  selectGeneralInitialized,
  selectRoles,
} from '../../redux/slices/general/index.ts';
import { dispatch } from '../../redux/store.ts';

// ----------------------------------------------------------------------

const selectAccountMembers = (state) => selectAccount(state)?.members;
const selectMembersInitialized = (state) => selectAccountAssetsInitialized('members')(state);
const selectRolesInitialized = (state) => selectGeneralInitialized('roles')(state);

const selectRolesById = (state) => selectRoles(state).byId;

function AccountMembers() {
  const roles = useSelector(selectRolesById);
  const members = useSelector(selectAccountMembers);
  const membersInitialized = useSelector(selectMembersInitialized);
  const rolesInitialized = useSelector(selectRolesInitialized);
  const [searchMembers, setSearchMembers] = useState('');
  const [activeUser, setActiveUser] = useState(null);
  const id = useId();

  const onSearchMembers = useCallback((event) => setSearchMembers(event.target.value), []);

  useEffect(() => {
    dispatch(getRoles());
  }, []);
  // Compute uniqueUsers first and include 'type' in each role
  const uniqueUsers = useMemo(
    () =>
      Object.values(
        members.reduce((acc, curr) => {
          const userId = curr.user.id;
          if (!acc[userId]) {
            acc[userId] = {
              ...curr,
              roles: [],
            };
          }
          // Include 'type' in each role
          const rolesWithType = (curr.roles || []).map((role) => ({
            ...role,
            type: curr.type,
          }));
          acc[userId].roles = [...acc[userId].roles, ...rolesWithType];
          return acc;
        }, {}),
      ),
    [members],
  );

  // Filter data based on search term
  const dataFiltered = useMemo(() => {
    if (!uniqueUsers) return [];
    return uniqueUsers.filter((member) => {
      const fullName = `${member.user?.first_name} ${member.user?.last_name}`;
      return fullName.toLowerCase().includes(searchMembers.toLowerCase());
    });
  }, [uniqueUsers, searchMembers]);

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {activeUser && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 h-full w-full z-[1000]"
          />
        )}
      </AnimatePresence>

      {/* Expanded Card */}
      <AnimatePresence>
        {activeUser && (
          <ExpandedMemberCard
            activeUser={activeUser}
            id={id}
            roles={roles}
            onClose={() => setActiveUser(null)}
          />
        )}
      </AnimatePresence>

      {/* Collapsed Cards */}
      {!(rolesInitialized && membersInitialized) ? (
        <Stack
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          spacing={1}
        >
          {!rolesInitialized && (
            <TextShimmer
              className="text-md"
              duration={2}
            >
              Loading roles...
            </TextShimmer>
          )}
          {!membersInitialized && (
            <TextShimmer
              className="text-md"
              duration={2}
            >
              Loading members...
            </TextShimmer>
          )}
        </Stack>
      ) : (
        <div className="max-w-6xl mx-auto p-4 pb-64 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataFiltered.map((userItem) => (
            <m.div
              key={userItem.user.id} // Use user ID as key
              layoutId={`card-${userItem.user.id}-${id}`}
              onClick={() => setActiveUser(userItem)}
              className="cursor-pointer bg-white dark:bg-neutral-800 rounded-2xl shadow-md p-6 hover:shadow-lg"
            >
              <MemberCard
                userItem={userItem}
                id={id}
                roles={roles}
              />
            </m.div>
          ))}
        </div>
      )}

      <DynamicIsland>
        {!!membersInitialized && (
          <SearchField
            size="small"
            value={searchMembers}
            onChange={onSearchMembers}
            placeholder="Search members..."
          />
        )}
        {/* <OrganisationPopover /> */}
        {!!rolesInitialized && <InvitationMenuPopover />}
      </DynamicIsland>
    </>
  );
}

export default memo(AccountMembers);
