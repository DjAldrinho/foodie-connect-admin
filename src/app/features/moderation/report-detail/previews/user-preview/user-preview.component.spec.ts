/**
 * User Preview Component Tests
 * Strict TDD: Tests written before implementation
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserPreviewComponent } from './user-preview.component';

describe('UserPreviewComponent', () => {
  let component: UserPreviewComponent;
  let fixture: ComponentFixture<UserPreviewComponent>;

  const mockUser = {
    id: 'user-1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    bio: 'Food lover and restaurant enthusiast',
    statistics: {
      totalLogins: 150,
      lastLoginAt: '2026-04-10T09:00:00Z',
      restaurantsCreated: 2,
      reviewsWritten: 25,
      reportsSubmitted: 3,
    },
    createdAt: '2026-01-15T10:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPreviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserPreviewComponent);
    component = fixture.componentInstance;
    component.user = mockUser;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user information', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;

    expect(compiled.textContent).toContain('Juan Pérez');
    expect(compiled.textContent).toContain('juan@example.com');
  });

  it('should display user avatar', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const avatar = compiled.querySelector('.user-avatar');

    expect(avatar).toBeTruthy();
    expect(avatar.src).toContain('pravatar.cc');
  });

  it('should display user bio', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;

    expect(compiled.textContent).toContain('Food lover and restaurant enthusiast');
  });

  it('should display user statistics', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;

    expect(compiled.textContent).toContain('150');
    expect(compiled.textContent).toContain('2');
    expect(compiled.textContent).toContain('25');
    expect(compiled.textContent).toContain('3');
  });

  it('should display account creation date', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;

    expect(compiled.textContent).toContain('January');
    expect(compiled.textContent).toContain('2026');
  });

  it('should handle missing optional fields', () => {
    component.user = {
      ...mockUser,
      avatar: undefined,
      bio: undefined,
    };

    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
