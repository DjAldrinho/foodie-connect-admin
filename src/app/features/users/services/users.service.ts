/**
 * Users Service
 * Handles all user-related operations
 */

import { Injectable, signal } from '@angular/core';
import { Observable, of, delay, tap, BehaviorSubject, map } from 'rxjs';
import { BaseService } from '../../../core/services/base.service';
import type {
  UserListItem,
  UserDetail,
  UserListFilters,
  BulkActionRequest,
  ChangeRoleRequest,
  UserStatistics,
  RestaurantSummary,
  ReviewSummary,
  UserActivity,
} from '../../../models/users.types';
import type { PaginatedResponse, PaginationParams } from '../../../models/common.types';
import { UserRole, UserStatus } from '../../../models/auth.types';

/**
 * Mock users data
 */
const MOCK_USERS: UserListItem[] = [
  {
    id: '1',
    email: 'juan.perez@example.com',
    firstName: 'Juan',
    lastName: 'Pérez',
    fullName: 'Juan Pérez',
    avatar: 'https://i.pravatar.cc/150?img=1',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    createdAt: '2026-01-15T10:00:00Z',
    lastLoginAt: '2026-04-09T09:30:00Z',
  },
  {
    id: '2',
    email: 'maria.garcia@example.com',
    firstName: 'María',
    lastName: 'García',
    fullName: 'María García',
    avatar: 'https://i.pravatar.cc/150?img=2',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    createdAt: '2026-02-01T14:30:00Z',
    lastLoginAt: '2026-04-08T16:45:00Z',
  },
  {
    id: '3',
    email: 'carlos.lopez@example.com',
    firstName: 'Carlos',
    lastName: 'López',
    fullName: 'Carlos López',
    avatar: 'https://i.pravatar.cc/150?img=3',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    createdAt: '2026-02-10T08:15:00Z',
    lastLoginAt: '2026-04-07T11:20:00Z',
  },
  {
    id: '4',
    email: 'ana.martinez@example.com',
    firstName: 'Ana',
    lastName: 'Martínez',
    fullName: 'Ana Martínez',
    avatar: 'https://i.pravatar.cc/150?img=4',
    role: UserRole.USER,
    status: UserStatus.INACTIVE,
    createdAt: '2026-02-15T12:00:00Z',
    lastLoginAt: '2026-03-20T14:30:00Z',
  },
  {
    id: '5',
    email: 'luis.rodriguez@example.com',
    firstName: 'Luis',
    lastName: 'Rodríguez',
    fullName: 'Luis Rodríguez',
    avatar: 'https://i.pravatar.cc/150?img=5',
    role: UserRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
    createdAt: '2026-01-01T09:00:00Z',
    lastLoginAt: '2026-04-09T08:00:00Z',
  },
  {
    id: '6',
    email: 'carmen.sanchez@example.com',
    firstName: 'Carmen',
    lastName: 'Sánchez',
    fullName: 'Carmen Sánchez',
    avatar: 'https://i.pravatar.cc/150?img=6',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    createdAt: '2026-03-01T10:30:00Z',
    lastLoginAt: '2026-04-06T15:10:00Z',
  },
  {
    id: '7',
    email: 'javier.fernandez@example.com',
    firstName: 'Javier',
    lastName: 'Fernández',
    fullName: 'Javier Fernández',
    avatar: 'https://i.pravatar.cc/150?img=7',
    role: UserRole.USER,
    status: UserStatus.SUSPENDED,
    createdAt: '2026-03-05T11:00:00Z',
    lastLoginAt: '2026-03-25T09:45:00Z',
  },
  {
    id: '8',
    email: 'laura.gomez@example.com',
    firstName: 'Laura',
    lastName: 'Gómez',
    fullName: 'Laura Gómez',
    avatar: 'https://i.pravatar.cc/150?img=8',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    createdAt: '2026-03-10T14:20:00Z',
    lastLoginAt: '2026-04-08T10:30:00Z',
  },
  {
    id: '9',
    email: 'diego.diaz@example.com',
    firstName: 'Diego',
    lastName: 'Díaz',
    fullName: 'Diego Díaz',
    avatar: 'https://i.pravatar.cc/150?img=9',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    createdAt: '2026-02-20T09:15:00Z',
    lastLoginAt: '2026-04-09T07:50:00Z',
  },
  {
    id: '10',
    email: 'patricia.ruiz@example.com',
    firstName: 'Patricia',
    lastName: 'Ruiz',
    fullName: 'Patricia Ruiz',
    avatar: 'https://i.pravatar.cc/150?img=10',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    createdAt: '2026-03-15T16:00:00Z',
    lastLoginAt: '2026-04-05T14:20:00Z',
  },
  {
    id: '11',
    email: 'miguel.castro@example.com',
    firstName: 'Miguel',
    lastName: 'Castro',
    fullName: 'Miguel Castro',
    avatar: 'https://i.pravatar.cc/150?img=11',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    createdAt: '2026-03-20T11:30:00Z',
    lastLoginAt: '2026-04-07T09:10:00Z',
  },
  {
    id: '12',
    email: 'isabel.ramos@example.com',
    firstName: 'Isabel',
    lastName: 'Ramos',
    fullName: 'Isabel Ramos',
    avatar: 'https://i.pravatar.cc/150?img=12',
    role: UserRole.USER,
    status: UserStatus.INACTIVE,
    createdAt: '2026-03-25T13:45:00Z',
    lastLoginAt: '2026-03-30T16:20:00Z',
  },
  {
    id: '13',
    email: 'raul.morales@example.com',
    firstName: 'Raúl',
    lastName: 'Morales',
    fullName: 'Raúl Morales',
    avatar: 'https://i.pravatar.cc/150?img=13',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    createdAt: '2026-04-01T10:00:00Z',
    lastLoginAt: '2026-04-08T11:40:00Z',
  },
  {
    id: '14',
    email: 'teresa.torres@example.com',
    firstName: 'Teresa',
    lastName: 'Torres',
    fullName: 'Teresa Torres',
    avatar: 'https://i.pravatar.cc/150?img=14',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    createdAt: '2026-04-02T15:30:00Z',
    lastLoginAt: '2026-04-06T13:50:00Z',
  },
  {
    id: '15',
    email: 'fernando.ortega@example.com',
    firstName: 'Fernando',
    lastName: 'Ortega',
    fullName: 'Fernando Ortega',
    avatar: 'https://i.pravatar.cc/150?img=15',
    role: UserRole.USER,
    status: UserStatus.SUSPENDED,
    createdAt: '2026-04-03T09:20:00Z',
    lastLoginAt: '2026-04-05T10:15:00Z',
  },
];

