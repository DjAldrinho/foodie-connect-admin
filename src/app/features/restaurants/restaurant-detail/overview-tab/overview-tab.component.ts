import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import type { Restaurant } from '../../../../models/restaurants.types';
import { RestaurantStatus, VerificationStatus } from '../../../../models/restaurants.types';

@Component({
  selector: 'app-overview-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
  templateUrl: './overview-tab.component.html',
  styleUrls: ['./overview-tab.component.css'],
})
export class OverviewTabComponent {
  readonly restaurant = input.required<Restaurant>();
  readonly VerificationStatus = VerificationStatus;

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
}
