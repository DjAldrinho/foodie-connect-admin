import { inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Observable, throwError, retry, catchError, map } from 'rxjs';
import { environment } from '@environments/environment';

import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  QueryParams,
  Entity,
} from '../../models/common.types';

/**
 * Base HTTP service with common CRUD operations
 * All feature services should extend this service
 */
export class BaseService<T extends Entity> {
  protected readonly http = inject(HttpClient);
  protected readonly apiUrl = environment.apiUrl;

  constructor(protected readonly endpoint: string) {}

  /**
   * Get all items with optional pagination and filtering
   */
  getAll(
    pagination?: PaginationParams,
    filters?: QueryParams
  ): Observable<PaginatedResponse<T>> {
    let params = this.buildParams(pagination, filters);
    return this.http
      .get<ApiResponse<PaginatedResponse<T>>>(`${this.apiUrl}/${this.endpoint}`, { params })
      .pipe(
        retry({ count: 3, delay: 1000 }),
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Get a single item by ID
   */
  getById(id: string | number): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(`${this.apiUrl}/${this.endpoint}/${id}`)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Create a new item
   */
  create(item: Partial<T>): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${this.apiUrl}/${this.endpoint}`, item)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Update an existing item
   */
  update(id: string | number, item: Partial<T>): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(`${this.apiUrl}/${this.endpoint}/${id}`, item)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Delete an item
   */
  delete(id: string | number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/${this.endpoint}/${id}`)
      .pipe(
        map(() => undefined),
        catchError(this.handleError)
      );
  }

  /**
   * Bulk delete items
   */
  bulkDelete(ids: (string | number)[]): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${this.apiUrl}/${this.endpoint}/bulk-delete`, { ids })
      .pipe(
        map(() => undefined),
        catchError(this.handleError)
      );
  }

  /**
   * Upload a file
   */
  uploadFile(file: File, additionalData?: Record<string, string>): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.http
      .post<ApiResponse<{ url: string }>>(`${this.apiUrl}/${this.endpoint}/upload`, formData)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Download a file
   */
  downloadFile(url: string): Observable<Blob> {
    return this.http
      .get(url, { responseType: 'blob' })
      .pipe(catchError(this.handleError));
  }

  /**
   * Export data to CSV
   */
  exportToCsv(filters?: QueryParams): Observable<Blob> {
    let params = this.buildParams(undefined, filters);
    return this.http
      .get(`${this.apiUrl}/${this.endpoint}/export`, {
        params,
        responseType: 'blob',
        headers: { Accept: 'text/csv' },
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Build HTTP params from pagination and filters
   */
  protected buildParams(
    pagination?: PaginationParams,
    filters?: QueryParams
  ): HttpParams {
    let params = new HttpParams();

    if (pagination) {
      params = params.set('page', pagination.page.toString());
      params = params.set('pageSize', pagination.pageSize.toString());

      if (pagination.sortBy) {
        params = params.set('sortBy', pagination.sortBy);
      }
      if (pagination.sortOrder) {
        params = params.set('sortOrder', pagination.sortOrder);
      }
    }

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => params = params.append(key, v));
          } else {
            params = params.set(key, String(value));
          }
        }
      });
    }

    return params;
  }

  /**
   * Handle HTTP errors
   */
  protected handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case HttpStatusCode.BadRequest:
          errorMessage = 'Invalid request. Please check your input.';
          break;
        case HttpStatusCode.Unauthorized:
          errorMessage = 'You are not authorized to perform this action.';
          break;
        case HttpStatusCode.Forbidden:
          errorMessage = 'You do not have permission to access this resource.';
          break;
        case HttpStatusCode.NotFound:
          errorMessage = 'The requested resource was not found.';
          break;
        case HttpStatusCode.Conflict:
          errorMessage = 'This resource already exists.';
          break;
        case HttpStatusCode.UnprocessableEntity:
          errorMessage = 'The request could not be processed.';
          break;
        case HttpStatusCode.InternalServerError:
          errorMessage = 'An internal server error occurred. Please try again later.';
          break;
        case HttpStatusCode.BadGateway:
          errorMessage = 'The server is temporarily unavailable. Please try again later.';
          break;
        case HttpStatusCode.ServiceUnavailable:
          errorMessage = 'The service is temporarily unavailable. Please try again later.';
          break;
        default:
          errorMessage = error.error?.message || 'An unexpected error occurred.';
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
