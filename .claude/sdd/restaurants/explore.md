## Exploration: Restaurants Module Implementation

### Current State
The foodie-connect-admin project uses Angular 21.2.0 with standalone components, signals for state management, and lazy-loaded routes. Three phases are complete (Foundation, Layout+Auth, Dashboard), and Phase 4 (Users Module) serves as the architectural pattern for feature modules.

### Affected Areas
- `src/app/features/restaurants/` - New feature module to be created (partially exists)
- `src/app/app.routes.ts` - Will add restaurants route with loadChildren()
- `src/app/models/restaurants.types.ts` - Created (Restaurant, RestaurantListItem, filters, etc.)
- `src/app/features/restaurants/services/restaurants.service.ts` - Created (extends BaseService)
- `src/app/features/restaurants/restaurants-list/view-toggle/` - Created (ViewToggleComponent)

### Architecture Patterns (from Users Module)
1. **Feature Structure**: `feature-name/{list,detail}/{components}/`
2. **Routes**: `feature.routes.ts` with loadChildren() in app.routes.ts
3. **Services**: Extend BaseService, use `/api/endpoint` pattern
4. **Components**: Standalone with imports[], OnPush change detection
5. **State**: Signals for local state, computed for derived state
6. **Types**: Interfaces in `src/app/models/` folder
7. **Shared**: Reuse button, card, empty-state, loading-spinner, etc.

### Backend API Endpoints (from SPECIFICATION.md)
- `GET /api/restaurants` - Paginated list with search, filters
- `GET /api/restaurants/:id` - Detailed restaurant info
- `PATCH /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Soft delete
- `POST /api/restaurants/:id/verify` - Approve/reject verification
- `GET /api/restaurants/:id/photos` - Restaurant photos
- `GET /api/restaurants/:id/menu` - Restaurant menu
- `GET /api/restaurants/:id/reviews` - Restaurant reviews
- `GET /api/restaurants/export` - Export to CSV

### Component Requirements (from TASKS.md)
**List Components:**
1. RestaurantsListComponent - Main page with filters, view toggle, bulk actions
2. RestaurantFiltersComponent - Search, status, cuisine, price, rating filters
3. ViewToggleComponent - Grid/list switcher ✓ (already created)
4. GridViewComponent - Card-based responsive grid
5. ListViewComponent - Table view with sortable columns

**Detail Components:**
6. RestaurantDetailComponent - Detail page with tabs
7. OverviewTabComponent - Restaurant info, stats, hero gallery
8. PhotosTabComponent - Photo gallery with lightbox
9. MenuTabComponent - Menu categories and items
10. ReviewsTabComponent - Reviews list with filters
11. VerificationActionsComponent - Approve/reject workflow

**Additional:**
12. RestaurantFormComponent - Create/edit form
13. Restaurants routes configuration

### Approaches
1. **Follow Users Module Pattern Exactly** (RECOMMENDED)
   - Pros: Consistent architecture, proven to work, follows established conventions
   - Cons: None - this is the established pattern
   - Effort: Low/Medium

2. **Custom Architecture for Restaurants**
   - Pros: Could optimize for restaurant-specific needs
   - Cons: Breaks consistency, harder to maintain, team must learn new patterns
   - Effort: High

### Recommendation
**Use Approach 1** - Follow the Users Module pattern exactly. The Users module is complete and working, providing a battle-tested template. Component structure, service patterns, routing, and state management are all proven.

### Key Implementation Details
- **Grid View**: Responsive (1/2/3/4 columns), cards with cover photo, verified badge, rating
- **List View**: Table with sortable columns, row selection, bulk actions
- **Filters**: Debounced search (300ms), status dropdowns, cuisine multiselect
- **Tabs**: Use Angular 21+ native control flow (@if, @for) for tab switching
- **Verification**: Status workflow (Pending → Verified/Rejected), admin-only actions
- **Photos**: Grid with lazy loading, lightbox modal, admin upload/delete
- **Menu**: Accordion-style categories, expandable items
- **Reviews**: Star ratings, helpful counts, filter by rating/photos/verified

### Risks
- **Complexity**: 13 components is significant - need to manage scope carefully
- **Photo Management**: Lightbox implementation and image lazy loading can be tricky
- **Verification Workflow**: Ensure status transitions are properly handled and persisted
- **Performance**: Large photo galleries may need optimization
- **State Management**: Multiple tabs with different data sources - need proper loading states

### Ready for Proposal
**Yes** - The codebase patterns are clear, Users module provides a complete template, backend endpoints are documented in SPECIFICATION.md, and all necessary shared components exist. The orchestrator should proceed with sdd-propose to create the change proposal.
