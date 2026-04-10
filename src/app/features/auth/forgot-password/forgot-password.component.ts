import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

/**
 * ForgotPasswordComponent - Password recovery form
 *
 * Features:
 * - Email input for password reset
 * - Submit button to send reset email
 * - Back to login link
 * - Loading state during submission
 * - Success/error messages
 * - Form validation
 *
 * @example
 * ```html
 * <app-forgot-password></app-forgot-password>
 * ```
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    InputComponent,
    ButtonComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  /**
   * Form group
   */
  readonly form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  /**
   * Loading state
   */
  readonly isLoading = signal(false);

  /**
   * Success state
   */
  readonly isSubmitted = signal(false);

  /**
   * Error message
   */
  readonly errorMessage = signal('');

  /**
   * Get email control
   */
  get emailControl() {
    return this.form.get('email');
  }

  /**
   * Handle form submission
   */
  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email } = this.form.value;

    try {
      // TODO: Implement password reset API call
      // await this.authService.requestPasswordReset(email);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      this.isSubmitted.set(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      this.errorMessage.set('Ocurrió un error al solicitar el restablecimiento de contraseña. Por favor, intenta nuevamente.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get error message for email field
   */
  getEmailError(): string {
    if (this.emailControl?.errors?.['required']) {
      return 'El email es requerido';
    }
    if (this.emailControl?.errors?.['email']) {
      return 'Ingresa un email válido';
    }
    return '';
  }

  /**
   * Navigate back to login
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
