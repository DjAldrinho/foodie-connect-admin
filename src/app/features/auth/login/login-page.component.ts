import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginFormComponent } from './login-form/login-form.component';

/**
 * LoginPageComponent - Main login page container
 *
 * Features:
 * - Uses AuthLayout
 * - Centers LoginFormComponent
 * - Handles login success redirect
 * - Displays error messages from AuthService
 * - Page title: "Iniciar Sesión"
 * - SEO meta tags
 *
 * @example
 * ```html
 * <app-login-page></app-login-page>
 * ```
 */
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, LoginFormComponent],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
})
export class LoginPageComponent {
  private readonly router = inject(Router);

  /**
   * Handle successful login
   * Redirects to dashboard or stored URL
   */
  onLoginSuccess(): Promise<boolean> {
    console.log('🚀 onLoginSuccess called!');

    // Get stored redirect URL from query params or default to dashboard
    const redirectUrl = this.router.parseUrl(this.router.url).queryParams['redirect'] as string || '/dashboard';

    console.log('🔀 Redirecting to:', redirectUrl);
    console.log('📍 Current URL:', this.router.url);

    const navigationPromise = this.router.navigate([redirectUrl]);

    navigationPromise.then(
      (success) => console.log('✅ Navigation successful:', success),
      (error) => console.error('❌ Navigation failed:', error)
    );

    return navigationPromise;
  }

  /**
   * Get page title
   */
  get pageTitle(): string {
    return 'Iniciar Sesión';
  }
}
