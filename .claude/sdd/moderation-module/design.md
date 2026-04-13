# Moderation Module - Technical Design

## Architecture Decisions

### 1. Service Architecture: Extend BaseService<Report>

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Extend BaseService | Reuses CRUD, export, bulk ops, consistent pattern | May need overrides for queue-specific logic | ✅ CHOSEN |
| Standalone ModerationService | Full control over queue logic | Duplicates code, breaks consistency | ❌ |
| Hybrid (BaseService + QueueService) | Clear separation of concerns | Complexity overhead | ❌ |

**Rationale**: Moderation queue needs standard CRUD (approve/reject = update status) + bulk operations. BaseService provides 80% of functionality. Queue-specific methods (getQueue, getStats, moderation actions) will be added as overrides.

### 2. Component Hierarchy

```
moderation/
├── moderation-list.component.ts          # Main queue view
│   ├── moderation-filters/               # Filter sidebar
│   ├── moderation-stats/                 # Statistics cards
│   └── moderation-table/                 # Queue table
│       └── moderation-row/               # Report row with preview
├── moderation-detail.component.ts        # Report detail view
│   ├── content-preview/                  # Type-specific preview
│   │   ├── user-preview/
│   │   ├── restaurant-preview/
│   │   ├── review-preview/
│   │   ├── photo-preview/
│   │   └── comment-preview/
│   ├── report-history/                   # Action timeline
│   └── similar-reports/                  # Related reports
└── dialogs/
    ├── moderation-action.dialog.ts       # Confirm approve/reject
    └── bulk-moderation.dialog.ts         # Confirm bulk action
```

### 3. Content Preview Strategy

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| Type-specific components | Optimized UI per type, better UX | More files, 5 components | ✅ CHOSEN |
| Generic preview component | Less code | Limited UX, complex switches | ❌ |
| External content link | Zero code | Leaves admin panel, poor UX | ❌ |

**Rationale**: Each content type (user/restaurant/review/photo/comment) has different fields. Type-specific components provide optimal preview experience. Fallback to generic link if preview unavailable.

### 4. State Management

- **Service-level signals**: `queueItems`, `statistics`, `filters`
- **Component-level signals**: Local UI state (selection, dialog open)
- **No global state**: Moderation is isolated feature
- **Derived state via computed()**: Filtered queue, priority-sorted items

### 5. Priority Calculation Logic

**Location**: ModerationService (server-side eventually, client-side for mock)

**Algorithm** (client-side mock):
```typescript
priorityScore = (isEscalated ? 1000 : 0) +
                (reportCount * 100) +
                (daysSinceReport * 10)
```

**Server-side** (future): Database query with ORDER BY

### 6. Bulk Action Pattern

Reuse existing `SelectionService` from core. Multi-select table → selection service → bulk moderation dialog → service.bulkAction()

## Data Flow Diagrams

### Report Lifecycle

```
User submits report
        ↓
API stores report (status: PENDING)
        ↓
Moderation queue fetches (status: PENDING)
        ↓
Admin views → Approves/Rejects/Dismisses
        ↓
API updates status + records action
        ↓
Queue refreshes (item removed or updated)
        ↓
History timeline updated
```

### Filter Flow

```
User changes filter
        ↓
Filter signal updates
        ↓
Component calls service.getQueue(filters)
        ↓
Service filters data (client-side for mock)
        ↓
Returns filtered, sorted, paginated results
        ↓
Queue table updates
```

### Bulk Action Flow

```
User selects multiple reports (checkboxes)
        ↓
SelectionService tracks selected IDs
        ↓
User clicks bulk action → dialog opens
        ↓
User confirms action
        ↓
service.bulkAction(ids, action, note)
        ↓
API processes batch
        ↓
Selection cleared
        ↓
Queue refreshes
```

## Interfaces/Contracts

### Core Types

```typescript
// moderation.types.ts
export enum ReportStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',       // Content approved
  REJECTED = 'REJECTED',       // Content removed
  DISMISSED = 'DISMISSED',     // Report invalid
  ESCALATED = 'ESCALATED',     // Sent to super-admin
}

export enum ContentType {
  USER = 'USER',
  RESTAURANT = 'RESTAURANT',
  REVIEW = 'REVIEW',
  PHOTO = 'PHOTO',
  COMMENT = 'COMMENT',
}

export enum ModerationAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  DISMISS = 'dismiss',
  ESCALATE = 'escalate',
}

export interface Report {
  id: string;
  contentType: ContentType;
  contentId: string;
  contentPreview?: ContentPreview;
  reason: string;
  description?: string;
  reporterId: string;
  reporterName: string;
  status: ReportStatus;
  isEscalated: boolean;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
  priorityScore: number;
}

export interface ModerationQueueItem extends Report {
  // Computed fields for queue display
  age: number; // days since report
}

export interface ModerationActionResult {
  reportId: string;
  action: ModerationAction;
  moderatedBy: string;
  moderatedAt: string;
  note?: string;
}

export interface ModerationStats {
  totalPending: number;
  escalatedCount: number;
  avgResponseTime: number; // hours
  actionsToday: number;
  actionsThisWeek: number;
}

export interface ContentPreview {
  type: ContentType;
  id: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  metadata?: Record<string, unknown>;
}
```

### Service API

```typescript
class ModerationService extends BaseService<Report> {
  // Queue management
  getQueue(filters?: QueueFilters): Observable<PaginatedResponse<ModerationQueueItem>>;
  getReportById(id: string): Observable<Report>;

  // Moderation actions
  moderateReport(id: string, action: ModerationActionRequest): Observable<ModerationActionResult>;
  bulkModerate(request: BulkModerationRequest): Observable<void>;

  // Statistics
  getStatistics(): Observable<ModerationStats>;
  getActionHistory(reportId: string): Observable<ModerationActionResult[]>;

  // Export
  exportToCsv(filters?: QueueFilters): Observable<Blob>;
}
```

