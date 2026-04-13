/**
 * Comment Preview Component
 * Displays comment information in moderation detail view
 */

import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import type { ReportDetail } from '../../../../../../models/moderation.types';

/**
 * Comment Preview Component
 *
 * Shows comment details including:
 * - Comment text
 * - Author information
 * - Parent content context (review or restaurant)
 */
@Component({
  selector: 'app-comment-preview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './comment-preview.component.html',
  styleUrls: ['./comment-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentPreviewComponent {
  readonly comment = input<ReportDetail['content']['comment']>();
}
