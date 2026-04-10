import { Component, inject, signal, computed, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/services';
import { ToastNotificationService } from '../../../../core/services';
import { InputComponent } from '../../../../shared/components/input';
import { ButtonComponent } from '../../../../shared/components/button';

/**
 * LoginFormComponent - Login form with validation
 *
 * Features:
 * - Email input (required, email format)
 * - Password input (required, min 8 chars)
 * - Remember me checkbox
 * - Login submit button
 * - Forgot password link
 * - Real-time validation feedback
 * - Shows loading state during submission
 * - Disabled state while submitting
 * - Error message display
 * - Success calls AuthService.login()
 * - Enter key submits form
 * - ARIA required attributes
 * - ARIA invalid states with error messages
 * - AXE compliance (WCAG AA)
 *
 * @example
 * ```html
 * <app-login-form (loginSuccess)="onSuccess()"></app-login-form>
 * ```
 */
@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    InputComponent,
    ButtonComponent,
  ],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
})
export class LoginFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = AuthService();
  private readonly toastService = inject(ToastNotificationService);
  private readonly router = inject(Router);

  /**
   * Login form group
   */
  readonly form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [false],
  });

  /**
   * Loading state
   */
  readonly isLoading = signal(false);

  /**
   * Server error message
   */
  readonly serverError = signal('');

  /**
   * Form submitted state
   */
  readonly submitted = signal(false);

  /**
   * Form validation state
   */
  readonly isFormValid = computed(() => this.form.valid && !this.isLoading());

  /**
   * Get email control
   */
  get emailControl() {
    return this.form.get('email');
  }

  /**
   * Get password control
   */
  get passwordControl() {
    return this.form.get('password');
  }

  /**
   * Get remember me control
   */
  get rememberMeControl() {
    return this.form.get('rememberMe');
  }

  /**
   * Login success event
   */
  readonly loginSuccess = output<void>();

  /**
   * Handle form submission
   */
  async onSubmit(): Promise<void> {
    // Mark form as submitted
    this.submitted.set(true);

    if (this.form.invalid || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.serverError.set('');

    const { email, password, rememberMe } = this.form.value;

    try {
      await this.authService.login({ email, password, rememberMe });

      this.toastService.success('Inicio de sesión exitoso');
      this.loginSuccess.emit();
    } catch (error: any) {
      console.error('Login error:', error);
      this.handleLoginError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Handle login error
   */
  private handleLoginError(error: any): void {
    if (error.status === 401) {
      this.serverError.set('Credenciales inválidas. Por favor, verifica tu email y contraseña.');
    } else if (error.status === 429) {
      this.serverError.set('Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente.');
    } else if (error.status === 0) {
      this.serverError.set('Error de conexión. Por favor, verifica tu conexión a internet.');
    } else {
      this.serverError.set('Ocurrió un error al iniciar sesión. Por favor, intenta nuevamente.');
    }
  }

  /**
   * Get error message for email field
   */
  getEmailError(): string {
    const control = this.emailControl;

    // Only show error if field is touched or form was submitted
    if (!control?.touched && !this.submitted()) {
      return '';
    }

    if (control?.errors?.['required']) {
      return 'El email es requerido';
    }
    if (control?.errors?.['email']) {
      return 'Ingresa un email válido';
    }
    return '';
  }

  /**
   * Get error message for password field
   */
  getPasswordError(): string {
    const control = this.passwordControl;

    // Only show error if field is touched or form was submitted
    if (!control?.touched && !this.submitted()) {
      return '';
    }

    if (control?.errors?.['required']) {
      return 'La contraseña es requerida';
    }
    if (control?.errors?.['minlength']) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    return '';
  }

  /**
   * Handle Enter key press
   */
  onKeyPress(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' && this.isFormValid()) {
      this.onSubmit();
    }
  }
}
