# 📚 Guía de Aprendizaje - Foodie Connect Admin

> Documento de aprendizaje completo sobre arquitectura, patrones y tecnologías utilizadas en Foodie Connect Admin

## 🎯 Propósito

Este documento está diseñado para que puedas aprender **todos los conceptos, patrones y buenas prácticas** que hemos aplicado en el desarrollo del panel de administración. Cada sección incluye explicaciones teóricas, ejemplos prácticos y recursos adicionales.

---

## 📑 Índice

1. [Arquitectura del Proyecto](#1-arquitectura-del-proyecto)
2. [Angular 21: Nuevas Características](#2-angular-21-nuevas-características)
3. [Signals: Reactive State Management](#3-signals-reactive-state-management)
4. [Functional Services](#4-functional-services)
5. [Standalone Components](#5-standalone-components)
6. [HTTP Interceptors](#6-http-interceptors)
7. [Route Guards](#7-route-guards)
8. [Reactive Forms](#8-reactive-forms)
9. [Material Design Integration](#9-material-design-integration)
10. [Tailwind CSS](#10-tailwind-css)
11. [TypeScript Best Practices](#11-typescript-best-practices)
12. [Patrones de Diseño](#12-patrones-de-diseño)
13. [Problemas Comunes y Soluciones](#13-problemas-comunes-y-soluciones)

---

## 1. Arquitectura del Proyecto

### 🏗️ Estructura General

```
Foodie Connect Admin
├── Core Layer          # Infraestructura base
├── Features Layer     # Módulos de funcionalidad
├── Shared Layer       # Componentes reutilizables
└── Presentation Layer # Layouts y UI
```

### 📁 Estructura de Directorios

```
src/app/
├── core/                    # CORE LAYER
│   ├── auth/               # Autenticación
│   │   ├── services/       # AuthService, TokenStorage
│   │   ├── guards/         # Route guards
│   │   └── interceptors/   # HTTP interceptors
│   └── services/           # BaseService, Toast, etc.
│
├── features/               # FEATURES LAYER
│   ├── auth/              # Login, forgot password
│   ├── dashboard/         # Dashboard principal
│   └── users/             # Gestión de usuarios
│
├── layouts/                # PRESENTATION LAYER
│   ├── auth-layout/       # Layout para auth pages
│   └── main-layout/       # Layout principal
│       ├── sidebar/       # Menú lateral
│       └── top-bar/       # Barra superior
│
├── shared/                 # SHARED LAYER
│   ├── components/        # Componentes reutilizables
│   ├── directives/        # Directivas custom
│   ├── pipes/             # Pipes transformadores
│   └── utils/             # Utilidades
│
├── models/                 # TYPE DEFINITIONS
│   ├── auth.types.ts      # Tipos de autenticación
│   ├── users.types.ts     # Tipos de usuarios
│   └── common.types.ts    # Tipos comunes
│
└── assets/                 # STATIC ASSETS
    ├── images/            # Imágenes, logo
    └── i18n/              # Traducciones
```

### 🎯 Principios de Arquitectura

#### **1. Separation of Concerns**
Cada capa tiene una responsabilidad clara:
- **Core**: Infraestructura, no UI
- **Features**: Funcionalidad de negocio
- **Shared**: Componentes genéricos
- **Layouts**: Estructura visual

#### **2. Single Responsibility**
Cada componente/hacer una sola cosa:
- ✅ `UserListComponent`: Muestra lista de usuarios
- ✅ `UserFiltersComponent`: Maneja filtros
- ✅ `UsersTableComponent`: Renderiza la tabla

#### **3. Dependency Inversion**
Depende de abstracciones, no de implementaciones:
```typescript
// ❌ MAL
constructor(private http: HttpClient) {}

// ✅ BIEN
constructor(private baseService: BaseService<User>) {}
```

---

## 2. Angular 21: Nuevas Características

### 🚀 Cambios Importantes en Angular 21

#### **1. Standalone Components (Default)**
**Antes (v17-):**
```typescript
@Component({
  selector: 'app-users',
  standalone: true, // Tenías que agregarlo
  imports: [CommonModule, FormsModule]
})
```

**Ahora (v21+):**
```typescript
@Component({
  selector: 'app-users',
  // standalone: true es el default, no hace falta
  imports: [CommonModule, FormsModule]
})
```

#### **2. Functional APIs**
**Antes (Decorators):**
```typescript
export class UsersComponent {
  @Input() users: User[] = [];
  @Output() select = new EventEmitter<User>();
}
```

**Ahora (Functions):**
```typescript
export class UsersComponent {
  readonly users = input<User[]>([]);
  readonly select = output<User>();
}
```

#### **3. Signals (Built-in)**
Angular 21 incluye signals de forma nativa:
```typescript
import { signal, computed, effect } from '@angular/core';

export class UsersComponent {
  // Writable signal
  readonly count = signal(0);

  // Computed signal
  readonly doubleCount = computed(() => this.count() * 2);

  // Effect
  constructor() {
    effect(() => {
      console.log('Count changed:', this.count());
    });
  }
}
```

#### **4. New Control Flow Syntax**
**Antes:**
```html
<div *ngIf="user">{{ user.name }}</div>
<div *ngFor="let user of users">{{ user.name }}</div>
```

**Ahora:**
```html
@if (user) {
  {{ user.name }}
}
@for (user of users; track user.id) {
  {{ user.name }}
}
```

#### **5. HttpHandlerFn Breaking Change**
**Antes:**
```typescript
export const authInterceptor: HttpInterceptor = (req, next) => {
  return next.handle(req); // ❌ Ya no existe .handle()
}
```

**Ahora:**
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req); // ✅ next es una función directamente
}
```

---

## 3. Signals: Reactive State Management

### 🎯 ¿Qué son los Signals?

Los **Signals** son el nuevo sistema de reactividad de Angular. Son **wrappers** alrededor de valores que notifican a los consumidores cuando el valor cambia.

### 📊 Tipos de Signals

#### **1. Writable Signals**
Pueden ser escritos y leídos:

```typescript
import { signal } from '@angular/core';

export class UsersComponent {
  // Crear signal
  readonly users = signal<User[]>([]);

  addUser(user: User) {
    // Leer signal
    const current = this.users();

    // Escribir signal
    this.users.set([...current, user]);

    // O usar update
    this.users.update(current => [...current, user]);
  }
}
```

#### **2. Computed Signals**
Derivan su valor de otros signals:

```typescript
import { signal, computed } from '@angular/core';

export class UsersComponent {
  readonly users = signal<User[]>([]);
  readonly filter = signal<string>('');

  // Se recalcula automáticamente cuando users o filter cambian
  readonly filteredUsers = computed(() => {
    const users = this.users();
    const filter = this.filter();

    return users.filter(u =>
      u.name.toLowerCase().includes(filter.toLowerCase())
    );
  });
}
```

#### **3. Effects**
Ejecutan código cuando un signal cambia:

```typescript
import { signal, effect } from '@angular/core';

export class UsersComponent {
  readonly users = signal<User[]>([]);

  constructor() {
    effect(() => {
      const users = this.users();
      console.log('Users count:', users.length);

      // Guardar en localStorage
      localStorage.setItem('users', JSON.stringify(users));
    });
  }
}
```

### ✅ Ventajas de Signals

1. **Performance**: Solo re-renderiza lo que cambió
2. **Type Safety**: Totalmente tipado
3. **Simplicity**: Más simple que RxJS para state local
4. **Debugging**: Fácil de debuggear

### ❌ Cuándo NO usar Signals

- Para **HTTP requests** → Usa `Observable` + `HttpClient`
- Para **event streams** → Usa `Observable` + RxJS
- Para **async operations** → Usa `Observable` o `async/await`

---

## 4. Functional Services

### 🔄 Servicios Funcionales vs Clases

Angular 21+ introduce **servicios funcionales** como alternativa a las clases tradicionales.

#### **Servicio Tradicional (Clase)**
```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
}

// Uso
constructor(private userService: UserService) {}
this.userService.getUsers().subscribe(users => ...);
```

#### **Servicio Funcional**
```typescript
export const UserService = () => {
  const http = inject(HttpClient);

  const getUsers = (): Observable<User[]> => {
    return http.get<User[]>('/api/users');
  };

  return {
    getUsers,
    // otros métodos...
  };
};

// Uso
const userService = UserService();
userService.getUsers().subscribe(users => ...);
```

### ✅ Ventajas de Servicios Funcionales

1. **Tree-shakeable**: Solo incluye lo que usás
2. **Testable**: Más fácil de mockear
3. **Minimal**: Less boilerplate
4. **Composition**: Más fácil de componer

### 🎯 AuthService como Funcional

```typescript
export const AuthService = () => {
  const http = inject(HttpClient);
  const router = inject(Router);
  const tokenStorage = TokenStorageService();

  // Internal state (signals)
  const currentUserSignal = signal<User | null>(null);
  const isAuthenticatedSignal = computed(() => currentUserSignal() !== null);

  // Methods
  const login = (credentials: LoginCredentials): Observable<User> => {
    return http.post<LoginResponse>('/auth/login', credentials)
      .pipe(
        tap(response => {
          tokenStorage.setAccessToken(response.accessToken);
          currentUserSignal.set(response.user);
        }),
        switchMap(() => of(currentUserSignal()!))
      );
  };

  const logout = (): void => {
    tokenStorage.clearTokens();
    currentUserSignal.set(null);
    router.navigate(['/auth/login']);
  };

  // Return public API
  return {
    // Signals (read-only)
    isAuthenticated: isAuthenticatedSignal,
    currentUser: currentUserSignal,

    // Methods
    login,
    logout,
  };
};
```

---

## 5. Standalone Components

### 🧩 ¿Qué son?

Los **Standalone Components** son componentes que **no necesitan NgModule** para declarar sus dependencias.

### ✅ Ventajas

1. **Tree-shakeable**: Solo incluye lo que usás
2. **Modular**: Cada componente declara sus dependencias
3. **Simplicity**: No más NgModule boilerplate
4. **Lazy-loading**: Más fácil de implementar

### 📝 Estructura de un Standalone Component

```typescript
@Component({
  selector: 'app-users-list',
  standalone: true, // ← Standalone (default en v21)
  imports: [
    // Declará dependencias acá
    CommonModule,
    FormsModule,
    MatTableModule,
  ],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush, // ← Best practice
})
export class UsersListComponent {
  // Component logic...
}
```

### 🔄 Lazy Loading con Standalone Components

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./features/users/users-list')
      .then(m => m.UsersListComponent), // ← Lazy load component
  },
];
```

---

## 6. HTTP Interceptors

### 🛡️ ¿Qué son?

Los **HTTP Interceptors** son middlewares que interceptan **todas** las peticiones HTTP salientes y entrantes.

### 🎯 Usos Comunes

1. **Agregar headers** (JWT tokens)
2. **Manejo de errores**
3. **Loading indicators**
4. **Retry logic**
5. **Logging**

### 🔐 Auth Interceptor

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = AuthService();
  const token = authService.getAccessToken();

  // Clonar request y agregar header
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req); // ← Pasar al siguiente interceptor
};
```

### ⚡ Loading Interceptor

```typescript
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingStateService);

  // Show loading
  loadingService.setLoading(true);

  return next(req).pipe(
    // Hide loading cuando termina
    finalize(() => loadingService.setLoading(false))
  );
};
```

### 🔄 Retry Interceptor

```typescript
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry({
      count: 3,
      delay: (error, retryCount) => {
        // Exponential backoff
        return timer(Math.pow(2, retryCount) * 1000);
      },
    })
  );
};
```

### 📋 Registrar Interceptors

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideHttpClient(withInterceptorsFromDi()), // ← Habilitar interceptores

    // Registrar interceptores
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
  ],
};
```

---

## 7. Route Guards

### 🔒 ¿Qué son?

Los **Route Guards** protegen rutas basándose en condiciones (auth, roles, permissions).

### 📊 Tipos de Guards

#### **1. canActivate**
Protege el acceso a una ruta:

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = AuthService();
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  return true;
};
```

#### **2. canActivateChild**
Protege rutas hijas:

```typescript
export const adminGuard: CanActivateFn = () => {
  const authService = AuthService();
  const router = inject(Router);

  if (!authService.hasAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN])) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
```

### 🎯 Uso en Routes

```typescript
export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout'),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login'),
        canActivate: [guestGuard], // ← Solo usuarios no autenticados
      },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout'),
    canActivate: [authGuard], // ← Solo usuarios autenticados
    children: [
      {
        path: 'users',
        loadComponent: () => import('./features/users'),
        canActivate: [adminGuard], // ← Solo admins
      },
    ],
  },
];
```

---

## 8. Reactive Forms

### 📝 Formularios Reactivos vs Template-Driven

#### **Template-Driven**
```html
<input [(ngModel)]="user.name" #name="ngModel" required />
```
- Simple para forms básicos
- Lógica en el template
- No escalan bien

#### **Reactive Forms** ✅
```typescript
this.form = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(3)]],
  email: ['', [Validators.required, Validators.email]],
});
```
- Lógica en el component
- Type-safe
- Escalan bien
- Más testables

### 🎯 Estructura de un Reactive Form

```typescript
export class LoginFormComponent {
  // FormBuilder inyección
  private readonly fb = inject(FormBuilder);

