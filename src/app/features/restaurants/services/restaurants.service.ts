import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import type { PaginatedResponse, PaginationParams } from '../../../models/common.types';

import type {
  Restaurant,
  RestaurantListItem,
  RestaurantFilters,
  RestaurantStats,
  RestaurantPhoto,
  RestaurantReview,
  VerificationAction,
  MenuItem,
  MenuCategory,
} from '../../../models/restaurants.types';
import { RestaurantStatus, VerificationStatus, CuisineType, PriceRange } from '../../../models/restaurants.types';

/**
 * Mock restaurants data for development
 */
const MOCK_RESTAURANTS: RestaurantListItem[] = [
  {
    id: '1',
    name: 'La Parrilla Argentina',
    slug: 'la-parrilla-argentina',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    cuisine: CuisineType.PARRILLA,
    rating: 4.5,
    reviewCount: 128,
    city: 'Buenos Aires',
    status: RestaurantStatus.ACTIVE,
    verificationStatus: VerificationStatus.VERIFIED,
    priceRange: PriceRange.$$,
    createdAt: new Date('2026-01-15T00:00:00Z'),
  },
  {
    id: '2',
    name: 'Pasta House',
    slug: 'pasta-house',
    coverImage: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800',
    cuisine: CuisineType.ITALIANA,
    rating: 4.2,
    reviewCount: 89,
    city: 'Córdoba',
    status: RestaurantStatus.ACTIVE,
    verificationStatus: VerificationStatus.VERIFIED,
    priceRange: PriceRange.$$,
    createdAt: new Date('2026-02-01T00:00:00Z'),
  },
  {
    id: '3',
    name: 'Sushi Express',
    slug: 'sushi-express',
    coverImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
    cuisine: CuisineType.JAPONESA,
    rating: 4.8,
    reviewCount: 256,
    city: 'Rosario',
    status: RestaurantStatus.PENDING,
    verificationStatus: VerificationStatus.PENDING,
    priceRange: PriceRange.$$$,
    createdAt: new Date('2026-02-15T00:00:00Z'),
  },
  {
    id: '4',
    name: 'Taco Loco',
    slug: 'taco-loco',
    coverImage: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
    cuisine: CuisineType.MEXICANA,
    rating: 4.0,
    reviewCount: 64,
    city: 'Mendoza',
    status: RestaurantStatus.ACTIVE,
    verificationStatus: VerificationStatus.VERIFIED,
    priceRange: PriceRange.$,
    createdAt: new Date('2026-03-01T00:00:00Z'),
  },
  {
    id: '5',
    name: 'Green Garden',
    slug: 'green-garden',
    cuisine: CuisineType.VEGETARIANA,
    rating: 4.6,
    reviewCount: 142,
    city: 'Buenos Aires',
    status: RestaurantStatus.ACTIVE,
    verificationStatus: VerificationStatus.VERIFIED,
    priceRange: PriceRange.$$,
    createdAt: new Date('2026-03-10T00:00:00Z'),
  },
  {
    id: '6',
    name: 'Pizza Paradise',
    slug: 'pizza-paradise',
    cuisine: CuisineType.PIZZERIA,
    rating: 3.9,
    reviewCount: 78,
    city: 'Mar del Plata',
    status: RestaurantStatus.SUSPENDED,
    verificationStatus: VerificationStatus.VERIFIED,
    priceRange: PriceRange.$$,
    createdAt: new Date('2026-03-15T00:00:00Z'),
  },
];

/**
 * RestaurantsService - Service for restaurant CRUD operations
 *
 * Provides methods for:
 * - Listing restaurants with filters and pagination
 * - CRUD operations for restaurants
 * - Verification workflow
 * - Photo management
 * - Menu management
 * - Reviews retrieval
 * - Export functionality
 *
 * Supports both mock data (development) and real backend (production)
 * via the useMockRestaurants feature flag in environment.ts
 */
