# Personal Hub

An integrated workspace application designed to enhance personal productivity

## 🚀 Project Overview

### Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5+
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **State Management**: TanStack Query + React Hook Form
- **Authentication**: OpenID Connect (OIDC) with JWT
- **Testing**: Jest, React Testing Library, Playwright
- **Tools**: ESLint, Prettier, Turbopack

### Key Features
- ✅ **TODO Management**: CRUD operations, status management, priority settings, subtasks
- ✅ **Calendar**: Event management, monthly view, color categorization, all-day/timed events
- ✅ **Notes**: Rich text editor, category/tag classification, pinning, search
- ✅ **Dashboard**: Real-time integrated view, progress tracking, analytics
- ✅ **User Management**: Profile, OIDC authentication, settings
- ✅ **UI/UX**: Responsive design, dark mode, accessibility support

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Backend API (localhost:8080)

### Setup Instructions
```bash
# 1. Clone the repository
git clone https://github.com/sasazame/personal-hub.git
cd personal-hub

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
open http://localhost:3000
```

### Development Workflow

```bash
# 1. Development (Fast reload with Turbopack)
npm run dev
# Use for: Quick iterations, component development, styling changes

# 2. Production Preview (Optimized build)
npm run preview
# Use for: Integration testing, performance testing, final checks

# 3. Production Build + Start (Separate commands)
npm run build
npm run start
# Use for: Deployment preparation, production debugging
```

#### Workflow Recommendations
- **開発中**: `npm run dev` で細かな変更を確認
- **機能完成時**: `npm run preview` で結合テスト
- **PR作成前**: `npm run build` でビルドエラーがないことを確認

## 🛠️ Environment Setup

### Environment Variables
Create `.env.local` file:
```bash
# API Endpoint
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# Application Settings
NEXT_PUBLIC_APP_NAME=Personal Hub
```

### Backend Integration
The backend API must be running on localhost:8080.
See [todo-app-backend](https://github.com/sasazame/todo-app-backend) for details.

## 👨‍💻 Development Guide

### Development Server
```bash
# Fast development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start
```

### Code Quality
```bash
# ESLint check
npm run lint

# Type check
npm run type-check

# Run tests
npm test

# E2E tests
npm run test:e2e
```

### Branch Strategy
```bash
# New feature development
git checkout -b feat/feature-name

# Bug fixes
git checkout -b fix/bug-description

# Run tests locally (required before PR)
npm run type-check && npm run lint && npm test && npm run build

# Create pull request
git push origin feat/feature-name
gh pr create --assignee sasazame
```

## 🧩 Architecture

### Directory Structure
```
src/
├── app/                    # App Router (pages)
│   ├── dashboard/         # Dashboard
│   ├── todos/             # TODO management
│   ├── calendar/          # Calendar
│   ├── notes/             # Notes feature
│   └── profile/           # User settings
├── components/
│   ├── ui/                # Basic UI components
│   ├── todos/             # TODO-related components
│   ├── calendar/          # Calendar-related
│   ├── notes/             # Notes-related
│   ├── dashboard/         # Dashboard-related
│   ├── auth/              # Authentication-related
│   └── layout/            # Layout
├── hooks/                 # Custom hooks
├── lib/                   # External library configurations
├── services/              # API communication logic
├── types/                 # Type definitions
└── utils/                 # Helper functions
```

### Module Design
- **todos/**: TODO functionality (fully implemented)
- **calendar/**: Calendar and event management (fully implemented)
- **notes/**: Notes functionality (fully implemented)
- **dashboard/**: Real-time integrated dashboard (fully implemented)
- **analytics/**: Analytics and reporting (planned)
- **shared/**: Common components and utilities

## 🔐 Authentication

### OIDC Authentication
The application uses OpenID Connect (OIDC) for authentication:
- JWT tokens stored in localStorage
- Automatic token refresh before expiration
- Support for multiple OAuth providers (Google, GitHub)
- Secure user session management

## 🧪 Testing

### Test Execution
```bash
# Unit tests
npm test

# Tests in watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Testing Strategy
- **Unit Tests**: Components, hooks, utilities
- **Integration Tests**: Feature interactions, API communication
- **E2E Tests**: User flows, critical paths

## 📡 API Integration

### TanStack Query-based State Management
```typescript
// hooks/useTodos.ts
export function useTodos(status?: TodoStatus) {
  return useQuery({
    queryKey: ['todos', status],
    queryFn: () => todoApi.getList({ status }),
    staleTime: 1000 * 60 * 5,
  });
}

// hooks/useCalendar.ts
export function useAllCalendarEvents() {
  return useQuery({
    queryKey: ['calendar', 'events', 'all'],
    queryFn: () => calendarService.getAllEvents(),
    staleTime: 1000 * 60 * 5,
  });
}

// hooks/useNotes.ts
export function useNotes(filters?: NoteFilters) {
  return useQuery({
    queryKey: ['notes', filters],
    queryFn: () => notesService.getNotes(filters),
    staleTime: 1000 * 60 * 5,
  });
}
```

## 🎨 Design System

### Theme Configuration
- **Color Palette**: Primary (Blue), Secondary (Gray), Accent colors
- **Typography**: Inter font, unified hierarchy
- **Spacing**: 8px grid system
- **Responsive**: Mobile-first approach

### Component Design
- **UI Components**: Reusable basic elements
- **Feature Components**: Function-specific components
- **Layout Components**: Page structure and navigation

## 🚧 Development Roadmap

### Phase 1: Foundation Setup ✅
- [x] Project structure and architecture design
- [x] Full TODO functionality implementation
- [x] Authentication system with OIDC
- [x] Basic UI component library
- [x] TypeScript type safety and testing foundation

### Phase 2: New Feature Development ✅
- [x] Calendar functionality (monthly view, event management)
- [x] Notes feature (rich text editor, categories/tags)
- [x] Dashboard (real-time integrated display)
- [x] Cross-feature data integration
- [x] Comprehensive test coverage

### Phase 3: Optimization & Enhancement 🚧
- [ ] Analytics and reporting features
- [ ] Advanced search and filtering
- [ ] Performance optimization
- [ ] PWA support

### Phase 4: Enterprise Features
- [ ] Data export/import
- [ ] External calendar integration (Google Calendar)
- [ ] Notification and reminder system
- [ ] Team features and sharing

## 📝 Development Guidelines

### Coding Standards
- TypeScript strict mode
- React functional components
- Server Components first approach
- Styling with Tailwind CSS

### Commit Convention
```
<type>(<scope>): <subject>

🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

## 📚 Documentation

For detailed development information, refer to `CLAUDE.md` and the `docs/` folder.

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch
3. Commit your changes
4. Run tests (required)
5. Create a pull request

---

**Developer**: sasazame  
**Last Updated**: June 2025