  // FormGroup
  readonly form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [false],
  });

  // Computed property
  readonly isFormValid = computed(() => this.form.valid && !this.isLoading());

  // Submit
  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    const { email, password, rememberMe } = this.form.value;
    // Submit logic...
  }

  // Error messages
  getEmailError(): string {
    const control = this.form.get('email');

    if (!control?.touched && !this.submitted()) {
      return ''; // No mostrar error aún
    }

    if (control?.errors?.['required']) {
      return 'El email es requerido';
    }
    if (control?.errors?.['email']) {
      return 'Ingresa un email válido';
    }
    return '';
  }
}
```

### ✅ Validaciones Comunes

```typescript
this.form = this.fb.group({
  email: ['', [
    Validators.required,
    Validators.email,
    Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)
  ]],
  password: ['', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(20),
  ]],
  age: ['', [
    Validators.min(18),
    Validators.max(100),
  ]],
});
```

---

## 9. Material Design Integration

### 🎨 Angular Material Setup

#### **1. Installation**
```bash
npm install @angular/material@19 @angular/cdk@19 @angular/animations@19
```

#### **2. Configure Theme**
```typescript
// styles/material-theme.css
@import '@angular/material/prebuilt-themes/indigo-pink.css';
```

#### **3. Import in App**
```typescript
// angular.json
"styles": [
  "src/styles/material-theme.css",
  "src/styles.css"
]
```

### 🧩 Material Components Usados

#### **Buttons**
```html
<button mat-button>Default</button>
<button mat-raised-button color="primary">Primary</button>
<button mat-stroked-button>Stroked</button>
<button mat-flat-button color="accent">Accent</button>
<button mat-icon-button>
  <mat-icon>menu</mat-icon>
