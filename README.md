# Personal Hub

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

A modern, integrated workspace application designed to enhance personal productivity with seamless task management, calendar scheduling, and note-taking capabilities.

## ✨ Features

- **📝 TODO Management** - Advanced task tracking with priorities, subtasks, and status management
- **📅 Calendar** - Event scheduling with drag-and-drop, color categorization, and recurring events
- **📒 Notes** - Rich text editor with categories, tags, and full-text search
- **⏰ Moments** - Timeline-based capture of thoughts, ideas, and discoveries with smart tagging
- **📊 Dashboard** - Real-time overview of all activities with progress tracking
- **🎯 Goals** - Goal setting and achievement tracking with calendar integration
- **📈 Analytics** - Productivity insights and reporting
- **🌓 Dark Mode** - Eye-friendly theme with system preference sync
- **🌍 Internationalization** - English and Japanese language support

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/sasazame/personal-hub.git
cd personal-hub

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev

# Open http://localhost:3000
```

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- Backend API running on `http://localhost:8080` ([personal-hub-backend](https://github.com/sasazame/personal-hub-backend))

## 🛠️ Development

```bash
# Development with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests
npm test

# E2E tests
npm run test:e2e

# Production build
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
├── hooks/           # Custom React hooks
├── services/        # API integration layer
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── lib/             # Third-party library configs
```

## 🔐 Environment Variables

Create a `.env.local` file:

```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# OAuth (Optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
```

## 🚢 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sasazame/personal-hub)

1. Click the button above or run `vercel` in your terminal
2. Set environment variables in Vercel dashboard
3. Deploy!

### Other Platforms

See [deployment guide](./docs/deployment/README.md) for Cloudflare Pages, Netlify, and self-hosting options.

## 📚 Documentation

- [Getting Started](./docs/getting-started/README.md)
- [Development Guide](./docs/development/README.md)
- [API Reference](./docs/api/README.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting a PR.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [React](https://react.dev/)
- UI components inspired by [Tailwind UI](https://tailwindui.com/)
- Icons from [Heroicons](https://heroicons.com/) and [Lucide](https://lucide.dev/)

---

**Developer**: [@sasazame](https://github.com/sasazame)  
**Repository**: [personal-hub](https://github.com/sasazame/personal-hub)