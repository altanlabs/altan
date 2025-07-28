import { formatDate } from '../../utils/dateUtils.js';

export const baseUrl = 'https://storage.googleapis.com/logos-chatbot-optimai/user/';

export function getMemberName(roomMember) {
  const member = roomMember?.member;
  console.log('member', member);
  if (!member) {
    return 'Anonymous';
  }
  switch (member.member_type) {
    case 'agent':
      return member.agent?.name || `AIgent ${member.agent?.id?.slice(0, 5)}`;
    case 'user':
      if (member.user) {
        const { first_name, last_name } = member.user;
        return `${first_name || ''} ${last_name || ''}`.trim() || 'Anonymous User';
      }
      return 'Anonymous';
    default:
      if (member.guest) {
        const { first_name, last_name } = member.guest;
        return `${first_name || ''} ${last_name || ''}`.trim() || 'Anonymous User';
      }
      return 'Anonymous';
  }
}

export function getMemberDetails(member, me = null) {
  if (!member?.member) {
    return {};
  }
  const since = !!member.date_creation ? formatDate(member.date_creation) : 'Dawn of history';
  const common = {
    id: member.id,
    since,
    type: member.member.member_type,
    name: getMemberName(member),
    role: member.role,
  };
  if (!!me) {
    common.isMe = member.member.id === me.id;
  }
  switch (member.member.member_type) {
    case 'agent':
      return {
        src:
          member?.member?.agent?.avatar_url ||
          'https://storage.googleapis.com/logos-chatbot-optimai/Subtract.png',
        status: 'online',
        email: null,
        ...common,
      };
    case 'user':
      return {
        src: member.member.user?.avatar_url,
        status: member.id === me?.id ? 'online' : 'offline',
        email: member?.member?.user?.email,
        ...common,
      };
    default:
      const guest = member.member.guest;
      return {
        src: guest?.avatar_url,
        status: member.id === me?.id ? 'online' : 'offline',
        email: member?.member?.guest?.email,
        ...common,
      };
  }
}

export function fetchCurrentMember(memberId, members) {
  return members.byId[
    members.allIds.find((roomMemberId) => members.byId[roomMemberId].member?.id === memberId)
  ];
}

export const isMobile = () => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  // Regular expression covering a wider range of mobile devices
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

  // Testing user agent for mobile devices
  const isMobileDevice = mobileRegex.test(navigator.userAgent);

  // Additional check for touch capabilities (not exclusively mobile, but common in mobile devices)
  const isTouchDevice =
    'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

  return isMobileDevice || isTouchDevice;
};
