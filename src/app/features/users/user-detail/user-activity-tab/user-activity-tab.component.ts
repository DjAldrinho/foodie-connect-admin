import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface ActivityItem {
  id: string;
  type: 'post' | 'review' | 'follow' | 'like';
  description: string;
  createdAt: string;
}

@Component({
  selector: 'app-user-activity-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="activity-tab">
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (activities().length === 0) {
        <div class="empty-state">
          <mat-icon class="empty-icon">history</mat-icon>
          <p class="empty-title">No activity yet</p>
          <p class="empty-description">This user hasn't any recent activity</p>
        </div>
      } @else {
        <div class="activity-list">
          @for (activity of activities(); track activity.id) {
            <mat-card class="activity-card">
              <div class="activity-icon">
                <mat-icon [class]="getActivityIconClass(activity.type)">
                  {{ getActivityIcon(activity.type) }}
                </mat-icon>
              </div>
              <div class="activity-content">
                <p class="activity-description">{{ activity.description }}</p>
                <div class="activity-footer">
                  <mat-icon class="calendar-icon">schedule</mat-icon>
                  <span class="activity-date">{{ getRelativeTime(activity.createdAt) }}</span>
                </div>
              </div>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .activity-tab {
        padding: 1rem 0;
      }

      .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 300px;
      }

      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
      }

      .empty-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        color: var(--mat-sys-outline);
        margin-bottom: 1rem;
      }

      .empty-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--mat-sys-on-surface);
        margin-bottom: 0.5rem;
      }

      .empty-description {
        color: var(--mat-sys-on-surface-variant);
      }

      .activity-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .activity-card {
        display: flex;
        gap: 1rem;
        padding: 1rem;
      }

      .activity-icon {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .activity-icon mat-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
        color: white;
      }

      .activity-icon.post {
        background-color: #2196f3;
      }

      .activity-icon.review {
        background-color: #ff9800;
      }

      .activity-icon.follow {
        background-color: #4caf50;
      }

      .activity-icon.like {
        background-color: #e91e63;
      }

      .activity-content {
        flex: 1;
        min-width: 0;
      }

      .activity-description {
        margin: 0 0 0.5rem 0;
        color: var(--mat-sys-on-surface);
        line-height: 1.4;
      }

      .activity-footer {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .calendar-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
        color: var(--mat-sys-on-surface-variant);
      }

      .activity-date {
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
      }

      @media (max-width: 768px) {
        .activity-card {
          padding: 0.75rem;
        }
      }
    `,
  ],
})
export class UserActivityTabComponent {
  loading = signal(true);
  activities = signal<ActivityItem[]>([]);

  constructor() {
    this.loadMockData();
  }

  private loadMockData(): void {
    setTimeout(() => {
      this.activities.set([
        {
          id: '1',
          type: 'post',
          description: 'Created a new post about "Delicious food at this place!"',
          createdAt: '2026-04-08T10:30:00Z',
        },
        {
          id: '2',
          type: 'review',
          description: 'Reviewed "La Parrilla del Chef" with 5 stars',
          createdAt: '2026-04-07T15:45:00Z',
        },
        {
          id: '3',
          type: 'like',
          description: 'Liked a post from @foodie_master',
          createdAt: '2026-04-07T14:20:00Z',
        },
        {
          id: '4',
          type: 'follow',
          description: 'Started following @chef_gordon',
          createdAt: '2026-04-06T09:15:00Z',
        },
        {
          id: '5',
          type: 'post',
          description: 'Created a new post about "Amazing dessert you must try!"',
          createdAt: '2026-04-05T20:00:00Z',
        },
        {
          id: '6',
          type: 'review',
          description: 'Reviewed "Sushi Master" with 4 stars',
          createdAt: '2026-04-05T19:30:00Z',
        },
        {
          id: '7',
          type: 'like',
          description: 'Liked a review from @gourmet_critic',
          createdAt: '2026-04-04T16:45:00Z',
        },
        {
          id: '8',
          type: 'post',
          description: 'Created a new post about "Perfect romantic dinner atmosphere"',
          createdAt: '2026-04-03T21:00:00Z',
        },
      ]);
      this.loading.set(false);
    }, 800);
  }

  getActivityIcon(type: ActivityItem['type']): string {
    const icons: Record<ActivityItem['type'], string> = {
      post: 'photo_camera',
      review: 'rate_review',
      follow: 'person_add',
      like: 'favorite',
    };
    return icons[type];
  }

  getActivityIconClass(type: ActivityItem['type']): string {
    return type;
  }

  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }

    return date.toLocaleDateString();
  }
}
