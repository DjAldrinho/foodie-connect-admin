import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';

export interface UserReview {
  id: string;
  restaurantName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

@Component({
  selector: 'app-user-reviews-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatRippleModule,
  ],
  template: `
    <div class="reviews-tab">
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (reviews().length === 0) {
        <div class="empty-state">
          <mat-icon class="empty-icon">rate_review</mat-icon>
          <p class="empty-title">No reviews yet</p>
          <p class="empty-description">This user hasn't reviewed any places</p>
        </div>
      } @else {
        <div class="reviews-list">
          @for (review of paginatedReviews(); track review.id) {
            <mat-card class="review-card">
              <div class="review-header">
                <h3 class="restaurant-name">{{ review.restaurantName }}</h3>
                <div class="rating">
                  @for (star of [1, 2, 3, 4, 5]; track star) {
                    <mat-icon
                      class="star-icon"
                      [class.filled]="star <= review.rating"
                    >
                      {{ star <= review.rating ? 'star' : 'star_border' }}
                    </mat-icon>
                  }
                </div>
              </div>
              <p class="review-comment">{{ review.comment }}</p>
              <div class="review-footer">
                <mat-icon class="calendar-icon">calendar_today</mat-icon>
                <span class="review-date">{{ review.createdAt | date : 'mediumDate' }}</span>
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
      .reviews-tab {
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

      .reviews-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .review-card {
        padding: 1.25rem;
      }

      .review-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.75rem;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .restaurant-name {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--mat-sys-on-surface);
      }

      .rating {
        display: flex;
        gap: 0.125rem;
      }

      .star-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
        color: var(--mat-sys-outline);
      }

      .star-icon.filled {
        color: #ffc107;
      }

      .review-comment {
        margin: 0 0 1rem 0;
        color: var(--mat-sys-on-surface-variant);
        line-height: 1.5;
      }

      .review-footer {
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

      .review-date {
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
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
        .review-header {
          flex-direction: column;
        }

        .pagination {
          flex-direction: column;
          gap: 0.5rem;
        }
      }
    `,
  ],
})
export class UserReviewsTabComponent {
  private readonly reviewsPerPage = 5;

  loading = signal(true);
  currentPage = signal(1);
  reviews = signal<UserReview[]>([]);

  totalPages = computed(() => Math.ceil(this.reviews().length / this.reviewsPerPage));

  paginatedReviews = computed(() => {
    const start = (this.currentPage() - 1) * this.reviewsPerPage;
    const end = start + this.reviewsPerPage;
    return this.reviews().slice(start, end);
  });

  constructor() {
    this.loadMockData();
  }

  private loadMockData(): void {
    setTimeout(() => {
      this.reviews.set([
        {
          id: '1',
          restaurantName: 'La Parrilla del Chef',
          rating: 5,
          comment: 'Excelente servicio y comida deliciosa. Los cortes de carne son de primera calidad y el personal muy atento. Definitivamente volveré.',
          createdAt: '2026-04-07T15:45:00Z',
        },
        {
          id: '2',
          restaurantName: 'Sushi Master',
          rating: 4,
          comment: 'Buena calidad de pescado, aunque los precios son un poco elevados. El ambiente es agradable y recomendado para ocasiones especiales.',
          createdAt: '2026-04-05T20:30:00Z',
        },
        {
          id: '3',
          restaurantName: 'Pizza Hut',
          rating: 3,
          comment: 'Pizza correcta pero nada especial. El servicio fue un poco lento pero el lugar está limpio.',
          createdAt: '2026-04-03T12:15:00Z',
        },
        {
          id: '4',
          restaurantName: 'Burger King',
          rating: 4,
          comment: 'Hamburguesas consistentes y sabrosas. El local estaba bien mantenido y el pedido fue rápido.',
          createdAt: '2026-04-01T18:00:00Z',
        },
        {
          id: '5',
          restaurantName: 'Taco Loco',
          rating: 5,
          comment: '¡Los mejores tacos de la ciudad! Salsas increíbles y muy buena relación calidad-precio. Un must.',
          createdAt: '2026-03-30T13:20:00Z',
        },
        {
          id: '6',
          restaurantName: 'Cafe del Sol',
          rating: 4,
          comment: 'Excelente café y ambiente muy agradable. Perfecto para trabajar o conversar con amigos.',
          createdAt: '2026-03-28T09:00:00Z',
        },
        {
          id: '7',
          restaurantName: 'El Puesto',
          rating: 3,
          comment: 'Comida aceptable pero el servicio fue lento. Esperaba un poco más considering las reseñas positivas.',
          createdAt: '2026-03-25T21:45:00Z',
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
