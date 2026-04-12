import { Component, output, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import type { RestaurantFilters } from '../../../../models/restaurants.types';
import { RestaurantStatus, VerificationStatus, CuisineType, PriceRange } from '../../../../models/restaurants.types';

@Component({
  selector: 'app-restaurant-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
  templateUrl: './restaurant-filters.component.html',
  styleUrls: ['./restaurant-filters.component.css'],
})
export class RestaurantFiltersComponent {
  readonly filters = model<RestaurantFilters>({});
  readonly filtersChange = output<RestaurantFilters>();
  readonly reset = output<void>();

  readonly statusOptions = [RestaurantStatus.PENDING, RestaurantStatus.ACTIVE, RestaurantStatus.SUSPENDED, RestaurantStatus.REJECTED];
  readonly verificationOptions = [VerificationStatus.PENDING, VerificationStatus.VERIFIED, VerificationStatus.REJECTED];
  readonly cuisineOptions = Object.values(CuisineType);
  readonly priceRangeOptions = Object.values(PriceRange);
  readonly ratingOptions = [1, 2, 3, 4, 5];

  onSearchChange(search: string): void {
    this.filters.update(f => ({ ...f, search }));
    this.emitChange();
  }

  onStatusChange(status: RestaurantStatus): void {
    this.filters.update(f => ({ ...f, status }));
    this.emitChange();
  }

  onCuisineToggle(cuisine: CuisineType): void {
    const current = this.filters().cuisine || [];
    const updated = current.includes(cuisine)
      ? current.filter(c => c !== cuisine)
      : [...current, cuisine];
    this.filters.update(f => ({ ...f, cuisine: updated.length ? updated : undefined }));
    this.emitChange();
  }

  onPriceRangeToggle(price: PriceRange): void {
    const current = this.filters().priceRange || [];
    const updated = current.includes(price)
      ? current.filter(p => p !== price)
      : [...current, price];
    this.filters.update(f => ({ ...f, priceRange: updated.length ? updated : undefined }));
    this.emitChange();
  }

  onRatingChange(rating: number): void {
    this.filters.update(f => ({ ...f, rating }));
    this.emitChange();
  }

  onReset(): void {
    this.filters.set({});
    this.reset.emit();
  }

  private emitChange(): void {
    this.filtersChange.emit(this.filters());
  }
}
