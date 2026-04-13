import { Directive, inject, input, OnInit, DestroyRef, ElementRef, NgZone } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

/**
 * LazyLoadImageDirective - Lazy load images with Intersection Observer
 *
 * Features:
 * - Uses Intersection Observer API for efficient lazy loading
 * - Fallback for browsers without Intersection Observer support
 * - Adds fade-in animation when image loads
 * - Supports both src and ngSrc
 *
 * @example
 * ```html
 * <img appLazyLoadImage [src]="imageUrl" [alt]="altText" />
 * <img appLazyLoadImage ngSrc="image.jpg" [alt]="altText" width="400" height="300" />
 * ```
 */
@Directive({
  selector: 'img[appLazyLoadImage]',
  standalone: true,
  host: {
    '[class.lazy-loading]': 'isLoading()',
    '[class.lazy-loaded]': 'isLoaded()',
  },
})
export class LazyLoadImageDirective implements OnInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  /**
   * Image source URL
   */
  readonly src = input.required<string>();

  /**
   * Root margin for Intersection Observer (default: 50px)
   * Load image when it's within 50px of viewport
   */
  readonly rootMargin = input<string>('50px');

  /**
   * Fallback image to show while loading
   */
  readonly placeholder = input<string>('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3C/svg%3E');

  /**
   * Loading state
   */
  isLoading = () => !this.loaded;

  /**
   * Loaded state
   */
  isLoaded = () => this.loaded;

  private loaded = false;
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    // Check if Intersection Observer is supported
    if ('IntersectionObserver' in window) {
      this.observeImage();
    } else {
      // Fallback: load immediately
      this.loadImage();
    }
  }

  private observeImage(): void {
    this.ngZone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !this.loaded) {
              this.loadImage();
              this.observer?.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: this.rootMargin(),
          threshold: 0.01,
        }
      );

      this.observer.observe(this.elementRef.nativeElement);
    });

    // Cleanup on destroy
    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
    });
  }

  private loadImage(): void {
    const img = this.elementRef.nativeElement as HTMLImageElement;

    // Set placeholder initially
    if (this.placeholder()) {
      img.src = this.placeholder();
    }

    // Load actual image
    this.ngZone.runOutsideAngular(() => {
      const tempImg = new Image();

      tempImg.onload = () => {
        this.ngZone.run(() => {
          img.src = this.src();
          this.loaded = true;
          img.classList.add('lazy-fade-in');
        });
      };

      tempImg.onerror = () => {
        this.ngZone.run(() => {
          // Keep placeholder on error
          img.classList.add('lazy-error');
        });
      };

      tempImg.src = this.src();
    });
  }
}
