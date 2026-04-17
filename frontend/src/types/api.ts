export type ApiErrorResponse = {
  message: string | string[];
  error?: string;
  statusCode?: number;
};

export type PaginatedMeta = {
  page: number;
  limit: number;
  total: number;
};

export type ApiListResponse<T> = {
  data: T[];
  meta?: PaginatedMeta;
  message?: string;
};

export type ApiDetailResponse<T> = {
  data: T;
  message?: string;
};