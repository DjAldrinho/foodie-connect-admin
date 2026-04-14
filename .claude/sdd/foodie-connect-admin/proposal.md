# Proposal: Foodie Connect Admin CRM

## Intent

Desarrollar un panel de administración completo (Admin CRM) para Foodie Connect, una plataforma de gestión de restaurantes. El sistema permitirá a los administradores gestionar usuarios, restaurantes, moderación, notificaciones, analíticas y configuración del sitio.

## Vision

Admin CRM es un panel moderno, accesible y performante que permite a los administradores:
- Gestionar usuarios del sistema con roles y permisos
- Administrar restaurantes con sistema de verificación
- Moderar contenido reportado por usuarios
- Enviar notificaciones a usuarios
- Visualizar analíticas y métricas del sistema
- Configurar parámetros del sitio

## Scope

### Módulos Implementados

#### 1. Authentication Module ✅
- Login con email/contraseña
- Remember me functionality
- Token refresh automático
- Protected routes con guards
- Logout con cleanup de sesión

#### 2. Dashboard Module ✅
- Cards con métricas clave (usuarios, restaurantes, moderaciones)
- Gráficos de tendencias
- Actividad reciente
- Navegación rápida a otros módulos

#### 3. Users Module ✅
- Listado de usuarios con filtros (estado, rol, búsqueda)
- Tabla con ordenamiento y paginación
- Acciones: ver detalle, cambiar estado, eliminar
- Virtual scroll para performance (1000+ filas)

#### 4. Restaurants Module ✅
- Grid/list toggle para vista de restaurantes
- Filtros avanzados (estado, categoría, precio, rating, ubicación)
- Vista de detalle con tabs (Overview, Photos, Menu, Reviews)
- Sistema de verificación (aprobar/rechazar)
- Gestión de fotos con lightbox
- Menú agrupado por categorías
- Reviews con filtros

#### 5. Moderation Module ✅
- Cola de contenido pendiente de moderación
- Preview de usuarios, restaurantes, comentarios
- Acciones: aprobar/rechazar con motivo
- Filtros por tipo, estado, prioridad
- Bulk actions

#### 6. Notifications Module ✅
- Formulario para crear notificaciones
- Targeting por segmentos (todos, usuarios, dueños de restaurantes)
- Historial de notificaciones enviadas
- Preview antes de enviar

#### 7. Analytics Module ✅
- Dashboard de analíticas
- Gráficos de usuarios, restaurantes, contenido
- Métricas de engagement
- Exportar datos

#### 8. Settings Module ✅
- Configuración del sitio (nombre, descripción, logo)
- Configuración de email (SMTP, templates)
- Configuración de moderación
- Configuración de registros

### Out of Scope

- Frontend público para usuarios finales (proyecto separado)
- Sistema de reservas
- Sistema de pedidos/delivery
- Pagos procesamiento
- Chat en tiempo real

## Approach

### Arquitectura General

**Patrón Arquitectónico**: Clean Architecture con capas bien definidas
- **Presentation Layer**: Componentes Angular standalone
- **Business Layer**: Services con lógica de negocio
- **Data Layer**: BaseService para HTTP calls
- **Cross-cutting**: Guards, Interceptors, Directives

**Tecnologías Principales**:
- Angular 21.2+ con standalone components
- Signals para estado local
- RxJS para operaciones async
- Angular Material para UI components
- Tailwind CSS 4+ para estilos
- NgxTranslate para i18n

**Principios de Diseño**:
- Components pequeños y enfocados (SRP)
- Signals para estado reativo
- Lazy loading de módulos
- Virtual scroll para datasets grandes
- Optimización de imágenes (lazy loading, blur + fade)
- Route preloading para UX

### Estrategia de Testing

**4 Niveles de Testing**:
1. **Unit Tests (370+ tests)**: Services y componentes aislados
2. **Integration Tests (25+ tests)**: Flujos completos entre servicios
3. **Component Tests (115+ tests)**: Comportamiento de UI
4. **E2E Tests (15+ tests)**: Flujos de usuario críticos

**Framework**: Jasmine + Karma (Angular 21 compatibility)

### Performance Optimizations

