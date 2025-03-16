import { AxiosInstance } from 'axios';
export declare const setSession: (axiosInstance: AxiosInstance, accessToken: string | null) => void;
export declare const authAxios: AxiosInstance;
declare const createAuthenticatedApi: (baseURL?: string) => AxiosInstance;
declare const cancelAllRequests: (message?: string) => void;
export { createAuthenticatedApi, cancelAllRequests };
//# sourceMappingURL=api.d.ts.map