# Moderation Module Proposal

## Intent

Implement a centralized moderation queue to manage user-reported content across the Foodie Connect platform. Moderators need a unified interface to review, approve, reject, dismiss, and escalate reports on users, restaurants, reviews, photos, and comments. The current system has report references in the dashboard and user/restaurant models but no moderation workflow implementation.

## Scope

### In Scope

- **Moderation queue**: Priority-sorted list of all pending reports with filtering by type, status, priority, and date range
- **Report detail view**: Content preview, reporter information, moderation actions, and action history timeline
- **Moderation actions**: Approve (remove content), Reject (dismiss report), Dismiss (keep content), Escalate (SUPER_ADMIN review)
- **Bulk operations**: Multi-select with batch approve/reject/dismiss
- **Statistics dashboard**: Pending reports count, resolved today, average response time
- **Export functionality**: CSV export of filtered reports (inherited from BaseService)
- **Route integration**: New `/moderation` routes added to app routing

### Out of Scope

- Contextual moderation actions within Users/Restaurants modules (future enhancement)
- Real-time queue updates via WebSocket
- Auto-moderation rules or AI-powered content filtering
- Moderator performance analytics
- Advanced escalation workflow beyond SUPER_ADMIN flag
- Content editing capabilities (only approve/reject/remove)

## Approach

**Centralized Moderation Queue with Type-Based Filtering**

Single moderation module following the established pattern from Users/Restaurants modules:

1. **Extend BaseService**: Create `ModerationService` extending `BaseService<Report>` with queue-specific methods
2. **Priority-based sorting**: Escalated reports first, then by report count, then by date
3. **Type-aware components**: Dynamic content preview based on report type (USER, RESTAURANT, REVIEW, PHOTO, COMMENT)
4. **Signal-based state**: Use Angular signals for reactive state management (selection, filters, stats)
5. **Material Design**: Consistent UI with existing modules using Material components
6. **Mock data first**: Implement with in-memory signals for development, ready for API integration

**Architecture**:
- Feature module structure: `/src/app/features/moderation/` with routes, services, components
- Lazy-loaded from app routes
- List/detail page pattern matching existing modules
- Dialog-based confirmations for all moderation actions

## Affected Areas

| File/Path | Impact | Description |
|-----------|--------|-------------|
| `src/app/features/moderation/moderation.routes.ts` | NEW | Moderation module routes (list, detail) |
| `src/app/features/moderation/moderation.module.ts` | NEW | Feature module declaration |
| `src/app/features/moderation/services/moderation.service.ts` | NEW | Moderation service extending BaseService |
| `src/app/features/moderation/moderation-list/` | NEW | List component with stats, filters, table |
| `src/app/features/moderation/report-detail/` | NEW | Detail component with preview and actions |
| `src/app/models/moderation.types.ts` | NEW | Report, ReportStatus, ReportType, ModerationAction interfaces |
| `src/app/app.routes.ts` | MODIFY | Add moderation loadChildren route |
| `src/app/app.config.ts` | MODIFY | Add moderation navigation link (optional) |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Content preview complexity varies by report type | High | Medium | Use type-specific preview components; graceful fallback for missing previews |
| Queue performance degrades with large datasets | Medium | Medium | Implement pagination (existing pattern), server-side filtering |
| API endpoint structure differs from assumptions | Medium | Low | Document API contract clearly; keep interfaces flexible with metadata field |
| Moderation actions have unexpected side effects | Low | High | Add TODO comments for backend integration; test with real API early |
| Bulk actions accidentally dismiss multiple reports | Low | Medium | Require confirmation dialogs; show clear count before action |

## Rollback Plan

If critical issues arise post-deployment:

1. **Route removal**: Comment out moderation route in `app.routes.ts` to disable access
2. **Feature flag**: Add environment variable check to conditionally load moderation module
3. **Database isolation**: Moderation actions use separate API endpoints; can be disabled without affecting other modules
4. **UI rollback**: Navigation links can be hidden via configuration

**Revert time**: < 5 minutes (route comment-out) or < 1 hour (full module removal)

## Dependencies

### External
- None (backend API assumed to follow REST conventions matching BaseService pattern)

### Internal
- Existing `BaseService<T>` pattern from Users/Restaurants modules
- Material Design components (already in use)
- Angular signals (already in use)
- Dialog service pattern (already established)

### Blocking
- None - can proceed independently

## Success Criteria

- [ ] Moderators can view all pending reports in a unified queue
- [ ] Reports are sorted by priority (escalated → report count → date)
- [ ] Filters work correctly by type, status, priority, and date range
- [ ] Moderation actions (approve/reject/dismiss/escalate) update report status
- [ ] Bulk selection and batch actions work without errors
- [ ] Content preview displays correctly for each report type
- [ ] Statistics cards show accurate counts and metrics
- [ ] Export to CSV generates correctly formatted data
- [ ] Action history timeline displays all moderation actions taken
- [ ] All AXE accessibility checks pass
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Dark mode renders correctly
- [ ] No console errors or warnings
- [ ] All navigation links function correctly
