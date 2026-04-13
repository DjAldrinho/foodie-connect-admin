/**
 * Moderation Queue Component Tests
 * Strict TDD: Tests written before implementation
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, Observable } from 'rxjs';
import { ModerationQueueComponent } from './moderation-queue.component';
import { ModerationService } from '../services/moderation.service';
import { SelectionService, ToastNotificationService } from '../../../../core/services';
import { Router } from '@angular/router';
import { ReportType, ReportStatus, Priority } from '../../../models/moderation.types';

describe('ModerationQueueComponent', () => {
  let component: ModerationQueueComponent;
  let fixture: ComponentFixture<ModerationQueueComponent>;
  let mockModerationService: jasmine.SpyObj<ModerationService>;
  let mockSelectionService: jasmine.SpyObj<SelectionService>;
  let mockToastService: jasmine.SpyObj<ToastNotificationService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockModerationService = jasmine.createSpyObj('ModerationService', [
      'getAll',
      'getStatistics',
      'bulkAction',
    ]);
    mockSelectionService = jasmine.createSpyObj('SelectionService', [
      'getSelections',
      'clearSelections',
      'setSelected',
      'toggleSelection',
    ]);
    mockToastService = jasmine.createSpyObj('ToastNotificationService', [
      'showSuccess',
      'showError',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Setup default mock returns
    mockModerationService.getAll.and.returnValue(
      of({
        items: [],
        total: 0,
        page: 1,
        pageSize: 25,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      })
    );
    mockModerationService.getStatistics.and.returnValue(
      of({
        pendingCount: 10,
        inReviewCount: 5,
        escalatedCount: 2,
        todayResolved: 8,
        avgResolutionTime: 24,
        totalReportsThisMonth: 45,
      })
    );
    mockSelectionService.getSelections.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [ModerationQueueComponent, ReactiveFormsModule],
      providers: [
        { provide: ModerationService, useValue: mockModerationService },
        { provide: SelectionService, useValue: mockSelectionService },
        { provide: ToastNotificationService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModerationQueueComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load reports on init', () => {
    fixture.detectChanges();
    expect(mockModerationService.getAll).toHaveBeenCalled();
  });

  it('should load statistics on init', () => {
    fixture.detectChanges();
    expect(mockModerationService.getStatistics).toHaveBeenCalled();
    expect(component.statistics()).toBeDefined();
  });

  it('should have correct default filters', () => {
    fixture.detectChanges();
    expect(component.filters()).toEqual({
      type: undefined,
      status: undefined,
      priority: undefined,
    });
  });

  it('should have correct pagination state', () => {
    fixture.detectChanges();
    expect(component.pagination()).toEqual({
      page: 1,
      pageSize: 25,
      sortBy: 'priority',
      sortOrder: 'desc',
    });
  });

  it('should apply type filter', () => {
    fixture.detectChanges();
    component.applyFilter('type', ReportType.REVIEW);
    expect(component.filters().type).toBe(ReportType.REVIEW);
    expect(mockModerationService.getAll).toHaveBeenCalled();
  });

  it('should apply status filter', () => {
    fixture.detectChanges();
    component.applyFilter('status', ReportStatus.PENDING);
    expect(component.filters().status).toBe(ReportStatus.PENDING);
  });

  it('should apply priority filter', () => {
    fixture.detectChanges();
    component.applyFilter('priority', Priority.ESCALATED);
    expect(component.filters().priority).toBe(Priority.ESCALATED);
  });

  it('should clear all filters', () => {
    fixture.detectChanges();
    component.applyFilter('type', ReportType.REVIEW);
    component.applyFilter('status', ReportStatus.PENDING);
    component.clearFilters();
    expect(component.filters().type).toBeUndefined();
    expect(component.filters().status).toBeUndefined();
  });

  it('should change page', () => {
    fixture.detectChanges();
    component.changePage(2);
    expect(component.pagination().page).toBe(2);
    expect(mockModerationService.getAll).toHaveBeenCalled();
  });

  it('should change sort', () => {
    fixture.detectChanges();
    component.changeSort('count');
    expect(component.pagination().sortBy).toBe('count');
  });

  it('should navigate to report detail', () => {
    fixture.detectChanges();
    component.navigateToReport('123');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/moderation', '123']);
  });

  it('should toggle selection', () => {
    fixture.detectChanges();
    component.toggleSelection('123');
    expect(mockSelectionService.toggleSelection).toHaveBeenCalledWith('123');
  });

  it('should check if report is selected', () => {
    mockSelectionService.getSelections.and.returnValue(['123', '456']);
    fixture.detectChanges();
    expect(component.isSelected('123')).toBe(true);
    expect(component.isSelected('789')).toBe(false);
  });

  it('should get selected count', () => {
    mockSelectionService.getSelections.and.returnValue(['123', '456', '789']);
    fixture.detectChanges();
    expect(component.selectedCount()).toBe(3);
  });

  it('should perform bulk approve action', () => {
    mockSelectionService.getSelections.and.returnValue(['123', '456']);
    mockModerationService.bulkAction.and.returnValue(
      of({
        successCount: 2,
        failedCount: 0,
        failedIds: [],
        errors: [],
      })
    );

    fixture.detectChanges();
    component.performBulkAction('approve');

    expect(mockModerationService.bulkAction).toHaveBeenCalledWith({
      action: 'approve',
      reportIds: ['123', '456'],
    });
    expect(mockToastService.showSuccess).toHaveBeenCalled();
    expect(mockSelectionService.clearSelections).toHaveBeenCalled();
  });

  it('should perform bulk dismiss action', () => {
    mockSelectionService.getSelections.and.returnValue(['123', '456']);
    mockModerationService.bulkAction.and.returnValue(
      of({
        successCount: 2,
        failedCount: 0,
        failedIds: [],
        errors: [],
      })
    );

    fixture.detectChanges();
    component.performBulkAction('dismiss');

    expect(mockModerationService.bulkAction).toHaveBeenCalledWith({
      action: 'dismiss',
      reportIds: ['123', '456'],
    });
  });

  it('should handle bulk action with partial failures', () => {
    mockSelectionService.getSelections.and.returnValue(['123', '456', '789']);
    mockModerationService.bulkAction.and.returnValue(
      of({
        successCount: 2,
        failedCount: 1,
        failedIds: ['789'],
        errors: [{ id: '789', error: 'Report not found' }],
      })
    );

    fixture.detectChanges();
    component.performBulkAction('approve');

    expect(mockToastService.showSuccess).toHaveBeenCalled();
    expect(mockToastService.showError).toHaveBeenCalled();
  });

  it('should refresh queue', () => {
    fixture.detectChanges();
    component.refreshQueue();
    expect(mockModerationService.getAll).toHaveBeenCalled();
  });

  it('should track reports by ID', () => {
    fixture.detectChanges();
    const report1 = { id: '123' } as any;
    const report2 = { id: '456' } as any;
    expect(component.trackReport(0, report1)).toBe('123');
    expect(component.trackReport(1, report2)).toBe('456');
  });

  it('should show loading state initially', () => {
    fixture.detectChanges();
    expect(component.isLoading()).toBe(true);
  });

  it('should hide loading state after data loads', () => {
    mockModerationService.getAll.and.returnValue(
      of({
        items: [{ id: '1' } as any],
        total: 1,
        page: 1,
        pageSize: 25,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      })
    );

    fixture.detectChanges();
    // After subscription completes, loading should be false
    expect(component.isLoading()).toBe(false);
  });

  it('should handle error state', () => {
    mockModerationService.getAll.and.returnValue(
      new Observable((observer) => {
        observer.error(new Error('Network error'));
      })
    );

    fixture.detectChanges();
    expect(component.hasError()).toBe(true);
  });

  it('should auto-refresh queue every 60 seconds', (done) => {
    jasmine.clock().install();
    fixture.detectChanges();

    const initialCallCount = mockModerationService.getAll.calls.count();

    // Fast forward 60 seconds
    jasmine.clock().tick(60000);

    setTimeout(() => {
      expect(mockModerationService.getAll.calls.count()).toBeGreaterThan(initialCallCount);
      jasmine.clock().uninstall();
      done();
    }, 100);
  });
});
