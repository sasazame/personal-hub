# Claude Code Development Guidelines

## Project Overview
Personal Hub - Personal Productivity Enhancement Application
- **Tech Stack**: Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS
- **State Management**: TanStack Query + React Hook Form
- **Authentication**: OpenID Connect (OIDC) with JWT tokens
- **Testing**: Jest, React Testing Library, Playwright
- **Core Features**: TODO Management (✅ Complete), Calendar (✅ Complete), Notes (✅ Complete), Integrated Dashboard (✅ Complete)
- **Planned**: Analytics, PWA Support, External Integrations
- **Purpose**: Centralized daily task management and productivity enhancement

## Development Flow (Important)
```bash
# 1. Create feat branch for new features
git checkout -b feat/feature-name

# 2. Implement, test, commit (CI-equivalent checks required)
npm run type-check && npm run lint && npm test && npm run build
git add . && git commit -m "feat: feature description"

# 3. Run E2E tests locally (required due to CI disabled)
npm run test:e2e  # At minimum npm run test:e2e:smoke is required

# 4. Push to GitHub and create PR (CI runs automatically)
git push origin feat/feature-name
gh pr create --title "Feature Title" --body "Detailed description" --assignee sasazame
```

## CI/CD Pipeline ✅
- **Auto-run**: On PR creation and push
- **Required Checks**: type-check, lint, test, build
- **Testing**: Jest + React Testing Library + Playwright
- **E2E Tests**: ⚠️ Temporarily disabled in CI ([Issue #24](https://github.com/sasazame/personal-hub/issues/24))
- **Deployment**: main branch → Vercel auto-deploy

## Coding Standards

### TypeScript
- `strict: true`, no `any` (use `unknown` + type guards)
- Use const assertions (instead of Enums)
- No React.FC, one export per file
- Clear prop naming (`onTodoClick`, etc.)

### React/Next.js
- Server Components first, minimal `'use client'`
- Custom hooks: `use` prefix
- Filenames: PascalCase (`TodoItem.tsx`)

### Tailwind CSS
- Mobile-first, `dark:` support
- Use design tokens
- Organize with `cn()` utility

## Design System

### Premium Authentication Screen Design
**Implementation Overview**:
- **Background**: Animated gradient (blue/indigo→slate) + blob animations
- **Glassmorphism**: `bg-white/10 backdrop-blur-xl border-white/20`
- **Floating Labels**: `FloatingInput` component
- **Brand Identity**: Sparkles icon + blue gradient logo
- **Password Strength**: Real-time display + 5-level rating system

**Components**:
- `FloatingInput`: Glass effect + floating label input
- `PasswordStrength`: Strength indicator (Very Weak→Strong)
- Premium button: Blue gradient + hover effects + scale transform

**Animations**:
- `animate-blob`: 7s infinite loop, blue blob movement
- `bg-grid-pattern`: Grid pattern background
- Smooth transitions: 0.3s duration
- Floating removed: Improved usability

**Accessibility**:
- Proper aria-label settings
- Focus ring support
- Screen reader support (sr-only)
- Full keyboard navigation

## Authentication Architecture

### OIDC Implementation
- **Token Storage**: JWT tokens in localStorage
- **Automatic Refresh**: Tokens refreshed 1 minute before expiration
- **User Info**: Cached in localStorage to avoid 403 errors on user endpoints
- **OAuth Providers**: Support for Google, GitHub
- **Session Management**: Secure with automatic cleanup on logout

## Project Structure
```
src/
├── app/                    # App Router pages
│   ├── dashboard/         # Dashboard (✅ Complete)
│   ├── todos/             # TODO management (✅ Complete)
│   ├── calendar/          # Calendar (✅ Complete)
│   ├── notes/             # Notes feature (✅ Complete)
│   └── analytics/         # Analytics (Planned)
├── components/
│   ├── ui/                # Basic UI components
│   ├── todos/             # TODO-related components (✅ Complete)
│   ├── calendar/          # Calendar-related (✅ Complete)
│   ├── notes/             # Notes-related (✅ Complete)
│   ├── auth/              # Authentication-related
│   └── layout/            # Layout
├── hooks/                 # Custom hooks (✅ Comprehensive)
├── lib/                   # External library configs
├── services/              # API communication & mock services (✅ Complete)
├── types/                 # Type definitions (✅ Complete)
└── utils/                 # Utilities
```

## Commit Convention
```
<type>(<scope>): <subject>

🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>
```
**Types**: feat, fix, docs, style, refactor, perf, test, chore

## Testing Strategy
- **Unit**: Jest + RTL (utilities, hooks)
- **Integration**: RTL (user interactions)
- **E2E**: Playwright (critical paths)
- **Config**: Jest exclusions (Playwright: `*.spec.ts`)
- **Quality**: AAA pattern, user perspective, type safety focus

### Clean Test Output (Important)
**Keep console output minimal**:
- **Production code**: Always remove debug `console.log`
- **Test code**: Suppress expected warnings in `jest.setup.js`
- **Mock returns**: Return `{}` or appropriate values, not `undefined`
- **Reason**: Improves CI/CD log readability, easier to find real issues

```javascript
// ❌ Bad example
console.log('Debug:', data); // Don't leave in production code
mockResolvedValue(undefined); // Causes TanStack Query warnings

// ✅ Good example  
mockResolvedValue({}); // Return empty object
// Suppress expected warnings in jest.setup.js
```

## API Integration
- Backend URL: `http://localhost:8080/api/v1` (personal-hub-backend)
- Uses TanStack Query
- Error handling: Error Boundary + toast notifications

## Important Implementation Patterns
1. **Server Components**: Default for data fetching
2. **Client Components**: Only when interaction needed
3. **State Management**: TanStack Query (server state) + useState (local state)
4. **Forms**: React Hook Form + Zod
5. **Errors**: Error Boundary + appropriate fallbacks

## Claude Code Request Template
```markdown
## Feature to Implement
[Specific UI/UX requirements]

## Current Situation
[Related components, existing implementation]

## Expected Result
[Screen behavior, user experience]

## Design Requirements
[Responsive, accessibility requirements]
```

## Development Checklist
- [ ] Work on feat branch
- [ ] TypeScript type safety (no `any`)
- [ ] Proper Server/Client Components separation
- [ ] Responsive design
- [ ] Accessibility (a11y)
- [ ] Error handling
- [ ] Create tests (match actual behavior)
- [ ] **CI-equivalent check**: `type-check && lint && test && build`
- [ ] Confirm all tests pass
- [ ] **Run local E2E tests** (required): `npm run test:e2e`
- [ ] Create PR (assignee: sasazame), check [PR Requirements](./docs/PR_REQUIREMENTS.md)

## Development Commands
```bash
npm run dev          # Development server (Turbopack)
npm run build        # Production build
npm run type-check   # TypeScript type check
npm run lint         # ESLint
npm test             # Jest unit tests
npm run test:e2e     # Playwright E2E tests

# CI-equivalent check (required)
npm run type-check && npm run lint && npm test && npm run build
```

## Environment & Configuration
- Node.js 18+, npm 9+
- Backend integration: localhost:8080
- Main packages: see package.json

## CI/CD Troubleshooting
### Common Issues & Solutions
1. **Jest + Playwright Conflict**
   - `jest.config.js`: `testPathIgnorePatterns: ['*.spec.ts']`
   - E2E tests run separately: `npm run test:e2e`

2. **TypeScript Type Errors**
   - No `any` → use `unknown` + type guards
   - CVA: Handle undefined `defaultVariants`

3. **Test Failure Patterns**
   - UI tests: Match actual CSS output
   - Modal tests: DOM structure identification
   - Async tests: `waitFor` + proper selectors

4. **E2E Test Issues** ⚠️
   - Temporarily disabled in CI ([Issue #24](https://github.com/sasazame/personal-hub/issues/24))
   - Local E2E test execution is mandatory
   - Verify backend is running: `http://localhost:8080`

### Fix Procedure
```bash
# 1. Run CI-equivalent tests locally
npm run type-check && npm run lint && npm test && npm run build

# 2. Run E2E tests (required)
npm run test:e2e  # or npm run test:e2e:smoke

# 3. Debug errors if any
npm test -- --verbose  # Detailed test results
npm run lint -- --debug  # ESLint details

# 4. After fixes, run tests again
# 5. Push only after all tests pass
```

This file provides concise guidelines for efficient Claude Code collaboration.
For detailed design information, refer to `README.md` and the `docs/` folder.