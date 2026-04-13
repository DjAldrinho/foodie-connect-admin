# Proposal: Restaurants Module

## Intent

Implementar el módulo completo de restaurantes (Restaurants Module) para el panel de administración de Foodie Connect. Este módulo permitirá a los administradores gestionar todos los aspectos de los restaurantes: listado con filtros avanzados, detalle completo con tabs (Overview, Photos, Menu, Reviews), sistema de verificación, moderación, gestión de fotos, y control de estados.

## Scope

### In Scope
- **RestaurantsListComponent** - Página principal con grid/list toggle, filtros, búsqueda, paginación
- **RestaurantFiltersComponent** - Filtros por estado, categoría, precio, rating, ubicación, búsqueda debounced
- **ViewToggleComponent** - Toggle entre vista grid y list ✅ (ya creado)
- **GridViewComponent** - Vista de cards responsivo (1/2/3/4 columnas)
- **ListViewComponent** - Vista de tabla con columnas ordenables
- **RestaurantDetailComponent** - Página de detalle con navegación por tabs
- **OverviewTabComponent** - Info del restaurante, estadísticas, galería hero, contacto, horarios
- **PhotosTabComponent** - Galería de fotos con lightbox, upload/delete (admin)
- **MenuTabComponent** - Menú agrupado por categoría con items
- **ReviewsTabComponent** - Lista de reviews con filtros
- **VerificationActionsComponent** - Workflow aprobar/rechazar restaurante
- **RestaurantFormComponent** - Formulario crear/editar restaurante
- **RestaurantsService** - Service con todos los endpoints CRUD
- **restaurants.routes.ts** - Configuración de rutas lazy-loaded

### Out of Scope
- Crear restaurantes por parte de usuarios (frontend público)
- Sistema de reservas
- Sistema de delivery/pedidos
- Reporte de usuarios
- Analytics avanzado (esto va en Analytics Module)

## Approach

Seguir exactamente el patrón del **Users Module** (Phase 4):
- Componentes standalone con OnPush change detection
- Signals para estado local y computed para derivado
- Services extienden BaseService con endpoints REST
- Lazy loading con loadChildren() en rutas
- Estructura: `restaurants/{restaurants-list, restaurant-detail}/{components}/`
- Reutilizar shared components (button, card, empty-state, loading-spinner)
- Angular 21+ native control flow (@if, @for) para tabs y listas

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/features/restaurants/restaurants-list/` | New | Página principal de listado de restaurantes |
| `src/app/features/restaurants/restaurant-detail/` | New | Página de detalle con tabs |
| `src/app/features/restaurants/services/` | New | RestaurantsService con todos los endpoints |
| `src/app/features/restaurants/restaurants.routes.ts` | New | Configuración de rutas del módulo |
| `src/app/app.routes.ts` | Modified | Agregar ruta restaurants con loadChildren() |
| `src/app/models/restaurants.types.ts` | Created ✅ | Interfaces y tipos ya creados |
| `src/app/features/restaurants/restaurants-list/view-toggle/` | Created ✅ | ViewToggleComponent ya creado |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Complejidad de 13 componentes | Medium | Dividir en subtareas iterativas, usar TaskCreate para tracking |
| Lightbox implementation para fotos | Medium | Reusar patrón de Users Module si existe, o usar librería probada |
| Performance con galerías grandes | Low | Lazy loading de imágenes, paginación |
| Estado de verificación complejo | Low | Estados bien definidos en enum, transiciones controladas en backend |
| Tabs con múltiples data sources | Low | Cada tab es independiente con su propio loading state |

## Rollback Plan

Si hay problemas críticos:
1. Eliminar ruta restaurants de `src/app/app.routes.ts`
2. Eliminar carpeta `src/app/features/restaurants/` (excepto archivos ya creados que no rompan)
3. Eliminar `restaurants.types.ts` de models si no se usa en otro lado
4. Branch de git permite revert completo si es necesario

## Dependencies

- Phase 4 (Users Module) debe estar completo como patrón arquitectónico
- Backend endpoints deben estar implementados (según SPECIFICATION.md)
- Shared components (button, card, empty-state, loading-spinner) deben existir
- BaseService debe estar funcionando correctamente
- AuthGuard configurado para proteger rutas de administración

## Success Criteria

- [ ] Restaurants list se muestra correctamente con grid/list toggle funcional
- [ ] Filtros (búsqueda, estado, categoría, rating) funcionan correctamente
- [ ] Paginación funciona correctamente
- [ ] Vista de detalle de restaurante carga toda la información correctamente
- [ ] Tabs (Overview, Photos, Menu, Reviews) cambian correctamente
- [ ] Galería de fotos funciona con lightbox
- [ ] Sistema de verificación (aprobar/rechazar) funciona correctamente
- [ ] Build exitoso sin errores de TypeScript
- [ ] No violaciones de accesibilidad WCAG AA (AXE checks pasan)
- [ ] Responsive design funciona en mobile/tablet/desktop