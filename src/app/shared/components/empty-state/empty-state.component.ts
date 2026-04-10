import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

/**
 * EmptyStateComponent - Reusable empty state component
 *
 * Features:
 * - @Input for icon, title, description
 * - @Input for action button (optional)
 * - Centered content with illustration
 * - Consistent styling across app
 * - Accessible (alt text for icons)
 *
 * @example
 * ```html
 * <app-empty-state
 *   icon="inbox"
 *   title="No hay datos"
 *   description="Aún no tienes elementos creados."
 *   [actionButton]="{ label: 'Crear', callback: () => {} }"
 * ></app-empty-state>
 * ```
 */
export interface EmptyStateAction {
  label: string;
  callback: () => void;
}

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.css'],
})
export class EmptyStateComponent {
  /**
   * Material icon name to display
   */
  readonly icon = input<string>('inbox');

  /**
   * Main title text
   */
  readonly title = input.required<string>();

  /**
   * Descriptive text below title
   */
  readonly description = input('');

  /**
   * Optional action button
   */
  readonly actionButton = input<EmptyStateAction | undefined>(undefined);

  /**
   * Size variant (small, medium, large)
   */
  readonly size = input<'small' | 'medium' | 'large'>('medium');

  /**
   * Handle action button click
   */
  onAction(): void {
    this.actionButton()?.callback();
  }
}
