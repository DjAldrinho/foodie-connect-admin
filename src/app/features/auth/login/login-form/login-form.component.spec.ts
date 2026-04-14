import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginFormComponent } from './login-form.component';

/**
 * Mock AuthService
 */
class MockAuthService {
  login = jasmine.createSpy('login').and.returnValue(
    of({
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
    })
  );
}

/**
 * Mock ToastNotificationService
 */
class MockToastService {
  success = jasmine.createSpy('success');
  error = jasmine.createSpy('error');
}

/**
 * Mock Router
 */
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

/**
 * LoginFormComponent Unit Tests
 */
describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let mockAuthService: MockAuthService;
  let mockToastService: MockToastService;
  let mockRouter: MockRouter;

  beforeEach(waitForAsync(() => {
    mockAuthService = new MockAuthService();
    mockToastService = new MockToastService();
    mockRouter = new MockRouter();

    TestBed.configureTestingModule({
      imports: [LoginFormComponent],
      providers: [
        { provide: 'AuthService', useValue: mockAuthService },
        { provide: ToastNotificationService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty email', () => {
      expect(component.email()).toBe('');
    });

    it('should have empty password', () => {
      expect(component.password()).toBe('');
    });

    it('should have rememberMe unchecked', () => {
      expect(component.rememberMe()).toBe(false);
    });

    it('should not be loading', () => {
      expect(component.isLoading()).toBe(false);
    });

    it('should have no server error', () => {
      expect(component.serverError()).toBe('');
    });

    it('should not be submitted', () => {
      expect(component.submitted()).toBe(false);
    });

    it('should have invalid form initially', () => {
      expect(component.isFormValid()).toBe(false);
    });
  });

  describe('email validation', () => {
    it('should show no error initially', () => {
      expect(component.getEmailError()).toBe('');
    });

    it('should show required error after submit', () => {
      component.submitted.set(true);

      expect(component.getEmailError()).toBe('El email es requerido');
    });

    it('should show required error after blur', () => {
      component.onEmailBlur();

      expect(component.getEmailError()).toBe('El email es requerido');
    });

    it('should show invalid email error', () => {
      component.email.set('invalid-email');
      component.onEmailBlur();

      expect(component.getEmailError()).toBe('Ingresa un email válido');
    });

    it('should accept valid email', () => {
      component.email.set('test@example.com');
      component.onEmailBlur();

      expect(component.getEmailError()).toBe('');
    });

    it('should validate email format correctly', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co',
        'user+tag@example.org',
      ];

      validEmails.forEach((email) => {
        component.email.set(email);
        expect(component.getEmailError()).toBe('');
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user @example.com',
      ];

      invalidEmails.forEach((email) => {
        component.email.set(email);
        component.onEmailBlur();

        expect(component.getEmailError()).not.toBe('');
      });
    });
  });

  describe('password validation', () => {
    it('should show no error initially', () => {
      expect(component.getPasswordError()).toBe('');
    });

    it('should show required error after submit', () => {
      component.submitted.set(true);

      expect(component.getPasswordError()).toBe('La contraseña es requerida');
    });

    it('should show required error after blur', () => {
      component.onPasswordBlur();

      expect(component.getPasswordError()).toBe('La contraseña es requerida');
    });

    it('should show minimum length error', () => {
      component.password.set('short');
      component.onPasswordBlur();

      expect(component.getPasswordError()).toBe('La contraseña debe tener al menos 8 caracteres');
    });

    it('should accept valid password', () => {
      component.password.set('password123');
      component.onPasswordBlur();

      expect(component.getPasswordError()).toBe('');
    });
  });

  describe('form validation', () => {
    it('should be invalid with empty fields', () => {
      expect(component.isFormValid()).toBe(false);
    });

    it('should be invalid with invalid email', () => {
      component.email.set('invalid');
      component.password.set('password123');

      expect(component.isFormValid()).toBe(false);
    });

    it('should be invalid with short password', () => {
      component.email.set('test@example.com');
      component.password.set('short');

      expect(component.isFormValid()).toBe(false);
    });

    it('should be valid with correct data', () => {
      component.email.set('test@example.com');
      component.password.set('password123');

      expect(component.isFormValid()).toBe(true);
    });

    it('should be invalid while loading', () => {
      component.email.set('test@example.com');
      component.password.set('password123');
      component.isLoading.set(true);

      expect(component.isFormValid()).toBe(false);
    });
  });

  describe('onSubmit() method', () => {
    beforeEach(() => {
      component.email.set('test@example.com');
      component.password.set('password123');
    });

    it('should submit valid form', async () => {
      await component.onSubmit();

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });
    });

    it('should set loading state during submission', async () => {
      const loginPromise = component.onSubmit();

      expect(component.isLoading()).toBe(true);

      await loginPromise;

      expect(component.isLoading()).toBe(false);
    });

    it('should mark form as submitted', async () => {
      await component.onSubmit();

      expect(component.submitted()).toBe(true);
    });

    it('should not submit invalid form', async () => {
      component.email.set('invalid-email');

      await component.onSubmit();

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should show toast on success', async () => {
      await component.onSubmit();

      expect(mockToastService.success).toHaveBeenCalledWith('Inicio de sesión exitoso');
    });

    it('should emit loginSuccess event', async () => {
      spyOn(component.loginSuccess, 'emit');

      await component.onSubmit();

      expect(component.loginSuccess.emit).toHaveBeenCalledTimes(1);
    });

    it('should handle rememberMe option', async () => {
      component.rememberMe.set(true);

      await component.onSubmit();

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      });
    });

    it('should clear server error on new submission', async () => {
      component.serverError.set('Previous error');

      await component.onSubmit();

      expect(component.serverError()).toBe('');
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      component.email.set('test@example.com');
      component.password.set('password123');
    });

    it('should handle 401 error', async () => {
      const error = { status: 401 };
      mockAuthService.login.and.returnValue(throwError(() => error));

      await component.onSubmit();

      expect(component.serverError()).toBe('Credenciales inválidas. Por favor, verifica tu email y contraseña.');
    });

    it('should handle 429 error (too many attempts)', async () => {
      const error = { status: 429 };
      mockAuthService.login.and.returnValue(throwError(() => error));

      await component.onSubmit();

      expect(component.serverError()).toBe('Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente.');
    });

    it('should handle connection error (status 0)', async () => {
      const error = { status: 0 };
      mockAuthService.login.and.returnValue(throwError(() => error));

      await component.onSubmit();

      expect(component.serverError()).toBe('Error de conexión. Por favor, verifica tu conexión a internet.');
    });

    it('should handle generic error', async () => {
      const error = { status: 500 };
      mockAuthService.login.and.returnValue(throwError(() => error));

      await component.onSubmit();

      expect(component.serverError()).toBe('Ocurrió un error al iniciar sesión. Por favor, intenta nuevamente.');
    });

    it('should reset loading state after error', async () => {
      const error = { status: 401 };
      mockAuthService.login.and.returnValue(throwError(() => error));

      await component.onSubmit();

      expect(component.isLoading()).toBe(false);
    });
  });

  describe('onEmailBlur() method', () => {
    it('should mark email as touched', () => {
      component.onEmailBlur();

      expect(component.emailTouched()).toBe(true);
    });
  });

  describe('onPasswordBlur() method', () => {
    it('should mark password as touched', () => {
      component.onPasswordBlur();

      expect(component.passwordTouched()).toBe(true);
    });
  });

  describe('onKeyPress() method', () => {
    it('should submit on Enter when form is valid', () => {
      component.email.set('test@example.com');
      component.password.set('password123');
      spyOn(component, 'onSubmit');

      const event = new KeyboardEvent('keypress', { key: 'Enter' });
      component.onKeyPress(event);

      expect(component.onSubmit).toHaveBeenCalledTimes(1);
    });

    it('should not submit on Enter when form is invalid', () => {
      component.email.set('invalid');
      spyOn(component, 'onSubmit');

      const event = new KeyboardEvent('keypress', { key: 'Enter' });
      component.onKeyPress(event);

      expect(component.onSubmit).not.toHaveBeenCalled();
    });

    it('should ignore non-Enter keys', () => {
      spyOn(component, 'onSubmit');

      const event = new KeyboardEvent('keypress', { key: 'a' });
      component.onKeyPress(event);

      expect(component.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('signals reactivity', () => {
    it('should update isFormValid when email changes', () => {
      expect(component.isFormValid()).toBe(false);

      component.email.set('test@example.com');
      component.password.set('password123');

      expect(component.isFormValid()).toBe(true);
    });

    it('should update isFormValid when password changes', () => {
      component.email.set('test@example.com');

      expect(component.isFormValid()).toBe(false);

      component.password.set('password123');

      expect(component.isFormValid()).toBe(true);
    });

    it('should update isFormValid when loading changes', () => {
      component.email.set('test@example.com');
      component.password.set('password123');

      expect(component.isFormValid()).toBe(true);

      component.isLoading.set(true);

      expect(component.isFormValid()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty email submission', async () => {
      component.password.set('password123');

      await component.onSubmit();

      expect(mockAuthService.login).not.toHaveBeenCalled();
      expect(component.getEmailError()).not.toBe('');
    });

    it('should handle empty password submission', async () => {
      component.email.set('test@example.com');

      await component.onSubmit();

      expect(mockAuthService.login).not.toHaveBeenCalled();
      expect(component.getPasswordError()).not.toBe('');
    });

    it('should handle rapid form submissions', async () => {
      component.email.set('test@example.com');
      component.password.set('password123');

      const promises = [
        component.onSubmit(),
        component.onSubmit(),
        component.onSubmit(),
      ];

      await Promise.all(promises);

      expect(mockAuthService.login).toHaveBeenCalledTimes(3);
    });

    it('should handle very long password', () => {
      const longPassword = 'a'.repeat(1000);
      component.password.set(longPassword);
      component.onPasswordBlur();

      expect(component.getPasswordError()).toBe('');
    });

    it('should handle special characters in email', () => {
      component.email.set('user+tag@example.com');
      component.onEmailBlur();

      expect(component.getEmailError()).toBe('');
    });
  });

  describe('accessibility', () => {
    it('should provide proper error messages', () => {
      component.onEmailBlur();

      const error = component.getEmailError();
      expect(error).toBeTruthy();
      expect(error.length).toBeGreaterThan(0);
    });

    it('should only show errors after blur or submit', () => {
      expect(component.getEmailError()).toBe('');

      component.email.set('invalid');

      expect(component.getEmailError()).toBe('');

      component.onEmailBlur();

      expect(component.getEmailError()).not.toBe('');
    });
  });

  describe('form reset', () => {
    it('should maintain state between submissions', async () => {
      component.email.set('test@example.com');
      component.password.set('password123');

      await component.onSubmit();

      expect(component.submitted()).toBe(true);

      // Reset for next submission
      component.submitted.set(false);
      component.email.set('another@example.com');

      await component.onSubmit();

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'another@example.com',
        password: 'password123',
        rememberMe: false,
      });
    });
  });
});
