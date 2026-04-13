import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner';
import type { RestaurantListItem } from '../../../../models/restaurants.types';
import { RestaurantStatus, VerificationStatus } from '../../../../models/restaurants.types';

@Component({
  selector: 'app-grid-view',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.css'],
})
export class GridViewComponent {
  readonly restaurants = input<RestaurantListItem[]>([]);
  readonly loading = input(false);
  readonly restaurantClick = output<string>();
  readonly VerificationStatus = VerificationStatus; // Make enum available to template

  getStatusColor(status: RestaurantStatus): string {
    switch (status) {
      case RestaurantStatus.ACTIVE:
        return 'active';
      case RestaurantStatus.PENDING:
        return 'pending';
      case RestaurantStatus.SUSPENDED:
        return 'suspended';
      case RestaurantStatus.REJECTED:
        return 'rejected';
      default:
        return '';
    }
  }

  onCardClick(restaurantId: string): void {
    this.restaurantClick.emit(restaurantId);
  }
}