</button>
```

#### **Inputs**
```html
<mat-form-field appearance="outline">
  <mat-label>Email</mat-label>
  <input matInput [formControl]="emailControl" />
  <mat-error *ngIf="emailControl.hasError('required')">
    Email is required
  </mat-error>
</mat-form-field>
```

#### **Table**
```html
<table mat-table [dataSource]="dataSource">
  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef>Name</th>
    <td mat-cell *matCellDef="let user">{{ user.name }}</td>
  </ng-container>

  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
</table>
```

#### **Dialog**
```typescript
// Open dialog
const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  data: {
    title: 'Delete User',
    message: 'Are you sure?',
  },
});

// Handle response
dialogRef.afterClosed().subscribe(confirmed => {
  if (confirmed) {
    // Delete user...
  }
});
```

---

## 10. Tailwind CSS

### 🎨 ¿Qué es Tailwind?

**Tailwind CSS** es un framework de **utility-first CSS** que te permite construir diseños custom sin escribir CSS.

### ✅ Ventajas

1. **Rapid Development**: No cambias entre HTML y CSS
2. **Consistency**: Design system pre-definido
3. **Small Bundle**: Solo incluye el CSS que usás
4. **Responsive**: Fácil responsive design

### 📝 Clases Comunes

#### **Spacing**
```html
<!-- Padding -->
<div class="p-4">padding: 1rem</div>
<div class="px-2 py-4">padding x: 0.5rem, y: 1rem</div>

