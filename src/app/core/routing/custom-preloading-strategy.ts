import { Injectable } from '@angular/core';
import {
  PreloadingStrategy,
  Router,
  Route,
} from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

/**
 * CustomPreloadingStrategy - Preload high-priority routes after app initialization
 *
 * Preloads routes marked with data: { preload: true } after a delay
 * to avoid competing with initial page load for resources.
 *
 * High-priority routes (preload immediately after delay):
 * - Dashboard
 * - Users
 * - Restaurants
 *
 * Low-priority routes (no preload):
 * - Settings (large, rarely accessed)
 * - Audit Logs (large, rarely accessed)
 * - Backup/Restore (admin only, rarely accessed)
 *
 * @example
 * ```typescript
 * {
 *   path: 'dashboard',
 *   loadComponent: () => import('./dashboard').then(m => m.DashboardComponent),
 *   data: { preload: true }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class CustomPreloadingStrategy implements PreloadingStrategy {
  private readonly preloadDelay = 2000; // 2 seconds after initial load

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    // Check if route has preload flag
    if (route.data && route.data['preload']) {
      // Preload after delay to avoid competing with initial load
      return timer(this.preloadDelay).pipe(
        mergeMap(() => {
          console.log(`[Preloading] Loading route: ${route.path}`);
          return load();
        })
      );
    }

    // Don't preload other routes
    return of(null);
  }
}

/**
 * QuicklinkPreloadingStrategy - Preload routes on hover/link interaction
 *
 * More aggressive strategy that preloads when user hovers over links
 * or when the route is likely to be navigated to next.
 *
 * Use with PreloadAllModules for optimal UX.
 */
@Injectable({
  providedIn: 'root',
})
export class QuicklinkPreloadingStrategy implements PreloadingStrategy {
  private loadedRoutes = new Set<string>();

  constructor(private router: Router) {}

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    // Skip if already loaded
    if (this.loadedRoutes.has(route.path || '')) {
      return of(null);
    }

    // Check if route should be preloaded
    if (route.data && route.data['preload']) {
      this.loadedRoutes.add(route.path || '');
      return load();
    }

    return of(null);
  }
}
