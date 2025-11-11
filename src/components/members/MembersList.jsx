import { useState, memo, useMemo } from 'react';
import { useSelector } from 'react-redux';

import MemberDialog from './MemberDialog.jsx';
import { cn } from '../../lib/utils.ts';
import { selectMembers, selectMe } from '../../redux/slices/room';
import DynamicAgentAvatar from '../agents/DynamicAgentAvatar';
import CustomAvatar from '../custom-avatar/CustomAvatar.jsx';
import Iconify from '../iconify/Iconify.jsx';
import MemberInviteDialog from '../room/drawer/MemberInviteDialog.jsx';
import { getMemberDetails } from '../room/utils';
import { Input } from '../ui/input';

const MembersList = ({
  maxHeight = 400,
  showTitle = true,
  compact = false,
  showInviteButton = true,
  onMemberSelect,
  emptyMessage = 'No members to display.',
}) => {
  const members = useSelector(selectMembers);
  const me = useSelector(selectMe);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const membersList = Object.values(members?.byId || {}).filter(
    (member) => member && (!member.is_kicked || me?.role === 'admin'),
  );

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return membersList;
    }

    const query = searchQuery.toLowerCase();
    return membersList.filter((member) => {
      const memberDetails = getMemberDetails(member, me);
      return (
        memberDetails.name?.toLowerCase().includes(query) ||
        member.role?.toLowerCase().includes(query) ||
        memberDetails.status?.toLowerCase().includes(query)
      );
    });
  }, [membersList, searchQuery, me]);

  const handleMemberClick = (member) => {
    if (onMemberSelect) {
      onMemberSelect(member);
    } else {
      // Open dialog to manage member
      setSelectedMember(member);
      setDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setTimeout(() => {
      setSelectedMember(null);
    }, 150);
  };

  return (
    <div className={cn('flex flex-col', compact ? 'gap-1' : 'gap-2')}>
      {showTitle && (
        <div
          className={cn(
            'flex justify-between items-center',
            compact ? 'mb-1' : 'mb-2',
          )}
        >
          <h3
            className={cn(
              'font-semibold',
              compact ? 'text-sm' : 'text-base',
            )}
          >
            Members ({membersList.length})
          </h3>
          {showInviteButton && <MemberInviteDialog />}
        </div>
      )}

      {/* Search bar */}
      <div className="relative mb-2">
        <Iconify
          icon="solar:magnifer-linear"
          width={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          type="text"
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      <div
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        {filteredMembers.length > 0 ? (
          <div className={cn('flex flex-col', compact ? 'gap-0.5' : 'gap-1')}>
            {filteredMembers.map((member) => {
              const memberDetails = getMemberDetails(member, me);

              return (
                <div
                  key={member.id}
                  className={cn(
                    'group flex items-center rounded-lg transition-colors cursor-pointer',
                    compact ? 'gap-1 p-0.5' : 'gap-2 p-2',
                    'hover:bg-accent',
                  )}
                  onClick={() => handleMemberClick(member)}
                >
                  {member.member?.member_type === 'agent' && member.member?.agent ? (
                    <DynamicAgentAvatar
                      agent={member.member.agent}
                      size={compact ? 32 : 40}
                      agentId={member.member.agent_id}
                      agentState={null}
                      isStatic={false}
                    />
                  ) : (
                    <CustomAvatar
                      src={memberDetails.src}
                      alt={memberDetails.name}
                      sx={{ width: compact ? 32 : 40, height: compact ? 32 : 40 }}
                    >
                      {memberDetails.name?.charAt(0)?.toUpperCase()}
                    </CustomAvatar>
                  )}

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'font-medium truncate',
                        compact ? 'text-sm' : 'text-sm',
                      )}
                    >
                      {memberDetails.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'rounded-full',
                          compact ? 'w-1.5 h-1.5' : 'w-2 h-2',
                          memberDetails.status === 'online'
                            ? 'bg-green-500'
                            : 'bg-gray-400',
                        )}
                      />
                      <p
                        className={cn(
                          'text-muted-foreground',
                          compact ? 'text-xs' : 'text-xs',
                        )}
                      >
                        {memberDetails.status || 'offline'} • {memberDetails.role || 'member'}
                      </p>
                    </div>
                  </div>

                  <Iconify
                    icon="solar:alt-arrow-right-linear"
                    width={20}
                    className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No members match your search.' : emptyMessage}
            </p>
          </div>
        )}
      </div>

      {/* Member Dialog */}
      <MemberDialog
        member={selectedMember}
        me={me}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
      />
    </div>
  );
};

export default memo(MembersList);
