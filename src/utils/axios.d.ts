import { AxiosInstance } from 'axios';

export const OPTIMAI_BASE_URL: string;

export const optimai: AxiosInstance;
export const optimai_root: AxiosInstance;
export const optimai_room: AxiosInstance;
export const optimai_integration: AxiosInstance;
export const optimai_galaxia: AxiosInstance;
export const optimai_shop: AxiosInstance;
export const optimai_tables: AxiosInstance;
export const optimai_agent: AxiosInstance;
export const optimai_tables_v4: AxiosInstance;
export const optimai_database: AxiosInstance;
export const optimai_pg_meta: AxiosInstance;
export const optimai_auth: AxiosInstance;
export const optimai_cloud: AxiosInstance;
export const optimai_pods: AxiosInstance;

export function authorizeUser(): Promise<{ accessToken: string }>;
export function unauthorizeUser(): void;

export const endpoints: {
  chat: string;
  kanban: string;
  calendar: string;
  auth: {
    me: string;
    login: string;
    register: string;
  };
  mail: {
    list: string;
    details: string;
    labels: string;
  };
  post: {
    list: string;
    details: string;
    latest: string;
    search: string;
  };
  product: {
    list: string;
    details: string;
    search: string;
  };
};

export function fetcher(args: string | [string, Record<string, unknown>]): Promise<unknown>; 