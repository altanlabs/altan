import { formatDate } from '../../utils/dateUtils';

// ============================================================================
// Types
// ============================================================================

interface User {
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
}

interface Agent {
  id: string;
  name?: string;
  account_id?: string;
  avatar_url?: string;
}

interface MemberData {
  id: string;
  member_type: 'agent' | 'user';
  agent?: Agent;
  user?: User;
}

interface RoomMember {
  id: string;
  role: string;
  date_creation?: string;
  member?: MemberData;
}

interface MemberDetails {
  id: string;
  name: string;
  since: string;
  type: 'agent' | 'user';
  role: string;
  src: string | null;
  status: string;
  email: string | null;
  isMe?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

export const baseUrl = 'https://storage.googleapis.com/logos-chatbot-optimai/user/';

// ============================================================================
// Member Utilities
// ============================================================================

export function getMemberName(roomMember: RoomMember | null | undefined): string {
  const member = roomMember?.member;
  
  if (!member) {
    return 'Anonymous';
  }

  switch (member.member_type) {
    case 'agent':
      return member.agent?.name || `AIgent ${member.agent?.id?.slice(0, 5) || ''}`;
    
    case 'user':
      if (member.user) {
        const { first_name, last_name } = member.user;
        return `${first_name || ''} ${last_name || ''}`.trim() || 'Anonymous User';
      }
      return 'Anonymous';
    
    default:
      return 'Anonymous';
  }
}

export function getMemberDetails(
  member: RoomMember | null | undefined,
  me: RoomMember | null = null,
): MemberDetails | Record<string, never> {
  if (!member?.member) {
    return {};
  }

  const since = member.date_creation ? formatDate(member.date_creation) : 'Dawn of history';
  
  const common = {
    id: member.id,
    since,
    type: member.member.member_type,
    name: getMemberName(member),
    role: member.role,
  };

  if (me) {
    Object.assign(common, { isMe: member.member.id === me.id });
  }

  switch (member.member.member_type) {
    case 'agent':
      return {
        ...common,
        src: member?.member?.agent?.avatar_url || null,
        status: 'online',
        email: null,
      };
    
    case 'user':
      return {
        ...common,
        src: member.member.user?.avatar_url || null,
        status: member.id === me?.id ? 'online' : 'offline',
        email: member?.member?.user?.email || null,
      };
    
    default:
      return {
        ...common,
        src: null,
        status: 'offline',
        email: null,
      };
  }
}

export function fetchCurrentMember(
  memberId: string,
  members: { byId: Record<string, RoomMember>; allIds: string[] },
): RoomMember | undefined {
  const roomMemberId = members.allIds.find(
    (id) => members.byId[id].member?.id === memberId,
  );
  
  return roomMemberId ? members.byId[roomMemberId] : undefined;
}

// ============================================================================
// Device Detection
// ============================================================================

export const isMobile = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  // Regular expression covering a wider range of mobile devices
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

  // Testing user agent for mobile devices
  const isMobileDevice = mobileRegex.test(navigator.userAgent);

  // Additional check for touch capabilities (not exclusively mobile, but common in mobile devices)
  const isTouchDevice =
    'ontouchstart' in window ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
    // @ts-expect-error - msMaxTouchPoints is IE-specific
    (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0);

  return Boolean(isMobileDevice || isTouchDevice);
};

