import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  text: string;
  date: string;
  helpfulCount: number;
}

@Component({
  selector: 'app-reviews-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
  templateUrl: './reviews-tab.component.html',
  styleUrls: ['./reviews-tab.component.css'],
})
export class ReviewsTabComponent {
  readonly restaurantId = input.required<string>();

  readonly reviews = signal<Review[]>([
    {
      id: '1',
      userName: 'Juan Pérez',
      rating: 5,
      text: 'Excellent food and service! The atmosphere is perfect for a romantic dinner.',
      date: '2026-03-15T10:00:00Z',
      helpfulCount: 12,
    },
    {
      id: '2',
      userName: 'María García',
      rating: 4,
      text: 'Great experience overall. The pasta was delicious but the wait time was a bit long.',
      date: '2026-03-10T14:30:00Z',
      helpfulCount: 8,
    },
    {
      id: '3',
      userName: 'Carlos López',
      rating: 5,
      text: 'Best steak in town! Will definitely come back.',
      date: '2026-03-05T18:00:00Z',
      helpfulCount: 15,
    },
  ]);

  readonly minRating = input<number>();
  readonly hasPhotosOnly = input(false);

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
}
