import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface UserPost {
  id: string;
  imageUrl: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

@Component({
  selector: 'app-user-posts-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="posts-tab">
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (posts().length === 0) {
        <div class="empty-state">
          <mat-icon class="empty-icon">photo_library</mat-icon>
          <p class="empty-title">No posts yet</p>
          <p class="empty-description">This user hasn't posted anything</p>
        </div>
      } @else {
        <div class="posts-grid">
          @for (post of paginatedPosts(); track post.id) {
            <mat-card class="post-card">
              <img [src]="post.imageUrl" [alt]="post.caption" class="post-image" />
              <div class="post-content">
                <p class="post-caption">{{ post.caption }}</p>
                <div class="post-engagement">
                  <span class="engagement-item">
                    <mat-icon>favorite</mat-icon>
                    {{ post.likesCount }}
                  </span>
                  <span class="engagement-item">
                    <mat-icon>comment</mat-icon>
                    {{ post.commentsCount }}
                  </span>
                </div>
              </div>
            </mat-card>
          }
        </div>

        @if (totalPages() > 1) {
          <div class="pagination">
            <button
              mat-button
              (click)="previousPage()"
              [disabled]="currentPage() === 1"
              class="pagination-button"
            >
              <mat-icon>chevron_left</mat-icon>
              Previous
            </button>
            <span class="page-info">Page {{ currentPage() }} of {{ totalPages() }}</span>
            <button
              mat-button
              (click)="nextPage()"
              [disabled]="currentPage() === totalPages()"
              class="pagination-button"
            >
              Next
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .posts-tab {
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

      .posts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .post-card {
        overflow: hidden;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .post-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .post-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
      }

      .post-content {
        padding: 1rem;
      }

      .post-caption {
        margin: 0 0 0.75rem 0;
        font-size: 0.9rem;
        color: var(--mat-sys-on-surface);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .post-engagement {
        display: flex;
        gap: 1rem;
      }

      .engagement-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
      }

      .engagement-item mat-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
      }

      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        padding: 1rem 0;
      }

      .pagination-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .page-info {
        color: var(--mat-sys-on-surface-variant);
        font-weight: 500;
      }

      @media (max-width: 768px) {
        .posts-grid {
          grid-template-columns: 1fr;
        }

        .pagination {
          flex-direction: column;
          gap: 0.5rem;
        }
      }
    `,
  ],
})
export class UserPostsTabComponent {
  private readonly postsPerPage = 6;

  loading = signal(true);
  currentPage = signal(1);
  posts = signal<UserPost[]>([]);

  totalPages = computed(() => Math.ceil(this.posts().length / this.postsPerPage));

  paginatedPosts = computed(() => {
    const start = (this.currentPage() - 1) * this.postsPerPage;
    const end = start + this.postsPerPage;
    return this.posts().slice(start, end);
  });

  constructor() {
    this.loadMockData();
  }

  private loadMockData(): void {
    setTimeout(() => {
      this.posts.set([
        {
          id: '1',
          imageUrl: 'https://picsum.photos/300/200?random=1',
          caption: 'Deliciosa comida en este lugar! ¡Definitivamente volveré!',
          likesCount: 42,
          commentsCount: 8,
          createdAt: '2026-04-08T10:30:00Z',
        },
        {
          id: '2',
          imageUrl: 'https://picsum.photos/300/200?random=2',
          caption: 'Postre increíble que tienen que probar',
          likesCount: 67,
          commentsCount: 12,
          createdAt: '2026-04-07T15:20:00Z',
        },
        {
          id: '3',
          imageUrl: 'https://picsum.photos/300/200?random=3',
          caption: 'Ambiente perfecto para una cena romántica',
          likesCount: 34,
          commentsCount: 5,
          createdAt: '2026-04-06T20:45:00Z',
        },
        {
          id: '4',
          imageUrl: 'https://picsum.photos/300/200?random=4',
          caption: 'Los mejores tacos de la ciudad 🌮',
          likesCount: 89,
          commentsCount: 23,
          createdAt: '2026-04-05T12:00:00Z',
        },
        {
          id: '5',
          imageUrl: 'https://picsum.photos/300/200?random=5',
          caption: 'Café de la mañana para empezar el día right',
          likesCount: 21,
          commentsCount: 3,
          createdAt: '2026-04-04T08:30:00Z',
        },
        {
          id: '6',
          imageUrl: 'https://picsum.photos/300/200?random=6',
          caption: 'Nuevo restaurante descubierto 👍',
          likesCount: 55,
          commentsCount: 9,
          createdAt: '2026-04-03T19:15:00Z',
        },
        {
          id: '7',
          imageUrl: 'https://picsum.photos/300/200?random=7',
          caption: 'Brunch del domingo perfecto',
          likesCount: 73,
          commentsCount: 15,
          createdAt: '2026-04-02T11:00:00Z',
        },
      ]);
      this.loading.set(false);
    }, 800);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
    }
  }
}
