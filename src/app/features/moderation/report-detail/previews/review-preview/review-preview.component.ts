/**
 * Review Preview Component
 * Displays review information in moderation detail view
 */

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import type { ReportDetail } from '../../../../../models/moderation.types';

/**
 * Review Preview Component
 *
 * Shows review details including:
 * - Rating and text
 * - Photos gallery
 * - Reviewer info
 * - Restaurant context
 */
@Component({
  selector: 'app-review-preview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './review-preview.component.html',
  styleUrls: ['./review-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // OnPush
})
export class ReviewPreviewComponent {
  readonly review = input<ReportDetail['content']['review']>();
}
