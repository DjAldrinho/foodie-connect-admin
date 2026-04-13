/**
 * Moderation Service
 * Handles all moderation queue operations with mock data
 */

import { Injectable, signal } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { BaseService } from '../../../core/services/base.service';
import type {
  Report,
  ReportListItem,
  ReportDetail,
  QueueQuery,
  ModerationBulkActionRequest,
  BulkActionResponse,
  ModerationStatistics,
  ActionHistoryItem,
} from '../../../../models/moderation.types';
import type { PaginatedResponse, PaginationParams } from '../../../models/common.types';
import {
  ReportType,
  ReportStatus,
  Priority,
  ModerationAction,
} from '../../../../models/moderation.types';

/**
 * Mock reports data (30 sample reports)
 */
const MOCK_REPORTS: Report[] = [
  // User reports
  {
    id: '1',
    type: ReportType.USER,
    status: ReportStatus.PENDING,
    priority: Priority.HIGH,
    reportCount: 5,
    reporter: { id: '101', name: 'Juan Pérez', email: 'juan@example.com', avatar: 'https://i.pravatar.cc/150?img=1' },
    reason: 'Fake profile',
    description: 'This user appears to be using a fake identity and stolen photos',
    createdAt: '2026-04-10T10:00:00Z',
    updatedAt: '2026-04-10T10:00:00Z',
  },
  {
    id: '2',
    type: ReportType.USER,
    status: ReportStatus.PENDING,
    priority: Priority.MEDIUM,
    reportCount: 2,
    reporter: { id: '102', name: 'María García', email: 'maria@example.com', avatar: 'https://i.pravatar.cc/150?img=2' },
    reason: 'Spam behavior',
    description: 'User is posting spam content across multiple restaurants',
    createdAt: '2026-04-09T14:30:00Z',
    updatedAt: '2026-04-09T14:30:00Z',
  },
  // Restaurant reports
  {
    id: '3',
    type: ReportType.RESTAURANT,
    status: ReportStatus.PENDING,
    priority: Priority.ESCALATED,
    reportCount: 8,
    reporter: { id: '103', name: 'Carlos López', email: 'carlos@example.com', avatar: 'https://i.pravatar.cc/150?img=3' },
    reason: 'Fake restaurant',
    description: 'This restaurant does not exist, photos are stolen from other websites',
    createdAt: '2026-04-11T09:15:00Z',
    updatedAt: '2026-04-11T09:15:00Z',
    escalatedAt: '2026-04-11T10:00:00Z',
    escalatedBy: { id: 'admin1', name: 'Admin User' },
  },
  {
    id: '4',
    type: ReportType.RESTAURANT,
    status: ReportStatus.IN_REVIEW,
    priority: Priority.HIGH,
    reportCount: 4,
    reporter: { id: '104', name: 'Ana Martínez', email: 'ana@example.com', avatar: 'https://i.pravatar.cc/150?img=4' },
    reason: 'Inappropriate content',
    description: 'Restaurant description contains offensive language',
    createdAt: '2026-04-08T16:45:00Z',
    updatedAt: '2026-04-09T10:30:00Z',
  },
  // Review reports
  {
    id: '5',
    type: ReportType.REVIEW,
    status: ReportStatus.PENDING,
    priority: Priority.HIGH,
    reportCount: 6,
    reporter: { id: '105', name: 'Luis Rodríguez', email: 'luis@example.com', avatar: 'https://i.pravatar.cc/150?img=5' },
    reason: 'Fake review',
    description: 'This review is clearly fake, user never visited the restaurant',
    createdAt: '2026-04-10T11:20:00Z',
    updatedAt: '2026-04-10T11:20:00Z',
  },
  {
    id: '6',
    type: ReportType.REVIEW,
    status: ReportStatus.PENDING,
    priority: Priority.MEDIUM,
    reportCount: 2,
    reporter: { id: '106', name: 'Carmen Sánchez', email: 'carmen@example.com', avatar: 'https://i.pravatar.cc/150?img=6' },
    reason: 'Competitor sabotage',
    description: 'Appears to be a competitor leaving fake negative reviews',
    createdAt: '2026-04-09T13:10:00Z',
    updatedAt: '2026-04-09T13:10:00Z',
  },
  // Photo reports
  {
    id: '7',
    type: ReportType.PHOTO,
    status: ReportStatus.PENDING,
    priority: Priority.LOW,
    reportCount: 1,
    reporter: { id: '107', name: 'Javier Fernández', email: 'javier@example.com', avatar: 'https://i.pravatar.cc/150?img=7' },
    reason: 'Inappropriate photo',
    description: 'Photo contains inappropriate content',
    createdAt: '2026-04-08T10:30:00Z',
    updatedAt: '2026-04-08T10:30:00Z',
  },
  {
    id: '8',
    type: ReportType.PHOTO,
    status: ReportStatus.PENDING,
    priority: Priority.MEDIUM,
    reportCount: 3,
    reporter: { id: '108', name: 'Laura Gómez', email: 'laura@example.com', avatar: 'https://i.pravatar.cc/150?img=8' },
    reason: 'Stolen photo',
    description: 'This photo was stolen from another restaurant\'s profile',
    createdAt: '2026-04-09T15:45:00Z',
    updatedAt: '2026-04-09T15:45:00Z',
  },
  // Comment reports
  {
    id: '9',
    type: ReportType.COMMENT,
    status: ReportStatus.PENDING,
    priority: Priority.LOW,
    reportCount: 1,
    reporter: { id: '109', name: 'Diego Díaz', email: 'diego@example.com', avatar: 'https://i.pravatar.cc/150?img=9' },
    reason: 'Offensive language',
    description: 'Comment contains offensive and discriminatory language',
    createdAt: '2026-04-07T12:00:00Z',
    updatedAt: '2026-04-07T12:00:00Z',
  },
  {
    id: '10',
    type: ReportType.COMMENT,
    status: ReportStatus.IN_REVIEW,
    priority: Priority.MEDIUM,
    reportCount: 2,
    reporter: { id: '110', name: 'Patricia Ruiz', email: 'patricia@example.com', avatar: 'https://i.pravatar.cc/150?img=10' },
    reason: 'Spam comment',
    description: 'Comment is promotional spam',
    createdAt: '2026-04-08T14:20:00Z',
    updatedAt: '2026-04-09T09:00:00Z',
  },
  // More reports to reach 30
  {
    id: '11',
    type: ReportType.USER,
    status: ReportStatus.RESOLVED,
    priority: Priority.LOW,
    reportCount: 1,
    reporter: { id: '111', name: 'Miguel Castro', email: 'miguel@example.com', avatar: 'https://i.pravatar.cc/150?img=11' },
    reason: 'Harassment',
    description: 'User is harassing other users',
    createdAt: '2026-04-05T10:00:00Z',
    updatedAt: '2026-04-06T14:30:00Z',
  },
  {
    id: '12',
    type: ReportType.RESTAURANT,
    status: ReportStatus.DISMISSED,
    priority: Priority.LOW,
    reportCount: 1,
    reporter: { id: '112', name: 'Isabel Ramos', email: 'isabel@example.com', avatar: 'https://i.pravatar.cc/150?img=12' },
    reason: 'Duplicate listing',
    description: 'This restaurant is already listed under a different name',
    createdAt: '2026-04-06T11:30:00Z',
    updatedAt: '2026-04-07T09:15:00Z',
  },
  {
    id: '13',
    type: ReportType.REVIEW,
    status: ReportStatus.RESOLVED,
    priority: Priority.MEDIUM,
    reportCount: 3,
    reporter: { id: '113', name: 'Raúl Morales', email: 'raul@example.com', avatar: 'https://i.pravatar.cc/150?img=13' },
    reason: 'Defamatory content',
    description: 'Review contains false and defamatory statements',
    createdAt: '2026-04-07T08:45:00Z',
    updatedAt: '2026-04-08T10:20:00Z',
  },
  {
    id: '14',
    type: ReportType.USER,
    status: ReportStatus.PENDING,
    priority: Priority.HIGH,
    reportCount: 4,
    reporter: { id: '114', name: 'Teresa Torres', email: 'teresa@example.com', avatar: 'https://i.pravatar.cc/150?img=14' },
    reason: 'Multiple accounts',
    description: 'User is operating multiple accounts to manipulate ratings',
    createdAt: '2026-04-10T16:00:00Z',
    updatedAt: '2026-04-10T16:00:00Z',
  },
  {
    id: '15',
    type: ReportType.RESTAURANT,
    status: ReportStatus.PENDING,
    priority: Priority.ESCALATED,
    reportCount: 10,
    reporter: { id: '115', name: 'Fernando Ortega', email: 'fernando@example.com', avatar: 'https://i.pravatar.cc/150?img=15' },
    reason: 'Illegal business',
    description: 'Restaurant is operating without proper licenses',
    createdAt: '2026-04-11T07:30:00Z',
    updatedAt: '2026-04-11T07:30:00Z',
    escalatedAt: '2026-04-11T08:00:00Z',
    escalatedBy: { id: 'admin2', name: 'Super Admin' },
  },
  {
    id: '16',
    type: ReportType.PHOTO,
    status: ReportStatus.PENDING,
    priority: Priority.LOW,
    reportCount: 1,
    reporter: { id: '116', name: 'Lucía Ramírez', email: 'lucia@example.com', avatar: 'https://i.pravatar.cc/150?img=16' },
    reason: 'Copyright violation',
    description: 'Photo is copyrighted material',
    createdAt: '2026-04-09T09:00:00Z',
    updatedAt: '2026-04-09T09:00:00Z',
  },
  {
    id: '17',
    type: ReportType.COMMENT,
    status: ReportStatus.PENDING,
    priority: Priority.MEDIUM,
    reportCount: 2,
    reporter: { id: '117', name: 'Pedro Jiménez', email: 'pedro@example.com', avatar: 'https://i.pravatar.cc/150?img=17' },
    reason: 'Threatening language',
    description: 'Comment contains threats towards other users',
    createdAt: '2026-04-10T13:30:00Z',
    updatedAt: '2026-04-10T13:30:00Z',
  },
  {
    id: '18',
    type: ReportType.USER,
    status: ReportStatus.IN_REVIEW,
    priority: Priority.HIGH,
    reportCount: 3,
    reporter: { id: '118', name: 'Sofia Martín', email: 'sofia@example.com', avatar: 'https://i.pravatar.cc/150?img=18' },
    reason: 'Impersonation',
    description: 'User is impersonating someone else',
    createdAt: '2026-04-09T11:00:00Z',
    updatedAt: '2026-04-10T08:30:00Z',
  },
  {
    id: '19',
    type: ReportType.REVIEW,
    status: ReportStatus.PENDING,
    priority: Priority.LOW,
    reportCount: 1,
    reporter: { id: '119', name: 'Diego Moreno', email: 'diego.moreno@example.com', avatar: 'https://i.pravatar.cc/150?img=19' },
    reason: 'Off-topic review',
    description: 'Review is not related to the restaurant',
    createdAt: '2026-04-08T15:15:00Z',
    updatedAt: '2026-04-08T15:15:00Z',
  },
  {
    id: '20',
    type: ReportType.RESTAURANT,
    status: ReportStatus.PENDING,
    priority: Priority.MEDIUM,
    reportCount: 2,
    reporter: { id: '120', name: 'Elena Castro', email: 'elena@example.com', avatar: 'https://i.pravatar.cc/150?img=20' },
    reason: 'Misleading information',
    description: 'Restaurant listing has misleading information about prices and location',
    createdAt: '2026-04-09T10:45:00Z',
    updatedAt: '2026-04-09T10:45:00Z',
  },
  {
    id: '21',
    type: ReportType.PHOTO,
    status: ReportStatus.PENDING,
    priority: Priority.LOW,
    reportCount: 1,
    reporter: { id: '121', name: 'Ricardo Flores', email: 'ricardo@example.com', avatar: 'https://i.pravatar.cc/150?img=21' },
    reason: 'Poor quality',
    description: 'Photo is very low quality and does not show the restaurant properly',
    createdAt: '2026-04-07T14:00:00Z',
    updatedAt: '2026-04-07T14:00:00Z',
  },
  {
    id: '22',
    type: ReportType.COMMENT,
    status: ReportStatus.PENDING,
    priority: Priority.LOW,
    reportCount: 1,
    reporter: { id: '122', name: 'Andrés Vega', email: 'andres@example.com', avatar: 'https://i.pravatar.cc/150?img=22' },
    reason: 'Irrelevant comment',
    description: 'Comment has nothing to do with the review or restaurant',
    createdAt: '2026-04-08T16:30:00Z',
    updatedAt: '2026-04-08T16:30:00Z',
  },
  {
    id: '23',
    type: ReportType.USER,
    status: ReportStatus.PENDING,
    priority: Priority.MEDIUM,
    reportCount: 2,
    reporter: { id: '123', name: 'Carla Medina', email: 'carla@example.com', avatar: 'https://i.pravatar.cc/150?img=23' },
    reason: 'Suspicious activity',
    description: 'User account shows suspicious login patterns',
    createdAt: '2026-04-10T09:30:00Z',
    updatedAt: '2026-04-10T09:30:00Z',
  },
  {
    id: '24',
    type: ReportType.REVIEW,
    status: ReportStatus.PENDING,
    priority: Priority.HIGH,
    reportCount: 5,
    reporter: { id: '124', name: 'Roberto Santos', email: 'roberto@example.com', avatar: 'https://i.pravatar.cc/150?img=24' },
    reason: 'Paid review',
    description: 'Evidence suggests this is a paid review',
    createdAt: '2026-04-11T12:00:00Z',
    updatedAt: '2026-04-11T12:00:00Z',
  },
  {
    id: '25',
    type: ReportType.RESTAURANT,
    status: ReportStatus.PENDING,
    priority: Priority.MEDIUM,
    reportCount: 2,
    reporter: { id: '125', name: 'Patricia Cruz', email: 'patricia.cruz@example.com', avatar: 'https://i.pravatar.cc/150?img=25' },
    reason: 'Closed restaurant',
    description: 'This restaurant has permanently closed',
    createdAt: '2026-04-09T11:15:00Z',
    updatedAt: '2026-04-09T11:15:00Z',
  },
  {
    id: '26',
    type: ReportType.USER,
    status: ReportStatus.PENDING,
    priority: Priority.LOW,
    reportCount: 1,
    reporter: { id: '126', name: 'Jorge Vargas', email: 'jorge@example.com', avatar: 'https://i.pravatar.cc/150?img=26' },
    reason: 'Incomplete profile',
    description: 'User profile lacks required information',
    createdAt: '2026-04-08T10:00:00Z',
    updatedAt: '2026-04-08T10:00:00Z',
  },
  {
    id: '27',
    type: ReportType.PHOTO,
    status: ReportStatus.PENDING,
    priority: Priority.LOW,
    reportCount: 1,
    reporter: { id: '127', name: 'Monica León', email: 'monica@example.com', avatar: 'https://i.pravatar.cc/150?img=27' },
    reason: 'Wrong restaurant',
    description: 'Photo does not belong to this restaurant',
    createdAt: '2026-04-07T15:30:00Z',
    updatedAt: '2026-04-07T15:30:00Z',
  },
  {
    id: '28',
    type: ReportType.COMMENT,
    status: ReportStatus.PENDING,
    priority: Priority.MEDIUM,
    reportCount: 2,
    reporter: { id: '128', name: 'Gabriel Herrera', email: 'gabriel@example.com', avatar: 'https://i.pravatar.cc/150?img=28' },
    reason: 'Personal attack',
    description: 'Comment contains personal attacks against the reviewer',
    createdAt: '2026-04-10T14:45:00Z',
    updatedAt: '2026-04-10T14:45:00Z',
  },
  {
    id: '29',
    type: ReportType.REVIEW,
    status: ReportStatus.PENDING,
    priority: Priority.MEDIUM,
    reportCount: 3,
    reporter: { id: '129', name: 'Daniela Romero', email: 'daniela@example.com', avatar: 'https://i.pravatar.cc/150?img=29' },
    reason: 'Violates guidelines',
    description: 'Review violates community guidelines in multiple ways',
    createdAt: '2026-04-09T16:20:00Z',
    updatedAt: '2026-04-09T16:20:00Z',
  },
  {
    id: '30',
    type: ReportType.USER,
    status: ReportStatus.PENDING,
    priority: Priority.HIGH,
    reportCount: 4,
    reporter: { id: '130', name: 'Federico Ortiz', email: 'federico@example.com', avatar: 'https://i.pravatar.cc/150?img=30' },
    reason: 'Bot activity',
    description: 'Account shows clear signs of bot activity',
    createdAt: '2026-04-11T10:30:00Z',
    updatedAt: '2026-04-11T10:30:00Z',
  },
];

