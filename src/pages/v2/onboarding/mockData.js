export const DEMO_QUESTIONS = [
  {
    id: 'group-0',
    title: 'What channels should it support?',
    options: ['Chat & Voice', 'Email & Chat', 'All channels'],
  },
  {
    id: 'group-1',
    title: "What's your priority?",
    options: ['Fast response time', 'Reduce human workload', 'Both'],
  },
];

export const DEMO_PLAN = {
  id: 'demo-plan',
  title: 'AI Customer Support Hub with Smart Routing',
  description: '24/7 AI-powered customer support system with voice, chat, and intelligent ticket management',
  is_approved: false,
  tasks: [
    {
      id: '1',
      task_name: 'Create 4 specialized AI agents (support, sales, technical, escalation)',
      status: 'to-do',
      assigned_agent_name: 'Genesis',
      priority: 1,
    },
    {
      id: '2',
      task_name: 'Set up ticket database, customer profiles, and knowledge base with auth',
      status: 'to-do',
      assigned_agent_name: 'Cloud',
      priority: 2,
    },
    {
      id: '3',
      task_name: 'Build support dashboard with live tickets, AI chat widget, and analytics',
      status: 'to-do',
      assigned_agent_name: 'Interface',
      priority: 3,
    },
    {
      id: '4',
      task_name: 'Create Slack notifications and auto-categorization service',
      status: 'to-do',
      assigned_agent_name: 'Services',
      priority: 4,
    },
  ],
};

// Agent avatars - matching PlanWidget
export const AGENT_AVATARS = {
  Genesis:
    'https://platform-api.altan.ai/media/a4ac5478-b3ae-477d-b1eb-ef47e710de7c?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
  Altan:
    'https://platform-api.altan.ai/media/9160c1d5-5cb2-46cd-bd55-98457c4b2e2a?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
  Interface:
    'https://platform-api.altan.ai/media/2262e664-dc6a-4a78-bad5-266d6b836136?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
  Cloud:
    'https://platform-api.altan.ai/media/56a7aab7-7200-4367-856b-df82b6fa3eee?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
  Services:
    'https://platform-api.altan.ai/media/22ed3f84-a15c-4050-88f0-d33cc891dc50?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
};

// Human avatars for the team (fallback if API fails)
const HUMAN_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ava',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan',
];