## File Changes

### New Files (22)

| Path | Purpose |
|------|---------|
| `src/app/models/moderation.types.ts` | Core type definitions |
| `src/app/features/moderation/moderation.routes.ts` | Feature routes |
| `src/app/features/moderation/moderation.module.ts` | Feature module (if needed) |
| `src/app/features/moderation/services/moderation.service.ts` | Moderation service |
| `src/app/features/moderation/moderation-list/moderation-list.component.ts` | Queue view |
| `src/app/features/moderation/moderation-list/moderation-filters/moderation-filters.component.ts` | Filter sidebar |
| `src/app/features/moderation/moderation-list/moderation-stats/moderation-stats.component.ts` | Stats cards |
| `src/app/features/moderation/moderation-list/moderation-table/moderation-table.component.ts` | Queue table |
| `src/app/features/moderation/moderation-list/moderation-table/moderation-row/moderation-row.component.ts` | Report row |
| `src/app/features/moderation/moderation-detail/moderation-detail.component.ts` | Detail view |
| `src/app/features/moderation/moderation-detail/content-preview/content-preview.component.ts` | Preview container |
| `src/app/features/moderation/moderation-detail/content-preview/user-preview/user-preview.component.ts` | User preview |
| `src/app/features/moderation/moderation-detail/content-preview/restaurant-preview/restaurant-preview.component.ts` | Restaurant preview |
| `src/app/features/moderation/moderation-detail/content-preview/review-preview/review-preview.component.ts` | Review preview |
| `src/app/features/moderation/moderation-detail/content-preview/photo-preview/photo-preview.component.ts` | Photo preview |
| `src/app/features/moderation/moderation-detail/content-preview/comment-preview/comment-preview.component.ts` | Comment preview |
| `src/app/features/moderation/moderation-detail/report-history/report-history.component.ts` | Action timeline |
| `src/app/features/moderation/moderation-detail/similar-reports/similar-reports.component.ts` | Related reports |
| `src/app/features/moderation/dialogs/moderation-action.dialog.ts` | Action confirmation |
| `src/app/features/moderation/dialogs/bulk-moderation.dialog.ts` | Bulk action confirmation |
| `src/app/features/moderation/index.ts` | Public exports |

### Modified Files (2)

| Path | Change |
|------|--------|
| `src/app/app.routes.ts` | Add moderation loadChildren route |
| `src/app/app.config.ts` | Add navigation link (optional) |

## Testing Strategy

### Unit Tests (Vitest + jsdom)

| Target | Tests | Priority |
|--------|-------|----------|
| ModerationService | getQueue, moderateReport, bulkAction, priority calculation | HIGH |
| ModerationFiltersComponent | Filter signals, output emission | MEDIUM |
| ModerationStatsComponent | Stat display, loading state | LOW |
| ContentPreview*Components | Render correct type, fallback | MEDIUM |
| Dialogs | Open/close, form validation, action emission | HIGH |

**Approach**: Test-first (Strict TDD). Write test → implement → refactor.

### Integration Tests

| Target | Tests | Priority |
|--------|-------|----------|
| ModerationList + Service | Filter → service → render | HIGH |
| ModerationDetail + Service | Load → moderate → history update | HIGH |
| Bulk action flow | Select → dialog → service → refresh | MEDIUM |

**Approach**: TestBed with mock service. Verify component-service interaction.

### E2E Tests (Playwright)

| Scenario | Steps | Priority |
|----------|-------|----------|
| Approve report | Navigate → click approve → confirm → verify removed | HIGH |
| Bulk dismiss | Select 3 → bulk dismiss → confirm → verify gone | MEDIUM |
| Filter queue | Apply status filter → verify results | MEDIUM |
| View detail | Click row → verify content preview | MEDIUM |

**Approach**: User journey focused. Happy path + critical edge cases.

### Test Data Strategy

- Mock data in service (like UsersService)
- 20-30 sample reports covering all types
- Edge cases: escalated, multiple reports, old/new
- Test utilities: `createMockReport()`, `createMockStats()`

## Migration/Rollout

### Migration

**No migration needed** - new feature.

### Rollout Strategy

**Option 1: Feature Flag** (Recommended)
- Add `enableModerationModule` flag to environment
- Conditionally load route in app.routes.ts
- Gradual rollout: admins → super-admins → all

**Option 2: Direct Release**
- Deploy to all users at once
- Simpler, but no gradual rollout

**Recommendation**: Start with feature flag for safety, remove once stable.

### Rollback

| Scenario | Time | Steps |
|----------|------|-------|
| Quick rollback | <5 min | Comment out route in app.routes.ts |
| Full rollback | <1 hour | Remove moderation directory + route + nav link |

## Open Questions

1. **Should we implement real-time queue updates?**
   - No (out of scope per proposal)
   - Future enhancement via WebSocket

2. **How to handle content deletion on REJECT?**
   - Mock: Mark status as REJECTED
   - Real: API calls content service to delete/hide

3. **Should we support custom bulk actions?**
   - No (out of scope)
   - Future: user-defined action presets

4. **Preview component fallback strategy?**
   - If preview unavailable → show "View on site" link
   - Log error for debugging

## Next Steps

✅ Design complete → Ready for **sdd-tasks** phase

Tasks will include:
1. Create type definitions
2. Implement ModerationService with mock data
3. Build moderation-list component hierarchy
4. Build moderation-detail component hierarchy
5. Implement dialogs
6. Add routing
7. Write tests (TDD approach)
8. Accessibility audit
9. Documentation
