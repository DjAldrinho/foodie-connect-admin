/**
 * Report Detail Component
 * Displays full details of a moderation report with type-specific content previews
 */

import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { ModerationService } from '../services/moderation.service';
import { ToastNotificationService } from '../../../core/services/toast-notification.service';

// Import preview components
import {
  UserPreviewComponent,
  RestaurantPreviewComponent,
  ReviewPreviewComponent,
  PhotoPreviewComponent,
  CommentPreviewComponent,
} from './previews';

import type {
  ReportDetail,
  ActionHistoryItem,
  ReportListItem,
} from '../../../../models/moderation.types';
import { ReportType, ModerationAction } from '../../../../models/moderation.types';

/**
 * Report Detail Component
 *
 * Shows detailed view of a moderation report including:
 * - Type-specific content preview
 * - Report metadata
 * - Action history timeline
 * - Related reports
 * - Moderation actions (approve, reject, dismiss, escalate)
 */
@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    UserPreviewComponent,
    RestaurantPreviewComponent,
    ReviewPreviewComponent,
    PhotoPreviewComponent,
    CommentPreviewComponent,
  ],
  templateUrl: './report-detail.component.html',
  styleUrls: ['./report-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDetailComponent implements OnInit {
  private readonly moderationService = inject(ModerationService);
  private readonly toastService = inject(ToastNotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Input from route
  reportId = signal<string>('');

  // Signals
  readonly report = signal<ReportDetail | null>(null);
  readonly actionHistory = signal<ActionHistoryItem[]>([]);
  readonly relatedReports = signal<ReportListItem[]>([]);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly errorMessage = signal('');

  // Type assertion for toast service
  private readonly toast = inject(ToastNotificationService) as unknown as {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
  };

  // Form signals
  readonly rejectReportReason = signal('');
  readonly escalateReportReason = signal('');

  // Computed properties
  readonly canReject = computed(() => this.rejectReportReason().trim().length >= 10);

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.reportId.set(id);
        this.loadReport(id);
      } else {
        this.hasError.set(true);
        this.errorMessage.set('Report ID not provided');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Load report details
   */
  private loadReport(id: string): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.moderationService.getById(id).subscribe({
      next: (report) => {
        this.report.set(report);
        this.loadActionHistory(id);
        this.loadRelatedReports(id);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.hasError.set(true);
        this.errorMessage.set(error.message);
        this.isLoading.set(false);
        this.toast.showError('Failed to load report details');
      },
    });
  }

  /**
   * Load action history
   */
  private loadActionHistory(id: string): void {
    this.moderationService.getActionHistory(id).subscribe({
      next: (history) => {
        this.actionHistory.set(history);
      },
      error: () => {
        // Non-critical, continue without history
      },
    });
  }

  /**
   * Load related reports
   */
  private loadRelatedReports(id: string): void {
    this.moderationService.getRelatedReports(id).subscribe({
      next: (reports) => {
        this.relatedReports.set(reports);
      },
      error: () => {
        // Non-critical, continue without related reports
      },
    });
  }

  /**
   * Approve the report
   */
  approveReport(): void {
    if (!this.report()) return;

    this.moderationService.approveReport(this.reportId()).subscribe({
      next: () => {
        this.toast.showSuccess('Report approved successfully');
        this.router.navigate(['/moderation']);
      },
      error: () => {
        this.toast.showError('Failed to approve report');
      },
    });
  }

  /**
   * Reject the report with reason
   */
  rejectReport(): void {
    if (!this.report() || !this.canReject()) {
      this.toast.showError('Please provide a reason (min 10 characters)');
      return;
    }

    this.moderationService.rejectReport(this.reportId(), this.rejectReportReason()).subscribe({
      next: () => {
        this.toast.showSuccess('Report rejected successfully');
        this.router.navigate(['/moderation']);
      },
      error: () => {
        this.toast.showError('Failed to reject report');
      },
    });
  }

  /**
   * Dismiss the report
   */
  dismissReport(): void {
    if (!this.report()) return;

    this.moderationService.dismissReport(this.reportId()).subscribe({
      next: () => {
        this.toast.showSuccess('Report dismissed successfully');
        this.router.navigate(['/moderation']);
      },
      error: () => {
        this.toast.showError('Failed to dismiss report');
      },
    });
  }

  /**
   * Escalate the report
   */
  escalateReport(): void {
    if (!this.report()) return;

    this.moderationService
      .escalateReport(this.reportId(), this.escalateReportReason() || undefined)
      .subscribe({
        next: () => {
          this.toast.showSuccess('Report escalated successfully');
          this.router.navigate(['/moderation']);
        },
        error: () => {
          this.toast.showError('Failed to escalate report');
        },
      });
  }

  /**
   * Navigate back to queue
   */
  goBack(): void {
    this.router.navigate(['/moderation']);
  }

  /**
   * Navigate to related report
   */
  navigateToRelatedReport(id: string): void {
    this.router.navigate(['/moderation', id]);
  }

  /**
   * Get the appropriate preview component based on report type
   */
  getPreviewComponent(): string {
    const type = this.report()?.type;
    switch (type) {
      case ReportType.USER:
        return 'user-preview';
      case ReportType.RESTAURANT:
        return 'restaurant-preview';
      case ReportType.REVIEW:
        return 'review-preview';
      case ReportType.PHOTO:
        return 'photo-preview';
      case ReportType.COMMENT:
        return 'comment-preview';
      default:
        return 'review-preview';
    }
  }

  /**
   * Get action display name
   */
  getActionDisplayName(action: ModerationAction): string {
    switch (action) {
      case ModerationAction.APPROVE_CONTENT:
        return 'Approved Content';
      case ModerationAction.REJECT_REPORT:
        return 'Rejected Report';
      case ModerationAction.DISMISS_REPORT:
        return 'Dismissed Report';
      case ModerationAction.ESCALATE:
        return 'Escalated';
      default:
        return action;
    }
  }

  /**
   * Track action history by ID
   */
  trackAction(index: number, action: ActionHistoryItem): string {
    return action.id;
  }

  /**
   * Track related reports by ID
   */
  trackRelatedReport(index: number, report: ReportListItem): string {
    return report.id;
  }
}