// Team agents with AI agents repeated 3 times and human avatars for a fuller sphere
export const TEAM_AGENTS = [
  // Main AI agent avatars
  {
    id: 'genesis',
    src: AGENT_AVATARS.Genesis,
    alt: 'Genesis - Orchestrator',
    title: 'Genesis',
    description: 'I orchestrate the team and ensure everything runs perfectly',
  },
  { id: 'human-1', src: HUMAN_AVATARS[0], alt: 'Team Member', title: 'Felix' },
  { id: 'human-2', src: HUMAN_AVATARS[1], alt: 'Team Member', title: 'Aneka' },
  {
    id: 'altan',
    src: AGENT_AVATARS.Altan,
    alt: 'Altan - Core AI',
    title: 'Altan',
    description: 'I am the core intelligence coordinating everything',
  },
  { id: 'human-3', src: HUMAN_AVATARS[2], alt: 'Team Member', title: 'Luna' },
  { id: 'human-4', src: HUMAN_AVATARS[3], alt: 'Team Member', title: 'Max' },
  {
    id: 'interface',
    src: AGENT_AVATARS.Interface,
    alt: 'Interface - UI/UX Designer',
    title: 'Interface',
    description: 'I design beautiful experiences that users love',
  },
  { id: 'human-5', src: HUMAN_AVATARS[4], alt: 'Team Member', title: 'Sophie' },
  { id: 'human-6', src: HUMAN_AVATARS[5], alt: 'Team Member', title: 'Alex' },
  {
    id: 'cloud',
    src: AGENT_AVATARS.Cloud,
    alt: 'Cloud - Infrastructure',
    title: 'Cloud',
    description: 'I deploy and scale your systems globally',
  },
  { id: 'human-7', src: HUMAN_AVATARS[6], alt: 'Team Member', title: 'Maya' },
  { id: 'human-8', src: HUMAN_AVATARS[7], alt: 'Team Member', title: 'James' },
  {
    id: 'services',
    src: AGENT_AVATARS.Services,
    alt: 'Services - Integration',
    title: 'Services',
    description: 'I connect all your tools and services seamlessly',
  },
  { id: 'human-9', src: HUMAN_AVATARS[8], alt: 'Team Member', title: 'Oliver' },
  { id: 'human-10', src: HUMAN_AVATARS[9], alt: 'Team Member', title: 'Emma' },

  // Second round: Duplicate agents
  { id: 'genesis-2', src: AGENT_AVATARS.Genesis, alt: 'Genesis Agent', title: 'Genesis' },
  { id: 'human-11', src: HUMAN_AVATARS[10], alt: 'Team Member', title: 'Liam' },
  { id: 'human-12', src: HUMAN_AVATARS[11], alt: 'Team Member', title: 'Olivia' },
  { id: 'interface-2', src: AGENT_AVATARS.Interface, alt: 'Interface Agent', title: 'Interface' },
  { id: 'human-13', src: HUMAN_AVATARS[12], alt: 'Team Member', title: 'Noah' },
  { id: 'human-14', src: HUMAN_AVATARS[13], alt: 'Team Member', title: 'Ava' },
  { id: 'altan-2', src: AGENT_AVATARS.Altan, alt: 'Altan Agent', title: 'Altan' },
  { id: 'human-15', src: HUMAN_AVATARS[14], alt: 'Team Member', title: 'Ethan' },

  // Third round: More agent duplicates for fuller sphere
  { id: 'cloud-2', src: AGENT_AVATARS.Cloud, alt: 'Cloud Agent', title: 'Cloud' },
  { id: 'human-1-dup', src: HUMAN_AVATARS[0], alt: 'Team Member', title: 'Felix' },
  { id: 'services-2', src: AGENT_AVATARS.Services, alt: 'Services Agent', title: 'Services' },
  { id: 'human-2-dup', src: HUMAN_AVATARS[1], alt: 'Team Member', title: 'Aneka' },
  { id: 'genesis-3', src: AGENT_AVATARS.Genesis, alt: 'Genesis Agent', title: 'Genesis' },
  { id: 'human-3-dup', src: HUMAN_AVATARS[2], alt: 'Team Member', title: 'Luna' },
  { id: 'interface-3', src: AGENT_AVATARS.Interface, alt: 'Interface Agent', title: 'Interface' },
  { id: 'human-4-dup', src: HUMAN_AVATARS[3], alt: 'Team Member', title: 'Max' },
  { id: 'altan-3', src: AGENT_AVATARS.Altan, alt: 'Altan Agent', title: 'Altan' },
];

export const AGENT_RECRUITMENT = [
  {
    name: 'Genesis',
    avatar: AGENT_AVATARS.Genesis,
    message: "I'll create your specialized AI agents with voice capabilities",
    role: 'AI Agent Creator',
  },
  {
    name: 'Cloud',
    avatar: AGENT_AVATARS.Cloud,
    message: "I'll build your ticket system, customer database, and knowledge base",
    role: 'Backend Infrastructure',
  },
  {
    name: 'Interface',
    avatar: AGENT_AVATARS.Interface,
    message: "I'll design your support dashboard with AI chat and real-time updates",
    role: 'Frontend Engineer',
  },
  {
    name: 'Services',
    avatar: AGENT_AVATARS.Services,
    message: "I'll automate Slack alerts and intelligent ticket categorization",
    role: 'Automation Specialist',
  },
];

export const DIALOGUE_SCRIPT = {
  welcome: [
    { text: "Welcome. We're Altan.", pause: 800 },
    { text: 'Your AI team, ready to build and run anything you imagine..', pause: 1200 },
    { text: 'We build, automate, and solve problems faster than humanly possible.', pause: 1200 },
    { text: 'Would you like me to show you how we work?', pause: 0 },
  ],
  problem: 'I need a customer support system that can handle inquiries 24/7',
  response: "Alright. Let's understand it together.",
  planning: 'Perfect. Let me assemble your team.',
  building: "Now you're seeing how we work. This is your operating system for intelligence.",
  closing: "That's how we work - fast, precise, intelligent.",
};
