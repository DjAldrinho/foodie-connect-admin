import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import type { AuditLog, AuditLogResponse } from '../../../models/settings.types';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogsComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);

  readonly isLoading = signal(false);
  readonly isExporting = signal(false);
  readonly logs = signal<AuditLog[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly totalPages = signal(0);

  readonly actionFilter = signal('');
  readonly entityTypeFilter = signal('');

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading.set(true);
    this.settingsService
      .getAuditLogs({
        action: this.actionFilter() || undefined,
        entityType: this.entityTypeFilter() || undefined,
        page: this.page(),
        limit: this.limit(),
      })
      .subscribe({
        next: (response: AuditLogResponse) => {
          this.logs.set(response.logs);
          this.total.set(response.total);
          this.totalPages.set(response.totalPages);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  applyFilters(): void {
    this.page.set(1);
    this.loadLogs();
  }

  clearFilters(): void {
    this.actionFilter.set('');
    this.entityTypeFilter.set('');
    this.page.set(1);
    this.loadLogs();
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) {
      this.page.update((p) => p + 1);
      this.loadLogs();
    }
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.loadLogs();
    }
  }

  exportLogs(): void {
    this.isExporting.set(true);
    this.settingsService
      .exportAuditLogs({
        action: this.actionFilter() || undefined,
        entityType: this.entityTypeFilter() || undefined,
      })
      .subscribe({
        next: (blob: Blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `audit-logs-${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
          this.isExporting.set(false);
        },
        error: () => {
          this.isExporting.set(false);
        },
      });
  }

  getActionBadgeClass(action: string): string {
    if (action.includes('UPDATE')) return 'badge-warning';
    if (action.includes('DELETE') || action.includes('REMOVE')) return 'badge-danger';
    if (action.includes('ADD') || action.includes('CREATE')) return 'badge-success';
    return 'badge-info';
  }

  getChangesCount(changes: Record<string, unknown> | undefined): number {
    return changes ? Object.keys(changes).length : 0;
  }
}
