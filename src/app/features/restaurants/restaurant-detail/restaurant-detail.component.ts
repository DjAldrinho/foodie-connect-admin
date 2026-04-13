import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { RestaurantsService } from '../services/restaurants.service';
import { ToastNotificationService } from '../../../core/services/toast-notification.service';
import { OverviewTabComponent } from './overview-tab/overview-tab.component';
import { PhotosTabComponent } from './photos-tab/photos-tab.component';
import { MenuTabComponent } from './menu-tab/menu-tab.component';
import { ReviewsTabComponent } from './reviews-tab/reviews-tab.component';
import { VerificationActionsComponent } from './verification-actions/verification-actions.component';

import type { Restaurant } from '../../../models/restaurants.types';

type TabType = 'overview' | 'photos' | 'menu' | 'reviews';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    OverviewTabComponent,
    PhotosTabComponent,
    MenuTabComponent,
    ReviewsTabComponent,
    VerificationActionsComponent,
  ],
  templateUrl: './restaurant-detail.component.html',
  styleUrls: ['../animations.css', './restaurant-detail.component.css'],
})
export class RestaurantDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly restaurantsService = inject(RestaurantsService);
  private readonly toast = inject(ToastNotificationService);

  readonly loading = signal(true);
  readonly restaurant = signal<Restaurant | null>(null);
  readonly activeTab = signal<TabType>('overview');

  readonly restaurantId = computed(() => this.route.snapshot.paramMap.get('id') || '');

  ngOnInit(): void {
    this.loadRestaurant();
    this.loadTabFromUrl();
  }

  private loadRestaurant(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.toast.error('Restaurant ID not found');
      this.router.navigate(['/restaurants']);
      return;
    }

    this.restaurantsService.getById(id).subscribe({
      next: (restaurant) => {
        this.restaurant.set(restaurant);
        this.loading.set(false);
      },
      error: (error) => {
        this.toast.error('Failed to load restaurant: ' + error.message);
        this.loading.set(false);
      },
    });
  }

  private loadTabFromUrl(): void {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'] as TabType;
      if (tab && ['overview', 'photos', 'menu', 'reviews'].includes(tab)) {
        this.activeTab.set(tab);
      }
    });
  }

  onTabChange(tab: TabType): void {
    this.activeTab.set(tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });
  }

  goBack(): void {
    this.router.navigate(['/restaurants']);
  }

  onVerifyAction(action: { action: string; data?: any }): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    switch (action.action) {
      case 'approve':
        this.toast.success('Restaurant approved successfully');
        break;
      case 'reject':
        this.toast.success('Restaurant rejected');
        break;
      case 'request-info':
        this.toast.success('Information requested');
        break;
    }

    // Reload restaurant data
    this.loadRestaurant();
  }
}
