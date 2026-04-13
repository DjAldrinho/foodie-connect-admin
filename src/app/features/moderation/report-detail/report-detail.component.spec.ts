/**
 * Report Detail Component Tests
 * Strict TDD: Tests written before implementation
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { ReportDetailComponent } from './report-detail.component';
import { ModerationService } from '../services/moderation.service';
import { ToastNotificationService } from '../../../../core/services';
import { ReportType, ReportStatus, ModerationAction } from '../../../models/moderation.types';

describe('ReportDetailComponent', () => {
  let component: ReportDetailComponent;
  let fixture: ComponentFixture<ReportDetailComponent>;
  let mockModerationService: jasmine.SpyObj<ModerationService>;
  let mockToastService: jasmine.SpyObj<ToastNotificationService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockReportDetail = {
    id: '1',
    type: ReportType.REVIEW,
    status: ReportStatus.PENDING,
    priority: 'high' as const,
    reportCount: 5,
    reporter: {
      id: '101',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    reason: 'Fake review',
    description: 'This review is clearly fake',
    createdAt: '2026-04-10T10:00:00Z',
    updatedAt: '2026-04-10T10:00:00Z',
    content: {
      id: '1',
      type: ReportType.REVIEW,
      review: {
        id: 'review-1',
        rating: 5,
        text: 'Great restaurant!',
        photos: [],
        reviewer: { id: 'rev-1', name: 'Reviewer', avatar: '' },
        restaurant: { id: 'rest-1', name: 'Restaurant' },
        createdAt: '2026-04-10T10:00:00Z',
      },
    },
    actionHistory: [],
    relatedReports: [],
  };

  beforeEach(async () => {
    mockModerationService = jasmine.createSpyObj('ModerationService', [
      'getById',
      'approveReport',
      'rejectReport',
      'dismissReport',
      'escalateReport',
      'getActionHistory',
      'getRelatedReports',
    ]);
    mockToastService = jasmine.createSpyObj('ToastNotificationService', [
      'showSuccess',
      'showError',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockModerationService.getById.and.returnValue(of(mockReportDetail));
    mockModerationService.getActionHistory.and.returnValue(of([]));
    mockModerationService.getRelatedReports.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ReportDetailComponent],
      providers: [
        { provide: ModerationService, useValue: mockModerationService },
        { provide: ToastNotificationService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportDetailComponent);
    component = fixture.componentInstance;
    component.reportId = '1';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load report on init', () => {
    fixture.detectChanges();
    expect(mockModerationService.getById).toHaveBeenCalledWith('1');
    expect(component.report()).toBeDefined();
  });

  it('should show loading state initially', () => {
    fixture.detectChanges();
    expect(component.isLoading()).toBe(true);
  });

  it('should hide loading after data loads', () => {
    fixture.detectChanges();
    expect(component.isLoading()).toBe(false);
  });

  it('should handle report not found', () => {
    mockModerationService.getById.and.returnValue(throwError(() => new Error('Report not found')));
    fixture.detectChanges();
    expect(component.hasError()).toBe(true);
  });

  it('should approve report', () => {
    mockModerationService.approveReport.and.returnValue(of({ ...mockReportDetail, status: ReportStatus.RESOLVED }));
    fixture.detectChanges();

    component.approveReport();
    expect(mockModerationService.approveReport).toHaveBeenCalledWith('1');
    expect(mockToastService.showSuccess).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/moderation']);
  });

  it('should reject report with reason', () => {
    const reason = 'Violates guidelines';
    mockModerationService.rejectReport.and.returnValue(of({ ...mockReportDetail, status: ReportStatus.RESOLVED }));
    fixture.detectChanges();

    component.rejectReportReason.set(reason);
    component.rejectReport();

    expect(mockModerationService.rejectReport).toHaveBeenCalledWith('1', reason);
    expect(mockToastService.showSuccess).toHaveBeenCalled();
  });

  it('should not reject report without reason', () => {
    fixture.detectChanges();
    component.rejectReportReason.set('');

    component.rejectReport();
    expect(mockModerationService.rejectReport).not.toHaveBeenCalled();
    expect(mockToastService.showError).toHaveBeenCalled();
  });

  it('should dismiss report', () => {
    mockModerationService.dismissReport.and.returnValue(of({ ...mockReportDetail, status: ReportStatus.DISMISSED }));
    fixture.detectChanges();

    component.dismissReport();
    expect(mockModerationService.dismissReport).toHaveBeenCalledWith('1');
    expect(mockToastService.showSuccess).toHaveBeenCalled();
  });

  it('should escalate report', () => {
    mockModerationService.escalateReport.and.returnValue(
      of({ ...mockReportDetail, priority: 'escalated' as const })
    );
    fixture.detectChanges();

    component.escalateReportReason.set('Needs senior review');
    component.escalateReport();

    expect(mockModerationService.escalateReport).toHaveBeenCalledWith('1', 'Needs senior review');
    expect(mockToastService.showSuccess).toHaveBeenCalled();
  });

  it('should load action history', () => {
    const mockHistory = [
      {
        id: 'action-1',
        action: ModerationAction.APPROVE_CONTENT,
        actor: { id: 'admin1', name: 'Admin', role: 'ADMIN' },
        timestamp: '2026-04-10T10:00:00Z',
      },
    ];
    mockModerationService.getActionHistory.and.returnValue(of(mockHistory));

    fixture.detectChanges();
    expect(component.actionHistory()).toEqual(mockHistory);
  });

  it('should load related reports', () => {
    const mockRelated = [
      {
        id: '2',
        type: ReportType.REVIEW,
        status: ReportStatus.PENDING,
        priority: 'medium' as const,
        reportCount: 2,
        reporter: { id: '102', name: 'María', email: 'maria@example.com' },
        reason: 'Spam',
        createdAt: '2026-04-09T10:00:00Z',
        updatedAt: '2026-04-09T10:00:00Z',
        contentPreview: { title: 'Review Report' },
      },
    ];
    mockModerationService.getRelatedReports.and.returnValue(of(mockRelated));

    fixture.detectChanges();
    expect(component.relatedReports()).toEqual(mockRelated);
  });

  it('should navigate back to queue', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/moderation']);
  });

  it('should navigate to related report', () => {
    component.navigateToRelatedReport('2');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/moderation', '2']);
  });

  it('should determine correct preview component type', () => {
    fixture.detectChanges();

    expect(component.getPreviewComponent()).toBe('review-preview');
    component.report.update((r) => ({ ...r!, type: ReportType.USER }));
    expect(component.getPreviewComponent()).toBe('user-preview');
    component.report.update((r) => ({ ...r!, type: ReportType.RESTAURANT }));
    expect(component.getPreviewComponent()).toBe('restaurant-preview');
    component.report.update((r) => ({ ...r!, type: ReportType.PHOTO }));
    expect(component.getPreviewComponent()).toBe('photo-preview');
    component.report.update((r) => ({ ...r!, type: ReportType.COMMENT }));
    expect(component.getPreviewComponent()).toBe('comment-preview');
  });
});
