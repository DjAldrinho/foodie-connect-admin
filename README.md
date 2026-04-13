# 🍽️ Foodie Connect Admin CRM

> Panel de administración para la red social gastronómica Foodie Connect

## 📋 Overview

Foodie Connect Admin es un panel de administración moderno y responsive construido con **Angular 21**, **Material Design**, y **Tailwind CSS**. Permite a los administradores gestionar usuarios, restaurantes, contenido y analytics de la plataforma.

## ✨ Features Implementados

### ✅ Phase 1: Foundation & Core Infrastructure
- **Core Services**: BaseService, ToastNotification, LoadingState, ApiCache
- **Authentication**: AuthService (functional), TokenStorageService
- **HTTP Interceptors**: Auth, Loading, Error, Retry con exponential backoff
- **Route Guards**: auth, admin, superAdmin, guest
- **Type Definitions**: auth, common, users, dashboard types
- **Environment Configuration**: dev/prod configurations
- **ESLint**: Strict TypeScript configuration

### ✅ Phase 2: Layout & Auth Components
- **Layouts**:
  - `AuthLayout`: Centered card con gradient background para login
  - `MainLayout`: Sidebar + TopBar + Content area
  - `Sidebar`: 7 navigation links, collapsible, mobile drawer
  - `TopBar`: Breadcrumbs, notification bell, mobile toggle

- **Shared Components**:
  - `Button`: 4 variants (primary, secondary, danger, ghost), 3 sizes
  - `Input`: Reusable input con validation y error states
  - `Card`: 3 variants (default, bordered, elevated)
  - `EmptyState`: Empty state component con icon y message
  - `LoadingSpinner`: Global loading spinner
  - `ToastContainer`: Global toast notifications

- **Auth Module**:
  - Login page con form validation
  - Forgot password page
  - Responsive design (mobile-first)

### ✅ Phase 3: Dashboard Module
- **Dashboard Components**:
  - `MetricCard`: Stat card con trend indicator
  - `ActivityTimeline`: Activity feed con 8 event types
  - `RatingChart`: Chart.js bar chart para ratings
  - `RecentActivity`: Recent activity table con pagination

- **Features**:
  - 4 key metrics (users, restaurants, reviews, reports)
  - Activity timeline con color-coded events
  - Rating distribution chart
  - Recent activity con pagination
  - Responsive grid layout

### ✅ Phase 4: Users Module (100% Complete)
- **Users List**:
  - Advanced filters (search, role, status, date range)
  - Material table con sorting y pagination
  - Bulk actions (change role, change status, delete)
  - Export to CSV functionality
  - User row con avatar, badges, actions dropdown

- **User Detail**:
  - Header con avatar, name, email, role/status badges
  - Stats card (Posts, Followers, Following)
  - 3 tabs: Posts, Reviews, Activity
  - Action buttons (Edit Role, Activate/Deactivate, Delete)

- **Services**:
  - Complete CRUD con mock data (15 users)
  - User statistics, restaurants, reviews, activity
  - Bulk actions y export functionality

### ✅ Phase 5: Restaurants Module (100% Complete)
- **Restaurants List**:
  - Grid/list view toggle
  - Advanced filters (search, status, cuisine, price range, rating)
  - Material table con sorting y pagination
  - Export to CSV functionality
  - Restaurant cards con cover images, ratings, badges

- **Restaurant Detail**:
  - Header con cover image, stats cards
  - 4 tabs: Overview, Photos, Menu, Reviews
  - Verification actions (approve, reject, request info)
  - Contact info, owner details, verification status

- **Services**:
  - Complete CRUD con mock data (6 restaurants)
  - Verification workflow (approve/reject/request info)
  - Photo management (upload, delete)
  - Menu management (categories, items)
  - Reviews retrieval with filters
  - Bulk operations and export functionality

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | 21.2.0 | Framework frontend |
| **TypeScript** | 5.9.2 | Type safety |
| **Material Design** | 19.0.0 | UI components |
| **Tailwind CSS** | 4.1.12 | Utility-first CSS |
| **Chart.js** | 4.4.0 | Data visualization |
| **@ngx-translate** | 15.0.0 | i18n (Spanish/English) |

## 📁 Project Structure

