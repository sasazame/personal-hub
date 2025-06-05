# E2E Test Guide

## Running E2E Tests

### Option 1: With Real Backend (Default)
Ensure the backend is running on `http://localhost:8080` before running tests:

```bash
# In the backend directory
cd ../todo-app-backend
./mvnw spring-boot:run

# In the frontend directory
npm run test:e2e
```

### Option 2: With Mock Backend (CI Mode)
This mode starts a mock backend server automatically:

```bash
npm run test:e2e:ci
```

### Option 3: With MSW (Browser Mocks)
This mode uses Mock Service Worker for API mocking:

```bash
npm run test:e2e:mock
```

## Test Structure

- `auth-e2e.spec.ts` - Authentication flow tests
- `todo-basic.spec.ts` - Basic CRUD operations for todos
- `todo-with-auth.spec.ts` - Todo operations with authentication
- `auth-todo-integration.spec.ts` - Integration tests for auth and todos
- `smoke.spec.ts` - Quick smoke tests

## Debugging

### Run tests with UI mode:
```bash
npm run test:e2e:ui
```

### Run tests in headed mode:
```bash
npm run test:e2e:headed
```

## Known Issues

1. **Status Values**: The backend uses `DONE` for completed status, not `COMPLETED`
2. **Authentication**: Tests expect user to exist. The mock server includes a default test user.
3. **API Response Format**: The backend returns todos in `{ content: Todo[] }` format

## Test User Credentials

```javascript
{
  email: 'test@example.com',
  password: 'Test123',
  username: 'testuser'
}
```