**Implementadas en Phase 10**:
- ✅ Lazy loading imágenes: 30-40% ahorro ancho de banda
- ✅ Route preloading: <100ms navegación
- ✅ Virtual scroll: 98.5% reducción DOM
- ✅ Bundle optimization: 643 KB (monitoreando límite 1MB)
- ✅ Code splitting por módulos

## Affected Areas

| Area | State | Description |
|------|-------|-------------|
| `src/app/features/auth/` | ✅ Complete | Authentication module |
| `src/app/features/dashboard/` | ✅ Complete | Dashboard con métricas |
| `src/app/features/users/` | ✅ Complete | Users management |
| `src/app/features/restaurants/` | ✅ Complete | Restaurants CRUD |
| `src/app/features/moderation/` | ✅ Complete | Content moderation |
| `src/app/features/notifications/` | ✅ Complete | Notifications system |
| `src/app/features/analytics/` | ✅ Complete | Analytics dashboard |
| `src/app/features/settings/` | ✅ Complete | Site settings |
| `src/app/core/` | ✅ Complete | Core services y auth |
| `src/app/shared/` | ✅ Complete | Shared components |
| `src/app/layouts/` | ✅ Complete | Layout components |
| `src/assets/i18n/` | ✅ Complete | es.json, en.json (100+ keys cada uno) |

## Risks

| Risk | Likelihood | Status | Mitigation |
|------|------------|--------|------------|
| Angular 21 compatibility con Jest | High | ✅ Resuelto | Usar Karma + Jasmine en su lugar |
| Performance con datasets grandes | Medium | ✅ Mitigado | Virtual scroll implementado |
| Accessibility WCAG AA compliance | Medium | ✅ Completado | AXE audits pasan, skip links, ARIA |
| Bundle size > 1MB | Medium | ⚠️ Monitor | 643 KB actual, optimización continua |
| Testing coverage < 70% | Low | ✅ Logrado | 370+ tests, thresholds al 70% |

## Rollback Plan

**Git Branch Strategy**:
- `main`: Producción estable
- `feature/polish-and-tests`: Phase 10 + 11 completadas
- `feature/*`: Branches de features individuales

Si hay problemas críticos en producción:
1. Identificar commit problemático con `git bisect`
2. Hotfix branch desde `main`
3. Deploy de hotfix
4. Merge a `main` y `develop`

## Dependencies

### Externas
- Angular 21.2+ framework
- Angular Material 21.2+ UI library
- RxJS 7.8+ para async
- NgxTranslate 17+ para i18n
- Tailwind CSS 4+ para estilos
- Chart.js 4.5+ para gráficos
- Playwright 1.59+ para E2E tests

### Internas (Backend)
- API REST endpoints para todos los módulos
- Authentication endpoints (login, refresh, logout)
- CRUD endpoints para recursos
- File upload para imágenes

## Success Criteria

### Funcionales
- [x] Todos los módulos implementados y funcionales
- [x] Authentication flow completo (login/logout/refresh)
- [x] CRUD operations para usuarios y restaurantes
- [x] Moderation queue con preview y actions
- [x] Notifications con targeting
- [x] Analytics con gráficos
- [x] Settings con persistencia

### No Funcionales
- [x] Performance: <100ms navigation, <100ms table render
- [x] Accessibility: WCAG AA compliant (AXE pasa)
- [x] Responsive: Mobile (320-640px), Tablet (640-1024px), Desktop (>1024px)
- [x] i18n: Español e inglés completos
- [x] SEO: Meta tags, structured data
- [x] Testing: 370+ tests con 70% coverage

### Calidad de Código
- [x] TypeScript strict mode sin errores
- [x] ESLint sin warnings
- [x] Bundle size < 1MB
- [x] No memory leaks en componentes
- [x] Proper cleanup en destroy

## Timeline

**Fases Completadas**:
- ✅ Phase 1-7: Foundation, Auth, Dashboard, Users, Restaurants
- ✅ Phase 8: Analytics Module
- ✅ Phase 9: Settings Module
- ✅ Phase 10: Polish, Performance & Testing Foundation
- ✅ Phase 11: Testing Suite (370+ tests, CI/CD)

**Total**: 11 fases completadas

## Next Steps

1. ✅ Merge `feature/polish-and-tests` a `main`
2. ⏳ Deploy a producción
3. ⏳ Monitorear métricas y analytics
4. ⏳ Iterar basado en feedback de usuarios
