# Specifications: Foodie Connect Admin CRM

## Authentication Module

### Functional Requirements

#### Login
- **FR-AUTH-001**: Usuario debe poder ingresar email y contraseña
- **FR-AUTH-002**: Sistema debe validar formato de email
- **FR-AUTH-003**: Contraseña debe tener mínimo 8 caracteres
- **FR-AUTH-004**: Sistema debe mostrar errores de validación en tiempo real
- **FR-AUTH-005**: Usuario debe poder marcar "Recordarme"
- **FR-AUTH-006**: Login exitoso debe redirigir a dashboard
- **FR-AUTH-007**: Login fallido debe mostrar mensaje específico según error (401, 429, connection)

#### Session Management
- **FR-AUTH-008**: Sistema debe almacenar access token y refresh token
- **FR-AUTH-009**: Access token debe expirar en 15 minutos
- **FR-AUTH-010**: Refresh token debe expirar en 7 días
- **FR-AUTH-011**: Sistema debe refresh token automáticamente antes de expiración
- **FR-AUTH-012**: Logout debe limpiar todos los tokens
- **FR-AUTH-013**: Logout debe redirigir a login page

#### Protected Routes
- **FR-AUTH-014**: Rutas protegidas deben verificar token válido
- **FR-AUTH-015**: Token inválido debe redirigir a login
- **FR-AUTH-016**: Token expirado debe intentar refresh automático

### Non-Functional Requirements

- **NFR-AUTH-001**: Login debe completarse en < 2s
- **NFR-AUTH-002**: Token refresh debe ser transparente para usuario
- **NFR-AUTH-003**: Tokens deben almacenarse en localStorage (no cookies)
- **NFR-AUTH-004**: Contraseñas nunca deben loguearse o mostrarse

### Technical Specifications

#### Interfaces
```typescript
interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  full_name?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}
```

#### API Endpoints
- `POST /api/auth/login` - Login con credenciales
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout y invalidar tokens

#### Components
- `LoginFormComponent` - Formulario de login con validación
- `AuthGuard` - Guard para rutas protegidas

## Dashboard Module

### Functional Requirements

#### Metrics Display
- **FR-DASH-001**: Dashboard debe mostrar total de usuarios
- **FR-DASH-002**: Dashboard debe mostrar total de restaurantes
- **FR-DASH-003**: Dashboard debe mostrar moderaciones activas
- **FR-DASH-004**: Dashboard debe mostrar notificaciones enviadas
- **FR-DASH-005**: Dashboard debe mostrar gráfico de tendencia de usuarios
- **FR-DASH-006**: Dashboard debe mostrar gráfico de tendencia de restaurantes

#### Navigation
- **FR-DASH-007**: Dashboard debe tener navegación rápida a cada módulo
- **FR-DASH-008**: Cards deben ser clickeables y navegar a detalle

### Non-Functional Requirements

- **NFR-DASH-001**: Dashboard debe cargar en < 1s
- **NFR-DASH-002**: Gráficos deben renderizarse en < 500ms
- **NFR-DASH-003**: Métricas deben actualizarse en tiempo real

### Technical Specifications

#### Components
- `DashboardComponent` - Página principal con métricas
- `MetricCardComponent` - Card individual con métrica
- `TrendChartComponent` - Gráfico de tendencia

## Users Module

### Functional Requirements

#### List View
- **FR-USERS-001**: Listado debe mostrar usuarios en tabla
- **FR-USERS-002**: Tabla debe tener columnas: Email, Nombre, Rol, Estado, Acciones
- **FR-USERS-003**: Tabla debe soportar ordenamiento por columnas
- **FR-USERS-004**: Tabla debe tener paginación (10, 25, 50 por página)
- **FR-USERS-005**: Tabla debe usar virtual scroll para 1000+ usuarios

#### Filters
- **FR-USERS-006**: Filtro por estado (Active, Inactive, Pending)
- **FR-USERS-007**: Filtro por rol (User, Admin, Super Admin)
- **FR-USERS-008**: Búsqueda por email o nombre debounced (300ms)
- **FR-USERS-009**: Filtros deben combinarse (AND logic)

#### Actions
- **FR-USERS-010**: Ver detalle de usuario
- **FR-USERS-011**: Cambiar estado de usuario (Active ↔ Inactive)
- **FR-USERS-012**: Eliminar usuario con confirmación
- **FR-USERS-013**: Acciones deben mostrar feedback visual

### Non-Functional Requirements

- **NFR-USERS-001**: Render de 1000 filas en < 100ms
- **NFR-USERS-002**: Búsqueda debe debounced para no saturar API
- **NFR-USERS-003**: Filtros no deben causar re-render completo

