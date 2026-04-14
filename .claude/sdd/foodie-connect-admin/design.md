# Design: Foodie Connect Admin CRM

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Components │  │    Layouts   │  │  Shared UI  │         │
│  │  (Standalone)│  │ (MainLayout) │  │  (Buttons,  │         │
│  │             │  │             │  │   Cards,    │         │
│  └─────────────┘  └─────────────┘  │   Inputs)   │         │
│                                   └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Business Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Auth     │  │  Features   │  │    Core     │         │
│  │  Services   │  │  Services    │  │  Services   │         │
│  │             │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ BaseService │  │ TokenStorage│  │ ApiCache    │         │
│  │  (HTTP)     │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                      ┌─────────────┐
                      │   Backend   │
                      │    API      │
                      └─────────────┘
```

## Design Patterns

### 1. Component Architecture

#### Standalone Components
- Todos los componentes son `standalone: true` (default Angular 21)
- Cada componente maneja su propio estado con signals
- Change detection strategy: `OnPush` para performance

#### Component Structure
```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, OtherComponent],
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent {
  // Inputs
  readonly data = input.required<Type>();
  
  // Outputs
  readonly action = output<void>();
  
  // Local state
  private readonly loading = signal(false);
  
  // Computed state
  readonly displayData = computed(() => processData(this.data()));
  
  // DI
  private readonly service = inject(ServiceName);
}
```

#### Container-Presentational Pattern
- **Container Components**: Manejan lógica de negocio, llaman services
- **Presentational Components**: Solo renderizan UI, reciben datos vía @input

### 2. State Management

#### Signals Pattern
```typescript
// Local state
private readonly state = signal(initialValue);

// Computed (derived)
readonly derived = computed(() => transform(this.state()));

// Updates
this.state.set(newValue);
this.state.update(current => ({ ...current, field: newValue }));
```

#### Global State con Services
```typescript
@Injectable({ providedIn: 'root' })
export class GlobalStateService {
  private readonly state = signal<State>(initialState);
  
  readonly state = this.state.asReadonly();
  
  updateState(updater: (current: State) => Partial<State>) {
    this.state.update(current => ({ ...current, ...updater(current) }));
  }
}
```

### 3. Service Architecture

#### BaseService Pattern
```typescript
@Injectable({ providedIn: 'root' })
export class FeatureService extends BaseService {
  private readonly endpoint = '/api/feature';
  
  getAll(params?: QueryParams): Observable<DataType[]> {
    return this.get<DataType[]>(this.endpoint, undefined, params);
  }
  
  getById(id: string): Observable<DataType> {
    return this.get<DataType>(`${this.endpoint}/${id}`);
  }
  
  create(data: CreateDTO): Observable<DataType> {
    return this.post(this.endpoint, data);
  }
  
  update(id: string, data: UpdateDTO): Observable<DataType> {
    return this.put(`${this.endpoint}/${id}`, data);
  }
  
  delete(id: string): Observable<void> {
    return this.delete(`${this.endpoint}/${id}`);
  }
}
```

#### Service Singleton
- Todos los services usan `providedIn: 'root'`
- Inyección de dependencias con `inject()` function
- No constructor injection (Angular 15+ pattern)

### 4. Routing Architecture

#### Lazy Loading
```typescript
const routes: Routes = [{
  path: 'feature',
  loadChildren: () => import('./features/feature/feature.routes')
    .then(m => m.FeatureRoutes),
  canActivate: [AuthGuard]
}];
```

#### Custom Preloading
```typescript
@Injectable({ providedIn: 'root' })
export class CustomPreloadingStrategy implements PreloadingStrategy {
  private readonly delay = 2000; // 2 seconds
  
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    return route.data?.['preload'] 
      ? timer(this.delay).pipe(mergeMap(() => load()))
      : of(null);
  }
}
```

#### Route Guards
```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url }});
};
```

### 5. HTTP Layer

#### Interceptor Chain
```
Request → Retry Interceptor → Auth Interceptor → Loading Interceptor → Error Interceptor → Backend
                                                                                     ↓
Response ← 200 OK ←──────────────────────────────────────────────────────────────
                     ↓
Error ← Error Interceptor ← 4xx/5xx Error ←───────────────────────────────────
```

#### Retry Interceptor
```typescript
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  const retryService = inject(RetryService);
  
  return next(req).pipe(
    retry({
      count: 3,
      delay: (error) => timer(expBack(++retryService.attempt, 1000, 0, 10000)),
    })
  );
};
```

#### Auth Interceptor
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  const token = authService.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  
  return next(req);
};
```

### 6. Error Handling

