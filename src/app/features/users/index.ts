/**
 * Users Feature Module
 *
 * Exports all users-related components and services
 */

export { UsersService } from './services/users.service';

export { UsersListComponent } from './users-list/users-list.component';
export { UserFiltersComponent } from './users-list/user-filters/user-filters.component';
export { UsersTableComponent } from './users-list/users-table/users-table.component';
export { UserRowComponent } from './users-list/users-table/user-row/user-row.component';
export { BulkActionsComponent } from './users-list/bulk-actions/bulk-actions.component';

export {
  ChangeRoleDialogComponent,
  DeactivateUserDialogComponent,
  DeleteUserDialogComponent,
} from './dialogs/dialogs';

export { UserDetailComponent } from './user-detail/user-detail.component';
export { UserStatsCardComponent } from './user-detail/user-stats-card/user-stats-card.component';
export { UserPostsTabComponent } from './user-detail/user-posts-tab/user-posts-tab.component';
export { UserReviewsTabComponent } from './user-detail/user-reviews-tab/user-reviews-tab.component';
export { UserActivityTabComponent } from './user-detail/user-activity-tab/user-activity-tab.component';

export type {
  UserListItem,
  UserDetail,
  UserListFilters,
  BulkActionRequest,
  ChangeRoleRequest,
  UserStatistics,
  RestaurantSummary,
  ReviewSummary,
  UserActivity,
} from '../../models/users.types';

export type { UserStats } from './user-detail/user-stats-card/user-stats-card.component';
export type { UserPost } from './user-detail/user-posts-tab/user-posts-tab.component';
export type { UserReview } from './user-detail/user-reviews-tab/user-reviews-tab.component';
export type { ActivityItem } from './user-detail/user-activity-tab/user-activity-tab.component';