## Restaurants Module

### Functional Requirements

#### List View
- **FR-REST-001**: Toggle entre vista grid y list
- **FR-REST-002**: Grid debe mostrar cards con foto, nombre, rating, estado
- **FR-REST-003**: Grid debe ser responsivo (1/2/3/4 columnas según viewport)
- **FR-REST-004**: List debe mostrar tabla con más detalles

#### Filters
- **FR-REST-005**: Filtro por estado (Pending, Verified, Rejected, Suspended)
- **FR-REST-006**: Filtro por categoría (Pizza, Burger, Sushi, etc.)
- **FR-REST-007**: Filtro por rango de precios ($, $$, $$$)
- **FR-REST-008**: Filtro por rating mínimo (1-5 estrellas)
- **FR-REST-009**: Búsqueda por nombre o ubicación
- **FR-REST-010**: Filtros deben persistir en URL query params

#### Detail View
- **FR-REST-011**: Detail debe tener tabs: Overview, Photos, Menu, Reviews
- **FR-REST-012**: Overview tab: info básica, estadísticas, galería hero
- **FR-REST-013**: Photos tab: galería con lightbox, upload/delete (admin)
- **FR-REST-014**: Menu tab: items agrupados por categoría
- **FR-REST-015**: Reviews tab: lista con filtros y sorting

#### Verification
- **FR-REST-016**: Admin debe poder aprobar restaurante pendiente
- **FR-REST-017**: Admin debe poder rechazar con motivo obligatorio
- **FR-REST-018**: Acción debe actualizar estado y notificar al dueño

### Non-Functional Requirements

- **NFR-REST-001**: Grid images deben lazy load
- **NFR-REST-002**: Lightbox debe cargar imágenes on-demand
- **NFR-REST-003**: Menu debe cachearse por 5 minutos

## Moderation Module

### Functional Requirements

#### Queue
- **FR-MOD-001**: Cola debe mostrar contenido pendiente ordenado
- **FR-MOD-002**: Cada item debe mostrar tipo (User, Restaurant, Review, Comment)
- **FR-MOD-003**: Cada item debe tener preview del contenido
- **FR-MOD-004**: Priority indicator (alta prioridad destacada)

#### Actions
- **FR-MOD-005**: Aprobar contenido (quita de cola, publica)
- **FR-MOD-006**: Rechazar contenido (quita de cola, notifica usuario)
- **FR-MOD-007**: Rechazo requiere motivo obligatorio
- **FR-MOD-008**: Bulk actions para aprobar/rechazar múltiples items

#### Filters
- **FR-MOD-009**: Filtro por tipo de contenido
- **FR-MOD-010**: Filtro por estado (Pending, Approved, Rejected)
- **FR-MOD-011**: Filtro por prioridad

### Non-Functional Requirements

- **NFR-MOD-001**: Preview debe cargar sin bloquear UI
- **NFR-MOD-002**: Acciones bulk deben ser optimizados (batch API calls)

## Notifications Module

### Functional Requirements

#### Creation
- **FR-NOTIF-001**: Admin debe crear notificación con título y mensaje
- **FR-NOTIF-002**: Admin debe seleccionar target (todos, usuarios, dueños)
- **FR-NOTIF-003**: Admin debe poder ver preview antes de enviar
- **FR-NOTIF-004**: Envío debe ser inmediato o programado

#### Targeting
- **FR-NOTIF-005**: Target "Todos" envía a todos los usuarios
- **FR-NOTIF-006**: Target "Usuarios" filtra por rol USER
- **FR-NOTIF-007**: Target "Dueños" filtra por usuarios con restaurantes
- **FR-NOTIF-008**: Target custom permite segmentación avanzada

#### History
- **FR-NOTIF-009**: Historial debe mostrar notificaciones enviadas
- **FR-NOTIF-010**: Historial debe tener filtros por fecha, target, estado
- **FR-NOTIF-011**: Admin debe poder ver detalles de notificación enviada

### Non-Functional Requirements

- **NFR-NOTIF-001**: Envío debe usar queue para no bloquear UI
- **NFR-NOTIF-002**: Preview debe renderizarse instantáneamente

## Analytics Module

### Functional Requirements

#### Metrics
- **FR-ANAL-001**: Dashboard debe mostrar usuarios totales y nuevos registros
- **FR-ANAL-002**: Dashboard debe mostrar restaurantes totales y nuevos
- **FR-ANAL-003**: Dashboard debe mostrar contenido total (reviews, comments)
- **FR-ANAL-004**: Dashboard debe mostrar moderaciones procesadas

