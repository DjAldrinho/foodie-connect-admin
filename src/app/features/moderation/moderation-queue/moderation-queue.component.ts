/**
 * Moderation Queue Component
 * Main component for displaying and managing the moderation queue
 */

import { Component, OnInit, inject, DestroyRef, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ModerationService } from '../services/moderation.service';
import { SelectionService } from '../../../core/services/selection.service';
import { ToastNotificationService } from '../../../core/services/toast-notification.service';

import type {
  ReportListItem,
  QueueQuery,
  ModerationBulkActionRequest,
  ModerationStatistics,
} from '../../../../models/moderation.types';
import type { PaginatedResponse } from '../../../models/common.types';
import { PaginationParams } from '../../../models/common.types';
import { ReportType, ReportStatus, Priority } from '../../../../models/moderation.types';

/**
 * Moderation Queue Component
 *
 * Displays a paginated, filterable list of reports in the moderation queue.
 * Supports bulk actions, auto-refresh, and real-time statistics.
 */
@Component({
  selector: 'app-moderation-queue',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './moderation-queue.component.html',
  styleUrls: ['./moderation-queue.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // OnPush
})
export class ModerationQueueComponent implements OnInit {
  private readonly moderationService = inject(ModerationService);
  readonly selectionService = inject(SelectionService);
  private readonly toastService = inject(ToastNotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Type assertion for toast service
  private readonly toast = this.toastService as unknown as {
    success: (message: string) => void;
    error: (message: string) => void;
  };

  // Signals
  readonly reports = signal<ReportListItem[]>([]);
  readonly statistics = signal<ModerationStatistics | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly errorMessage = signal('');

  // Filter and pagination state
  readonly filters = signal<Partial<QueueQuery>>({
    type: undefined,
    status: undefined,
    priority: undefined,
  });

  readonly pagination = signal<PaginationParams>({
    page: 1,
    pageSize: 25,
    sortBy: 'priority',
    sortOrder: 'desc',
  });

  readonly totalReports = signal(0);
  readonly totalPages = signal(0);

  // Computed properties
  readonly selectedCount = computed(() => this.selectionService.selectedCount());
  readonly hasNext = computed(() => this.pagination().page < this.totalPages());
  readonly hasPrevious = computed(() => this.pagination().page > 1);

  // Filter options
  readonly reportTypes = Object.values(ReportType);
  readonly reportStatuses = Object.values(ReportStatus);
  readonly priorities = Object.values(Priority);

  /**
   * Initialize component and load data
   */
  ngOnInit(): void {
    this.loadQueue();
    this.loadStatistics();

    // Auto-refresh every 60 seconds
    interval(60000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadQueue();
        this.loadStatistics();
      });
  }

  /**
   * Load reports queue with current filters and pagination
   */
  private loadQueue(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    const query: QueueQuery = {
      ...this.filters(),
      ...this.pagination(),
    } as QueueQuery;

    this.moderationService.getAll(this.pagination(), query).subscribe({
      next: (response: PaginatedResponse<ReportListItem>) => {
        this.reports.set(response.items);
        this.totalReports.set(response.total);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        this.hasError.set(true);
        this.errorMessage.set(error.message);
        this.isLoading.set(false);
        this.toast.error('Failed to load moderation queue');
      },
    });
  }

  /**
   * Load moderation statistics
   */
  private loadStatistics(): void {
    this.moderationService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics.set(stats);
      },
      error: () => {
        // Don't show error for stats failure, just keep null
      },
    });
  }

  /**
   * Apply a filter
   */
  applyFilter(type: keyof QueueQuery, value: any): void {
    this.filters.update((current) => ({
      ...current,
      [type]: value,
    }));
    this.pagination.update((current) => ({ ...current, page: 1 }));
    this.loadQueue();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filters.set({
      type: undefined,
      status: undefined,
      priority: undefined,
    });
    this.pagination.update((current) => ({ ...current, page: 1 }));
    this.loadQueue();
  }

  /**
   * Change page
   */
  changePage(page: number): void {
    this.pagination.update((current) => ({ ...current, page }));
    this.loadQueue();
  }

  /**
   * Change sort
   */
  changeSort(sortBy: QueueQuery['sortBy']): void {
    const currentSort = this.pagination().sortOrder || 'desc';
    this.pagination.update((current) => ({
      ...current,
      sortBy,
      sortOrder: current.sortBy === sortBy ? (current.sortOrder === 'asc' ? 'desc' : 'asc') : 'desc',
    }));
    this.loadQueue();
  }

  /**
   * Navigate to report detail
   */
  navigateToReport(id: string): void {
    this.router.navigate(['/moderation', id]);
  }

  /**
   * Toggle report selection
   */
  toggleSelection(id: string): void {
    this.selectionService.toggle(id);
  }

  /**
   * Check if report is selected
   */
  isSelected(id: string): boolean {
    return this.selectionService.selected().includes(id);
  }

  /**
   * Perform bulk action
   */
  performBulkAction(action: ModerationBulkActionRequest['action']): void {
    const selectedIds = this.selectionService.selected();

    if (selectedIds.length === 0) {
      this.toast.error('No reports selected');
      return;
    }

    const request: ModerationBulkActionRequest = {
      action,
      reportIds: selectedIds,
    };

    this.moderationService.bulkAction(request).subscribe({
      next: (response) => {
        if (response.failedCount === 0) {
          this.toast.success(
            `${action.charAt(0).toUpperCase() + action.slice(1)} completed successfully`
          );
        } else {
          this.toast.success(
            `${action.charAt(0).toUpperCase() + action.slice(1)} completed: ${response.successCount} succeeded, ${response.failedCount} failed`
          );
          if (response.errors.length > 0) {
            response.errors.forEach((err: { id: string; error: string }) => {
              console.error(`Failed to ${action} report ${err.id}: ${err.error}`);
            });
          }
        }

        this.selectionService.clear();
        this.loadQueue();
        this.loadStatistics();
      },
      error: () => {
        this.toast.error(`Failed to perform ${action} action`);
      },
    });
  }

  /**
   * Refresh queue manually
   */
  refreshQueue(): void {
    this.loadQueue();
    this.loadStatistics();
  }

  /**
   * Track reports by ID for performance
   */
  trackReport(index: number, report: ReportListItem): string {
    return report.id;
  }
}