@Injectable({ providedIn: 'root' })
export class RestaurantsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly useMock = environment.features.useMockRestaurants;

  // In-memory storage for mock data
  private restaurantsSignal = signal<RestaurantListItem[]>([...MOCK_RESTAURANTS]);

  constructor() {
    // Service initialized with mock/real mode based on environment flag
  }

  /**
   * Get paginated list of restaurants with optional filters
   *
   * @param pagination - Pagination parameters (page, pageSize, sortBy, sortOrder)
   * @param filters - Filter criteria (search, status, cuisine, priceRange, rating, city)
   * @returns Observable with paginated restaurant list items
   *
   * @example
   * ```typescript
   * service.getAll(
   *   { page: 1, pageSize: 12, sortBy: 'createdAt', sortOrder: 'desc' },
   *   { status: RestaurantStatus.ACTIVE, cuisine: [CuisineType.PARRILLA] }
   * ).subscribe(response => {
   *   console.log(response.items); // RestaurantListItem[]
   *   console.log(response.total); // total count
   * });
   * ```
   */
  getAll(
    pagination?: PaginationParams,
    filters?: RestaurantFilters
  ): Observable<PaginatedResponse<RestaurantListItem>> {
    if (this.useMock) {
      return this.getAllMock(pagination, filters);
    }
    return this.getAllReal(pagination, filters);
  }

  /**
   * Mock implementation for development
   */
  private getAllMock(
    pagination?: PaginationParams,
    filters?: RestaurantFilters
  ): Observable<PaginatedResponse<RestaurantListItem>> {
    const restaurants = this.restaurantsSignal();

    // Apply filters
    let filtered = [...restaurants];

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchLower) ||
          r.city.toLowerCase().includes(searchLower) ||
          r.cuisine.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.status) {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    if (filters?.rating) {
      const minRating = filters.rating;
      filtered = filtered.filter((r) => r.rating >= minRating);
    }

    if (filters?.cuisine && filters.cuisine.length > 0) {
      const cuisines = filters.cuisine;
      filtered = filtered.filter((r) => cuisines.includes(r.cuisine));
    }

    if (filters?.priceRange && filters.priceRange.length > 0) {
      const prices = filters.priceRange;
      filtered = filtered.filter((r) => prices.includes(r.priceRange));
    }

    // Apply sorting
    const sortBy = pagination?.sortBy || 'createdAt';
    const sortOrder = pagination?.sortOrder || 'desc';

    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof RestaurantListItem];
      const bVal = b[sortBy as keyof RestaurantListItem];

      if (aVal === undefined || bVal === undefined) {
        return 0;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Apply pagination
    const page = pagination?.page || 1;
    const pageSize = pagination?.pageSize || 12;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return of({
      items,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    }).pipe(delay(500)); // Simulate network delay
  }

  /**
   * Real backend implementation
   */
  private getAllReal(
    pagination?: PaginationParams,
    filters?: RestaurantFilters
  ): Observable<PaginatedResponse<RestaurantListItem>> {
    let params = this.buildParams(pagination, filters as unknown as Record<string, string | number | boolean | string[] | undefined>);

    return this.http
      .get<{ data: PaginatedResponse<RestaurantListItem> }>(`${this.apiUrl}/restaurants`, { params })
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Get detailed restaurant information by ID
   *
   * @param id - Restaurant identifier (string or number)
   * @returns Observable with complete restaurant details including menu, photos, reviews
   * @throws Error if restaurant not found (404)
   *
   * @example
   * ```typescript
   * service.getById('123').subscribe(restaurant => {
   *   console.log(restaurant.name);
   *   console.log(restaurant.address);
   *   console.log(restaurant.menu);
   * });
   * ```
   */
  getById(id: string | number): Observable<Restaurant> {
    if (this.useMock) {
      return this.getByIdMock(id);
    }
    return this.getByIdReal(id);
  }

  /**
   * Mock implementation for get by ID
   */
  private getByIdMock(id: string | number): Observable<Restaurant> {
    const restaurants = this.restaurantsSignal();
    const listItem = restaurants.find((r) => r.id === id);

    if (!listItem) {
      return throwError(() => new Error('Restaurant not found'));
    }

    const restaurant: Restaurant = {
      id: listItem.id,
      name: listItem.name,
      slug: listItem.slug,
      coverImage: listItem.coverImage,
      cuisine: listItem.cuisine,
      rating: listItem.rating,
      reviewCount: listItem.reviewCount,
      status: listItem.status,
      verificationStatus: listItem.verificationStatus,
      priceRange: listItem.priceRange,
      createdAt: listItem.createdAt instanceof Date ? listItem.createdAt.toISOString() : listItem.createdAt,
      description: 'A wonderful dining experience with authentic cuisine and warm atmosphere.',
      images: [listItem.coverImage || ''],
      address: {
        street: 'Av. Corrientes 1234',
        city: listItem.city,
        country: 'Argentina',
        postalCode: 'C1234ABC',
      },
      phone: '+54 11 1234-5678',
      email: `contact@${listItem.slug}.com`,
      website: `https://${listItem.slug}.com`,
      ownerId: 'owner-1',
      ownerName: 'Restaurant Owner',
      ownerEmail: 'owner@example.com',
      verifiedAt: listItem.verificationStatus === VerificationStatus.VERIFIED ? new Date() : undefined,
      verifiedBy: listItem.verificationStatus === VerificationStatus.VERIFIED ? 'admin-1' : undefined,
      photoCount: 12,
      checkInCount: 345,
      isReported: false,
      updatedAt: new Date().toISOString(),
    };

    return of(restaurant).pipe(delay(300));
  }

  /**
   * Real backend implementation for get by ID
   */
  private getByIdReal(id: string | number): Observable<Restaurant> {
    return this.http
      .get<{ data: Restaurant }>(`${this.apiUrl}/restaurants/${id}`)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Create a new restaurant
   *
   * @param restaurant - Partial restaurant object with required fields (name, cuisine, address, etc.)
   * @returns Observable with created restaurant including generated ID and timestamps
   *
   * @example
   * ```typescript
   * service.create({
   *   name: 'New Restaurant',
   *   cuisine: CuisineType.PARRILLA,
   *   address: { street: 'Av. Corrientes 1234', city: 'Buenos Aires', country: 'Argentina', postalCode: 'C1234' },
   *   phone: '+54 11 1234-5678',
   *   email: 'contact@restaurant.com'
   * }).subscribe(restaurant => console.log(restaurant.id));
   * ```
   */
  create(restaurant: Partial<Restaurant>): Observable<Restaurant> {
    if (this.useMock) {
      return of({} as Restaurant).pipe(delay(300));
    }
    return this.createReal(restaurant);
  }

  private createReal(restaurant: Partial<Restaurant>): Observable<Restaurant> {
    return this.http
      .post<{ data: Restaurant }>(`${this.apiUrl}/restaurants`, restaurant)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Update existing restaurant information
   *
   * @param id - Restaurant identifier
   * @param restaurant - Partial restaurant object with fields to update
   * @returns Observable with updated restaurant
   *
   * @example
   * ```typescript
   * service.update('123', { name: 'Updated Name', phone: '+54 11 9999-9999' })
   *   .subscribe(restaurant => console.log(restaurant.name));
   * ```
   */
  update(id: string | number, restaurant: Partial<Restaurant>): Observable<Restaurant> {
    if (this.useMock) {
      return of({} as Restaurant).pipe(delay(300));
    }
    return this.updateReal(id, restaurant);
  }

  private updateReal(id: string | number, restaurant: Partial<Restaurant>): Observable<Restaurant> {
    return this.http
      .patch<{ data: Restaurant }>(`${this.apiUrl}/restaurants/${id}`, restaurant)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Delete restaurant (soft delete - marks as deleted, doesn't permanently remove)
   *
   * @param id - Restaurant identifier
   * @returns Observable that completes when deletion is successful
   *
   * @example
   * ```typescript
   * service.delete('123').subscribe(() => console.log('Restaurant deleted'));
   * ```
   */
  delete(id: string | number): Observable<void> {
    if (this.useMock) {
      return of(undefined).pipe(delay(300));
    }
    return this.deleteReal(id);
  }

  private deleteReal(id: string | number): Observable<void> {
    return this.http
      .delete<{ data: void }>(`${this.apiUrl}/restaurants/${id}`)
      .pipe(
        map(() => undefined),
        catchError(this.handleError)
      );
  }

  /**
   * Verify, reject, or request additional information for a restaurant
   *
   * Used in the restaurant verification workflow to approve pending restaurants,
   * reject submissions, or request more information from the owner.
   *
   * @param id - Restaurant identifier
   * @param action - Verification action object with action type ('approve' | 'reject' | 'request-info') and optional notes
   * @returns Observable with updated restaurant including new verification status
   *
   * @example
   * ```typescript
   * // Approve restaurant
   * service.verifyRestaurant('123', { action: 'approve' })
   *   .subscribe(restaurant => console.log(restaurant.verificationStatus)); // VERIFIED
   *
   * // Reject with notes
   * service.verifyRestaurant('123', { action: 'reject', notes: 'Incomplete documentation' })
   *   .subscribe(restaurant => console.log(restaurant.verificationStatus)); // REJECTED
   *
   * // Request more information
   * service.verifyRestaurant('123', { action: 'request-info', notes: 'Please upload menu photos' })
   *   .subscribe(restaurant => console.log(restaurant.verificationStatus)); // PENDING
   * ```
   */
  verifyRestaurant(id: string, action: VerificationAction): Observable<Restaurant> {
    if (this.useMock) {
      return of({} as Restaurant).pipe(delay(300));
    }
    return this.verifyRestaurantReal(id, action);
  }

  private verifyRestaurantReal(id: string, action: VerificationAction): Observable<Restaurant> {
    return this.http
      .post<{ data: Restaurant }>(`${this.apiUrl}/restaurants/${id}/verify`, action)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Get all photos for a restaurant
   *
   * @param id - Restaurant identifier
   * @returns Observable with array of restaurant photos (url, caption, uploadedAt, uploadedBy)
   *
   * @example
   * ```typescript
   * service.getRestaurantPhotos('123').subscribe(photos => {
   *   photos.forEach(photo => console.log(photo.url, photo.caption));
   * });
   * ```
   */
  getRestaurantPhotos(id: string): Observable<RestaurantPhoto[]> {
    if (this.useMock) {
      return of([]).pipe(delay(300));
    }
    return this.getRestaurantPhotosReal(id);
  }

  private getRestaurantPhotosReal(id: string): Observable<RestaurantPhoto[]> {
    return this.http
      .get<{ data: RestaurantPhoto[] }>(`${this.apiUrl}/restaurants/${id}/photos`)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Upload a new photo for a restaurant
   *
   * @param id - Restaurant identifier
   * @param file - Image file to upload (jpg, png, webp)
   * @param caption - Optional photo caption/description
   * @returns Observable with the uploaded photo URL
   *
   * @example
   * ```typescript
   * const file = event.target.files[0];
   * service.uploadRestaurantPhoto('123', file, 'Main dining area')
   *   .subscribe(result => console.log('Photo uploaded:', result.url));
   * ```
   */
  uploadRestaurantPhoto(id: string, file: File, caption?: string): Observable<{ url: string }> {
    if (this.useMock) {
      return of({ url: 'https://example.com/photo.jpg' }).pipe(delay(300));
    }
    return this.uploadRestaurantPhotoReal(id, file, caption);
  }

  private uploadRestaurantPhotoReal(id: string, file: File, caption?: string): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) {
      formData.append('caption', caption);
    }

    return this.http
      .post<{ data: { url: string } }>(`${this.apiUrl}/restaurants/${id}/photos`, formData)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Delete a photo from a restaurant's gallery
   *
   * @param restaurantId - Restaurant identifier
   * @param photoId - Photo identifier to delete
   * @returns Observable that completes when deletion is successful
   *
   * @example
   * ```typescript
   * service.deleteRestaurantPhoto('123', 'photo-456').subscribe(() => {
   *   console.log('Photo deleted');
   * });
   * ```
   */
  deleteRestaurantPhoto(restaurantId: string, photoId: string): Observable<void> {
    if (this.useMock) {
      return of(undefined).pipe(delay(300));
    }
    return this.deleteRestaurantPhotoReal(restaurantId, photoId);
  }

  private deleteRestaurantPhotoReal(restaurantId: string, photoId: string): Observable<void> {
    return this.http
      .delete<{ data: void }>(`${this.apiUrl}/restaurants/${restaurantId}/photos/${photoId}`)
      .pipe(
        map(() => undefined),
        catchError(this.handleError)
      );
  }

  /**
   * Get restaurant menu with categories and items
   *
   * @param id - Restaurant identifier
   * @returns Observable with array of menu categories containing menu items
   *
   * @example
   * ```typescript
   * service.getRestaurantMenu('123').subscribe(categories => {
   *   categories.forEach(category => {
   *     console.log(category.name); // "Starters", "Main Course", etc.
   *     category.items.forEach(item => console.log(item.name, item.price));
   *   });
   * });
   * ```
   */
  getRestaurantMenu(id: string): Observable<MenuCategory[]> {
    if (this.useMock) {
      return of([]).pipe(delay(300));
    }
    return this.getRestaurantMenuReal(id);
  }

  private getRestaurantMenuReal(id: string): Observable<MenuCategory[]> {
    return this.http
      .get<{ data: MenuCategory[] }>(`${this.apiUrl}/restaurants/${id}/menu`)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Update restaurant menu with new categories and items
   *
   * @param id - Restaurant identifier
   * @param categories - Complete menu structure with categories and items
   * @returns Observable with updated menu
   *
   * @example
   * ```typescript
   * service.updateRestaurantMenu('123', [
   *   { name: 'Starters', items: [{ name: 'Bruschetta', price: 1200, description: '...' }] }
   * ]).subscribe(menu => console.log('Menu updated', menu.length));
   * ```
   */
  updateRestaurantMenu(id: string, categories: MenuCategory[]): Observable<MenuCategory[]> {
    if (this.useMock) {
      return of([]).pipe(delay(300));
    }
    return this.updateRestaurantMenuReal(id, categories);
  }

  private updateRestaurantMenuReal(id: string, categories: MenuCategory[]): Observable<MenuCategory[]> {
    return this.http
      .put<{ data: MenuCategory[] }>(`${this.apiUrl}/restaurants/${id}/menu`, { categories })
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Get paginated reviews for a restaurant with optional filters
   *
   * @param id - Restaurant identifier
   * @param pagination - Optional pagination parameters
   * @param filters - Optional filters (minRating: 1-5, hasPhotos: true/false)
   * @returns Observable with paginated reviews
   *
   * @example
   * ```typescript
   * // Get all reviews
   * service.getRestaurantReviews('123').subscribe(response => {
   *   console.log(response.items); // RestaurantReview[]
   * });
   *
   * // Get 5-star reviews with photos only
   * service.getRestaurantReviews('123', { page: 1, pageSize: 20 }, { minRating: 5, hasPhotos: true })
   *   .subscribe(response => console.log(response.items));
   * ```
   */
  getRestaurantReviews(
    id: string,
    pagination?: PaginationParams,
    filters?: { minRating?: number; hasPhotos?: boolean }
  ): Observable<PaginatedResponse<RestaurantReview>> {
    if (this.useMock) {
      return this.getRestaurantReviewsMock(id, pagination, filters);
    }
    return this.getRestaurantReviewsReal(id, pagination, filters);
  }

  private getRestaurantReviewsMock(
    id: string,
    pagination?: PaginationParams,
    filters?: { minRating?: number; hasPhotos?: boolean }
  ): Observable<PaginatedResponse<RestaurantReview>> {
    return of({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    }).pipe(delay(300));
  }

  private getRestaurantReviewsReal(
    id: string,
    pagination?: PaginationParams,
    filters?: { minRating?: number; hasPhotos?: boolean }
  ): Observable<PaginatedResponse<RestaurantReview>> {
    const params = this.buildParams(pagination, filters as unknown as Record<string, string | number | boolean | string[] | undefined>);
    return this.http
      .get<{ data: PaginatedResponse<RestaurantReview> }>(`${this.apiUrl}/restaurants/${id}/reviews`, { params })
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Get aggregated statistics across all restaurants
   *
   * Returns counts for total restaurants, pending verifications, active restaurants,
   * recent signups, and other dashboard metrics.
   *
   * @returns Observable with restaurant statistics
   *
   * @example
   * ```typescript
   * service.getRestaurantStats().subscribe(stats => {
   *   console.log('Total:', stats.total);
   *   console.log('Pending:', stats.pendingVerification);
   *   console.log('Active:', stats.active);
   * });
   * ```
   */
  getRestaurantStats(): Observable<RestaurantStats> {
    if (this.useMock) {
      return of({} as RestaurantStats).pipe(delay(300));
    }
    return this.getRestaurantStatsReal();
  }

  private getRestaurantStatsReal(): Observable<RestaurantStats> {
    return this.http
      .get<{ data: RestaurantStats }>(`${this.apiUrl}/restaurants/stats`)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Export restaurants to CSV format with optional filters
   *
   * Generates a CSV file with restaurant data that can be opened in Excel or other spreadsheet applications.
   * The file includes all restaurant fields matching the applied filters.
   *
   * @param filters - Optional filter criteria to limit exported data
   * @returns Observable with CSV blob for download
   *
   * @example
   * ```typescript
   * service.exportToCsv({ status: RestaurantStatus.ACTIVE, cuisine: [CuisineType.PARRILLA] })
   *   .subscribe(blob => {
   *     const url = window.URL.createObjectURL(blob);
   *     const a = document.createElement('a');
   *     a.href = url;
   *     a.download = `restaurants-${new Date().toISOString()}.csv`;
   *     a.click();
   *   });
   * ```
   */
  exportToCsv(filters?: RestaurantFilters): Observable<Blob> {
    if (this.useMock) {
      return this.exportToCsvMock(filters);
    }
    return this.exportToCsvReal(filters);
  }

  private exportToCsvMock(filters?: RestaurantFilters): Observable<Blob> {
    // Generate a simple CSV blob
    const csv = 'id,name,cuisine,rating,city,status\n1,"La Parrilla Argentina",Parrilla,4.5,"Buenos Aires",ACTIVE\n';
    return of(new Blob([csv], { type: 'text/csv' })).pipe(delay(500));
  }

  private exportToCsvReal(filters?: RestaurantFilters): Observable<Blob> {
    const params = this.buildParams(undefined, filters as unknown as Record<string, string | number | boolean | string[] | undefined>);
    return this.http
      .get(`${this.apiUrl}/restaurants/export`, {
        params,
        responseType: 'blob',
        headers: { Accept: 'text/csv' },
      })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Bulk verify multiple restaurants at once
   *
   * Use this to approve or reject multiple pending restaurants in a single operation.
   * Commonly used from the restaurants list with bulk selection.
   *
   * @param restaurantIds - Array of restaurant identifiers to verify
   * @param action - Bulk action: 'approve' or 'reject'
   * @param notes - Optional notes explaining the decision (applied to all)
   * @returns Observable that completes when bulk operation is done
   *
   * @example
   * ```typescript
   * // Approve multiple pending restaurants
   * service.bulkVerify(['123', '456', '789'], 'approve', 'All documentation verified')
   *   .subscribe(() => console.log('Bulk approval complete'));
   *
   * // Reject multiple restaurants
   * service.bulkVerify(['123', '456'], 'reject', 'Incomplete information')
   *   .subscribe(() => console.log('Bulk rejection complete'));
   * ```
   */
  bulkVerify(restaurantIds: string[], action: 'approve' | 'reject', notes?: string): Observable<void> {
    if (this.useMock) {
      return of(undefined).pipe(delay(500));
    }
    return this.bulkVerifyReal(restaurantIds, action, notes);
  }

  private bulkVerifyReal(restaurantIds: string[], action: 'approve' | 'reject', notes?: string): Observable<void> {
    return this.http
      .post<{ data: void }>(`${this.apiUrl}/restaurants/bulk-verify`, {
        ids: restaurantIds,
        action,
        notes,
      })
      .pipe(
        map(() => undefined),
        catchError(this.handleError)
      );
  }

  /**
   * Bulk update status for multiple restaurants
   *
   * Change the status (ACTIVE, SUSPENDED, etc.) of multiple restaurants at once.
   * Useful for suspending problematic restaurants or reactivating suspended ones.
   *
   * @param restaurantIds - Array of restaurant identifiers to update
   * @param status - New status to apply to all restaurants
   * @returns Observable that completes when bulk update is done
   *
   * @example
   * ```typescript
   * // Suspend multiple restaurants
   * service.bulkUpdateStatus(['123', '456'], RestaurantStatus.SUSPENDED)
   *   .subscribe(() => console.log('Restaurants suspended'));
   *
   * // Reactivate suspended restaurants
   * service.bulkUpdateStatus(['123', '456'], RestaurantStatus.ACTIVE)
   *   .subscribe(() => console.log('Restaurants reactivated'));
   * ```
   */
  bulkUpdateStatus(restaurantIds: string[], status: RestaurantStatus): Observable<void> {
    if (this.useMock) {
      return of(undefined).pipe(delay(500));
    }
    return this.bulkUpdateStatusReal(restaurantIds, status);
  }

  private bulkUpdateStatusReal(restaurantIds: string[], status: RestaurantStatus): Observable<void> {
    return this.http
      .patch<{ data: void }>(`${this.apiUrl}/restaurants/bulk-status`, {
        ids: restaurantIds,
        status,
      })
      .pipe(
        map(() => undefined),
        catchError(this.handleError)
      );
  }

  /**
   * Bulk delete multiple restaurants (soft delete)
   *
   * Permanently marks multiple restaurants as deleted. They will no longer appear
   * in listings but may be retained in the database for audit purposes.
   *
   * @param restaurantIds - Array of restaurant identifiers to delete
   * @returns Observable that completes when bulk deletion is done
   *
   * @example
   * ```typescript
   * service.bulkDelete(['123', '456', '789']).subscribe(() => {
   *   console.log('Restaurants deleted');
   * });
   * ```
   */
  bulkDelete(restaurantIds: string[]): Observable<void> {
    if (this.useMock) {
      return of(undefined).pipe(delay(500));
    }
    return this.bulkDeleteReal(restaurantIds);
  }

  private bulkDeleteReal(restaurantIds: string[]): Observable<void> {
    return this.http
      .post<{ data: void }>(`${this.apiUrl}/restaurants/bulk-delete`, {
        ids: restaurantIds,
      })
      .pipe(
        map(() => undefined),
        catchError(this.handleError)
      );
  }

  /**
   * Build HTTP query parameters from pagination and filter objects
   *
   * Converts pagination and filter objects into HttpParams for HTTP requests.
   * Handles arrays by appending multiple values with the same key.
   *
   * @param pagination - Optional pagination parameters
   * @param filters - Optional filter key-value pairs
   * @returns HttpParams object with all query parameters
   *
   * @private
   */
  private buildParams(
    pagination?: PaginationParams,
    filters?: Record<string, string | number | boolean | string[] | undefined>
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
            value.forEach((v) => params = params.append(key, String(v)));
          } else {
            params = params.set(key, String(value));
          }
        }
      });
    }

    return params;
  }

  /**
   * Handle HTTP errors with user-friendly messages
   *
   * Converts HTTP error responses into user-friendly error messages based on status code.
   * Handles 400, 401, 403, 404, 500, and other common HTTP errors.
   *
   * @param error - HTTP error response or ErrorEvent
   * @returns Observable that throws an Error with user-friendly message
   *
   * @private
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.status) {
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid request. Please check your input.';
          break;
        case 401:
          errorMessage = 'You are not authorized to perform this action.';
          break;
        case 403:
          errorMessage = 'You do not have permission to access this resource.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 500:
          errorMessage = 'An internal server error occurred. Please try again later.';
          break;
        default:
          errorMessage = error.error?.message || 'An unexpected error occurred.';
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