@Injectable({
  providedIn: 'root',
})
export class UsersService extends BaseService<UserListItem> {
  // In-memory storage for mock data
  private usersSignal = signal<UserListItem[]>([...MOCK_USERS]);

  constructor() {
    super('users');
  }

  /**
   * Get paginated list of users with filters
   */
  override getAll(
    pagination?: PaginationParams,
    filters?: UserListFilters
  ): Observable<PaginatedResponse<UserListItem>> {
    const users = this.usersSignal();

    // Apply filters
    let filtered = [...users];

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.role) {
      filtered = filtered.filter((user) => user.role === filters.role);
    }

    if (filters?.status) {
      filtered = filtered.filter((user) => user.status === filters.status);
    }

    if (filters?.startDate) {
      filtered = filtered.filter((user) => user.createdAt >= filters.startDate!);
    }

    if (filters?.endDate) {
      filtered = filtered.filter((user) => user.createdAt <= filters.endDate!);
    }

    // Apply sorting
    const sortBy = pagination?.sortBy || 'createdAt';
    const sortOrder = pagination?.sortOrder || 'desc';

    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof UserListItem];
      const bVal = b[sortBy as keyof UserListItem];

      if (aVal === undefined || bVal === undefined) {
        return 0;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Apply pagination
    const page = pagination?.page || 1;
    const pageSize = pagination?.pageSize || 10;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return of({
      items,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    }).pipe(delay(500)); // Simulate network delay
  }

  /**
   * Get user by ID with full details
   */
  getUserById(id: string): Observable<UserDetail> {
    const users = this.usersSignal();
    const user = users.find((u) => u.id === id);

    if (!user) {
      throw new Error('User not found');
    }

    const userDetail: UserDetail = {
      ...user,
      phone: '+34 600 123 456',
      bio: 'Food lover and restaurant enthusiast',
      preferences: {
        language: 'es',
        notificationEmail: true,
        notificationPush: true,
        theme: 'light',
      },
      statistics: {
        totalLogins: Math.floor(Math.random() * 100) + 10,
        lastLoginAt: user.lastLoginAt,
        restaurantsCreated: Math.floor(Math.random() * 5),
        reviewsWritten: Math.floor(Math.random() * 50) + 5,
        reportsSubmitted: Math.floor(Math.random() * 3),
      },
      updatedAt: user.createdAt,
    };

    return of(userDetail).pipe(delay(300));
  }

  /**
   * Update user role
   */
  updateUserRole(id: string, request: ChangeRoleRequest): Observable<UserDetail> {
    const users = this.usersSignal();
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updated = [...users];
    updated[userIndex] = {
      ...updated[userIndex],
      role: request.role,
    };

    this.usersSignal.set(updated);

    return this.getUserById(id).pipe(delay(300));
  }

  /**
   * Activate user
   */
  activateUser(id: string): Observable<UserDetail> {
    return this.updateUserStatus(id, 'ACTIVE' as UserStatus);
  }

  /**
   * Deactivate user
   */
  deactivateUser(id: string): Observable<UserDetail> {
    return this.updateUserStatus(id, 'INACTIVE' as UserStatus);
  }

  /**
   * Suspend user
   */
  suspendUser(id: string): Observable<UserDetail> {
    return this.updateUserStatus(id, 'SUSPENDED' as UserStatus);
  }

  /**
   * Delete user (soft delete)
   */
  deleteUser(id: string): Observable<void> {
    const users = this.usersSignal();
    const updated = users.filter((u) => u.id !== id);
    this.usersSignal.set(updated);

    return of(undefined).pipe(delay(300));
  }

  /**
   * Perform bulk action on multiple users
   */
  bulkAction(request: BulkActionRequest): Observable<void> {
    const users = this.usersSignal();
    const updated = [...users];

    request.userIds.forEach((id) => {
      const index = updated.findIndex((u) => u.id === id);
      if (index !== -1) {
        switch (request.action) {
          case 'activate':
            updated[index].status = UserStatus.ACTIVE;
            break;
          case 'deactivate':
            updated[index].status = UserStatus.INACTIVE;
            break;
          case 'updateRole':
            if (request.payload?.role) {
              updated[index].role = request.payload.role;
            }
            break;
          case 'delete':
            // Handled separately by bulkDelete
            break;
        }
      }
    });

    this.usersSignal.set(updated);

    return of(undefined).pipe(delay(500));
  }

  /**
   * Bulk delete users
   */
  override bulkDelete(ids: string[]): Observable<void> {
    const users = this.usersSignal();
    const updated = users.filter((u) => !ids.includes(u.id));
    this.usersSignal.set(updated);

    return of(undefined).pipe(delay(500));
  }

  /**
   * Export users to CSV
   */
  override exportToCsv(filters?: UserListFilters): Observable<Blob> {
    // Get filtered users
    const users = this.usersSignal();
    let filtered = [...users];

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.role) {
      filtered = filtered.filter((user) => user.role === filters.role);
    }

    if (filters?.status) {
      filtered = filtered.filter((user) => user.status === filters.status);
    }

    // Generate CSV
    const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Created At'];
    const rows = filtered.map((user) => [
      user.id,
      user.fullName,
      user.email,
      user.role,
      user.status,
      user.createdAt,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });

    return of(blob).pipe(delay(500));
  }

  /**
   * Get user statistics
   */
  getUserStatistics(id: string): Observable<UserStatistics> {
    return this.getUserById(id).pipe(
      delay(300),
      map((user) => user.statistics)
    );
  }

  /**
   * Get user restaurants
   */
  getUserRestaurants(id: string): Observable<RestaurantSummary[]> {
    const restaurants: RestaurantSummary[] = [
      {
        id: '1',
        name: 'Restaurante Ejemplo 1',
        status: 'APPROVED',
        createdAt: '2026-03-01T10:00:00Z',
      },
      {
        id: '2',
        name: 'Restaurante Ejemplo 2',
        status: 'PENDING',
        createdAt: '2026-03-15T14:30:00Z',
      },
    ];

    return of(restaurants).pipe(delay(300));
  }

  /**
   * Get user reviews
   */
  getUserReviews(id: string): Observable<ReviewSummary[]> {
    const reviews: ReviewSummary[] = [
      {
        id: '1',
        restaurantName: 'Restaurante Ejemplo 1',
        rating: 5,
        helpfulCount: 12,
        createdAt: '2026-03-20T10:00:00Z',
      },
      {
        id: '2',
        restaurantName: 'Restaurante Ejemplo 2',
        rating: 4,
        helpfulCount: 8,
        createdAt: '2026-04-01T14:30:00Z',
      },
      {
        id: '3',
        restaurantName: 'Restaurante Ejemplo 3',
        rating: 5,
        helpfulCount: 15,
        createdAt: '2026-04-05T18:00:00Z',
      },
    ];

    return of(reviews).pipe(delay(300));
  }

  /**
   * Get user activity log
   */
  getUserActivity(id: string, page = 1, pageSize = 10): Observable<PaginatedResponse<UserActivity>> {
    const activities: UserActivity[] = [
      {
        id: '1',
        type: 'login',
        description: 'User logged in',
        createdAt: '2026-04-09T09:30:00Z',
      },
      {
        id: '2',
        type: 'review',
        description: 'Reviewed "Restaurante Ejemplo 1"',
        metadata: { rating: 5 },
        createdAt: '2026-04-08T14:20:00Z',
      },
      {
        id: '3',
        type: 'photo',
        description: 'Uploaded photo to "Restaurante Ejemplo 1"',
        createdAt: '2026-04-07T16:45:00Z',
      },
      {
        id: '4',
        type: 'restaurant_created',
        description: 'Created restaurant "Mi Restaurante"',
        createdAt: '2026-04-06T10:15:00Z',
      },
      {
        id: '5',
        type: 'login',
        description: 'User logged in',
        createdAt: '2026-04-05T08:30:00Z',
      },
      {
        id: '6',
        type: 'review',
        description: 'Reviewed "Restaurante Ejemplo 2"',
        metadata: { rating: 4 },
        createdAt: '2026-04-04T12:00:00Z',
      },
      {
        id: '7',
        type: 'report',
        description: 'Submitted report for inappropriate content',
        createdAt: '2026-04-03T15:20:00Z',
      },
      {
        id: '8',
        type: 'login',
        description: 'User logged in',
        createdAt: '2026-04-02T09:45:00Z',
      },
    ];

    const total = activities.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const items = activities.slice(start, start + pageSize);

    return of({
      items,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    }).pipe(delay(300));
  }

  /**
   * Helper method to update user status
   */
  private updateUserStatus(id: string, status: UserStatus): Observable<UserDetail> {
    const users = this.usersSignal();
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updated = [...users];
    updated[userIndex] = {
      ...updated[userIndex],
      status,
    };

    this.usersSignal.set(updated);

    return this.getUserById(id).pipe(delay(300));
  }
}
