export { api } from ‘./api’;
export { attachInterceptors } from ‘./interceptors’;
export type { NormalizedError as ApiError } from ‘./interceptors’;
export { postMultipart, toFormData } from ‘./multipart’;

// (optional) tiny helpers so callers don’t import axios types everywhere
export type { AxiosRequestConfig } from ‘axios’;