@Injectable({
  providedIn: 'root',
})
export class ModerationService extends BaseService<Report> {
  // In-memory storage for mock data
  private reportsSignal = signal<Report[]>([...MOCK_REPORTS]);
  private actionHistorySignal = signal<Map<string, ActionHistoryItem[]>>(new Map());

  constructor() {
    super('moderation');
    this.initializeActionHistory();
  }

  /**
   * Initialize action history for all reports
   */
  private initializeActionHistory(): void {
    const history = new Map<string, ActionHistoryItem[]>();

    MOCK_REPORTS.forEach((report) => {
      if (report.status === ReportStatus.RESOLVED || report.status === ReportStatus.DISMISSED) {
        history.set(report.id, [
          {
            id: `${report.id}-action-1`,
            action: report.status === ReportStatus.RESOLVED ? ModerationAction.APPROVE_CONTENT : ModerationAction.DISMISS_REPORT,
            actor: { id: 'admin1', name: 'Admin User', role: 'ADMIN' },
            timestamp: report.updatedAt,
            reason: report.status === ReportStatus.RESOLVED ? 'Content reviewed and approved' : 'Report dismissed after review',
          },
        ]);
      } else if (report.status === ReportStatus.IN_REVIEW) {
        history.set(report.id, [
          {
            id: `${report.id}-action-1`,
            action: ModerationAction.ESCALATE,
            actor: { id: 'admin1', name: 'Admin User', role: 'ADMIN' },
            timestamp: report.updatedAt,
            reason: 'Moved to in-review queue',
          },
        ]);
      } else {
        history.set(report.id, []);
      }
    });

    this.actionHistorySignal.set(history);
  }

