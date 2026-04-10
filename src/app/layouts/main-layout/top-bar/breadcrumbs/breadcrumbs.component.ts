import { Component, inject, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, takeUntil, filter, startWith } from 'rxjs/operators';

/**
 * Breadcrumb item interface
 */
interface Breadcrumb {
  label: string;
  path: string;
}

/**
 * BreadcrumbsComponent - Auto-generated breadcrumb navigation
 *
 * Features:
 * - Auto-generated from router configuration
 * - Custom labels for routes
 * - Clickable breadcrumb links
 * - Current page as last item (non-clickable)
 * - Separator icon (/)
 * - Truncation on long paths
 * - ARIA navigation landmark
 *
 * @example
 * ```html
 * <app-breadcrumbs></app-breadcrumbs>
 * ```
 */
@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css'],
})
export class BreadcrumbsComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  /**
   * Custom route labels mapping
   * Override auto-generated labels with custom ones
   */
  private readonly routeLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    users: 'Usuarios',
    restaurants: 'Restaurantes',
    moderation: 'Moderación',
    notifications: 'Notificaciones',
    analytics: 'Analíticas',
    settings: 'Configuración',
    auth: 'Autenticación',
    login: 'Iniciar Sesión',
    'forgot-password': 'Recuperar Contraseña',
  };

  /**
   * Breadcrumb items observable
   */
  readonly breadcrumbs$ = this.createBreadcrumbs();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Create breadcrumb items from router
   */
  private createBreadcrumbs(): Observable<Breadcrumb[]> {
    return this.router.events.pipe(
      filter((event) => event.constructor.name === 'NavigationEnd'),
      startWith(null),
      map(() => this.buildBreadcrumbs())
    );
  }

  /**
   * Build breadcrumb array from current route
   */
  private buildBreadcrumbs(): Breadcrumb[] {
    const breadcrumbs: Breadcrumb[] = [];
    let currentRoute = this.activatedRoute.root;
    let url = '';

    while (currentRoute) {
      const children = currentRoute.children;
      currentRoute = children.length > 0 ? children[0] : this.activatedRoute;

      if (currentRoute?.snapshot?.url?.length) {
        const routeSegment = currentRoute.snapshot.url[0].path;
        url += `/${routeSegment}`;

        const label = this.getRouteLabel(routeSegment);
        breadcrumbs.push({ label, path: url });
      }
    }

    return breadcrumbs;
  }

  /**
   * Get custom label for route segment
   */
  private getRouteLabel(segment: string): string {
    return (
      this.routeLabels[segment] ||
      segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );
  }

  /**
   * Track breadcrumbs for ngFor performance
   */
  trackBreadcrumb(index: number, breadcrumb: Breadcrumb): string {
    return breadcrumb.path;
  }
}
