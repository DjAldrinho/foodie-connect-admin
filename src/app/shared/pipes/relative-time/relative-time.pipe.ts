import { Pipe, PipeTransform } from '@angular/core';

/**
 * RelativeTimePipe - Format timestamps as relative time
 *
 * Converts ISO timestamp strings to human-readable relative time
 * Examples:
 * - "5 minutes ago"
 * - "2 hours ago"
 * - "Yesterday"
 * - "3 days ago"
 *
 * @example
 * ```html
 * {{ timestamp | relativeTime }}
 * ```
 */
@Pipe({
  name: 'relativeTime',
  standalone: true,
})
export class RelativeTimePipe implements PipeTransform {
  transform(timestamp: string): string {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return diffSecs <= 1 ? 'just now' : `${diffSecs} seconds ago`;
    }

    if (diffMins < 60) {
      return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
    }

    if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }

    if (diffDays === 1) {
      return 'Yesterday';
    }

    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }

    // For dates older than a week, show actual date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}