#### Global Error Handler
```typescript
@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error): void {
    console.error('Global error handler:', error);
    
    // Log to external service (Sentry, etc.)
    this.logError(error);
  }
  
  private logError(error: Error): void {
    // Send to logging service
  }
}
```

#### Toast Notifications
```typescript
// Show success toast
toastService.success('Operación exitosa');

// Show error toast
toastService.error('Ocurrió un error');

// Show info toast with duration
toastService.info('Mensaje informativo', 3000);

// Show warning with action
toastService.warning('Advertencia', 5000, {
  label: 'Deshacer',
  handler: () => undoAction()
});
```

### 7. Caching Strategy

#### API Cache Service
```typescript
@Injectable({ providedIn: 'root' })
export class ApiCacheService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }
  
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL
    });
  }
  
  invalidate(pattern: string): void {
    // Wildcard pattern matching
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    Array.from(this.cache.keys())
      .filter(key => regex.test(key))
      .forEach(key => this.cache.delete(key));
  }
}
```

### 8. Performance Optimizations

#### Virtual Scroll
```typescript
@Component({
  selector: 'app-virtual-table',
  standalone: true,
  imports: [ScrollingModule]
})
export class VirtualTableComponent {
  readonly rowHeight = 72; // Fixed height
  
  readonly items = input<Item[]>([]);
  
  trackByItem(index: number, item: Item): string {
    return item.id;
  }
}
```

```html
<cdk-virtual-scroll-viewport
  [itemSize]="rowHeight"
  [minBufferPx]="500"
  [maxBufferPx]="1000">
  <div *cdkVirtualFor="let item of items; trackBy: trackByItem" [style]="{height: rowHeight + 'px'}">
    {{ item.name }}
  </div>
</cdk-virtual-scroll-viewport>
```

#### Lazy Loading Images
```typescript
@Directive({
  selector: 'img[appLazyLoad]',
  standalone: true
})
export class LazyLoadImageDirective implements OnInit {
  readonly src = input.required<string>();
  
  constructor(private readonly el: ElementRef<HTMLImageElement>) {}
  
  ngOnInit(): void {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage();
            observer.unobserve(this.el.nativeElement);
          }
        });
      }, { rootMargin: '50px' });
      
      observer.observe(this.el.nativeElement);
    } else {
      this.loadImage();
    }
  }
  
  private loadImage(): void {
    this.el.nativeElement.src = this.src();
  }
}
```

### 9. Internationalization

#### NgxTranslate Setup
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideTranslations(httpLoaderFactory, {
      format: 'json',
      defaultLanguage: 'es',
    }),
    provide: TranslateLoader,
    useClass: TranslateHttpLoader
  ]
};
```

#### Language Switcher
```typescript
export const LanguageService = () => {
  const translate = inject(TranslateService);
  const currentLanguage = signal<Language>('es');
  
  const setLanguage = (lang: Language): void => {
    translate.use(lang);
    currentLanguage.set(lang);
    localStorage.setItem('foodie_language', lang);
  };
  
  const toggleLanguage = (): void => {
    setLanguage(currentLanguage() === 'es' ? 'en' : 'es');
  };
  
  return { currentLanguage, setLanguage, toggleLanguage };
};
```

### 10. Accessibility Architecture

#### Skip Links
```html
<a href="#main-content" class="skip-link">
  Saltar al contenido principal
</a>

<main id="main-content" tabindex="-1">
  <!-- Main content -->
</main>
```

#### Focus Management
```typescript
onKeydown(event: KeyboardEvent, index: number): void {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      this.focusMenuItem(Math.min(index + 1, items.length - 1));
      break;
    case 'ArrowUp':
      event.preventDefault();
      this.focusMenuItem(Math.max(index - 1, 0));
      break;
    case 'Escape':
      this.close();
      break;
  }
}

private focusMenuItem(index: number): void {
  const items = document.querySelectorAll('.nav-item');
  (items[index] as HTMLElement)?.focus();
}
```

#### ARIA Attributes
```html
<button
  (click)="onAction()"
  [attr.aria-label]="buttonLabel"
  [attr.aria-pressed]="isActive">
  {{ label }}
</button>

<div role="navigation" aria-label="Main menu">
  <a routerLink="/dashboard" aria-label="Dashboard">
    Dashboard
  </a>
