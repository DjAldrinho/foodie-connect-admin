import { Component, output, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * View mode type
 */
export type ViewMode = 'grid' | 'list';

/**
 * ViewToggleComponent - Toggle between grid and list views
 *
 * Features:
 * - Grid icon button
 * - List icon button
 * - Active state styling
 * - Emits viewModeChange event
 * - ARIA toggle button role
 * - Keyboard accessible (Enter, Space)
 * - Tooltip labels
 *
 * @example
 * ```html
 * <app-view-toggle
 *   [viewMode]="'grid'"
 *   (viewModeChange)="onViewModeChange($event)"
 * ></app-view-toggle>
 * ```
 */
@Component({
  selector: 'app-view-toggle',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './view-toggle.component.html',
  styleUrls: ['./view-toggle.component.css'],
})
export class ViewToggleComponent {
  /**
   * Current view mode
   */
  readonly viewMode = input<ViewMode>('grid');

  /**
   * View mode change event
   */
  readonly viewModeChange = output<ViewMode>();

  /**
   * Handle grid view click
   */
  onGridView(): void {
    if (this.viewMode() !== 'grid') {
      this.viewModeChange.emit('grid');
    }
  }

  /**
   * Handle list view click
   */
  onListView(): void {
    if (this.viewMode() !== 'list') {
      this.viewModeChange.emit('list');
    }
  }
}
