/**
 * Feature flags configuration
 * Control which features are enabled/disabled in the application
 */

export interface FeatureFlags {
  // Core features
  todos: boolean;
  calendar: boolean;
  notes: boolean;
  goals: boolean;
  analytics: boolean;
  
  // Integration features
  gmailIntegration: boolean;
  googleCalendarSync: boolean;
  
  // Auth features
  googleOAuth: boolean;
  githubOAuth: boolean;
  passwordReset: boolean;
  
  // UI features
  darkMode: boolean;
  internationalization: boolean;
  
  // Experimental features
  pwa: boolean;
  offlineMode: boolean;
}

/**
 * Get feature flags from environment variables or use defaults
 */
export function getFeatureFlags(): FeatureFlags {
  // Allow runtime override for testing
  if (typeof window !== 'undefined' && (window as any).__FEATURE_FLAGS__) {
    return (window as any).__FEATURE_FLAGS__;
  }

  return {
    // Core features (all enabled by default)
    todos: process.env.NEXT_PUBLIC_FEATURE_TODOS !== 'false',
    calendar: process.env.NEXT_PUBLIC_FEATURE_CALENDAR !== 'false',
    notes: process.env.NEXT_PUBLIC_FEATURE_NOTES !== 'false',
    goals: process.env.NEXT_PUBLIC_FEATURE_GOALS !== 'false',
    analytics: process.env.NEXT_PUBLIC_FEATURE_ANALYTICS === 'true', // Disabled by default
    
    // Integration features
    gmailIntegration: process.env.NEXT_PUBLIC_FEATURE_GMAIL_INTEGRATION === 'true', // Disabled by default
    googleCalendarSync: process.env.NEXT_PUBLIC_FEATURE_GOOGLE_CALENDAR_SYNC === 'true', // Disabled by default
    
    // Auth features
    googleOAuth: process.env.NEXT_PUBLIC_FEATURE_GOOGLE_OAUTH !== 'false',
    githubOAuth: process.env.NEXT_PUBLIC_FEATURE_GITHUB_OAUTH === 'true', // Disabled by default
    passwordReset: process.env.NEXT_PUBLIC_FEATURE_PASSWORD_RESET !== 'false',
    
    // UI features
    darkMode: process.env.NEXT_PUBLIC_FEATURE_DARK_MODE !== 'false',
    internationalization: process.env.NEXT_PUBLIC_FEATURE_I18N !== 'false',
    
    // Experimental features (disabled by default)
    pwa: process.env.NEXT_PUBLIC_FEATURE_PWA === 'true',
    offlineMode: process.env.NEXT_PUBLIC_FEATURE_OFFLINE_MODE === 'true',
  };
}

/**
 * Hook to access feature flags in components
 */
export function useFeatureFlags(): FeatureFlags {
  return getFeatureFlags();
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature] ?? false;
}

// Export a singleton instance for non-component usage
export const featureFlags = getFeatureFlags();