</div>
```

## Folder Structure

```
src/app/
├── core/
│   ├── auth/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── token-storage.service.ts
│   │   │   └── auth.guard.ts
│   │   └── interceptors/
│   │       ├── retry.interceptor.ts
│   │       ├── auth.interceptor.ts
│   │       ├── loading.interceptor.ts
│   │       └── error.interceptor.ts
│   ├── services/
│   │   ├── base.service.ts
│   │   ├── toast-notification.service.ts
│   │   ├── loading-state.service.ts
│   │   ├── selection.service.ts
│   │   ├── language.service.ts
│   │   └── api-cache.service.ts
│   └── models/
│       └── user.types.ts
├── shared/
│   ├── components/
│   │   ├── button/
│   │   ├── card/
│   │   ├── input/
│   │   ├── empty-state/
│   │   └── loading-spinner/
│   ├── directives/
│   │   └── lazy-load-image.directive.ts
│   └── pipes/
├── features/
│   ├── auth/
│   │   └── login/
│   │       └── login-form/
│   ├── dashboard/
│   ├── users/
│   │   └── users-list/
│   │       ├── users-table/
│   │       └── user-filters/
│   ├── restaurants/
│   │   ├── restaurants-list/
│   │   │   ├── view-toggle/
│   │   │   ├── restaurant-filters/
│   │   │   └── grid-view/
│   │   └── restaurant-detail/
│   │       └── tabs/
│   ├── moderation/
│   │   └── moderation-queue/
│   │       └── report-detail/
│   ├── notifications/
│   ├── analytics/
│   └── settings/
├── layouts/
│   └── main-layout/
│       ├── sidebar/
│       └── top-bar/
├── assets/
│   ├── i18n/
│   │   ├── es.json
│   │   └── en.json
│   └── images/
└── styles/
    ├── material-theme.css
    └── styles.css
```

## Technology Stack

### Frontend Framework
- **Angular 21.2+**: Framework principal
- **TypeScript 5.9**: Lenguaje con strict mode
- **RxJS 7.8**: Para programación reactiva

### UI Libraries
- **Angular Material 21.2**: Componentes UI
- **Angular CDK 21.2**: Virtual scroll, a11y
- **Tailwind CSS 4.1**: Estilos utilitarios

### i18n
- **NgxTranslate 17**: Traducciones
- **Http Loader**: Cargar JSONs dinámicamente

### Testing
- **Jasmine**: Testing framework
- **Karma**: Test runner
- **Playwright**: E2E tests
- **Testing Library**: Component testing utilities

### Development Tools
- **Angular CLI 21.2**: Scaffolding y building
- **ESLint**: Linting
- **Prettier**: Code formatting
- **GitHub Actions**: CI/CD

## Security Considerations

### Token Storage
- **Access Token**: localStorage, 15 min TTL
- **Refresh Token**: localStorage, 7 days TTL
- **No cookies**: httpOnly no aplicable (configuración)

### XSS Prevention
- Angular sanitization por defecto
- `DomSanitizer` para HTML dinámico
- Validación de inputs en backend

### CSRF Protection
- Tokens en mutaciones (POST, PATCH, DELETE)
- Verificación de origin en backend

### Rate Limiting
- Login endpoint: 5 intentos por 15 min
- API endpoints: 100 requests/minuto por usuario

## Performance Targets

### Bundle Size
- **Initial Bundle**: < 1MB (actual: 643 KB)
- **Lazy Loaded Chunks**: < 200KB cada uno
- **Total JS**: < 2MB

### Load Time
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Largest Contentful Paint**: < 2.5s

### Runtime Performance
- **Frame Rate**: 60fps en animaciones
- **Table Render**: < 100ms para 100 filas
- **Route Transitions**: < 100ms

## Monitoring & Observability

### Logging Strategy
- Client errors → Console + Sentry
- API errors → Toast + Log server
- Performance → Web Vitals

### Metrics
- **Core Web Vitals**: LCP, FID, CLS
- **Custom Metrics**: API response times, error rates
- **User Analytics**: Feature usage, navigation paths

## Deployment Architecture

### Environments
- **Development**: Localhost con hot reload
- **Staging**: Pre-production environment
- **Production**: CDN + Static hosting

### Build Process
```bash
# Development build
ng build --configuration development

# Production build
ng build --configuration production

# Output: dist/browser/
```

### CI/CD Pipeline
1. **Lint**: ESLint validation
2. **Type Check**: TypeScript compiler
3. **Unit Tests**: 370+ tests
4. **E2E Tests**: 15+ critical paths
5. **Build**: Production bundle
6. **Deploy**: Automatic on main branch

## Future Enhancements

### Short Term (Next 3 months)
- [ ] PWA support (Service Worker, Manifest)
- [ ] Advanced analytics (custom dashboards)
- [ ] Real-time updates (WebSockets)
- [ ] File upload optimization (chunking, resume)

### Long Term (6-12 months)
- [ ] Micro-frontend architecture
- [ ] Offline mode support
- [ ] Advanced role-based permissions
- [ ] Audit logs system
- [ ] Multi-language support beyond ES/EN
