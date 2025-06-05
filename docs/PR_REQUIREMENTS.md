# Pull Request Requirements

## CI/CD Requirements

### Required Checks

All PR must pass the following CI checks:

1. **Type Check** - TypeScript compilation without errors
2. **Lint** - ESLint without errors or warnings  
3. **Unit Tests** - All Jest tests passing (233 tests)
4. **Build** - Next.js production build successful

### E2E Test Requirements

⚠️ **IMPORTANT**: E2E tests are temporarily disabled in CI due to environment issues.

**Before merging any PR, you MUST:**

1. Run E2E tests locally and ensure they pass
2. Include E2E test results in your PR description

#### How to run E2E tests locally:

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test suites
npm run test:e2e:auth    # Authentication tests
npm run test:e2e:app     # Application tests
npm run test:e2e:smoke   # Smoke tests (minimum)

# Run with UI (for debugging)
npm run test:e2e:ui
```

#### Required E2E test coverage:

- [ ] Smoke tests MUST pass
- [ ] Authentication flow tests SHOULD pass
- [ ] Core functionality tests SHOULD pass

### PR Checklist Template

Please copy and use this checklist in your PR description:

```markdown
## PR Checklist

### CI Checks (Automated)
- [ ] TypeScript type check passing
- [ ] ESLint no errors/warnings
- [ ] Unit tests passing (233 tests)
- [ ] Build successful

### Local E2E Tests (Manual)
- [ ] Smoke tests passing
- [ ] Auth tests passing (if auth changes)
- [ ] App tests passing (if app changes)

### E2E Test Results
```
# Paste your local E2E test output here
```

### Additional Checks
- [ ] Code follows project conventions
- [ ] No console.log or debugging code
- [ ] API changes coordinated with backend
```

## Known Issues

- **CI E2E Tests**: Currently disabled. See [Issue #TODO](https://github.com/sasazame/todo-app-frontend/issues/TODO)
- **Backend Dependency**: E2E tests require backend running on `http://localhost:8080`

## Future Improvements

Once CI E2E tests are re-enabled, this manual process will be automated.