/**
 * Restaurants Feature Routes
 */

import { Routes } from '@angular/router';

export const restaurantsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./restaurants-list/restaurants-list.component').then(m => m.RestaurantsListComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./restaurant-detail/restaurant-detail.component').then(m => m.RestaurantDetailComponent),
  },
];