  /**
   * Calculate priority score for sorting
   * Escalated: 1000 + report count × 100 + days × 10
   * Normal: report count × 100 + days × 10
   */
  private calculatePriorityScore(report: Report): number {
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(report.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    const baseScore = report.reportCount * 100 + daysSinceCreation * 10;
    return report.priority === Priority.ESCALATED ? 1000 + baseScore : baseScore;
  }

  /**
   * Get paginated list of reports with filters
   */
  override getAll(
    pagination?: PaginationParams,
    filters?: QueueQuery
  ): Observable<PaginatedResponse<ReportListItem>> {
    const reports = this.reportsSignal();

    // Apply filters
    let filtered = reports.map((report): ReportListItem => ({
      ...report,
      contentPreview: this.generateContentPreview(report),
    }));

    if (filters?.type) {
      filtered = filtered.filter((report) => report.type === filters.type);
    }

    if (filters?.status) {
      filtered = filtered.filter((report) => report.status === filters.status);
    }

    if (filters?.priority) {
      filtered = filtered.filter((report) => report.priority === filters.priority);
    }

    if (filters?.dateAfter) {
      filtered = filtered.filter((report) => report.createdAt >= filters.dateAfter!);
    }

    if (filters?.dateBefore) {
      filtered = filtered.filter((report) => report.createdAt <= filters.dateBefore!);
    }

    // Apply sorting
    const sortBy = filters?.sortBy || 'priority';
    const sortOrder = filters?.sortOrder || 'desc';

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'priority':
          comparison = this.calculatePriorityScore(a) - this.calculatePriorityScore(b);
          break;
        case 'count':
          comparison = a.reportCount - b.reportCount;
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'reporter':
          comparison = a.reporter.name.localeCompare(b.reporter.name);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Apply pagination
    const page = filters?.page || pagination?.page || 1;
    const pageSize = filters?.pageSize || pagination?.pageSize || 25;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return of({
      items,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    }).pipe(delay(500)); // Simulate network delay
  }

  /**
   * Get report by ID with full details
   */
  override getById(id: string): Observable<ReportDetail> {
    const reports = this.reportsSignal();
    const report = reports.find((r) => r.id === id);

    if (!report) {
      return new Observable((observer) => {
        observer.error(new Error('Report not found'));
      });
    }

    const reportDetail: ReportDetail = {
      ...report,
      content: this.generateDetailedContent(report),
      actionHistory: this.actionHistorySignal().get(id) || [],
      relatedReports: this.findRelatedReports(report),
    };

    return of(reportDetail).pipe(delay(300));
  }

  /**
   * Approve a report (marks as resolved)
   */
  approveReport(id: string): Observable<ReportDetail> {
    const reports = this.reportsSignal();
    const reportIndex = reports.findIndex((r) => r.id === id);

    if (reportIndex === -1) {
      return new Observable((observer) => {
        observer.error(new Error('Report not found'));
      });
    }

    const updated = [...reports];
    updated[reportIndex] = {
      ...updated[reportIndex],
      status: ReportStatus.RESOLVED,
      updatedAt: new Date().toISOString(),
    };

    this.reportsSignal.set(updated);
    this.addActionHistoryEntry(id, ModerationAction.APPROVE_CONTENT, 'Content approved after review');

    return this.getById(id).pipe(delay(300));
  }

  /**
   * Reject a report with a reason
   */
  rejectReport(id: string, reason: string): Observable<ReportDetail> {
    if (!reason || reason.length < 10) {
      return new Observable((observer) => {
        observer.error(new Error('Reason is required (min 10 characters)'));
      });
    }

    const reports = this.reportsSignal();
    const reportIndex = reports.findIndex((r) => r.id === id);

    if (reportIndex === -1) {
      return new Observable((observer) => {
        observer.error(new Error('Report not found'));
      });
    }

    const updated = [...reports];
    updated[reportIndex] = {
      ...updated[reportIndex],
      status: ReportStatus.RESOLVED,
      updatedAt: new Date().toISOString(),
    };

    this.reportsSignal.set(updated);
    this.addActionHistoryEntry(id, ModerationAction.REJECT_REPORT, reason);

    return this.getById(id).pipe(delay(300));
  }

  /**
   * Dismiss a report
   */
  dismissReport(id: string): Observable<ReportDetail> {
    const reports = this.reportsSignal();
    const reportIndex = reports.findIndex((r) => r.id === id);

    if (reportIndex === -1) {
      return new Observable((observer) => {
        observer.error(new Error('Report not found'));
      });
    }

    const updated = [...reports];
    updated[reportIndex] = {
      ...updated[reportIndex],
      status: ReportStatus.DISMISSED,
      updatedAt: new Date().toISOString(),
    };

    this.reportsSignal.set(updated);
    this.addActionHistoryEntry(id, ModerationAction.DISMISS_REPORT, 'Report dismissed after review');

    return this.getById(id).pipe(delay(300));
  }

  /**
   * Escalate a report
   */
  escalateReport(id: string, reason?: string): Observable<ReportDetail> {
    const reports = this.reportsSignal();
    const reportIndex = reports.findIndex((r) => r.id === id);

    if (reportIndex === -1) {
      return new Observable((observer) => {
        observer.error(new Error('Report not found'));
      });
    }

    const updated = [...reports];
    updated[reportIndex] = {
      ...updated[reportIndex],
      priority: Priority.ESCALATED,
      status: ReportStatus.IN_REVIEW,
      escalatedAt: new Date().toISOString(),
      escalatedBy: { id: 'current-user', name: 'Current User' },
      updatedAt: new Date().toISOString(),
    };

    this.reportsSignal.set(updated);
    this.addActionHistoryEntry(id, ModerationAction.ESCALATE, reason || 'Report escalated for review');

    return this.getById(id).pipe(delay(300));
  }

  /**
   * Perform bulk action on multiple reports
   */
  bulkAction(request: ModerationBulkActionRequest): Observable<BulkActionResponse> {
    const results: BulkActionResponse = {
      successCount: 0,
      failedCount: 0,
      failedIds: [],
      errors: [],
    };

    const promises = request.reportIds.map((id: string) => {
      return new Promise<void>((resolve) => {
        let action$: Observable<ReportDetail>;

        switch (request.action) {
          case 'approve':
            action$ = this.approveReport(id);
            break;
          case 'reject':
            action$ = this.rejectReport(id, request.reason || 'Bulk rejection');
            break;
          case 'dismiss':
            action$ = this.dismissReport(id);
            break;
          case 'escalate':
            action$ = this.escalateReport(id, request.reason);
            break;
          default:
            action$ = new Observable((observer) => observer.error(new Error('Unknown action')));
        }

        action$.subscribe({
          next: () => {
            results.successCount++;
            resolve();
          },
          error: (error) => {
            results.failedCount++;
            results.failedIds.push(id);
            results.errors.push({ id, error: error.message });
            resolve();
          },
        });
      });
    });

    return new Observable<BulkActionResponse>((observer) => {
      Promise.all(promises).then(() => {
        observer.next(results);
        observer.complete();
      });
    }).pipe(delay(500)) as Observable<BulkActionResponse>;
  }

  /**
   * Get moderation statistics
   */
  getStatistics(): Observable<ModerationStatistics> {
    const reports = this.reportsSignal();
    const today = new Date().toDateString();

    const stats: ModerationStatistics = {
      pendingCount: reports.filter((r) => r.status === ReportStatus.PENDING).length,
      inReviewCount: reports.filter((r) => r.status === ReportStatus.IN_REVIEW).length,
      escalatedCount: reports.filter((r) => r.priority === Priority.ESCALATED).length,
      todayResolved: 0, // Would need to check action history timestamps
      avgResolutionTime: 24, // Mock value
      totalReportsThisMonth: reports.filter((r) => {
        const reportDate = new Date(r.createdAt);
        const now = new Date();
        return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
      }).length,
    };

    return of(stats).pipe(delay(200));
  }

  /**
   * Get action history for a report
   */
  getActionHistory(reportId: string): Observable<ActionHistoryItem[]> {
    const history = this.actionHistorySignal().get(reportId) || [];
    // Sort by timestamp descending
    const sorted = [...history].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    return of(sorted).pipe(delay(200));
  }

  /**
   * Get related reports
   */
  getRelatedReports(reportId: string): Observable<ReportListItem[]> {
    const reports = this.reportsSignal();
    const report = reports.find((r) => r.id === reportId);

    if (!report) {
      return of([]);
    }

    const related = reports
      .filter((r) => r.id !== reportId && r.type === report.type)
      .slice(0, 5)
      .map((r): ReportListItem => ({
        ...r,
        contentPreview: this.generateContentPreview(r),
      }));

    return of(related).pipe(delay(200));
  }

  /**
   * Generate content preview for list view
   */
  private generateContentPreview(report: Report): ReportListItem['contentPreview'] {
    switch (report.type) {
      case ReportType.USER:
        return {
          title: 'User Report',
          description: report.description,
          author: report.reporter.name,
        };
      case ReportType.RESTAURANT:
        return {
          title: 'Restaurant Report',
          description: report.description,
          thumbnail: 'https://picsum.photos/seed/restaurant/150/100',
        };
      case ReportType.REVIEW:
        return {
          title: 'Review Report',
          description: report.description,
          author: report.reporter.name,
        };
      case ReportType.PHOTO:
        return {
          title: 'Photo Report',
          description: report.description,
          thumbnail: 'https://picsum.photos/seed/photo/150/100',
        };
      case ReportType.COMMENT:
        return {
          title: 'Comment Report',
          description: report.description,
          author: report.reporter.name,
        };
    }
  }

  /**
   * Generate detailed content based on report type
   */
  private generateDetailedContent(report: Report): ReportDetail['content'] {
    const baseContent = {
      id: report.id,
      type: report.type,
    };

    switch (report.type) {
      case ReportType.USER:
        return {
          ...baseContent,
          user: {
            id: 'user-1',
            name: 'Reported User',
            email: 'user@example.com',
            avatar: 'https://i.pravatar.cc/150?img=50',
            bio: 'User biography here',
            statistics: {
              totalLogins: 150,
              lastLoginAt: '2026-04-10T09:00:00Z',
              restaurantsCreated: 2,
              reviewsWritten: 25,
              reportsSubmitted: 3,
            },
            createdAt: '2026-01-15T10:00:00Z',
          },
        };

      case ReportType.RESTAURANT:
        return {
          ...baseContent,
          restaurant: {
            id: 'restaurant-1',
            name: 'Reported Restaurant',
            description: 'Restaurant description here',
            address: 'Calle Ejemplo 123, Madrid',
            cuisine: 'Spanish',
            rating: 4.5,
            photos: [
              'https://picsum.photos/seed/rest1/400/300',
              'https://picsum.photos/seed/rest2/400/300',
              'https://picsum.photos/seed/rest3/400/300',
            ],
            owner: {
              id: 'owner-1',
              name: 'Restaurant Owner',
              email: 'owner@example.com',
            },
            createdAt: '2026-02-01T10:00:00Z',
          },
        };

      case ReportType.REVIEW:
        return {
          ...baseContent,
          review: {
            id: 'review-1',
            rating: 5,
            text: 'This is a sample review text that would be displayed in the detail view. It contains the full content of the review that was reported.',
            photos: [
              'https://picsum.photos/seed/review1/400/300',
              'https://picsum.photos/seed/review2/400/300',
            ],
            reviewer: {
              id: 'reviewer-1',
              name: 'Reviewer Name',
              avatar: 'https://i.pravatar.cc/150?img=60',
            },
            restaurant: {
              id: 'restaurant-1',
              name: 'Restaurant Name',
            },
            createdAt: '2026-03-15T14:30:00Z',
          },
        };

      case ReportType.PHOTO:
        return {
          ...baseContent,
          photo: {
            id: 'photo-1',
            url: 'https://picsum.photos/seed/photoreport/800/600',
            caption: 'Sample photo caption',
            exif: {
              camera: 'iPhone 14 Pro',
              dateTaken: '2026-04-01T10:00:00Z',
              location: 'Madrid, Spain',
            },
            uploader: {
              id: 'uploader-1',
              name: 'Uploader Name',
              avatar: 'https://i.pravatar.cc/150?img=70',
            },
            restaurant: {
              id: 'restaurant-1',
              name: 'Restaurant Name',
            },
            uploadedAt: '2026-04-01T10:00:00Z',
          },
        };

      case ReportType.COMMENT:
        return {
          ...baseContent,
          comment: {
            id: 'comment-1',
            text: 'This is the full comment text that was reported for moderation. It may contain offensive or inappropriate content.',
            author: {
              id: 'commenter-1',
              name: 'Commenter Name',
              avatar: 'https://i.pravatar.cc/150?img=80',
            },
            parentType: 'review',
            parentId: 'review-1',
            parentContent: {
              id: 'review-1',
              title: 'Sample Review Title',
              text: 'Sample review content...',
            },
            createdAt: '2026-04-05T16:20:00Z',
          },
        };
    }
  }

  /**
   * Find related reports (same type)
   */
  private findRelatedReports(report: Report): ReportListItem[] {
    const reports = this.reportsSignal();
    return reports
      .filter((r) => r.id !== report.id && r.type === report.type)
      .slice(0, 3)
      .map((r): ReportListItem => ({
        ...r,
        contentPreview: this.generateContentPreview(r),
      }));
  }

  /**
   * Add action history entry
   */
  private addActionHistoryEntry(
    reportId: string,
    action: ModerationAction,
    reason?: string
  ): void {
    const history = this.actionHistorySignal();
    const reportHistory = history.get(reportId) || [];

    const newEntry: ActionHistoryItem = {
      id: `${reportId}-action-${Date.now()}`,
      action,
      actor: {
        id: 'current-user',
        name: 'Current User',
        role: 'ADMIN',
      },
      timestamp: new Date().toISOString(),
      reason,
    };

    history.set(reportId, [...reportHistory, newEntry]);
    this.actionHistorySignal.set(history);
  }
}
