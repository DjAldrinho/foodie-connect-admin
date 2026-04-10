/**
 * Common types and interfaces used across the application
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  errors?: Record<string, string[]>;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Query parameters for filtering
 */
export type QueryParams = Record<string, string | number | boolean | string[] | undefined>;

/**
 * File upload response
 */
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

/**
 * Entity with ID
 */
export interface Entity {
  id: string | number;
}

/**
 * Timestamped entity
 */
export interface Timestamped extends Entity {
  createdAt: string;
  updatedAt: string;
}
