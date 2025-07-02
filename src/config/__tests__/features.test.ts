import { getFeatureFlags, isFeatureEnabled } from '../features';

describe('Feature Flags', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getFeatureFlags', () => {
    it('should enable core features by default', () => {
      const flags = getFeatureFlags();
      
      expect(flags.todos).toBe(true);
      expect(flags.calendar).toBe(true);
      expect(flags.notes).toBe(true);
      expect(flags.goals).toBe(true);
      // Analytics is now disabled by default
      expect(flags.analytics).toBe(false);
    });

    it('should disable integration features by default', () => {
      const flags = getFeatureFlags();
      
      expect(flags.gmailIntegration).toBe(false);
      expect(flags.googleCalendarSync).toBe(false);
      // GitHub OAuth is now disabled by default
      expect(flags.githubOAuth).toBe(false);
    });

    it('should disable experimental features by default', () => {
      const flags = getFeatureFlags();
      
      expect(flags.pwa).toBe(false);
      expect(flags.offlineMode).toBe(false);
    });

    it('should respect environment variable overrides', () => {
      process.env.NEXT_PUBLIC_FEATURE_TODOS = 'false';
      process.env.NEXT_PUBLIC_FEATURE_GMAIL_INTEGRATION = 'true';
      process.env.NEXT_PUBLIC_FEATURE_PWA = 'true';
      
      // Need to re-import to get fresh values
      jest.resetModules();
      const { getFeatureFlags: getFlags } = require('../features');
      const flags = getFlags();
      
      expect(flags.todos).toBe(false);
      expect(flags.gmailIntegration).toBe(true);
      expect(flags.pwa).toBe(true);
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return correct values for enabled features', () => {
      expect(isFeatureEnabled('todos')).toBe(true);
      expect(isFeatureEnabled('calendar')).toBe(true);
      expect(isFeatureEnabled('notes')).toBe(true);
    });

    it('should return correct values for disabled features', () => {
      expect(isFeatureEnabled('gmailIntegration')).toBe(false);
      expect(isFeatureEnabled('pwa')).toBe(false);
      expect(isFeatureEnabled('analytics')).toBe(false);
      expect(isFeatureEnabled('githubOAuth')).toBe(false);
    });

    it('should handle environment overrides', () => {
      process.env.NEXT_PUBLIC_FEATURE_GMAIL_INTEGRATION = 'true';
      
      jest.resetModules();
      const { isFeatureEnabled: isEnabled } = require('../features');
      
      expect(isEnabled('gmailIntegration')).toBe(true);
    });
  });

  describe('runtime overrides', () => {
    it('should use runtime overrides when available', () => {
      (window as any).__FEATURE_FLAGS__ = {
        todos: false,
        calendar: false,
        notes: true,
        goals: true,
        analytics: false,
        gmailIntegration: true,
        googleCalendarSync: false,
        googleOAuth: true,
        githubOAuth: false,
        passwordReset: true,
        darkMode: true,
        internationalization: true,
        pwa: false,
        offlineMode: false,
      };

      const flags = getFeatureFlags();
      
      expect(flags.todos).toBe(false);
      expect(flags.gmailIntegration).toBe(true);
      
      delete (window as any).__FEATURE_FLAGS__;
    });
  });
});