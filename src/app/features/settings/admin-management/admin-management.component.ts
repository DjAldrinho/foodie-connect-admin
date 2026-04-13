import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import type { AdminUser } from '../../../models/settings.types';

@Component({
  selector: 'app-admin-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-management.component.html',
  styleUrls: ['./admin-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminManagementComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);

  readonly isLoading = signal(false);
  readonly admins = signal<AdminUser[]>([]);
  readonly showAddForm = signal(false);
  readonly isAdding = signal(false);
  readonly isRemoving = signal(false);
  readonly addSuccess = signal(false);

  readonly newAdminEmail = signal('');
  readonly newAdminRole = signal<'ADMIN' | 'SUPER_ADMIN'>('ADMIN');

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.isLoading.set(true);
    this.settingsService.getAdmins().subscribe({
      next: (data: AdminUser[]) => {
        this.admins.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
    this.addSuccess.set(false);
  }

  addAdmin(): void {
    if (!this.newAdminEmail()) {
      return;
    }

    this.isAdding.set(true);
    this.settingsService
      .addAdmin({
        email: this.newAdminEmail(),
        role: this.newAdminRole(),
      })
      .subscribe({
        next: () => {
          this.isAdding.set(false);
          this.addSuccess.set(true);
          this.newAdminEmail.set('');
          this.newAdminRole.set('ADMIN');
          this.loadAdmins();
          setTimeout(() => {
            this.addSuccess.set(false);
            this.showAddForm.set(false);
          }, 2000);
        },
        error: () => {
          this.isAdding.set(false);
        },
      });
  }

  removeAdmin(id: string, email: string): void {
    if (!confirm(`Are you sure you want to remove admin "${email}"?`)) {
      return;
    }

    this.isRemoving.set(true);
    this.settingsService.removeAdmin(id).subscribe({
      next: () => {
        this.isRemoving.set(false);
        this.loadAdmins();
      },
      error: () => {
        this.isRemoving.set(false);
      },
    });
  }

  getRoleBadgeClass(role: string): string {
    return role === 'SUPER_ADMIN' ? 'badge-super-admin' : 'badge-admin';
  }
}
