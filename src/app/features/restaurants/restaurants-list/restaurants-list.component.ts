/**
 * RestaurantsListComponent - Main restaurants list page
 *
 * Features:
 * - Grid/list toggle view
 * - Restaurant filters (search, status, cuisine, price, rating)
 * - Pagination
 * - Export to CSV button
 * - Loading state
 * - Empty state
 */

import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { RestaurantsService } from '../services/restaurants.service';
import { ToastNotificationService } from '../../../core/services/toast-notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner';
import { RestaurantFiltersComponent } from './restaurant-filters/restaurant-filters.component';
import { GridViewComponent } from './grid-view/grid-view.component';
import { ListViewComponent } from './list-view/list-view.component';
import { ViewToggleComponent, ViewMode } from './view-toggle/view-toggle.component';

import type { RestaurantListItem, RestaurantFilters } from '../../../models/restaurants.types';
import { RestaurantStatus, CuisineType, PriceRange } from '../../../models/restaurants.types';

@Component({
  selector: 'app-restaurants-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RestaurantFiltersComponent,
    GridViewComponent,
    ListViewComponent,
    ViewToggleComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './restaurants-list.component.html',
  styleUrls: ['../animations.css', './restaurants-list.component.css'],
})
export class RestaurantsListComponent implements OnInit, OnDestroy {
  private readonly restaurantsService = inject(RestaurantsService);
  private readonly toast = inject(ToastNotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  /**
   * Restaurants list
   */
  readonly restaurants = signal<RestaurantListItem[]>([]);

  /**
   * Loading state
   */
  readonly loading = signal(false);

  /**
   * Total restaurants count
   */
  readonly totalRestaurants = signal(0);

  /**
   * Current page
   */
  readonly currentPage = signal(1);

  /**
   * Page size
   */
  readonly pageSize = signal(12);

  /**
   * Total pages
   */
  readonly totalPages = signal(0);

  /**
   * Current filters
   */
  readonly filters = signal<RestaurantFilters>({});

  /**
   * Sort by field
   */
  readonly sortBy = signal<string>('createdAt');

  /**
   * Sort order
   */
  readonly sortOrder = signal<'asc' | 'desc'>('desc');

  /**
   * View mode (grid or list)
   */
  readonly viewMode = signal<ViewMode>('grid');

  /**
   * Computed: current pagination
   */
  readonly pagination = computed(() => ({
    page: this.currentPage(),
    pageSize: this.pageSize(),
    sortBy: this.sortBy(),
    sortOrder: this.sortOrder(),
  }));

  /**
   * Computed: end index for pagination display
   */
  readonly paginationEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.totalRestaurants())
  );

  /**
   * Computed: start index for pagination display
   */
  readonly paginationStart = computed(() =>
    (this.currentPage() - 1) * this.pageSize() + 1
  );

  /**
   * Computed: has any filters active
   */
  readonly hasActiveFilters = computed(() => {
    const f = this.filters();
    return !!(f.search || f.status || f.cuisine?.length || f.priceRange?.length || f.rating || f.city);
  });

  ngOnInit(): void {
    this.loadFiltersFromUrl();
    this.loadRestaurants();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load filters from URL query params on init
   */
  private loadFiltersFromUrl(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const newFilters: RestaurantFilters = {};

      if (params['search']) {
        newFilters.search = params['search'];
      }
      if (params['status']) {
        newFilters.status = params['status'] as RestaurantStatus;
      }
      if (params['cuisine']) {
        newFilters.cuisine = Array.isArray(params['cuisine'])
          ? params['cuisine'] as CuisineType[]
          : [params['cuisine'] as CuisineType];
      }
      if (params['priceRange']) {
        const prices = Array.isArray(params['priceRange'])
          ? params['priceRange']
          : [params['priceRange']];
        newFilters.priceRange = prices as PriceRange[];
      }
      if (params['rating']) {
        newFilters.rating = parseFloat(params['rating']);
      }
      if (params['page']) {
        this.currentPage.set(parseInt(params['page'], 10));
      }
      if (params['pageSize']) {
        this.pageSize.set(parseInt(params['pageSize'], 10));
      }
      if (params['sortBy']) {
        this.sortBy.set(params['sortBy']);
      }
      if (params['sortOrder']) {
        this.sortOrder.set(params['sortOrder'] as 'asc' | 'desc');
      }
      if (params['view']) {
        this.viewMode.set(params['view'] as ViewMode);
      }

      if (Object.keys(newFilters).length > 0) {
        this.filters.set(newFilters);
      }
    });
  }

  /**
   * Update URL query params to reflect current state
   */
  private updateUrlParams(): void {
    const params: Record<string, string | string[]> = {};

    const f = this.filters();
    if (f.search) params['search'] = f.search;
    if (f.status) params['status'] = f.status;
    if (f.cuisine && f.cuisine.length > 0) params['cuisine'] = f.cuisine;
    if (f.priceRange && f.priceRange.length > 0) params['priceRange'] = f.priceRange;
    if (f.rating) params['rating'] = f.rating.toString();

    if (this.currentPage() !== 1) params['page'] = this.currentPage().toString();
    if (this.pageSize() !== 12) params['pageSize'] = this.pageSize().toString();
    if (this.sortBy() !== 'createdAt') params['sortBy'] = this.sortBy();
    if (this.sortOrder() !== 'desc') params['sortOrder'] = this.sortOrder();
    if (this.viewMode() !== 'grid') params['view'] = this.viewMode();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }

  /**
   * Load restaurants with current filters and pagination
   */
  loadRestaurants(): void {
    this.loading.set(true);

    this.restaurantsService
      .getAll(this.pagination(), this.filters() as unknown as Record<string, unknown>)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.restaurants.set(response.items);
          this.totalRestaurants.set(response.total);
          this.totalPages.set(response.totalPages);
          this.loading.set(false);
        },
        error: (error) => {
          this.toast.error('Failed to load restaurants: ' + error.message);
          this.loading.set(false);
        },
      });
  }

  /**
   * Handle filters change
   */
  onFiltersChange(newFilters: RestaurantFilters): void {
    this.filters.set(newFilters);
    this.currentPage.set(1);
    this.updateUrlParams();
    this.loadRestaurants();
  }

  /**
   * Handle reset filters
   */
  onResetFilters(): void {
    this.filters.set({});
    this.currentPage.set(1);
    this.updateUrlParams();
    this.loadRestaurants();
  }

  /**
   * Handle view mode change
   */
  onViewModeChange(mode: ViewMode): void {
    this.viewMode.set(mode);
    this.updateUrlParams();
  }

  /**
   * Handle page change
   */
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.updateUrlParams();
    this.loadRestaurants();
  }

  /**
   * Handle sort change
   */
  onSortChange(sort: { sortBy: string; sortOrder: 'asc' | 'desc' }): void {
    this.sortBy.set(sort.sortBy);
    this.sortOrder.set(sort.sortOrder);
    this.updateUrlParams();
    this.loadRestaurants();
  }

  /**
   * Handle view restaurant
   */
  onViewRestaurant(restaurantId: string): void {
    this.router.navigate(['/restaurants', restaurantId]);
  }

  /**
   * Handle export to CSV
   */
  onExportToCsv(): void {
    this.restaurantsService.exportToCsv(this.filters()).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `restaurants-${new Date().toISOString()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.success('Restaurants exported successfully');
      },
      error: (error: Error) => {
        this.toast.error('Failed to export restaurants: ' + error.message);
      },
    });
  }

  /**
   * Handle refresh
   */
  onRefresh(): void {
    this.loadRestaurants();
  }
}