<!-- Margin -->
<div class="m-4">margin: 1rem</div>
<div class="mx-auto">margin x: auto (center)</div>
```

#### **Flexbox**
```html
<div class="flex justify-between items-center">
  <div>Left</div>
  <div>Right</div>
</div>
```

#### **Grid**
```html
<div class="grid grid-cols-3 gap-4">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>
```

#### **Responsive**
```html
<!-- Mobile: column, Desktop: row -->
<div class="flex flex-col md:flex-row">
  <div>Content</div>
</div>
```

### 🎨 Custom Colors

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',
        secondary: '#2C3E50',
        accent: '#F39C12',
      },
    },
  },
};
```

```html
<!-- Uso -->
<button class="bg-primary text-white hover:bg-primary/80">
  Click me
</button>
```

---

## 11. TypeScript Best Practices

### 🔒 Strict Mode

Siempre usá **TypeScript strict mode**:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
  }
}
```

### 📝 Type Definitions

#### **Interfaces vs Types**

```typescript
// ✅ Interface para objetos
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Type para unions o primitives
type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
type ID = string | number;
```

#### **Enums vs Const Objects**

```typescript
// ❌ Enum (problemático en strict mode)
enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

// ✅ Const object + type
type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
const UserRole = {
  USER: 'USER' as UserRole,
  ADMIN: 'ADMIN' as UserRole,
  SUPER_ADMIN: 'SUPER_ADMIN' as UserRole,
} as const;
```

### 🎯 Casting

```typescript
// ❌ Evitar 'as any'
const user = data as any;

