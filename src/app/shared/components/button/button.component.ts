import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'icon';
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * ButtonComponent - Reusable button component
 *
 * Variants:
 * - primary: Main action button with brand color
 * - secondary: Secondary action with outline style
 * - text: Text-only button (no background)
 * - icon: Icon-only button (circular)
 *
 * Features:
 * - Material button integration
 * - Icon support (prefix or icon-only)
 * - Loading state
 * - Disabled state
 * - WCAG AA compliance
 * - Keyboard accessible
 *
 * @example
 * ```html
 * <app-button
 *   variant="primary"
 *   size="medium"
 *   [icon]="add"
 *   [loading]="false"
 *   (click)="onClick()"
 * >
 *   Create Item
 * </app-button>
 * ```
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
})
export class ButtonComponent {
  /**
   * Button variant
   */
  readonly variant = input<ButtonVariant>('primary');

  /**
   * Button size
   */
  readonly size = input<ButtonSize>('medium');

  /**
   * Icon name (optional prefix or icon-only)
   */
  readonly icon = input<string>('');

  /**
   * Whether button is in loading state
   */
  readonly loading = input(false);

  /**
   * Whether button is disabled
   */
  readonly disabled = input(false);

  /**
   * Button type attribute
   */
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  /**
   * Click event
   */
  readonly click = output<void>();

  /**
   * Whether to show icon only (no text)
   */
  readonly iconOnly = input(false);

  /**
   * Handle click event
   */
  onClick(): void {
    if (!this.loading() && !this.disabled()) {
      this.click.emit();
    }
  }

  /**
   * Get CSS classes based on props
   */
  getClasses(): string[] {
    const classes: string[] = [`${this.variant()}`];

    if (this.size() !== 'medium') {
      classes.push(this.size());
    }

    if (this.iconOnly() || (this.icon() && !this.hasContent())) {
      classes.push('icon-only');
    }

    return classes;
  }

  /**
   * Check if button has content (text slot)
   * This will be checked in the template
   */
  hasContent(): boolean {
    return true; // Will be overridden by ng-content check in template
  }
}
