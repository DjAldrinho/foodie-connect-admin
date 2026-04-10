# Skill Registry

Generated: 2026-04-09
Project: foodie-connect-admin

## User Skills

### SDD Skills (Engram)

| Skill | Name | Triggers |
|-------|------|----------|
| `sdd-flow` | Spec-Driven Development workflow | "starting non-trivial changes", "multi-phase implementation planning" |
| `memory-protocol` | Engram persistent memory protocol | Always active for engram users |

### Code Quality Skills

| Skill | Name | Triggers |
|-------|------|----------|
| `pr-review-deep` | Deep PR review | When reviewing pull requests |
| `commit-hygiene` | Commit message standards | When creating commits |
| `testing-coverage` | Test coverage analysis | When writing or reviewing tests |
| `architecture-guardrails` | Architecture validation | When making architectural decisions |

### Development Skills

| Skill | Name | Triggers |
|-------|------|----------|
| `issue-creation` | GitHub issue creation | When creating issues |
| `branch-pr` | PR creation workflow | When creating pull requests |
| `project-structure` | Project structure guidance | When organizing project files |
| `ui-elements` | UI component patterns | When building UI components |

### Other Skills

| Skill | Name | Triggers |
|-------|------|----------|
| `docs-alignment` | Documentation alignment | When updating docs |
| `visual-language` | Visual design consistency | When designing UI |
| `business-rules` | Business logic patterns | When implementing business rules |
| `cultural-norms` | Team collaboration patterns | When working with teams |
| `backlog-triage` | Backlog prioritization | When managing backlog |

## Project Conventions

### AGENTS.md
- TypeScript: Strict types, no `any`, use `unknown` when uncertain
- Angular: Standalone components, signals, native control flow, OnPush strategy
- State: Signals with `computed()` for derived state
- Accessibility: WCAG AA compliance, AXE checks required
- Services: Single responsibility, `inject()` function, `providedIn: 'root'`

### CLAUDE.md (project-level)
- Angular standalone components (v20+ default)
- Signals for state management
- NgOptimizedImage for static images
- No `ngClass`/`ngStyle` — use bindings instead
- Reactive forms preferred
- Lazy loading for features
- No globals like `new Date()` in templates

## Compact Rules (for sub-agents)

When working with **Angular + TypeScript** code in this project:

1. **Always use standalone components** - `standalone: true` is default in Angular v20+, don't set it explicitly
2. **Use signals for state** - `signal()`, `computed()`, `effect()` for reactive state management
3. **Prefer functional APIs** - `input()`, `output()`, `model()` instead of decorators
4. **Native control flow** - Use `@if`, `@for`, `@switch` instead of `*ngIf`, `*ngFor`, `*ngSwitch`
5. **OnPush strategy** - Set `changeDetection: ChangeDetectionStrategy.OnPush` in components
6. **No ngClass/ngStyle** - Use `[class.foo]` and `[style.bar]` bindings instead
7. **Inject function** - Use `inject()` instead of constructor injection
8. **Strict types** - No `any`, use `unknown` when type is uncertain
9. **Accessibility** - WCAG AA compliance, AXE checks required
10. **Reactive forms** - Prefer over template-driven forms

When **testing**:

1. **Vitest** is the test runner - use `npm test`
2. **Unit tests** - Write `.spec.ts` files alongside components
3. **Coverage** - Use `npm test -- --coverage` with c8
4. **No integration layer** - @testing-library/* not installed (manual testing only)

When **styling**:

1. **Tailwind CSS v4** - Use utility classes in templates
2. **No inline styles** - Use Tailwind classes instead
3. **Dark mode** - Use `dark:` prefix when needed

When **formatting**:

1. **Prettier** - Run `npx prettier --write .` before committing
2. **No ESLint** - Not configured, rely on TypeScript compiler

## Model Assignments (cached for session)

| Phase | Model | Reason |
|-------|-------|--------|
| orchestrator | opus | Coordinates, makes decisions |
| sdd-explore | sonnet | Reads code, structural |
| sdd-propose | opus | Architectural decisions |
| sdd-spec | sonnet | Structured writing |
| sdd-design | opus | Architecture decisions |
| sdd-tasks | sonnet | Mechanical breakdown |
| sdd-apply | sonnet | Implementation |
| sdd-verify | sonnet | Validation against spec |
| sdd-archive | haiku | Copy and close |
| default | sonnet | Non-SDD general delegation |
