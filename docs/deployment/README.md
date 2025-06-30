# Deployment Guide

This guide covers deploying Personal Hub to various platforms, with a focus on Vercel (recommended) and alternatives.

## 🚀 Vercel Deployment (Recommended)

Vercel provides the best experience for Next.js applications with zero-config deployment.

### Prerequisites

- GitHub account connected to Vercel
- Backend API deployed and accessible
- Environment variables ready

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sasazame/personal-hub)

### Manual Deployment

#### 1. Install Vercel CLI

```bash
npm i -g vercel
```

#### 2. Deploy

```bash
# In project root
vercel

# Follow prompts:
# - Link to existing project or create new
# - Configure project settings
# - Deploy
```

#### 3. Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
```

#### 4. Configure Custom Domain

1. Go to Project → Settings → Domains
2. Add your domain (e.g., `app.zametech.com`)
3. Configure DNS:

**For Cloudflare:**
```
Type: CNAME
Name: app
Target: cname.vercel-dns.com
Proxy: OFF (DNS only)
```

**For other providers:**
```
Type: A
Name: @
Value: 76.76.21.21
```

### Production Deployment

```bash
# Deploy to production
vercel --prod

# Or push to main branch (auto-deploy)
git push origin main
```

## ☁️ Cloudflare Pages

Since you're using Cloudflare for DNS, Cloudflare Pages is a great alternative.

### Setup

#### 1. Install Dependencies

```bash
npm install -D @cloudflare/next-on-pages
```

#### 2. Update package.json

```json
{
  "scripts": {
    "pages:build": "npx @cloudflare/next-on-pages",
    "pages:dev": "npx wrangler pages dev .vercel/output/static"
  }
}
```

#### 3. Build for Cloudflare

```bash
npm run pages:build
```

#### 4. Deploy

```bash
npx wrangler pages deploy .vercel/output/static \
  --project-name=personal-hub \
  --compatibility-date=2024-06-30
```

### Configure in Cloudflare Dashboard

1. Go to Cloudflare Pages
2. Create new project
3. Connect GitHub repository
4. Build settings:
   - Build command: `npm run pages:build`
   - Build output: `.vercel/output/static`
   - Root directory: `/`

### Environment Variables

Add in Cloudflare Pages → Settings → Environment variables

### Custom Domain

Since you own `zametech.com`:

1. Go to Custom domains
2. Add `app.zametech.com`
3. DNS will be configured automatically

## 📦 Self-Hosting with Docker

### Dockerfile

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
    restart: unless-stopped
```

### Deploy

```bash
# Build and run
docker-compose up -d

# With nginx reverse proxy
docker-compose -f docker-compose.prod.yml up -d
```

## 🌐 Other Platforms

### Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NEXT_PUBLIC_API_URL = "https://api.yourdomain.com/api/v1"
```

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway login
railway link
railway up
```

### Render

1. Create new Web Service
2. Connect GitHub repo
3. Build Command: `npm run build`
4. Start Command: `npm start`
5. Add environment variables

## 🔧 Post-Deployment Checklist

### 1. Environment Variables

Ensure all required variables are set:

- [ ] `NEXT_PUBLIC_API_URL`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] OAuth client IDs (if using)
- [ ] Any feature flags

### 2. API Configuration

- [ ] Backend API is accessible from production
- [ ] CORS is configured for production domain
- [ ] API rate limiting is configured
- [ ] SSL certificates are valid

### 3. OAuth Configuration

Update redirect URIs in OAuth providers:

**Google Console:**
- Authorized redirect URIs: `https://app.yourdomain.com/auth/callback`

**GitHub OAuth Apps:**
- Authorization callback URL: `https://app.yourdomain.com/auth/callback`

### 4. Domain Configuration

- [ ] SSL certificate is active
- [ ] www redirect is configured
- [ ] Security headers are set

### 5. Monitoring

Set up monitoring:

```javascript
// Example: Vercel Analytics
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## 🚨 Troubleshooting

### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Working

1. Ensure variables start with `NEXT_PUBLIC_` for client-side access
2. Rebuild after changing variables
3. Check variable names match exactly

### API Connection Issues

1. Verify API URL includes protocol (`https://`)
2. Check CORS configuration
3. Test API endpoint directly
4. Review browser console for errors

### Performance Issues

1. Enable caching headers
2. Use CDN for static assets
3. Implement proper image optimization
4. Review bundle size: `npm run analyze`

## 📊 Production Optimizations

### 1. Enable ISR (Incremental Static Regeneration)

```typescript
export const revalidate = 3600; // Revalidate every hour
```

### 2. Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/hero.png"
  alt="Hero"
  width={1200}
  height={600}
  priority
  placeholder="blur"
/>
```

### 3. Bundle Analysis

```bash
# Install analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // config
});

# Run analysis
ANALYZE=true npm run build
```

## 🔒 Security Checklist

- [ ] Enable security headers
- [ ] Configure CSP (Content Security Policy)
- [ ] Set up rate limiting
- [ ] Enable HTTPS only
- [ ] Configure proper CORS
- [ ] Validate all inputs
- [ ] Sanitize user content
- [ ] Regular dependency updates

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)