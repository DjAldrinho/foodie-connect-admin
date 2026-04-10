import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { UserStatsCardComponent, UserStats } from './user-stats-card/user-stats-card.component';
import { UserPostsTabComponent } from './user-posts-tab/user-posts-tab.component';
import { UserReviewsTabComponent } from './user-reviews-tab/user-reviews-tab.component';
import { UserActivityTabComponent } from './user-activity-tab/user-activity-tab.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  stats: UserStats;
}

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatMenuModule,
    UserStatsCardComponent,
    UserPostsTabComponent,
    UserReviewsTabComponent,
    UserActivityTabComponent,
  ],
  template: `
    <div class="user-detail-page">
      <div class="header">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back to Users
        </button>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
      } @else {
        <div class="detail-container">
          <div class="user-header">
            <div class="avatar-section">
              <img [src]="user()?.avatar" [alt]="user()?.name" class="user-avatar" />
              <div class="status-indicator" [class.status-active]="user()?.status === 'ACTIVE'"></div>
            </div>

            <div class="user-info">
              <div class="name-section">
                <h1 class="user-name">{{ user()?.name }}</h1>
                <div class="chips-row">
                  <mat-chip [class]="'role-chip role-' + user()!.role.toLowerCase()">
                    {{ user()!.role }}
                  </mat-chip>
                  <mat-chip [class]="'status-chip status-' + user()!.status.toLowerCase()">
                    {{ user()!.status }}
                  </mat-chip>
                </div>
              </div>

              <div class="email-section">
                <mat-icon class="email-icon">email</mat-icon>
                <span class="user-email">{{ user()?.email }}</span>
              </div>

              <div class="actions-row">
                <button mat-stroked-button (click)="onEditRole()">
                  <mat-icon>edit</mat-icon>
                  Edit Role
                </button>
                <button mat-stroked-button (click)="onToggleStatus()">
                  <mat-icon>{{ user()?.status === 'ACTIVE' ? 'person_off' : 'person_add' }}</mat-icon>
                  {{ user()?.status === 'ACTIVE' ? 'Deactivate' : 'Activate' }}
                </button>
                <button mat-stroked-button color="warn" (click)="onDelete()">
                  <mat-icon>delete</mat-icon>
                  Delete
                </button>
              </div>
            </div>
          </div>

          <app-user-stats-card [stats]="user()!.stats" (statClick)="onStatClick($event)" />

          <mat-tab-group class="user-tabs">
            <mat-tab label="Posts">
              <ng-template matTabContent>
                <app-user-posts-tab />
              </ng-template>
            </mat-tab>
            <mat-tab label="Reviews">
              <ng-template matTabContent>
                <app-user-reviews-tab />
              </ng-template>
            </mat-tab>
            <mat-tab label="Activity">
              <ng-template matTabContent>
                <app-user-activity-tab />
              </ng-template>
            </mat-tab>
          </mat-tab-group>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .user-detail-page {
        padding: 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .header {
        margin-bottom: 1.5rem;
      }

      .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
      }

      .detail-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .user-header {
        display: flex;
        gap: 1.5rem;
        padding: 1.5rem;
        background: var(--mat-sys-surface);
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .avatar-section {
        position: relative;
        flex-shrink: 0;
      }

      .user-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid var(--mat-sys-primary);
      }

      .status-indicator {
        position: absolute;
        bottom: 4px;
        right: 4px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid white;
        background-color: var(--mat-sys-error);
      }

      .status-indicator.status-active {
        background-color: #4caf50;
      }

      .user-info {
        flex: 1;
        min-width: 0;
      }

      .name-section {
        margin-bottom: 0.75rem;
      }

      .user-name {
        margin: 0 0 0.5rem 0;
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--mat-sys-on-surface);
      }

      .chips-row {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .role-chip {
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.75rem;
      }

      .role-user {
        background-color: #e3f2fd;
        color: #1976d2;
      }

      .role-admin {
        background-color: #fff3e0;
        color: #f57c00;
      }

      .role-super_admin {
        background-color: #fce4ec;
        color: #c2185b;
      }

      .status-chip {
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.75rem;
      }

      .status-active {
        background-color: #e8f5e9;
        color: #388e3c;
      }

      .status-inactive {
        background-color: #fff3e0;
        color: #f57c00;
      }

      .status-suspended {
        background-color: #ffebee;
        color: #d32f2f;
      }

      .email-section {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        color: var(--mat-sys-on-surface-variant);
      }

      .email-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
      }

      .user-email {
        font-size: 0.95rem;
      }

      .actions-row {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .user-tabs {
        background: var(--mat-sys-surface);
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      @media (max-width: 768px) {
        .user-detail-page {
          padding: 1rem;
        }

        .user-header {
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1rem;
        }

        .user-avatar {
          width: 64px;
          height: 64px;
        }

        .user-name {
          font-size: 1.5rem;
        }

        .email-section {
          justify-content: center;
        }

        .actions-row {
          justify-content: center;
        }

        .chips-row {
          justify-content: center;
        }
      }
    `,
  ],
})
export class UserDetailComponent {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  loading = signal(true);
  user = signal<UserDetail | null>(null);

  constructor() {
    this.loadUserData();
  }

  private loadUserData(): void {
    const userId = this.route.snapshot.paramMap.get('id');

    setTimeout(() => {
      this.user.set({
        id: userId || '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://i.pravatar.cc/150?img=1',
        role: 'USER',
        status: 'ACTIVE',
        stats: {
          postsCount: 24,
          followersCount: 156,
          followingCount: 89,
        },
      });
      this.loading.set(false);
    }, 600);
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  onEditRole(): void {
    if (!this.user()) return;

    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Edit User Role',
        message: `Change role for ${this.user()!.name}?`,
        confirmText: 'Change',
        cancelText: 'Cancel',
      },
    });
  }

  onToggleStatus(): void {
    if (!this.user()) return;

    const action = this.user()!.status === 'ACTIVE' ? 'Deactivate' : 'Activate';

    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `${action} User`,
        message: `Are you sure you want to ${action.toLowerCase()} ${this.user()!.name}?`,
        confirmText: action,
        cancelText: 'Cancel',
      },
    });
  }

  onDelete(): void {
    if (!this.user()) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete ${this.user()!.name}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        isDestructive: true,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.router.navigate(['/users']);
      }
    });
  }

  onStatClick(stat: 'posts' | 'followers' | 'following'): void {
    console.log('Stat clicked:', stat);
  }
}