// ✅ Type guards
const isUser = (data: unknown): data is User => {
  return typeof data === 'object' && 'id' in data && 'name' in data;
};

// ✅ Type casting con validación
const user = data as User;
if (!user.id || !user.name) {
  throw new Error('Invalid user data');
}
```

---

## 12. Patrones de Diseño

### 🏛️ Arquitectura Hexagonal

Separar dominio de infraestructura:

```
Domain Layer (Core)
├── Entities
├── Use Cases
└── Ports (Interfaces)

Infrastructure Layer
├── Controllers
├── Repositories
└── Services
```

### 🔄 Repository Pattern

Abstraer acceso a datos:

```typescript
// Abstract Repository
interface UserRepository {
  getAll(): Observable<User[]>;
  getById(id: string): Observable<User>;
  create(user: User): Observable<User>;
  update(id: string, user: User): Observable<User>;
  delete(id: string): Observable<void>;
}

// Concrete Repository
@Injectable({ providedIn: 'root' })
export class HttpUserRepository implements UserRepository {
  private http = inject(HttpClient);

  getAll(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }

  // ... otros métodos
}
```

### 🧩 Component Pattern

**Small, Focused Components**:

```typescript
// ❌ MAL: Giant component
@Component({ ... })
export class UsersComponent {
  // 500 líneas de código...
}

// ✅ BIEN: Small components
@Component({ ... })
export class UsersListComponent {
  // Orquesta los child components
}

@Component({ ... })
export class UserFiltersComponent {
  // Solo maneja filtros
}

@Component({ ... })
export class UsersTableComponent {
  // Solo renderiza la tabla
}
```

### 🎯 Presenter Pattern

Separar lógica de presentación:

```typescript
@Component({ ... })
export class UsersComponent {
  readonly users = signal<User[]>([]);
  readonly filteredUsers = computed(() => {
    return this.presenter.filterUsers(this.users(), this.filter());
  });

  constructor(private readonly presenter: UsersPresenter) {}
}

