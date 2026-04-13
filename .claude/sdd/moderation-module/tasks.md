# Moderation Module - Implementation Tasks

## Phase 1: Foundation (5 tasks)

1. **Create core types** - `src/app/models/moderation.types.ts` with ReportStatus, ContentType, ModerationAction, Report, ModerationQueueItem, ModerationActionResult, ModerationStats, ContentPreview interfaces
2. **Create feature routes** - `src/app/features/moderation/moderation.routes.ts` with queue and detail routes, admin guard
3. **Create moderation module** - `src/app/features/moderation/moderation.module.ts` (if needed for lazy loading)
4. **Create public API barrel** - `src/app/features/moderation/index.ts` exporting types, service, components
5. **Add app route** - modify `src/app/app.routes.ts` to load moderation routes with loadChildren

## Phase 2: Core Service (7 tasks)

6. **Create ModerationService skeleton** - `src/app/features/moderation/services/moderation.service.ts` extending BaseService<Report>
7. **Add mock data** - 30 sample reports covering all types (user, restaurant, review, photo, comment), various statuses, priorities
8. **Implement getQueue()** - filter by type/status/priority, sort by priority score, paginate (default 25)
9. **Implement moderateReport()** - handle approve/reject/dismiss/escalate actions, return action result
10. **Implement bulkModerate()** - batch process multiple reports, partial success handling
11. **Implement getStatistics()** - calculate pending count, escalated count, today's actions
12. **Implement getActionHistory()** - return timeline of moderation actions for report

## Phase 3: List Components (9 tasks)

13. **Create ModerationListComponent** - `moderation-list/moderation-list.component.ts` main queue view with signals
14. **Create ModerationFiltersComponent** - `moderation-filters/moderation-filters.component.ts` filter sidebar (type, status, priority, date range)
15. **Create ModerationStatsComponent** - `moderation-stats/moderation-stats.component.ts` 4 stat cards (pending, escalated, today resolved, avg response time)
16. **Create ModerationTableComponent** - `moderation-table/moderation-table.component.ts` data table with selection, sorting
17. **Create ModerationRowComponent** - `moderation-row/moderation-row.component.ts` report row with priority badge, preview thumbnail
18. **Integrate SelectionService** - wire up multi-select checkboxes in table to existing SelectionService
19. **Add filter to service binding** - filter signal changes trigger service.getQueue() call
20. **Add stats refresh** - stats update when queue changes
21. **Add auto-refresh** - 60-second interval to refresh queue data

## Phase 4: Detail Components (10 tasks)

22. **Create ModerationDetailComponent** - `moderation-detail/moderation-detail.component.ts` report detail view
23. **Create ContentPreviewComponent** - `content-preview/content-preview.component.ts` container that switches by content type
24. **Create UserPreviewComponent** - `user-preview/user-preview.component.ts` user profile card (name, bio, avatar, stats)
25. **Create RestaurantPreviewComponent** - `restaurant-preview/restaurant-preview.component.ts` restaurant card (name, address, cuisine, photos)
26. **Create ReviewPreviewComponent** - `review-preview/review-preview.component.ts` review with text, photos, author, restaurant
27. **Create PhotoPreviewComponent** - `photo-preview/photo-preview.component.ts` photo with EXIF, uploader, context
28. **Create CommentPreviewComponent** - `comment-preview/comment-preview.component.ts` comment with author, parent content
29. **Create ReportHistoryComponent** - `report-history/report-history.component.ts` action timeline with timestamps
30. **Create SimilarReportsComponent** - `similar-reports/similar-reports.component.ts` related reports list
31. **Add moderation actions UI** - action buttons (approve, reject, dismiss, escalate) in detail view

## Phase 5: Dialogs & Integration (6 tasks)

32. **Create ModerationActionDialog** - `dialogs/moderation-action.dialog.ts` confirm single action with optional reason
33. **Create BulkModerationDialog** - `dialogs/bulk-moderation.dialog.ts` confirm bulk action with warning message
34. **Add dialog validation** - require reason text for reject/escalate (min 10, max 500 chars)
35. **Wire detail actions** - approve/reject/dismiss/escalate buttons open dialog, call service, refresh on success
36. **Add navigation** - breadcrumb, back to queue, next/previous report buttons
37. **Add dashboard link** - optional nav link in app.config.ts or dashboard quick actions

## Phase 6: Testing - Strict TDD (12 tasks)

38. **Test ModerationService.getQueue()** - verify filtering, sorting, pagination, priority calculation
39. **Test ModerationService.moderateReport()** - verify action handling, status updates, history recording
40. **Test ModerationService.bulkModerate()** - verify batch processing, partial success, error handling
41. **Test ModerationService.getStatistics()** - verify stat calculations (pending, escalated, today)
42. **Test ModerationFiltersComponent** - verify filter signals, output emission, validation
43. **Test ModerationStatsComponent** - verify stat display, loading state, error handling
44. **Test ModerationTableComponent** - verify rendering, sorting, selection integration
45. **Test ModerationRowComponent** - verify priority badge, thumbnail, metadata display
46. **Test ModerationDetailComponent** - verify load report, content preview switch, action buttons
47. **Test content preview components** - verify each type renders correct fields, fallback strategy
48. **Test ModerationActionDialog** - verify open/close, form validation, action emission
49. **Test BulkModerationDialog** - verify warning message, confirmation, bulk action emission

## Phase 7: Polish & Commit (4 tasks)

50. **Add JSDoc comments** - document all public methods in ModerationService, component inputs/outputs
51. **Remove debug code** - clean up console.logs, temporary test code, unused imports
52. **Fix TypeScript errors** - resolve any strict type checking issues, unused variables
53. **Create commit** - conventional commit message "feat: Add moderation module with queue management and content review"

---

**Total Tasks: 53**

**Implementation Order:** Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 (parallel with dev) → Phase 7

**Testing Strategy:** Strict TDD - write tests BEFORE implementation for each component/service. Tests in Phase 6 run in parallel with development phases 2-5.

**Next Step:** Ready for **sdd-apply** phase to begin implementation starting with Phase 1 tasks.