```
src/app/
├── core/                  # Core infrastructure
│   ├── auth/             # Authentication services & guards
│   ├── interceptors/     # HTTP interceptors
│   └── services/         # Core services (BaseService, etc.)
├── features/             # Feature modules
│   ├── auth/            # Login, forgot password
│   ├── dashboard/       # Dashboard module
│   ├── users/           # Users module (list, detail)
│   └── restaurants/     # Restaurants module (list, detail, verification)
├── layouts/             # Layout components
│   ├── auth-layout/     # Login layout
│   └── main-layout/     # Main layout (sidebar, top-bar)
├── shared/              # Shared components
│   ├── components/      # Reusable UI components
│   ├── directives/      # Custom directives
│   ├── pipes/           # Angular pipes
│   └── utils/           # Utility functions
├── models/              # TypeScript interfaces
├── assets/              # Static assets (images, i18n)
└── styles/              # Global styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm 11+

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Development

```bash
# Start dev server (http://localhost:4200)
npm run dev

# Build with watch mode
npm run build -- --watch

# Run linter
npm run lint
```

## 📦 Modules

### Authentication Module
- JWT-based authentication
- Token refresh automático
- Protected routes con guards
- Login con remember me

### Dashboard Module
- Real-time metrics
- Activity timeline
- Rating distribution chart
- Recent activity table

### Users Module
- User management (CRUD)
- Advanced filtering y sorting
- Bulk operations
- User profile con tabs
- Activity tracking

## 🎨 Design System

### Colors
- **Primary**: `#FF6B35` (Naranja vibrante)
- **Secondary**: `#2C3E50` (Azul oscuro)
- **Accent**: `#F39C12` (Amarillo)
- **Success**: `#27AE60`
- **Warning**: `#F39C12`
- **Error**: `#E74C3C`

### Typography
- **Font Family**: Inter (body), Poppins (headings)
- **Sizes**: 12px (caption) to 112px (display)

### Components
- Material Design components
- Tailwind CSS utilities
- Custom shared components
- Responsive design (mobile-first)

## 🔒 Security

- JWT token management
- Route guards (auth, admin, superAdmin)
- HTTP interceptors para auth headers
- Token refresh automático
- Secure token storage (SSR-safe)

## 📱 Responsive Design

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🌐 i18n

- Spanish (default)
- English
- Easy to add new languages

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run e2e

# Test coverage
npm run test:coverage
```

## 📝 Code Style

- **TypeScript**: Strict mode
- **Linting**: ESLint con Angular rules
- **Format**: Prettier (recommended)
- **Commit**: Conventional commits

## 🔧 Configuration

### Environment Files
- `src/environments/environment.ts` - Development
- `src/environments/environment.prod.ts` - Production

### Key Files
- `angular.json` - Angular configuration
- `tailwind.config.js` - Tailwind configuration
- `.eslintrc.json` - ESLint rules
- `tsconfig.json` - TypeScript configuration

## 📚 Documentation

Para documentación detallada sobre arquitectura, patrones y aprendizaje, mirá:

- [docs/LEARNING.md](docs/LEARNING.md) - Guía de aprendizaje completa
- [docs/SPECIFICATION.md](docs/SPECIFICATION.md) - Especificación funcional
- [docs/DESIGN.md](docs/DESIGN.md) - Diseño técnico
- [docs/TASKS.md](docs/TASKS.md) - Breakdown de tareas

## 🚧 Roadmap

### ✅ Completado
- [x] Phase 1: Foundation & Core Infrastructure
- [x] Phase 2: Layout & Auth Components
- [x] Phase 3: Dashboard Module
- [x] Phase 4: Users Module
- [x] Phase 5: Restaurants Module

### 🔄 En Progreso
- [ ] Phase 6: Moderation Module
- [ ] Phase 7: Notifications Module
- [ ] Phase 8: Analytics Module
- [ ] Phase 9: Settings Module

### 📋 Planeado
- [ ] Phase 10: Polish & Testing
- [ ] Phase 11: Documentation

## 🤝 Contributing

Este es un proyecto privado. Por favor contactá al maintainers antes de hacer contribuciones.

## 📄 License

Proprietary - All rights reserved

## 👥 Team

- **Developer**: Aldray Narvaez
- **Architecture**: Angular 21 + Signals + Material Design
- **Design**: Foodie Connect brand guidelines

---

**Hecho con ❤️ usando Angular 21**
