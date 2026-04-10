import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'outlined' | 'elevated';
export type CardPadding = 'none' | 'small' | 'medium' | 'large';

/**
 * CardComponent - Reusable card container component
 *
 * Variants:
 * - default: Flat design with subtle border
 * - outlined: More prominent border
 * - elevated: Box shadow for depth
 *
 * Features:
 * - Header slot (optional)
 * - Content slot
 * - Footer slot (optional)
 * - Configurable padding
 * - Clickable (optional)
 * - Hover effect (optional)
 * - WCAG AA compliance
 *
 * @example
 * ```html
 * <app-card variant="elevated" padding="medium" [clickable]="true">
 *   <ng-container header>
 *     <h3>Card Title</h3>
 *   </ng-container>
 *   <ng-container content>
 *     <p>Card content goes here</p>
 *   </ng-container>
 * </app-card>
 * ```
 */
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent {
  /**
   * Card variant style
   */
  readonly variant = input<CardVariant>('default');

  /**
   * Padding size
   */
  readonly padding = input<CardPadding>('medium');

  /**
   * Whether card is clickable
   */
  readonly clickable = input(false);

  /**
   * Whether to show hover effect
   */
  readonly hoverable = input(false);

  /**
   * ARIA label for accessibility
   */
  readonly ariaLabel = input('');

  /**
   * Get CSS classes based on props
   */
  getClasses(): string[] {
    const classes: string[] = [this.variant()];

    if (this.clickable() || this.hoverable()) {
      classes.push('hoverable');
    }

    if (this.padding() !== 'medium') {
      classes.push(this.padding());
    }

    return classes;
  }

  /**
   * Handle card click
   */
  onClick(event: Event): void {
    if (this.clickable()) {
      // Prevent default if needed
      event.preventDefault();
    }
  }

  /**
   * Check if has header content
   */
  get hasHeader(): boolean {
    return true; // ng-content will handle this
  }

  /**
   * Check if has footer content
   */
  get hasFooter(): boolean {
    return true; // ng-content will handle this
  }
}
