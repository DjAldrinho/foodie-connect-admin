/**
 * Photo Preview Component
 * Displays photo information in moderation detail view
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { ReportDetail } from '../../../../../models/moderation.types';

/**
 * Photo Preview Component
 *
 * Shows photo details including:
 * - Full-size image
 * - EXIF data
 * - Uploader information
 * - Restaurant context (if applicable)
 */
@Component({
  selector: 'app-photo-preview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './photo-preview.component.html',
  styleUrls: ['./photo-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoPreviewComponent {
  readonly photo = input<ReportDetail['content']['photo']>();
}
