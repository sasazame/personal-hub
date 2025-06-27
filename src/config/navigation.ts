/**
 * Navigation configuration for consistent route translations
 * Part of Phase 2 refactoring to reduce code duplication
 */

import { createSwitchMapper } from '@/utils/conditionalHelpers';

export const ROUTE_TRANSLATIONS = {
  todos: 'nav.todos',
  profile: 'nav.profile',
  settings: 'nav.settings',
  calendar: 'nav.calendar',
  tags: 'nav.tags',
  starred: 'nav.starred',
  archive: 'nav.archive',
  notes: 'nav.notes',
  goals: 'nav.goals',
  analytics: 'nav.analytics',
  dashboard: 'nav.dashboard',
} as const;

/**
 * Get the translation key for a route segment
 * @param segment - Route segment to translate
 * @param t - Translation function
 * @returns Translated label for the route
 */
export function getRouteLabel(
  segment: string,
  t: (key: string) => string
): string {
  const key = ROUTE_TRANSLATIONS[segment as keyof typeof ROUTE_TRANSLATIONS];
  return key ? t(key) : segment.charAt(0).toUpperCase() + segment.slice(1);
}

/**
 * Create a route label mapper using the switch mapper utility
 */
export const createRouteLabelMapper = (t: (key: string) => string) => {
  const translatedRoutes = Object.entries(ROUTE_TRANSLATIONS).reduce(
    (acc, [route, key]) => ({
      ...acc,
      [route]: t(key),
    }),
    {} as Record<string, string>
  );

  return createSwitchMapper(
    translatedRoutes,
    (segment: string) => segment.charAt(0).toUpperCase() + segment.slice(1)
  );
};

/**
 * Route configuration with metadata
 */
export interface RouteConfig {
  path: string;
  translationKey: string;
  icon?: string;
  requiresAuth?: boolean;
  children?: RouteConfig[];
}

/**
 * Application routes configuration
 */
export const ROUTES: RouteConfig[] = [
  {
    path: '/',
    translationKey: 'nav.home',
    requiresAuth: false,
  },
  {
    path: '/dashboard',
    translationKey: 'nav.dashboard',
    requiresAuth: true,
  },
  {
    path: '/todos',
    translationKey: 'nav.todos',
    requiresAuth: true,
  },
  {
    path: '/calendar',
    translationKey: 'nav.calendar',
    requiresAuth: true,
  },
  {
    path: '/notes',
    translationKey: 'nav.notes',
    requiresAuth: true,
  },
  {
    path: '/goals',
    translationKey: 'nav.goals',
    requiresAuth: true,
    children: [
      {
        path: '/goals/[id]',
        translationKey: 'nav.goalDetails',
        requiresAuth: true,
      },
      {
        path: '/goals/[id]/calendar',
        translationKey: 'nav.goalCalendar',
        requiresAuth: true,
      },
      {
        path: '/goals/[id]/history',
        translationKey: 'nav.goalHistory',
        requiresAuth: true,
      },
    ],
  },
  {
    path: '/analytics',
    translationKey: 'nav.analytics',
    requiresAuth: true,
  },
  {
    path: '/profile',
    translationKey: 'nav.profile',
    requiresAuth: true,
  },
];

/**
 * Get route configuration by path
 */
export function getRouteConfig(path: string): RouteConfig | undefined {
  const findRoute = (routes: RouteConfig[], targetPath: string): RouteConfig | undefined => {
    for (const route of routes) {
      if (route.path === targetPath) {
        return route;
      }
      if (route.children) {
        const childRoute = findRoute(route.children, targetPath);
        if (childRoute) {
          return childRoute;
        }
      }
    }
    return undefined;
  };

  return findRoute(ROUTES, path);
}