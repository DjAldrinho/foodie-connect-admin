# Restaurants Module

## Overview

The Restaurants module provides complete CRUD functionality for managing restaurants in the Foodie Connect admin panel.

## Features

### List View
- **Grid/List Toggle**: Switch between card grid and table views
- **Advanced Filters**: Search, status, cuisine, price range, rating
- **URL Sync**: All filters, sort, and pagination are reflected in URL for sharing/bookmarking
- **Responsive Design**: 1/2/3/4 column grid based on screen size
- **Sortable Columns**: Click column headers to sort (table view)
- **Pagination**: Configurable page size (12/24/48)
- **Export to CSV**: Export filtered results

### Detail View
- **Tabbed Navigation**: Overview, Photos, Menu, Reviews tabs with URL persistence
- **Verification Workflow**: Approve/Reject/Request Info actions for pending restaurants
- **Photo Management**: Upload, delete, and lightbox view (TODO)
- **Menu Display**: Accordion-style categories with dietary badges
- **Reviews**: Filter by rating and photos, helpful counts

## Service Integration

### Environment Configuration

The module supports both mock data (development) and real backend (production) via feature flags:

**Development** (`src/environments/environment.ts`):
```typescript
features: {
  useMockRestaurants: true  // Uses in-memory mock data
}
```

**Production** (`src/environments/environment.prod.ts`):
```typescript
features: {
  useMockRestaurants: false  // Uses real backend API
}
```

### Backend API Endpoints

When `useMockRestaurants` is `false`, the service expects the following endpoints:

#### List & Detail
- `GET /api/restaurants` - Paginated list with filters
  - Query params: `page`, `pageSize`, `sortBy`, `sortOrder`, `search`, `status`, `cuisine[]`, `priceRange[]`, `rating`, `city`
  - Returns: `PaginatedResponse<RestaurantListItem>`

- `GET /api/restaurants/:id` - Single restaurant details
  - Returns: `Restaurant` with photos, menu, reviews nested

#### CRUD Operations
- `POST /api/restaurants` - Create new restaurant
  - Body: `Partial<Restaurant>`
  - Returns: `Restaurant`

- `PATCH /api/restaurants/:id` - Update restaurant
  - Body: `Partial<Restaurant>`
  - Returns: `Restaurant`

- `DELETE /api/restaurants/:id` - Soft delete restaurant
  - Returns: `void`

#### Verification
- `POST /api/restaurants/:id/verify` - Approve or reject restaurant
  - Body: `{ action: 'approve' | 'reject', notes?: string }`
  - Returns: `Restaurant`

#### Photos
- `GET /api/restaurants/:id/photos` - Get restaurant photos
  - Returns: `RestaurantPhoto[]`

- `POST /api/restaurants/:id/photos` - Upload photo
  - Body: FormData with `file` and optional `caption`
  - Returns: `{ url: string }`

- `DELETE /api/restaurants/:restaurantId/photos/:photoId` - Delete photo
  - Returns: `void`

#### Menu
- `GET /api/restaurants/:id/menu` - Get restaurant menu
  - Returns: `MenuCategory[]`

- `PUT /api/restaurants/:id/menu` - Update menu
  - Body: `{ categories: MenuCategory[] }`
  - Returns: `MenuCategory[]`

#### Reviews
- `GET /api/restaurants/:id/reviews` - Get reviews with filters
  - Query params: `page`, `pageSize`, `sortBy`, `sortOrder`, `minRating`, `hasPhotos`
  - Returns: `PaginatedResponse<RestaurantReview>`

#### Bulk Operations
- `POST /api/restaurants/bulk-verify` - Bulk verify
  - Body: `{ ids: string[], action: 'approve' | 'reject', notes?: string }`
  - Returns: `void`

- `PATCH /api/restaurants/bulk-status` - Bulk status update
  - Body: `{ ids: string[], status: RestaurantStatus }`
  - Returns: `void`

- `POST /api/restaurants/bulk-delete` - Bulk delete
  - Body: `{ ids: string[] }`
  - Returns: `void`

#### Statistics & Export
- `GET /api/restaurants/stats` - Get statistics
  - Returns: `RestaurantStats`

