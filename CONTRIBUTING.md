# Contributing to Personal Hub

Thank you for your interest in contributing to Personal Hub! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## 🤝 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

1. **Fork the repository**
   ```bash
   # Fork via GitHub UI, then:
   git clone https://github.com/YOUR_USERNAME/personal-hub.git
   cd personal-hub
   ```

2. **Set up your development environment**
   ```bash
   npm install
   cp .env.example .env.local
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   # or for bug fixes:
   git checkout -b fix/bug-description
   ```

## 💻 Development Process

### Branch Naming Convention

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `style/` - Code style changes (formatting, missing semicolons, etc.)
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes
- `chore/` - Maintenance tasks

### Commit Message Format

Follow the conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Example:
```
feat(calendar): add drag-and-drop functionality

Implement drag-and-drop for calendar events with visual feedback
and automatic time adjustment based on drop position.

Closes #123
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test changes
- `chore`: Maintenance tasks

## 🔄 Pull Request Process

1. **Before submitting a PR:**
   ```bash
   # Run all checks
   npm run type-check
   npm run lint
   npm test
   npm run build
   npm run test:e2e
   ```

2. **PR Guidelines:**
   - Fill out the PR template completely
   - Link related issues
   - Include screenshots for UI changes
   - Ensure all tests pass
   - Update documentation if needed
   - Request reviews from maintainers

3. **PR Title Format:**
   ```
   <type>(<scope>): <description>
   ```
   Example: `feat(calendar): add recurring event support`

## 📝 Coding Standards

### TypeScript

- Use TypeScript strict mode
- No `any` types - use `unknown` with type guards
- Prefer interfaces over types for object shapes
- Use const assertions where appropriate

```typescript
// ✅ Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// ❌ Avoid
type UserProfile = {
  id: any;
  name: string;
  email: string;
}
```

### React

- Use functional components with hooks
- One component per file
- Props interface should be named `{ComponentName}Props`
- Use Server Components by default, Client Components only when needed

```typescript
// ✅ Good
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ onClick, children }: ButtonProps) {
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
}
```

### Styling

- Use Tailwind CSS classes
- Follow mobile-first approach
- Support dark mode with `dark:` variants
- Use the `cn()` utility for conditional classes

```typescript
// ✅ Good
<div className={cn(
  "p-4 rounded-lg",
  "bg-white dark:bg-gray-800",
  isActive && "ring-2 ring-blue-500"
)}>
```

## 🧪 Testing Guidelines

### Unit Tests

- Test user behavior, not implementation details
- Use React Testing Library
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

```typescript
// ✅ Good
it('should display error message when form is invalid', async () => {
  render(<ContactForm />);
  
  const submitButton = screen.getByRole('button', { name: /submit/i });
  await userEvent.click(submitButton);
  
  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
});
```

### E2E Tests

- Test critical user flows
- Use Page Object Model pattern
- Keep tests independent and idempotent

## 📚 Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for complex functions
- Update API documentation for endpoint changes
- Include examples in documentation

## 🎯 Review Checklist

Before requesting a review, ensure:

- [ ] Code follows the project's coding standards
- [ ] Tests are added/updated and passing
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Sensitive data is not exposed
- [ ] Performance impact is considered
- [ ] Accessibility is maintained
- [ ] Mobile responsiveness is tested

## 🤔 Need Help?

- Check existing issues and PRs
- Join discussions in GitHub Discussions
- Ask questions in PR comments
- Review the [documentation](./docs/)

Thank you for contributing to Personal Hub! 🎉