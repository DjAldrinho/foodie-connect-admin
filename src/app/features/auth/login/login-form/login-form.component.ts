import { Component, inject, signal, computed, output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { lastValueFrom } from 'rxjs';
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
    MatIconModule,
    InputComponent,
    ButtonComponent,
  ],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
})
export class LoginFormComponent {
  private readonly authService = AuthService();
  private readonly toastService = inject(ToastNotificationService);
  private readonly router = inject(Router);

  constructor() {
    console.log('🔧 LoginFormComponent initialized');
  }

  /**
   * Form fields
   */
  readonly email = signal('');
  readonly password = signal('');
  readonly rememberMe = signal(false);

  /**
   * Field touched states
   */
  readonly emailTouched = signal(false);
  readonly passwordTouched = signal(false);

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
  readonly isFormValid = computed(() => {
    const email = this.email();
    const password = this.password();

    // Email validation
    const emailValid = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Password validation
    const passwordValid = password.length >= 8;

    const valid = emailValid && passwordValid && !this.isLoading();

    console.log('🔄 isFormValid computed:', {
      email,
      password: `${password.length} chars`,
      emailValid,
      passwordValid,
      isLoading: this.isLoading(),
      valid,
    });

    return valid;
  });

  /**
   * Login success event
   */
  readonly loginSuccess = output<void>();

  /**
   * Get error message for email field
   */
  getEmailError(): string {
    const email = this.email();

    // Only show error if field is touched or form was submitted
    if (!this.emailTouched() && !this.submitted()) {
      return '';
    }

    if (email.length === 0) {
      return 'El email es requerido';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Ingresa un email válido';
    }
    return '';
  }

  /**
   * Get error message for password field
   */
  getPasswordError(): string {
    const password = this.password();

    // Only show error if field is touched or form was submitted
    if (!this.passwordTouched() && !this.submitted()) {
      return '';
    }

    if (password.length === 0) {
      return 'La contraseña es requerida';
    }
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    return '';
  }

  /**
   * Handle form submission
   */
  async onSubmit(event?: Event): Promise<void> {
    // Prevent default form submission (page reload)
    if (event) {
      event.preventDefault();
    }

    console.log('🔐 Form submitted!');
    console.log('📧 Email:', this.email());
    console.log('🔑 Password length:', this.password().length);

    // Mark form as submitted
    this.submitted.set(true);

    // Validate
    if (!this.isFormValid()) {
      console.log('❌ Form is invalid');
      console.log('❌ isFormValid:', this.isFormValid());
      console.log('❌ email:', this.email());
      console.log('❌ password:', this.password());
      return;
    }

    console.log('✅ Form is valid, attempting login...');

    this.isLoading.set(true);
    this.serverError.set('');

    try {
      // Convert Observable to Promise and wait for completion
      const user = await lastValueFrom(
        this.authService.login({
          email: this.email(),
          password: this.password(),
          rememberMe: this.rememberMe(),
        })
      );

      console.log('✅ Login successful! User:', user);
      this.toastService.success('Inicio de sesión exitoso');
      this.loginSuccess.emit();
    } catch (error: any) {
      console.error('❌ Login error:', error);
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
   * Handle email input blur
   */
  onEmailBlur(): void {
    console.log('📧 Email blur, value:', this.email());
    this.emailTouched.set(true);
  }

  /**
   * Handle password input blur
   */
  onPasswordBlur(): void {
    console.log('🔑 Password blur, length:', this.password().length);
    this.passwordTouched.set(true);
  }

  /**
   * Handle Enter key press
   */
  onKeyPress(event: Event): void {
    console.log('⌨️  Key pressed:', (event as KeyboardEvent).key);
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' && this.isFormValid()) {
      console.log('⌨️  Enter pressed with valid form, submitting...');
      keyboardEvent.preventDefault();
      this.onSubmit();
    }
  }
}
