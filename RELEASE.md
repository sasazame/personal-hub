# Release Management Guide

## Branch Strategy

### Branch Structure
- `main`: Development branch (latest development version)
- `staging`: Staging environment (pre-production validation)
- `production`: Production environment (stable version)
- `feature/*`: Feature development
- `hotfix/*`: Emergency fixes

### Workflows

#### 1. Regular Feature Development
```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/new-feature

# After development, create PR to main
git push origin feature/new-feature
# Create and merge PR on GitHub

# Deploy to staging
git checkout staging
git merge main
git push origin staging
```

#### 2. Production Release
```bash
# After staging tests pass
git checkout production
git merge staging
git push origin production

# Create release tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

#### 3. Hotfix
```bash
# Fix directly from production
git checkout production
git checkout -b hotfix/critical-fix

# After fix
git push origin hotfix/critical-fix
# Create PR and merge to production

# Sync with main and staging
git checkout main
git merge hotfix/critical-fix
git push origin main

git checkout staging
git merge hotfix/critical-fix
git push origin staging
```

## Tag Strategy

### Semantic Versioning
- Use `vMAJOR.MINOR.PATCH` format
- MAJOR: Breaking changes
- MINOR: Backward compatible features
- PATCH: Bug fixes

### Creating Tags
```bash
# Regular release
git tag -a v1.0.0 -m "Initial release: Complete productivity suite"

# Pre-release
git tag -a v1.0.0-beta.1 -m "Beta release for testing"

# Push tag
git push origin v1.0.0
```

## Vercel Configuration

### Environment-specific Settings
1. **Staging Deployment**
   - Branch: `staging`
   - Domain: `staging.personal-hub.zametech.com`
   - Auto-Deploy: Enabled
   - Environment: `staging`

2. **Production Deployment**
   - Branch: `production`
   - Domain: `personal-hub.zametech.com`
   - Auto-Deploy: Enabled (or Manual)
   - Environment: `production`

### Environment Variables Management
Set different values per environment in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_GITHUB_CLIENT_ID`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_ENVIRONMENT`

#### Example Configuration:
```env
# Staging
NEXT_PUBLIC_API_URL=https://staging-api.personal-hub.com/api/v1
NEXT_PUBLIC_APP_URL=https://staging.personal-hub.zametech.com
NEXT_PUBLIC_ENVIRONMENT=staging

# Production
NEXT_PUBLIC_API_URL=https://personal-hub-backend.onrender.com/api/v1
NEXT_PUBLIC_APP_URL=https://personal-hub.zametech.com
NEXT_PUBLIC_ENVIRONMENT=production
```

## GitHub Actions Integration

`.github/workflows/release.yml`:
```yaml
name: Release Process

on:
  push:
    branches:
      - production
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Create Release
        if: startsWith(github.ref, 'refs/tags/')
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body_path: ./RELEASE_NOTES.md
          draft: false
          prerelease: false
```

## Checklists

### Pre-release Checklist
- [ ] All unit tests passing (`npm test`)
- [ ] E2E tests passing (with backend running)
- [ ] Build successful (`npm run build`)
- [ ] Bundle size reviewed
- [ ] Staging validation complete
- [ ] Environment variables configured in Vercel
- [ ] OAuth redirect URIs updated for production
- [ ] CORS configured on backend
- [ ] Documentation updated
- [ ] RELEASE_NOTES.md updated

### Post-release Checklist
- [ ] Production deployment successful
- [ ] Health check passed
- [ ] Core features tested (login, CRUD operations)
- [ ] Performance metrics acceptable
- [ ] Error monitoring active
- [ ] Analytics working (if enabled)
- [ ] Rollback procedure verified

## Rollback Procedure

If issues are detected in production:

```bash
# Quick rollback in Vercel
# Use Vercel dashboard to instantly rollback to previous deployment

# Git rollback
git checkout production
git reset --hard <previous-commit-hash>
git push --force origin production

# Or revert with a new commit
git checkout production
git revert HEAD
git push origin production
```

## Release Schedule

- **Feature releases**: Monthly (or as needed)
- **Bug fixes**: As needed
- **Security patches**: Immediate

## Communication

- Update RELEASE_NOTES.md for each release
- Create GitHub Release with changelog
- Notify users of major changes (if applicable)