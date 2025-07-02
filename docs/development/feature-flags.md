# Feature Flags

Personal Hub uses feature flags to control the availability of features across different environments. This allows for safe rollout of new features and easy toggling of experimental functionality.

## Configuration

Feature flags are controlled via environment variables. All feature flag environment variables follow the pattern:
```
NEXT_PUBLIC_FEATURE_[FEATURE_NAME]
```

## Available Feature Flags

### Core Features
These features are **enabled by default**. Set to `false` to disable.

- `NEXT_PUBLIC_FEATURE_TODOS` - TODO management functionality
- `NEXT_PUBLIC_FEATURE_CALENDAR` - Calendar and event management
- `NEXT_PUBLIC_FEATURE_NOTES` - Notes with rich text editor
- `NEXT_PUBLIC_FEATURE_GOALS` - Goal tracking and achievements
- `NEXT_PUBLIC_FEATURE_ANALYTICS` - Analytics dashboard

### Integration Features
These features are **disabled by default**. Set to `true` to enable.

- `NEXT_PUBLIC_FEATURE_GMAIL_INTEGRATION` - Gmail to task conversion
- `NEXT_PUBLIC_FEATURE_GOOGLE_CALENDAR_SYNC` - Google Calendar synchronization

### Experimental Features
These features are **disabled by default**. Set to `true` to enable.

- `NEXT_PUBLIC_FEATURE_PWA` - Progressive Web App support
- `NEXT_PUBLIC_FEATURE_OFFLINE_MODE` - Offline functionality

## Usage in Code

### Component Usage

Use the `FeatureFlag` component to conditionally render features:

```tsx
import { FeatureFlag } from '@/components/FeatureFlag';

function MyComponent() {
  return (
    <div>
      <FeatureFlag feature="gmailIntegration">
        <GmailIntegrationButton />
      </FeatureFlag>
      
      <FeatureFlag 
        feature="analytics" 
        fallback={<div>Analytics coming soon!</div>}
      >
        <AnalyticsDashboard />
      </FeatureFlag>
    </div>
  );
}
```

### HOC Usage

Use the `withFeatureFlag` HOC to wrap entire components:

```tsx
import { withFeatureFlag } from '@/components/FeatureFlag';

const AnalyticsPage = () => {
  return <div>Analytics content</div>;
};

export default withFeatureFlag('analytics')(AnalyticsPage);
```

### Programmatic Usage

Check feature flags programmatically:

```tsx
import { isFeatureEnabled, useFeatureFlags } from '@/config/features';

// In a component
function MyComponent() {
  const features = useFeatureFlags();
  
  if (features.gmailIntegration) {
    // Show Gmail features
  }
}

// Outside components
if (isFeatureEnabled('analytics')) {
  // Initialize analytics
}
```

## Environment-Specific Configuration

### Development
```env
# Enable all features for testing
NEXT_PUBLIC_FEATURE_GMAIL_INTEGRATION=true
NEXT_PUBLIC_FEATURE_GOOGLE_CALENDAR_SYNC=true
NEXT_PUBLIC_FEATURE_PWA=true
```

### Staging
```env
# Test new features before production
NEXT_PUBLIC_FEATURE_GMAIL_INTEGRATION=true
NEXT_PUBLIC_FEATURE_GOOGLE_CALENDAR_SYNC=false
```

### Production
```env
# Only stable features
NEXT_PUBLIC_FEATURE_GMAIL_INTEGRATION=false
NEXT_PUBLIC_FEATURE_GOOGLE_CALENDAR_SYNC=false
```

## Best Practices

1. **Default to Disabled** - New experimental features should be disabled by default
2. **Gradual Rollout** - Enable features in staging before production
3. **Clean Removal** - Remove feature flags once features are stable and universally available
4. **Documentation** - Document why a feature is behind a flag
5. **Testing** - Test both enabled and disabled states

## Adding New Feature Flags

1. Add the flag to `src/config/features.ts`:
```typescript
export interface FeatureFlags {
  // ... existing flags
  myNewFeature: boolean;
}

export function getFeatureFlags(): FeatureFlags {
  return {
    // ... existing flags
    myNewFeature: process.env.NEXT_PUBLIC_FEATURE_MY_NEW_FEATURE === 'true',
  };
}
```

2. Update `.env.example` with the new flag
3. Document the flag in this file
4. Use the flag in your components

## Removing Feature Flags

When a feature is stable and ready for general availability:

1. Remove the flag from `src/config/features.ts`
2. Remove `FeatureFlag` components wrapping the feature
3. Remove the environment variable from `.env.example`
4. Update this documentation
5. Communicate the change in release notes