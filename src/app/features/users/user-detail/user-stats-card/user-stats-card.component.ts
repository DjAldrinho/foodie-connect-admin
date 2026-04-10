import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

export interface UserStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

@Component({
  selector: 'app-user-stats-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="stats-card">
      <div class="stats-grid">
        <div class="stat-item" (click)="onStatClick('posts')" [class.clickable]="true">
          <div class="stat-value">{{ stats().postsCount }}</div>
          <div class="stat-label">Posts</div>
        </div>
        <div class="stat-item" (click)="onStatClick('followers')" [class.clickable]="true">
          <div class="stat-value">{{ stats().followersCount }}</div>
          <div class="stat-label">Followers</div>
        </div>
        <div class="stat-item" (click)="onStatClick('following')" [class.clickable]="true">
          <div class="stat-value">{{ stats().followingCount }}</div>
          <div class="stat-label">Following</div>
        </div>
      </div>
    </mat-card>
  `,
  styles: [
    `
      .stats-card {
        padding: 1rem;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
        text-align: center;
      }

      .stat-item {
        cursor: default;
      }

      .stat-item.clickable {
        cursor: pointer;
        transition: transform 0.2s ease;
      }

      .stat-item.clickable:hover {
        transform: scale(1.05);
      }

      .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--mat-sys-primary);
        margin-bottom: 0.25rem;
      }

      .stat-label {
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
        font-weight: 500;
      }

      @media (max-width: 768px) {
        .stats-grid {
          gap: 1rem;
        }

        .stat-value {
          font-size: 1.5rem;
        }

        .stat-label {
          font-size: 0.75rem;
        }
      }
    `,
  ],
})
export class UserStatsCardComponent {
  readonly stats = input.required<UserStats>();
  readonly statClick = output<'posts' | 'followers' | 'following'>();

  onStatClick(stat: 'posts' | 'followers' | 'following'): void {
    this.statClick.emit(stat);
  }
}
