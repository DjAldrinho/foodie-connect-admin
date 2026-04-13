/**
 * Restaurant Preview Component
 * Displays restaurant information in moderation detail view
 */

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import type { ReportDetail } from '../../../../../models/moderation.types';

/**
 * Restaurant Preview Component
 *
 * Shows restaurant details including:
 * - Photos gallery
 * - Basic info (name, address, cuisine, rating)
 * - Owner information
 */
@Component({
  selector: 'app-restaurant-preview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './restaurant-preview.component.html',
  styleUrls: ['./restaurant-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // OnPush
})
export class RestaurantPreviewComponent {
  readonly restaurant = input<ReportDetail['content']['restaurant']>();
}
