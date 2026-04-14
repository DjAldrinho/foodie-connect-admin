import { TestBed } from '@angular/core/testing';
import { ToastNotificationService, ToastType } from './toast-notification.service';

/**
 * ToastNotificationService Unit Tests
 *
 * Tests for toast notification service with signals and auto-dismiss
 */
describe('ToastNotificationService', () => {
  let service: ToastNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastNotificationService],
    });

    service = TestBed.inject(ToastNotificationService);
  });

  afterEach(() => {
    service.dismissAll();
    jasmine.clock().uninstall();
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  describe('show() method', () => {
  it('should show a toast and return ID', () => {
    const toastId = service.show('Test message', 'info');

    expect(toastId).toBeTruthy();
    expect(typeof toastId).toBe('string');
    expect(service.hasToast(toastId)).toBe(true);
  });

    it('should add toast to toasts signal', () => {
      service.show('Test message', 'success');

      expect(service.toastCount()).toBe(1);
      expect(service.hasVisibleToasts()).toBe(true);
    });

    it('should create toast with correct properties', () => {
      const toastId = service.show('Test message', 'error', 1000);

      const toast = service.getToast(toastId);
      expect(toast).toBeDefined();
      expect(toast?.message).toBe('Test message');
      expect(toast?.type).toBe('error');
      expect(toast?.duration).toBe(1000);
      expect(toast?.timestamp).toBeDefined();
    });

    it('should generate unique toast IDs', () => {
      const id1 = service.show('Message 1');
      const id2 = service.show('Message 2');

      expect(id1).not.toBe(id2);
    });
  });

  describe('toast types', () => {
    it('should show success toast', () => {
      const toastId = service.success('Success message');
      const toast = service.getToast(toastId);

      expect(toast?.type).toBe('success');
    });

    it('should show error toast', () => {
      const toastId = service.error('Error message');
      const toast = service.getToast(toastId);

      expect(toast?.type).toBe('error');
    });

    it('should show info toast', () => {
      const toastId = service.info('Info message');
      const toast = service.getToast(toastId);

      expect(toast?.type).toBe('info');
    });

    it('should show warning toast', () => {
      const toastId = service.warning('Warning message');
      const toast = service.getToast(toastId);

      expect(toast?.type).toBe('warning');
    });
  });

  describe('stack management', () => {
    it('should keep only max visible toasts (3)', () => {
      service.show('Toast 1');
      service.show('Toast 2');
      service.show('Toast 3');
      service.show('Toast 4');

      expect(service.toastCount()).toBe(3);
      expect(service.visibleToasts().length).toBe(3);
    });

    it('should remove oldest toast when max exceeded', () => {
      const id1 = service.show('Toast 1');
      service.show('Toast 2');
      service.show('Toast 3');
      service.show('Toast 4');

      expect(service.hasToast(id1)).toBe(false);
    });

    it('should compute visibleToasts correctly', () => {
      service.show('Toast 1');
      service.show('Toast 2');
      service.show('Toast 3');
      service.show('Toast 4');

      expect(service.visibleToasts().length).toBe(3);
    });
  });

  describe('auto-dismiss', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    it('should auto-dismiss toast after duration', () => {
      const toastId = service.show('Test', 'info', 1000);

      expect(service.hasToast(toastId)).toBe(true);

      jasmine.clock().tick(1000);
      jasmine.clock().tick(300); // dismissDuration

      expect(service.hasToast(toastId)).toBe(false);
    });

    it('should not auto-dismiss if duration is 0', () => {
      const toastId = service.show('Test', 'info', 0);

      jasmine.clock().tick(10000);

      expect(service.hasToast(toastId)).toBe(true);
    });

    it('should clear timer on manual dismiss', () => {
      const toastId = service.show('Test', 'info', 5000);

      service.dismiss(toastId);

      jasmine.clock().tick(5000);
      jasmine.clock().tick(300);

      expect(service.hasToast(toastId)).toBe(false);
    });
  });

  describe('dismiss() method', () => {
    it('should dismiss specific toast', () => {
      const toastId = service.show('Test message');

      expect(service.hasToast(toastId)).toBe(true);

      service.dismiss(toastId);

      // Wait for dismiss animation
      jasmine.clock().install();
      jasmine.clock().tick(300);
      jasmine.clock().uninstall();

      expect(service.hasToast(toastId)).toBe(false);
    });

    it('should clear timer when dismissing', () => {
      jasmine.clock().install();
      const toastId = service.show('Test', 'info', 5000);

      service.dismiss(toastId);

      jasmine.clock().tick(5000);
      jasmine.clock().tick(300);

      expect(service.hasToast(toastId)).toBe(false);
    });

    it('should do nothing if toast does not exist', () => {
      expect(() => {
        service.dismiss('non-existent-id');
      }).not.toThrow();
    });
  });

  describe('dismissAll() method', () => {
    it('should dismiss all toasts', () => {
      service.show('Toast 1');
      service.show('Toast 2');
      service.show('Toast 3');

      expect(service.toastCount()).toBe(3);

      service.dismissAll();

      // Wait for dismiss animation
      jasmine.clock().install();
      jasmine.clock().tick(300);
      jasmine.clock().uninstall();

      expect(service.toastCount()).toBe(0);
      expect(service.hasVisibleToasts()).toBe(false);
    });

    it('should clear all timers', () => {
      jasmine.clock().install();
      service.show('Toast 1', 'info', 5000);
      service.show('Toast 2', 'info', 5000);

      service.dismissAll();

      jasmine.clock().tick(5000);
      jasmine.clock().tick(300);

      expect(service.toastCount()).toBe(0);
    });
  });

  describe('hasToast() method', () => {
    it('should return true if toast exists', () => {
      const toastId = service.show('Test');

      expect(service.hasToast(toastId)).toBe(true);
    });

    it('should return false if toast does not exist', () => {
      expect(service.hasToast('non-existent')).toBe(false);
    });
  });

  describe('getToast() method', () => {
    it('should return toast by ID', () => {
      const toastId = service.show('Test message', 'success');
      const toast = service.getToast(toastId);

      expect(toast).toBeDefined();
      expect(toast?.id).toBe(toastId);
      expect(toast?.message).toBe('Test message');
    });

    it('should return undefined for non-existent toast', () => {
      const toast = service.getToast('non-existent');

      expect(toast).toBeUndefined();
    });
  });

  describe('signals', () => {
    it('should update toasts signal correctly', () => {
      service.show('Toast 1');
      expect(service.toasts().length).toBe(1);

      service.show('Toast 2');
      expect(service.toasts().length).toBe(2);
    });

    it('should update hasVisibleToasts signal correctly', () => {
      expect(service.hasVisibleToasts()).toBe(false);

      service.show('Toast 1');
      expect(service.hasVisibleToasts()).toBe(true);

      service.dismissAll();
      jasmine.clock().install();
      jasmine.clock().tick(300);
      jasmine.clock().uninstall();

      expect(service.hasVisibleToasts()).toBe(false);
    });

    it('should update toastCount signal correctly', () => {
      expect(service.toastCount()).toBe(0);

      service.show('Toast 1');
      expect(service.toastCount()).toBe(1);

      service.show('Toast 2');
      expect(service.toastCount()).toBe(2);
    });
  });

  describe('action buttons', () => {
    it('should support toast with action', () => {
      const actionHandler = jasmine.createSpy();
      const action = {
        label: 'Undo',
        handler: actionHandler,
      };

      const toastId = service.show('Test', 'info', 5000, action);
      const toast = service.getToast(toastId);

      expect(toast?.action).toBeDefined();
      expect(toast?.action?.label).toBe('Undo');
      expect(toast?.action?.handler).toBe(actionHandler);
    });
  });

  describe('cleanup', () => {
    it('should clear all timers on destroy', () => {
      jasmine.clock().install();
      service.show('Toast 1', 'info', 5000);
      service.show('Toast 2', 'info', 5000);

      service.ngOnDestroy();

      jasmine.clock().tick(5000);

      // Toasts should not auto-dismiss after ngOnDestroy
      expect(service.toastCount()).toBe(2);
    });
  });
});