- `GET /api/restaurants/export` - Export to CSV
  - Query params: Same filters as list endpoint
  - Returns: `Blob` (text/csv)

### Response Format

All endpoints return responses in this format:

```typescript
{
  data: T,           // The actual data
  success: boolean, // Whether the request succeeded
  message?: string,  // Optional message
  errors?: Record<string, string[]> // Validation errors
}
```

### Error Handling

The service handles HTTP errors and returns user-friendly messages:

- **400**: Invalid request - validation errors
- **401**: Unauthorized - not logged in
- **403**: Forbidden - insufficient permissions
- **404**: Not found - resource doesn't exist
- **500**: Internal server error - try again later

Errors are displayed via toast notifications.

## Mock Data

Development mode includes 6 mock restaurants with:
- Different statuses (ACTIVE, PENDING, SUSPENDED)
- Various cuisines (Parrilla, Italiana, Japonesa, Mexicana, Vegetariana, Pizzeria)
- Price ranges ($, $$, $$$)
- Ratings (3.9 - 4.8)
- Cities (Buenos Aires, Córdoba, Rosario, Mendoza, Mar del Plata)

## Switching to Real Backend

When the backend is ready:

1. Update `src/environments/environment.ts`:
   ```typescript
   features: {
     useMockRestaurants: false
   }
   ```

2. Ensure backend is running at the configured `apiUrl`

3. The service will automatically use real HTTP calls

4. All features remain the same - only the data source changes

## File Structure

```
src/app/features/restaurants/
├── restaurants-list/
│   ├── restaurants-list.component.ts/html/css
│   ├── restaurant-filters/
│   ├── grid-view/
│   ├── list-view/
│   └── view-toggle/
├── restaurant-detail/
│   ├── restaurant-detail.component.ts/html/css
│   ├── overview-tab/
│   ├── photos-tab/
│   ├── menu-tab/
│   ├── reviews-tab/
│   └── verification-actions/
├── services/
│   └── restaurants.service.ts
└── restaurants.routes.ts
```

## Usage Examples

### Navigate to Restaurants List
```typescript
this.router.navigate(['/restaurants']);
```

### Navigate with Filters
```typescript
this.router.navigate(['/restaurants'], {
  queryParams: {
    search: 'italian',
    status: 'ACTIVE',
    cuisine: ['Italiana', 'Parrilla'],
    rating: 4
  }
});
```

### Navigate to Detail
```typescript
this.router.navigate(['/restaurants', restaurantId]);
```

### Navigate to Specific Tab
```typescript
this.router.navigate(['/restaurants', restaurantId], {
  queryParams: { tab: 'photos' }
});
```

### Service Usage
```typescript
// Get paginated list
this.restaurantsService.getAll(
  { page: 1, pageSize: 12, sortBy: 'rating', sortOrder: 'desc' },
  { status: RestaurantStatus.ACTIVE, cuisine: [CuisineType.ITALIANA] }
).subscribe(response => {
  console.log(response.items); // RestaurantListItem[]
  console.log(response.total);  // Total count
});

// Get by ID
this.restaurantsService.getById(restaurantId).subscribe(restaurant => {
  console.log(restaurant.name);
  console.log(restaurant.photos);
});

// Verify restaurant
this.restaurantsService.verifyRestaurant(restaurantId, {
  action: 'approve'
}).subscribe(restaurant => {
  console.log('Restaurant verified:', restaurant.verificationStatus);
});
```

## Performance Considerations

- **Lazy Loading**: Restaurants module is loaded on-demand
- **Signals**: Efficient change detection with OnPush strategy
- **Debounced Search**: 300ms delay prevents excessive API calls
- **Pagination**: Reduces initial load time
- **Code Splitting**: Each component is independently loadable

## Accessibility

- All interactive elements are keyboard accessible
- ARIA labels on buttons and inputs
- Focus management in dialogs and tabs
- Color contrast meets WCAG AA standards
- Screen reader compatible

## Future Enhancements

- [ ] Implement photo lightbox with keyboard navigation
- [ ] Add photo gallery with infinite scroll
- [ ] Implement bulk actions from list view
- [ ] Add restaurant form for create/edit
- [ ] Add more sophisticated filtering options
- [ ] Implement real-time updates for verification status
- [ ] Add analytics dashboard for restaurants
