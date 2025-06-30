# Getting Started with Personal Hub

This guide will help you set up Personal Hub for development and understand the basic concepts.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher
- **Git** for version control
- A code editor (VS Code recommended)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/sasazame/personal-hub.git
cd personal-hub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your configuration
```

Required environment variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: `http://localhost:8080/api/v1`)

### 4. Set Up the Backend

Personal Hub requires a backend API. Clone and run the backend:

```bash
# In a separate directory
git clone https://github.com/sasazame/personal-hub-backend.git
cd personal-hub-backend

# Follow the backend setup instructions
docker-compose up -d
```

### 5. Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🎯 First Steps

### 1. Create an Account

1. Click "Sign Up" on the login page
2. Fill in your details
3. Verify your email (if configured)

### 2. Explore Features

- **Dashboard** - Overview of all your activities
- **TODOs** - Create and manage tasks
- **Calendar** - Schedule events
- **Notes** - Write and organize notes
- **Goals** - Set and track goals

### 3. Try Basic Operations

#### Create a TODO
```
1. Go to TODOs page
2. Click "New Task"
3. Enter task details
4. Set priority and due date
5. Click "Create"
```

#### Schedule an Event
```
1. Go to Calendar page
2. Click on any date
3. Fill in event details
4. Choose a color category
5. Click "Save"
```

#### Write a Note
```
1. Go to Notes page
2. Click "New Note"
3. Write your content
4. Add tags and categories
5. Click "Save"
```

## 🏗️ Project Structure Overview

```
personal-hub/
├── src/
│   ├── app/          # Pages and routes
│   ├── components/   # Reusable components
│   ├── hooks/        # Custom React hooks
│   ├── services/     # API integration
│   └── utils/        # Helper functions
├── public/           # Static assets
├── tests/           # Test files
└── docs/            # Documentation
```

## 🔧 Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start           # Start production server

# Testing
npm test            # Run unit tests
npm run test:e2e    # Run E2E tests
npm run test:watch  # Run tests in watch mode

# Code Quality
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript checks
npm run format      # Format code with Prettier
```

## 🐛 Troubleshooting

### Backend Connection Issues

If you see API connection errors:

1. Ensure the backend is running on port 8080
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Verify no firewall is blocking the connection

### Build Errors

If the build fails:

1. Clear the cache: `rm -rf .next node_modules`
2. Reinstall dependencies: `npm install`
3. Check for TypeScript errors: `npm run type-check`

### Test Failures

If tests fail:

1. Ensure the backend is running for integration tests
2. Update snapshots if needed: `npm test -- -u`
3. Check test logs for specific errors

## 📚 Next Steps

- Read the [Development Guide](../development/README.md)
- Explore the [API Documentation](../api/README.md)
- Check out [Feature Guides](../features/README.md)
- Review [Contributing Guidelines](../../CONTRIBUTING.md)

## 💡 Tips

- Use the development tools in your browser
- Enable React Developer Tools extension
- Check the console for helpful warnings
- Use TypeScript for better IDE support

Need help? Check our [troubleshooting guide](../development/troubleshooting.md) or open an issue on GitHub.