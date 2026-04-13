/**
 * Moderation Service Tests
 * Strict TDD: Tests written before implementation
 */

import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ModerationService } from './moderation.service';
import {
  ReportType,
  ReportStatus,
  Priority,
  ReportListItem,
  ReportDetail,
  QueueQuery,
  BulkActionRequest,
  ModerationStatistics,
  ActionHistoryItem,
} from '../../../models/moderation.types';

describe('ModerationService', () => {
  let service: ModerationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModerationService],
    });
    service = TestBed.inject(ModerationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return paginated reports', (done) => {
      const query: QueueQuery = {
        page: 1,
        pageSize: 25,
      };

      service.getAll(query).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.items).toBeInstanceOf(Array);
        expect(response.page).toBe(1);
        expect(response.pageSize).toBe(25);
        expect(response.total).toBeGreaterThan(0);
        expect(response.totalPages).toBeGreaterThan(0);
        done();
      });
    });

    it('should filter by report type', (done) => {
      const query: QueueQuery = {
        page: 1,
        pageSize: 25,
        type: ReportType.REVIEW,
      };

      service.getAll(query).subscribe((response) => {
        expect(response.items.every((item) => item.type === ReportType.REVIEW)).toBe(true);
        done();
      });
    });

    it('should filter by status', (done) => {
      const query: QueueQuery = {
        page: 1,
        pageSize: 25,
        status: ReportStatus.PENDING,
      };

      service.getAll(query).subscribe((response) => {
        expect(response.items.every((item) => item.status === ReportStatus.PENDING)).toBe(true);
        done();
      });
    });

    it('should filter by priority', (done) => {
      const query: QueueQuery = {
        page: 1,
        pageSize: 25,
        priority: Priority.ESCALATED,
      };

      service.getAll(query).subscribe((response) => {
        expect(response.items.every((item) => item.priority === Priority.ESCALATED)).toBe(true);
        done();
      });
    });

    it('should sort by priority (escalated first)', (done) => {
      const query: QueueQuery = {
        page: 1,
        pageSize: 25,
        sortBy: 'priority',
        sortOrder: 'desc',
      };

      service.getAll(query).subscribe((response) => {
        const priorities = response.items.map((item) => item.priority);
        // Escalated should come first
        const escalatedIndex = priorities.indexOf(Priority.ESCALATED);
        const highIndex = priorities.indexOf(Priority.HIGH);
        if (escalatedIndex !== -1 && highIndex !== -1) {
          expect(escalatedIndex).toBeLessThan(highIndex);
        }
        done();
      });
    });

    it('should sort by report count (descending)', (done) => {
      const query: QueueQuery = {
        page: 1,
        pageSize: 25,
        sortBy: 'count',
        sortOrder: 'desc',
      };

      service.getAll(query).subscribe((response) => {
        const counts = response.items.map((item) => item.reportCount);
        for (let i = 0; i < counts.length - 1; i++) {
          expect(counts[i] >= counts[i + 1]).toBe(true);
        }
        done();
      });
    });

    it('should filter by date range', (done) => {
      const query: QueueQuery = {
        page: 1,
        pageSize: 25,
        dateAfter: '2026-04-01',
        dateBefore: '2026-04-30',
      };

      service.getAll(query).subscribe((response) => {
        response.items.forEach((item) => {
          const date = new Date(item.createdAt);
          expect(date.getTime()).toBeGreaterThanOrEqual(new Date('2026-04-01').getTime());
          expect(date.getTime()).toBeLessThanOrEqual(new Date('2026-04-30').getTime());
        });
        done();
      });
    });

    it('should paginate correctly', (done) => {
      const query1: QueueQuery = { page: 1, pageSize: 10 };
      const query2: QueueQuery = { page: 2, pageSize: 10 };

      let page1Ids: string[] = [];

      service.getAll(query1).subscribe((response1) => {
        page1Ids = response1.items.map((item) => item.id);
        expect(response1.items.length).toBeLessThanOrEqual(10);
        expect(response1.page).toBe(1);

        service.getAll(query2).subscribe((response2) => {
          const page2Ids = response2.items.map((item) => item.id);
          expect(response2.items.length).toBeLessThanOrEqual(10);
          expect(response2.page).toBe(2);
          // Pages should have different items
          const hasOverlap = page1Ids.some((id) => page2Ids.includes(id));
          expect(hasOverlap).toBe(false);
          done();
        });
      });
    });
  });

  describe('getById', () => {
    it('should return report detail by ID', (done) => {
      service.getById('1').subscribe((report) => {
        expect(report).toBeDefined();
        expect(report.id).toBe('1');
        expect(report.content).toBeDefined();
        expect(report.actionHistory).toBeInstanceOf(Array);
        expect(report.relatedReports).toBeInstanceOf(Array);
        done();
      });
    });

    it('should throw error for non-existent ID', (done) => {
      service.getById('999999').subscribe({
        next: () => {
          fail('Should have thrown an error');
        },
        error: (error) => {
          expect(error).toBeDefined();
          expect(error.message).toContain('not found');
          done();
        },
      });
    });

    it('should include user content for user reports', (done) => {
      service.getById('1').subscribe((report) => {
        if (report.type === ReportType.USER) {
          expect(report.content.user).toBeDefined();
          expect(report.content.user?.id).toBeDefined();
          expect(report.content.user?.name).toBeDefined();
          expect(report.content.user?.statistics).toBeDefined();
        }
        done();
      });
    });

    it('should include review content for review reports', (done) => {
      service.getById('3').subscribe((report) => {
        if (report.type === ReportType.REVIEW) {
          expect(report.content.review).toBeDefined();
          expect(report.content.review?.id).toBeDefined();
          expect(report.content.review?.rating).toBeDefined();
          expect(report.content.review?.text).toBeDefined();
          expect(report.content.review?.photos).toBeInstanceOf(Array);
        }
        done();
      });
    });

    it('should include restaurant content for restaurant reports', (done) => {
      service.getById('2').subscribe((report) => {
        if (report.type === ReportType.RESTAURANT) {
          expect(report.content.restaurant).toBeDefined();
          expect(report.content.restaurant?.id).toBeDefined();
          expect(report.content.restaurant?.name).toBeDefined();
          expect(report.content.restaurant?.photos).toBeInstanceOf(Array);
        }
        done();
      });
    });

    it('should include photo content for photo reports', (done) => {
      service.getById('6').subscribe((report) => {
        if (report.type === ReportType.PHOTO) {
          expect(report.content.photo).toBeDefined();
          expect(report.content.photo?.id).toBeDefined();
          expect(report.content.photo?.url).toBeDefined();
          expect(report.content.photo?.uploader).toBeDefined();
        }
        done();
      });
    });

    it('should include comment content for comment reports', (done) => {
      service.getById('7').subscribe((report) => {
        if (report.type === ReportType.COMMENT) {
          expect(report.content.comment).toBeDefined();
          expect(report.content.comment?.id).toBeDefined();
          expect(report.content.comment?.text).toBeDefined();
          expect(report.content.comment?.author).toBeDefined();
        }
        done();
      });
    });
  });

  describe('approveReport', () => {
    it('should approve a report', (done) => {
      service.approveReport('1').subscribe((report) => {
        expect(report.status).toBe(ReportStatus.RESOLVED);
        expect(report.updatedAt).toBeDefined();
        done();
      });
    });

    it('should add action history entry', (done) => {
      service.getById('1').subscribe((before) => {
        const historyLengthBefore = before.actionHistory.length;

        service.approveReport('1').subscribe(() => {
          service.getById('1').subscribe((after) => {
            expect(after.actionHistory.length).toBe(historyLengthBefore + 1);
            expect(after.actionHistory[after.actionHistory.length - 1].action).toBe('approve_content');
            done();
          });
        });
      });
    });
  });

  describe('rejectReport', () => {
    it('should reject a report with reason', (done) => {
      const reason = 'Violates community guidelines';
      service.rejectReport('1', reason).subscribe((report) => {
        expect(report.status).toBe(ReportStatus.RESOLVED);
        expect(report.updatedAt).toBeDefined();
        done();
      });
    });

    it('should require reason with minimum length', (done) => {
      service.rejectReport('1', 'short').subscribe({
        next: () => {
          fail('Should have thrown validation error');
        },
        error: (error) => {
          expect(error.message).toContain('Reason is required');
          done();
        },
      });
    });

    it('should add action history with reason', (done) => {
      const reason = 'Inappropriate content';
      service.getById('1').subscribe((before) => {
        const historyLengthBefore = before.actionHistory.length;

        service.rejectReport('1', reason).subscribe(() => {
          service.getById('1').subscribe((after) => {
            expect(after.actionHistory.length).toBe(historyLengthBefore + 1);
            expect(after.actionHistory[after.actionHistory.length - 1].action).toBe('reject_report');
            expect(after.actionHistory[after.actionHistory.length - 1].reason).toBe(reason);
            done();
          });
        });
      });
    });
  });

  describe('dismissReport', () => {
    it('should dismiss a report', (done) => {
      service.dismissReport('1').subscribe((report) => {
        expect(report.status).toBe(ReportStatus.DISMISSED);
        expect(report.updatedAt).toBeDefined();
        done();
      });
    });

    it('should add action history entry', (done) => {
      service.getById('1').subscribe((before) => {
        const historyLengthBefore = before.actionHistory.length;

        service.dismissReport('1').subscribe(() => {
          service.getById('1').subscribe((after) => {
            expect(after.actionHistory.length).toBe(historyLengthBefore + 1);
            expect(after.actionHistory[after.actionHistory.length - 1].action).toBe('dismiss_report');
            done();
          });
        });
      });
    });
  });

  describe('escalateReport', () => {
    it('should escalate a report', (done) => {
      service.escalateReport('1', 'Requires admin review').subscribe((report) => {
        expect(report.priority).toBe(Priority.ESCALATED);
        expect(report.escalatedAt).toBeDefined();
        expect(report.escalatedBy).toBeDefined();
        done();
      });
    });

    it('should add action history with escalation reason', (done) => {
      const reason = 'Complex case requires senior review';
      service.getById('1').subscribe((before) => {
        const historyLengthBefore = before.actionHistory.length;

        service.escalateReport('1', reason).subscribe(() => {
          service.getById('1').subscribe((after) => {
            expect(after.actionHistory.length).toBe(historyLengthBefore + 1);
            expect(after.actionHistory[after.actionHistory.length - 1].action).toBe('escalate');
            expect(after.actionHistory[after.actionHistory.length - 1].reason).toBe(reason);
            done();
          });
        });
      });
    });
  });

  describe('bulkAction', () => {
    const request: BulkActionRequest = {
      action: 'approve',
      reportIds: ['1', '2', '3'],
    };

    it('should perform bulk approve action', (done) => {
      service.bulkAction(request).subscribe((response) => {
        expect(response.successCount).toBe(3);
        expect(response.failedCount).toBe(0);
        expect(response.failedIds).toHaveLength(0);
        done();
      });
    });

    it('should perform bulk dismiss action', (done) => {
      const dismissRequest: BulkActionRequest = {
        action: 'dismiss',
        reportIds: ['4', '5'],
      };

      service.bulkAction(dismissRequest).subscribe((response) => {
        expect(response.successCount).toBe(2);
        done();
      });
    });

    it('should perform bulk reject action with reason', (done) => {
      const rejectRequest: BulkActionRequest = {
        action: 'reject',
        reportIds: ['6', '7'],
        reason: 'Multiple violations',
      };

      service.bulkAction(rejectRequest).subscribe((response) => {
        expect(response.successCount).toBe(2);
        done();
      });
    });

    it('should handle partial failure gracefully', (done) => {
      const partialRequest: BulkActionRequest = {
        action: 'approve',
        reportIds: ['1', '999999', '3'], // 999999 doesn't exist
      };

      service.bulkAction(partialRequest).subscribe((response) => {
        expect(response.successCount).toBeGreaterThan(0);
        expect(response.failedCount).toBeGreaterThan(0);
        expect(response.failedIds).toContain('999999');
        expect(response.errors).toBeInstanceOf(Array);
        done();
      });
    });
  });

  describe('getStatistics', () => {
    it('should return moderation statistics', (done) => {
      service.getStatistics().subscribe((stats) => {
        expect(stats).toBeDefined();
        expect(stats.pendingCount).toBeGreaterThanOrEqual(0);
        expect(stats.inReviewCount).toBeGreaterThanOrEqual(0);
        expect(stats.escalatedCount).toBeGreaterThanOrEqual(0);
        expect(stats.todayResolved).toBeGreaterThanOrEqual(0);
        expect(stats.avgResolutionTime).toBeGreaterThanOrEqual(0);
        expect(stats.totalReportsThisMonth).toBeGreaterThanOrEqual(0);
        done();
      });
    });

    it('should calculate statistics correctly', (done) => {
      service.getAll({ page: 1, pageSize: 100 }).subscribe((reports) => {
        const pendingCount = reports.items.filter((r) => r.status === ReportStatus.PENDING).length;
        const escalatedCount = reports.items.filter((r) => r.priority === Priority.ESCALATED).length;

        service.getStatistics().subscribe((stats) => {
          expect(stats.pendingCount).toBe(pendingCount);
          expect(stats.escalatedCount).toBe(escalatedCount);
          done();
        });
      });
    });
  });

  describe('getActionHistory', () => {
    it('should return action history for report', (done) => {
      service.getActionHistory('1').subscribe((history) => {
        expect(history).toBeInstanceOf(Array);
        history.forEach((item) => {
          expect(item.id).toBeDefined();
          expect(item.action).toBeDefined();
          expect(item.actor).toBeDefined();
          expect(item.timestamp).toBeDefined();
        });
        done();
      });
    });

    it('should be ordered by timestamp descending', (done) => {
      service.getActionHistory('1').subscribe((history) => {
        for (let i = 0; i < history.length - 1; i++) {
          const date1 = new Date(history[i].timestamp);
          const date2 = new Date(history[i + 1].timestamp);
          expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
        }
        done();
      });
    });
  });

  describe('getRelatedReports', () => {
    it('should return related reports', (done) => {
      service.getRelatedReports('1').subscribe((reports) => {
        expect(reports).toBeInstanceOf(Array);
        reports.forEach((report) => {
          expect(report.id).toBeDefined();
          expect(report.type).toBeDefined();
          expect(report.status).toBeDefined();
        });
        done();
      });
    });

    it('should not include the report itself', (done) => {
      service.getRelatedReports('1').subscribe((reports) => {
        const hasSelf = reports.some((r) => r.id === '1');
        expect(hasSelf).toBe(false);
        done();
      });
    });
  });

  describe('priority calculation', () => {
    it('should calculate priority score correctly', (done) => {
      service.getAll({ page: 1, pageSize: 25, sortBy: 'priority', sortOrder: 'desc' }).subscribe((response) => {
        // Escalated reports should come first
        const escalatedReports = response.items.filter((r) => r.priority === Priority.ESCALATED);
        const nonEscalatedReports = response.items.filter((r) => r.priority !== Priority.ESCALATED);

        // Within non-escalated, higher report count should come first
        for (let i = 0; i < nonEscalatedReports.length - 1; i++) {
          expect(
            nonEscalatedReports[i].reportCount >= nonEscalatedReports[i + 1].reportCount
          ).toBe(true);
        }

        done();
      });
    });

    it('should prioritize escalated reports above all', (done) => {
      service.getAll({ page: 1, pageSize: 25, sortBy: 'priority', sortOrder: 'desc' }).subscribe((response) => {
        const hasEscalated = response.items.some((r) => r.priority === Priority.ESCALATED);
        if (hasEscalated) {
          const firstEscalatedIndex = response.items.findIndex((r) => r.priority === Priority.ESCALATED);
          // All items before first escalated should also be escalated
          for (let i = 0; i < firstEscalatedIndex; i++) {
            expect(response.items[i].priority).toBe(Priority.ESCALATED);
          }
        }
        done();
      });
    });
  });
});
