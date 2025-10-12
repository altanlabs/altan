import { Database, Users, FolderOpen, Code, Key } from 'lucide-react';

export const PRODUCTS = [
  {
    id: 'database',
    name: 'Database',
    description: 'PostgreSQL database',
    icon: Database,
  },
  {
    id: 'users',
    name: 'Users',
    description: 'User management',
    icon: Users,
  },
  {
    id: 'storage',
    name: 'Storage',
    description: 'File storage',
    icon: FolderOpen,
  },
  {
    id: 'functions',
    name: 'Edge Functions',
    description: 'Serverless functions',
    icon: Code,
  },
  {
    id: 'secrets',
    name: 'Secrets',
    description: 'Environment variables',
    icon: Key,
  },
];

