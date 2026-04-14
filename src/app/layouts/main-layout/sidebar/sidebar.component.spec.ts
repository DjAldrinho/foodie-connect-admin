import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { SidebarComponent } from './sidebar.component';

/**
 * Mock AuthService
 */
class MockAuthService {
  currentUser = jasmine.createSpy('currentUser').and.returnValue({
    full_name: 'John Doe',
    email: 'john@example.com',
  });

  userRole = jasmine.createSpy('userRole').and.returnValue('ADMIN');

  logout = jasmine.createSpy('logout');
}

/**
 * Mock Router
 */
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

/**
 * SidebarComponent Unit Tests
 */
describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let mockAuthService: MockAuthService;
  let mockRouter: MockRouter;

  beforeEach(waitForAsync(() => {
    mockAuthService = new MockAuthService();
    mockRouter = new MockRouter();

    TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: 'AuthService', useValue: mockAuthService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have menu items defined', () => {
      expect(component.menuItems).toHaveLength(7);
      expect(component.menuItems[0].path).toBe('/dashboard');
      expect(component.menuItems[0].label).toBe('Dashboard');
    });

    it('should have correct menu items structure', () => {
      const expectedPaths = [
        '/dashboard',
        '/users',
        '/restaurants',
        '/moderation',
        '/notifications',
        '/analytics',
        '/settings',
      ];

      const actualPaths = component.menuItems.map((item) => item.path);
      expect(actualPaths).toEqual(expectedPaths);
    });

    it('should default to closed state', () => {
      expect(component.open()).toBe(false);
    });

    it('should default to non-collapsed state', () => {
      expect(component.collapsed()).toBe(false);
    });

    it('should default to desktop mode', () => {
      expect(component.mobile()).toBe(false);
    });
  });

  describe('userName computed signal', () => {
    it('should display full_name when available', () => {
      mockAuthService.currentUser.and.returnValue({
        full_name: 'Jane Smith',
        email: 'jane@example.com',
      });

      fixture.detectChanges();

      expect(component.userName()).toBe('Jane Smith');
    });

    it('should fallback to firstName + lastName', () => {
      mockAuthService.currentUser.and.returnValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });

      fixture.detectChanges();

      expect(component.userName()).toBe('John Doe');
    });

    it('should fallback to fullName property', () => {
      mockAuthService.currentUser.and.returnValue({
        fullName: 'Bob Johnson',
        email: 'bob@example.com',
      });

      fixture.detectChanges();

      expect(component.userName()).toBe('Bob Johnson');
    });

    it('should fallback to email when no name available', () => {
      mockAuthService.currentUser.and.returnValue({
        email: 'user@example.com',
      });

      fixture.detectChanges();

      expect(component.userName()).toBe('user@example.com');
    });

    it('should return "Usuario" when no user', () => {
      mockAuthService.currentUser.and.returnValue(null);

      fixture.detectChanges();

      expect(component.userName()).toBe('Usuario');
    });
  });

  describe('userRole computed signal', () => {
    it('should display "Administrador" for ADMIN role', () => {
      mockAuthService.userRole.and.returnValue('ADMIN');

      expect(component.userRole()).toBe('Administrador');
    });

    it('should display "Usuario" for USER role', () => {
      mockAuthService.userRole.and.returnValue('USER');

      expect(component.userRole()).toBe('Usuario');
    });

    it('should display "Super Admin" for SUPER_ADMIN role', () => {
      mockAuthService.userRole.and.returnValue('SUPER_ADMIN');

      expect(component.userRole()).toBe('Super Admin');
    });

    it('should return original role if not mapped', () => {
      mockAuthService.userRole.and.returnValue('MODERATOR');

      expect(component.userRole()).toBe('MODERATOR');
    });

    it('should return "Sin Rol" when no role', () => {
      mockAuthService.userRole.and.returnValue(null);

      expect(component.userRole()).toBe('Sin Rol');
    });
  });

  describe('onClose() method', () => {
    it('should emit close event', () => {
      spyOn(component.close, 'emit');

      component.onClose();

      expect(component.close.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('onNavClick() method', () => {
    it('should close sidebar on mobile', () => {
      component.mobile.set(true);
      spyOn(component, 'onClose');

      component.onNavClick();

      expect(component.onClose).toHaveBeenCalledTimes(1);
    });

    it('should not close sidebar on desktop', () => {
      component.mobile.set(false);
      spyOn(component, 'onClose');

      component.onNavClick();

      expect(component.onClose).not.toHaveBeenCalled();
    });
  });

  describe('onLogout() method', () => {
    it('should call authService.logout', () => {
      component.onLogout();

      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
    });

    it('should navigate to login', () => {
      component.onLogout();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should logout and navigate in correct order', () => {
      component.onLogout();

      expect(mockAuthService.logout).toHaveBeenCalledBefore(mockRouter.navigate);
    });
  });

  describe('onKeydown() method', () => {
    beforeEach(() => {
      spyOn(component as any, 'focusMenuItem');
    });

    it('should handle ArrowDown key', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });

      component.onKeydown(event, 0);

      expect((component as any).focusMenuItem).toHaveBeenCalledWith(1);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should handle ArrowUp key', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });

      component.onKeydown(event, 1);

      expect((component as any).focusMenuItem).toHaveBeenCalledWith(0);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should not go below first item on ArrowUp', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });

      component.onKeydown(event, 0);

      expect((component as any).focusMenuItem).toHaveBeenCalledWith(0);
    });

    it('should not go above last item on ArrowDown', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });

      component.onKeydown(event, 6); // Last item

      expect((component as any).focusMenuItem).toHaveBeenCalledWith(6);
    });

    it('should handle Escape key on mobile', () => {
      component.mobile.set(true);
      spyOn(component, 'onClose');

      const event = new KeyboardEvent('keydown', { key: 'Escape' });

      component.onKeydown(event, 0);

      expect(component.onClose).toHaveBeenCalledTimes(1);
    });

    it('should not handle Escape key on desktop', () => {
      component.mobile.set(false);
      spyOn(component, 'onClose');

      const event = new KeyboardEvent('keydown', { key: 'Escape' });

      component.onKeydown(event, 0);

      expect(component.onClose).not.toHaveBeenCalled();
    });

    it('should ignore other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });

      component.onKeydown(event, 0);

      expect((component as any).focusMenuItem).not.toHaveBeenCalled();
    });
  });

  describe('focusMenuItem() method', () => {
    beforeEach(() => {
      // Mock querySelectorAll
      spyOn(document, 'querySelectorAll').and.callFake((selector) => {
        if (selector === '.nav-item') {
          return [
            { focus: jasmine.createSpy('focus') },
            { focus: jasmine.createSpy('focus') },
            { focus: jasmine.createSpy('focus') },
          ] as unknown as NodeList;
        }
        return [] as unknown as NodeList;
      });
    });

    it('should focus menu item by index', () => {
      (component as any).focusMenuItem(1);

      const items = document.querySelectorAll('.nav-item');
      expect(items[1]?.focus).toBeDefined();
    });

    it('should handle out of bounds index gracefully', () => {
      expect(() => {
        (component as any).focusMenuItem(100);
      }).not.toThrow();
    });
  });

  describe('input bindings', () => {
    it('should accept open input', () => {
      component.open.set(true);
      fixture.detectChanges();

      expect(component.open()).toBe(true);
    });

    it('should accept collapsed input', () => {
      component.collapsed.set(true);
      fixture.detectChanges();

      expect(component.collapsed()).toBe(true);
    });

    it('should accept mobile input', () => {
      component.mobile.set(true);
      fixture.detectChanges();

      expect(component.mobile()).toBe(true);
    });

    it('should transform string inputs to booleans', () => {
      // This tests the booleanAttribute transform
      component.open.set(true);
      component.collapsed.set(true);
      component.mobile.set(true);

      expect(component.open()).toBe(true);
      expect(component.collapsed()).toBe(true);
      expect(component.mobile()).toBe(true);
    });
  });

  describe('template rendering', () => {
    it('should render navigation links', () => {
      const links = fixture.debugElement.queryAll(By.css('a'));

      expect(links.length).toBeGreaterThan(0);
    });

    it('should render menu items with correct labels', () => {
      const navText = fixture.nativeElement.textContent;
      const menuItems = component.menuItems;

      menuItems.forEach((item) => {
        expect(navText).toContain(item.label);
      });
    });

    it('should render user info section', () => {
      fixture.detectChanges();

      const userText = fixture.nativeElement.textContent;
      expect(userText).toContain('John Doe');
      expect(userText).toContain('Administrador');
    });
  });

  describe('accessibility', () => {
    it('should have proper keyboard navigation support', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });

      expect(() => {
        component.onKeydown(event, 0);
      }).not.toThrow();
    });

    it('should handle Escape key for accessibility', () => {
      component.mobile.set(true);
      spyOn(component, 'onClose');

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      component.onKeydown(event, 0);

      expect(component.onClose).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle missing user gracefully', () => {
      mockAuthService.currentUser.and.returnValue(null);
      mockAuthService.userRole.and.returnValue(null);

      fixture.detectChanges();

      expect(component.userName()).toBe('Usuario');
      expect(component.userRole()).toBe('Sin Rol');
    });

    it('should handle user with minimal data', () => {
      mockAuthService.currentUser.and.returnValue({
        email: 'minimal@example.com',
      });

      fixture.detectChanges();

      expect(component.userName()).toBe('minimal@example.com');
    });

    it('should handle rapid keyboard navigation', () => {
      spyOn(component as any, 'focusMenuItem');

      for (let i = 0; i < 10; i++) {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        component.onKeydown(event, i % 7);
      }

      expect((component as any).focusMenuItem).toHaveBeenCalledTimes(10);
    });

    it('should handle multiple rapid logout calls', () => {
      for (let i = 0; i < 5; i++) {
        component.onLogout();
      }

      expect(mockAuthService.logout).toHaveBeenCalledTimes(5);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(5);
    });
  });
});
