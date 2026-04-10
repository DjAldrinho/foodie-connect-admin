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
  onLoginSuccess(): void {
    // Get stored redirect URL from query params or default to dashboard
    const redirectUrl = this.router.parseUrl(this.router.url).queryParams['redirect'] as string || '/dashboard';
    this.router.navigate([redirectUrl]);
  }

  /**
   * Get page title
   */
  get pageTitle(): string {
    return 'Iniciar Sesión';
  }
}
