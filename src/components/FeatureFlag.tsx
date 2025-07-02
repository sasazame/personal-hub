'use client';

import { ReactNode } from 'react';
import { isFeatureEnabled, FeatureFlags } from '@/config/features';

interface FeatureFlagProps {
  feature: keyof FeatureFlags;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component to conditionally render content based on feature flags
 * 
 * @example
 * <FeatureFlag feature="gmailIntegration">
 *   <GmailIntegrationButton />
 * </FeatureFlag>
 * 
 * @example with fallback
 * <FeatureFlag feature="analytics" fallback={<div>Analytics coming soon!</div>}>
 *   <AnalyticsDashboard />
 * </FeatureFlag>
 */
export function FeatureFlag({ feature, children, fallback = null }: FeatureFlagProps) {
  const isEnabled = isFeatureEnabled(feature);
  
  if (!isEnabled) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * Higher-order component to wrap components with feature flag check
 * 
 * @example
 * export default withFeatureFlag('gmailIntegration')(GmailIntegrationPage);
 */
export function withFeatureFlag<P extends object>(
  feature: keyof FeatureFlags,
  fallback?: ReactNode
) {
  return function WithFeatureFlagComponent(Component: React.ComponentType<P>) {
    return function WrappedComponent(props: P) {
      return (
        <FeatureFlag feature={feature} fallback={fallback}>
          <Component {...props} />
        </FeatureFlag>
      );
    };
  };
}