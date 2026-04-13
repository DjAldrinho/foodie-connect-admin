/**
 * User Preview Component
 * Displays user profile information in moderation detail view
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { ReportDetail } from '../../../../../models/moderation.types';

/**
 * User Preview Component
 *
 * Shows user profile details including:
 * - Avatar and basic info
 * - Bio
 * - Activity statistics
 * - Account creation date
 */
@Component({
  selector: 'app-user-preview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-preview.component.html',
  styleUrls: ['./user-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPreviewComponent {
  readonly user = input<ReportDetail['content']['user']>();
}
