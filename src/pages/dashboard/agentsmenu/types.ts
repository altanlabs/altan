/**
 * Type definitions for Agent Messaging Widget
 * Following Interface Segregation Principle - separate interfaces for different concerns
 */
import type React from 'react';

import type { Agent as ReduxAgent } from '../../../redux/slices/general/types/state';

// Re-export the Redux Agent type to maintain consistency
export type Agent = ReduxAgent;

export interface ChatWindow {
  agent: Agent;
  isExpanded: boolean;
}

export interface AgentAvatarProps {
  agent: Agent;
  size?: number;
  className?: string;
}

export interface AgentListItemProps {
  agent: Agent;
  onClick: (agent: Agent) => void;
  onEdit: (agent: Agent, e: React.MouseEvent) => void;
}

export interface WidgetHeaderProps {
  isExpanded: boolean;
  agentCount: number;
  onToggle: () => void;
  onCreateAgent: () => void;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export interface AgentListProps {
  agents: Agent[];
  isLoading: boolean;
  searchQuery: string;
  onAgentClick: (agent: Agent) => void;
  onAgentEdit: (agent: Agent, e: React.MouseEvent) => void;
  onNavigateToAgents: () => void;
}

// Types for Altaner (Project)
export interface AltanerComponent {
  id: string;
  type: string;
  cloud_id?: string;
  params?: {
    ids?: string[];
    [key: string]: unknown;
  };
}

export interface Altaner {
  id: string;
  name?: string;
  icon_url?: string;
  description?: string;
  preview_url?: string;
  interface_id?: string;
  is_pinned?: boolean;
  is_deleted?: boolean;
  last_modified?: string;
  date_creation?: string;
  components?: AltanerComponent[];
  user_ids?: string[];
}

export interface CompactProjectCardProps {
  altaner: Altaner;
}

// Member and User types for avatar groups
export interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
  _type?: 'user' | 'agent';
}

export interface Member {
  user: User;
}

export interface ProjectMember extends User {
  _type: 'user' | 'agent';
}

