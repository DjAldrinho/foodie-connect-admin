import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner';
import type { RestaurantListItem } from '../../../../models/restaurants.types';
import { RestaurantStatus, VerificationStatus } from '../../../../models/restaurants.types';

interface SortState {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

@Component({
  selector: 'app-list-view',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.css'],
})
export class ListViewComponent {
  readonly restaurants = input<RestaurantListItem[]>([]);
  readonly loading = input(false);
  readonly sortChange = output<SortState>();
  readonly restaurantClick = output<string>();
  readonly VerificationStatus = VerificationStatus; // Make enum available to template

  readonly sortField = input<string>('createdAt');
  readonly sortOrder = input<'asc' | 'desc'>('desc');

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

  onSort(field: string): void {
    if (this.sortField() === field) {
      // Toggle order if same field
      const newOrder = this.sortOrder() === 'asc' ? 'desc' : 'asc';
      this.sortChange.emit({ sortBy: field, sortOrder: newOrder });
    } else {
      // New field, default to desc
      this.sortChange.emit({ sortBy: field, sortOrder: 'desc' });
    }
  }

  getSortIcon(field: string): string {
    if (this.sortField() !== field) {
      return 'unfold_more';
    }
    return this.sortOrder() === 'asc' ? 'expand_less' : 'expand_more';
  }

  onRowClick(restaurantId: string): void {
    this.restaurantClick.emit(restaurantId);
  }
}