#### Charts
- **FR-ANAL-005**: Gráfico de tendencia de registros (últimos 30 días)
- **FR-ANAL-006**: Gráfico de tendencia de restaurantes (últimos 30 días)
- **FR-ANAL-007**: Gráfico de contenido por categoría
- **FR-ANAL-008**: Gráficos deben ser interactivos (zoom, tooltips)

#### Export
- **FR-ANAL-009**: Admin debe poder exportar datos a CSV
- **FR-ANAL-010**: Export debe permitir filtrar por rango de fechas

### Non-Functional Requirements

- **NFR-ANAL-001**: Charts deben usar Chart.js optimizado
- **NFR-ANAL-002**: Datos deben cachearse por 5 minutos
- **NFR-ANAL-003**: Export no debe bloquear UI (background job)

## Settings Module

### Functional Requirements

#### Site Settings
- **FR-SET-001**: Admin debe configurar nombre del sitio
- **FR-SET-002**: Admin debe configurar descripción del sitio
- **FR-SET-003**: Admin debe subir logo del sitio
- **FR-SET-004**: Cambios deben guardarse inmediatamente

#### Email Settings
- **FR-SET-005**: Admin debe configurar servidor SMTP
- **FR-SET-006**: Admin debe configurar templates de email
- **FR-SET-007**: Admin debe poder enviar email de prueba

#### Moderation Settings
- **FR-SET-008**: Admin debe configurar reglas de moderación automática
- **FR-SET-009**: Admin debe configurar palabras prohibidas
- **FR-SET-010**: Admin debe habilitar/deshabilitar auto-moderación

### Non-Functional Requirements

- **NFR-SET-001**: Cambios deben validarse antes de guardar
- **NFR-SET-002**: Settings deben persistirse en backend
- **NFR-SET-003**: Logo upload debe optimizar imagen

## Global Requirements

### Accessibility (WCAG AA)
- **ACC-001**: Todo contenido interactivo debe ser keyboard navigable
- **ACC-002**: Todo contenido debe tener focus indicators visibles
- **ACC-003**: Imágenes deben tener alt text descriptivo
- **ACC-004**: Colores deben tener contraste mínimo 4.5:1
- **ACC-005**: Forms deben tener labels y error messages
- **ACC-006**: Skip links para content principal
- **ACC-007**: ARIA attributes en componentes interactivos

### Responsive Design
- **RSP-001**: Mobile (320-640px): Hamburger menu, stacked layouts
- **RSP-002**: Tablet (640-1024px): Sidebar collapsible, grid adaptativo
- **RSP-003**: Desktop (>1024px): Sidebar fijo, layout completo

### Performance
- **PERF-001**: Initial bundle < 1MB
- **PERF-002**: Time to Interactive < 3s
- **PERF-003**: First Contentful Paint < 1.5s
- **PERF-004**: Route transitions < 100ms
- **PERF-005**: Table render (100 filas) < 100ms

### Internationalization
- **I18N-001**: Soporte para español e inglés
- **I18N-002**: Language switcher en header
- **I18N-003**: Preferencia de usuario persiste en localStorage
- **I18N-004**: Todos los textos deben estar traducidos
- **I18N-005**: Dates y números deben formatearse según locale

### Security
- **SEC-001**: Tokens almacenados en localStorage (httpOnly cookies no aplicables)
- **SEC-002**: HTTPS obligatorio en producción
- **SEC-003**: XSS prevention con Angular sanitization
- **SEC-004**: CSRF tokens en mutaciones
- **SEC-005**: Rate limiting en endpoints críticos

## Testing Requirements

### Unit Tests
- **UT-001**: Todos los services deben tener tests
- **UT-002**: Mínimo 70% coverage threshold
- **UT-003**: Tests deben cubrir happy path y edge cases
- **UT-004**: Tests deben mockear dependencias externas

### Component Tests
- **CT-001**: Componentes críticos deben tener tests
- **CT-002**: Tests deben verificar rendering y user interactions
- **CT-003**: Tests deben probar signals reactivity

### Integration Tests
- **IT-001**: Flujos completos (login → dashboard → logout)
- **IT-002**: Tests deben integrar múltiples servicios
- **IT-003**: Tests deben verificar persistencia de datos

### E2E Tests
- **E2E-001**: 6 critical user paths deben estar cubiertos
- **E2E-002**: Tests deben ejecutarse en Chrome (Playwright)
- **E2E-003**: Tests deben incluir screenshots para debugging

## API Contracts