@Injectable({ providedIn: 'root' })
export class UsersPresenter {
  filterUsers(users: User[], filter: string): User[] {
    return users.filter(u =>
      u.name.toLowerCase().includes(filter.toLowerCase())
    );
  }
}
```

---

## 13. Problemas Comunes y Soluciones

### ❌ Problema 1: "No provider found for AuthService"

**Causa**: AuthService es un servicio funcional, no una clase.

```typescript
// ❌ MAL
constructor(private authService: AuthService) {}

// ✅ BIEN
readonly authService = AuthService();
```

### ❌ Problema 2: "Object is possibly 'undefined'"

**Causa**: TypeScript strict mode requiere validación.

```typescript
// ❌ MAL
const name = user.name; // Error: user might be undefined

// ✅ BIEN: Optional chaining
const name = user?.name;

// ✅ BIEN: Non-null assertion (cuando estás seguro)
const name = user!.name;

// ✅ BIEN: Type guard
if (user) {
  const name = user.name; // TypeScript sabe que user existe
}
```

### ❌ Problema 3: "Expected 1 arguments, but got 3"

**Causa**: Login espera un objeto, no argumentos separados.

```typescript
// ❌ MAL
this.authService.login(email, password, rememberMe);

// ✅ BIEN
this.authService.login({ email, password, rememberMe });
```

### ❌ Problema 4: Enum casting errors

**Causa**: TypeScript strict mode requiere casting explícito.

```typescript
// ❌ MAL
const role: UserRole = 'USER';

// ✅ BIEN
const role: UserRole = 'USER' as UserRole;
```

### ❌ Problema 5: Assets not loading

**Causa**: Angular 21 cambia cómo se copian los assets.

**Solución**:
```json
// angular.json
"assets": [
  { "glob": "**/*", "input": "public" },
  { "glob": "**/*", "input": "src/assets" } // ← Agregar esto
]
```

```html
<!-- Usar ruta sin /assets -->
<img ngSrc="/images/logo.png" /> <!-- ✅ BIEN -->
<img ngSrc="/assets/images/logo.png" /> <!-- ❌ MAL -->
```

---

## 📖 Recursos Adicionales

### 📚 Documentación Oficial

- [Angular Docs](https://angular.dev)
- [Angular Material](https://material.angular.io)
- [RxJS](https://rxjs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org/docs)

### 🎥 Tutoriales Recomendados

- [Angular Signals](https://angular.dev/guide/signals)
- [Standalone Components](https://angular.dev/guide/standalone-components)
- [Reactive Forms](https://angular.dev/guide/forms/reactive-forms)
- [HTTP Client](https://angular.dev/guide/http)

### 🛠️ Herramientas

- **Augury**: Debug Angular apps
- **Angular DevTools**: Chrome extension
- **RxJS DevTools**: Debug observables

---

## 💡 Tips y Trucos

### 🚀 Performance

1. **OnPush Change Detection**: Siempre usalo
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

2. **TrackBy en @for**: Siempre usa trackBy
```html
@for (user of users; track user.id) {
  {{ user.name }}
}
```

3. **Lazy Loading**: Carga módulos bajo demanda
```typescript
loadComponent: () => import('./features/users')
```

### 🧪 Testing

```typescript
describe('UsersListComponent', () => {
  it('should display users', () => {
    const mockUsers = [{ id: '1', name: 'John' }];
    // Test implementation...
  });
});
```

### 🐛 Debugging

```typescript
// Debug signals
effect(() => {
  console.log('Users changed:', this.users());
});

// Debug forms
console.log('Form value:', this.form.value);
console.log('Form errors:', this.form.errors);
```

---

## 🎓 Conclusión

Este proyecto implementa **mejores prácticas modernas** de Angular 21:

- ✅ **Signals** para reactividad
- ✅ **Standalone Components** para modularidad
- ✅ **Functional Services** para tree-shaking
- ✅ **Reactive Forms** para forms complejos
- ✅ **TypeScript Strict** para type safety
- ✅ **Material Design** para UI consistente
- ✅ **Tailwind CSS** para estilos rápidos
- ✅ **Clean Architecture** para maintainability

Estos patrones y técnicas son **transferibles** a cualquier proyecto Angular moderno.

---

**¿Dudas? Revisá la documentación oficial o preguntame!** 🚀
