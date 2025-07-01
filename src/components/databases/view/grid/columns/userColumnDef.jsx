import { Avatar } from '@mui/material';

const formatMembers = (members = []) => {
  if (!Array.isArray(members)) return [];

  return members
    .map((memberObj) => {
      try {
        const user = memberObj?.user;
        if (!user) return null;

        return {
          id: user.id,
          name: user.first_name || user.last_name || user.email || 'Unknown User',
          avatar: user.avatar_url || '',
          email: user.email || '',
          member_id: user.member_id,
        };
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean);
};

class UserOptionRenderer {
  init(props) {
    try {
      const members = props?.cellRendererParams?.members || [];

      this.eGui = document.createElement('div');
      this.eGui.className = 'flex items-center gap-2';
      this.eGui.style.height = '100%';
      this.eGui.style.alignItems = 'center';
      this.eGui.style.padding = '4px 8px';

      if (!props?.value) {
        const label = document.createElement('span');
        label.textContent = 'Select user...';
        label.style.opacity = '0.7';
        this.eGui.appendChild(label);
        return;
      }

      const member = members.find((m) => m?.id === props.value);

      if (member) {
        const avatarContainer = document.createElement('div');
        avatarContainer.style.width = '24px';
        avatarContainer.style.height = '24px';
        avatarContainer.style.borderRadius = '50%';
        avatarContainer.style.overflow = 'hidden';
        avatarContainer.style.flexShrink = '0';

        const avatar = document.createElement('img');
        avatar.src =
          member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`;
        avatar.style.width = '100%';
        avatar.style.height = '100%';
        avatar.style.objectFit = 'cover';
        avatarContainer.appendChild(avatar);

        const nameEl = document.createElement('span');
        nameEl.textContent = member.name || member.email || 'Unknown User';
        nameEl.style.marginLeft = '8px';

        this.eGui.appendChild(avatarContainer);
        this.eGui.appendChild(nameEl);
      } else {
        const label = document.createElement('span');
        label.textContent = props.valueFormatted || 'Unknown User';
        label.style.opacity = '0.7';
        this.eGui.appendChild(label);
      }
    } catch (error) {
      this.eGui = document.createElement('div');
      this.eGui.textContent = 'Error loading user';
    }
  }

  getGui() {
    return this.eGui;
  }
}

export const getUserColumnDef = ({ field, getCommonFieldMenuItems, members = [] }) => {
  const formattedMembers = formatMembers(members);
  const isMultiSelect = field?.type === 'multiSelect';

  return {
    field: field?.db_field_name || field?.name || 'user',
    headerName: field?.name || 'User',
    editable: true,
    cellEditor: 'agRichSelect',
    cellEditorParams: (params) => ({
      values: isMultiSelect
        ? formattedMembers.map((m) => m.id) // No empty option for multi-select
        : ['', ...formattedMembers.map((m) => m.id)], // Empty option only for single select
      cellRenderer: UserOptionRenderer,
      cellRendererParams: {
        members: formattedMembers,
      },
      searchType: isMultiSelect ? 'matchAny' : 'match',
      multiSelect: isMultiSelect,
      allowTyping: true,
      filterList: true,
      highlightMatch: true,
      formatValue: (value) => {
        if (!value) return 'Select user...';
        const member = formattedMembers?.find((m) => m?.id === value);
        return member?.name || member?.email || 'Unknown User';
      },
    }),

    cellRenderer: (params) => {
      const values =
        isMultiSelect && params?.value
          ? typeof params.value === 'string'
            ? params.value.split(',').filter(Boolean)
            : params.value
          : params?.value
            ? [params.value]
            : [];

      return (
        <div className="h-full flex items-center">
          <div className="flex flex-wrap gap-1">
            {values.map((userId) => {
              const member = formattedMembers?.find((m) => m?.id === userId);
              if (!member) return null;

              return (
                <div
                  key={userId}
                  className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5"
                >
                  <Avatar
                    src={
                      member.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}`
                    }
                    alt={member.name || 'Unknown User'}
                    sx={{ width: 20, height: 20 }}
                  />
                  <span className="text-sm">{member.name || 'Unknown User'}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    },

    headerComponent: (params) => {
      const IconComponent = field?.icon;
      return (
        <div className="flex items-center gap-2">
          {IconComponent && (
            <IconComponent
              fontSize="small"
              sx={{ opacity: 0.7 }}
            />
          )}
          <span>{params?.displayName || 'User'}</span>
        </div>
      );
    },

    minWidth: 200,
    flex: 1,

    mainMenuItems: (params) => {
      try {
        const commonItems = getCommonFieldMenuItems?.(field, params) || [];
        return commonItems;
      } catch (error) {
        return [];
      }
    },
  };
};