### Authentication
```
POST /api/auth/login
Request: { email: string, password: string, rememberMe: boolean }
Response: { user: User, token: string, refreshToken: string }
Errors: 401 (invalid credentials), 429 (too many attempts), 0 (connection error)

POST /api/auth/refresh
Request: { refreshToken: string }
Response: { token: string, refreshToken: string }
Errors: 401 (invalid refresh token)

POST /api/auth/logout
Request: {}
Response: { success: boolean }
```

### Users
```
GET /api/users?page=1&limit=10&status=ACTIVE&role=USER&search=test
Response: { users: User[], total: number, page: number, limit: number }

PATCH /api/users/:id/status
Request: { status: 'ACTIVE' | 'INACTIVE' }
Response: { user: User }

DELETE /api/users/:id
Request: {}
Response: { success: boolean }
```

### Restaurants
```
GET /api/restaurants?page=1&limit=10&status=VERIFIED&category=PIZZA&price=$$
Response: { restaurants: Restaurant[], total: number, page: number, limit: number }

GET /api/restaurants/:id
Response: { restaurant: Restaurant }

PATCH /api/restaurants/:id/verify
Request: { action: 'approve' | 'reject', reason?: string }
Response: { restaurant: Restaurant }
```

### Moderation
```
GET /api/moderation/queue?type=USER&status=PENDING&priority=HIGH
Response: { items: ModerationItem[], total: number }

PATCH /api/moderation/:id/action
Request: { action: 'approve' | 'reject', reason?: string }
Response: { item: ModerationItem }
```

### Notifications
```
POST /api/notifications
Request: { title: string, message: string, target: string, scheduledAt?: Date }
Response: { notification: Notification }

GET /api/notifications/history?page=1&limit=10
Response: { notifications: Notification[], total: number }
```

### Analytics
```
GET /api/analytics/users?from=2024-01-01&to=2024-12-31
Response: { total: number, newRegistrations: number, trend: DataPoint[] }

GET /api/analytics/restaurants?from=2024-01-01&to=2024-12-31
Response: { total: number, newRestaurants: number, trend: DataPoint[] }

GET /api/analytics/export?format=csv&from=2024-01-01&to=2024-12-31
Response: File download (CSV)
```

### Settings
```
GET /api/settings
Response: { settings: Settings }

PATCH /api/settings
Request: { site: SiteSettings, email: EmailSettings, moderation: ModerationSettings }
Response: { settings: Settings }

POST /api/settings/logo
Request: FormData { file: File }
Response: { url: string }
```

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  full_name?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: Date;
  updatedAt: Date;
}
```

### Restaurant
```typescript
interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  rating: number;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  address: Address;
  contact: Contact;
  schedule: Schedule[];
  heroImage: string;
  images: string[];
  owner: User;
  createdAt: Date;
  updatedAt: Date;
}
```

### ModerationItem
```typescript
interface ModerationItem {
  id: string;
  type: 'USER' | 'RESTAURANT' | 'REVIEW' | 'COMMENT';
  targetId: string;
  content: any;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  reportedBy: User;
  createdAt: Date;
  reviewedBy?: User;
  reviewedAt?: Date;
}
```

### Notification
```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  target: 'ALL' | 'USERS' | 'OWNERS';
  status: 'DRAFT' | 'SCHEDULED' | 'SENT';
  sentAt?: Date;
  scheduledAt?: Date;
  createdBy: User;
  createdAt: Date;
}
```

## State Management

### Signals Usage
- **Local State**: Component signals para UI state
- **Global State**: Services con signals para shared state
- **Computed**: derived state con `computed()`
- **Persistence**: localStorage para user preferences

### Services
- **AuthService**: Authentication y session management
- **BaseService**: HTTP wrapper con interceptors
- **ToastNotificationService**: UI notifications
- **LoadingStateService**: Global loading state
- **SelectionService**: Generic selection management
- **LanguageService**: i18n language switching
- **ApiCacheService**: API response caching con TTL

## Error Handling

### HTTP Errors
- **400**: Bad Request - mostrar error específico
- **401**: Unauthorized - redirect a login o refresh token
- **403**: Forbidden - mostrar "Acceso denegado"
- **404**: Not Found - mostrar "Recurso no encontrado"
- **429**: Too Many Requests - mostrar "Demasiados intentos"
- **500**: Server Error - mostrar "Error del servidor"
- **0**: Connection Error - mostrar "Error de conexión"

### Client Errors
- **Validation Errors**: Mostrar en campo específico
- **Network Errors**: Toast con opción de reintentar
- **Unknown Errors**: Toast genérico + log para debugging
