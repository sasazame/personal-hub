/**
 * Shared conditional utilities to reduce code duplication
 * and provide consistent pattern matching across the application
 */

export interface MatchOptions {
  caseSensitive?: boolean;
  includes?: boolean;
  exact?: boolean;
}

/**
 * Find a matching key in an object based on a target string
 * @param target - The string to match against
 * @param mappings - Object containing key-value mappings
 * @param options - Matching options
 * @returns The matched value or undefined
 */
export function findMatchingKey<T>(
  target: string,
  mappings: Record<string, T>,
  options: MatchOptions = {}
): T | undefined {
  const {
    caseSensitive = false,
    includes = true,
    exact = false
  } = options;

  const normalizedTarget = caseSensitive ? target : target.toLowerCase();

  for (const [key, value] of Object.entries(mappings)) {
    const normalizedKey = caseSensitive ? key : key.toLowerCase();

    if (exact) {
      if (normalizedTarget === normalizedKey) {
        return value;
      }
    } else if (includes) {
      if (normalizedTarget.includes(normalizedKey) || normalizedKey.includes(normalizedTarget)) {
        return value;
      }
    }
  }

  return undefined;
}

export interface ConditionalRule<T, R> {
  test: (value: T) => boolean;
  result: R | ((value: T) => R);
}

/**
 * Create a conditional mapper that applies rules in order
 * @param rules - Array of conditional rules
 * @param defaultResult - Default result if no rules match
 * @returns A function that maps values based on rules
 */
export function createConditionalMapper<T, R>(
  rules: ConditionalRule<T, R>[],
  defaultResult: R | ((value: T) => R)
) {
  return (value: T): R => {
    for (const rule of rules) {
      if (rule.test(value)) {
        return typeof rule.result === 'function'
          ? (rule.result as (value: T) => R)(value)
          : rule.result;
      }
    }
    
    return typeof defaultResult === 'function'
      ? (defaultResult as (value: T) => R)(value)
      : defaultResult;
  };
}

/**
 * Create a string pattern matcher
 * @param patterns - Array of patterns to match against
 * @returns A function that tests if a string matches any pattern
 */
export function createPatternMatcher(patterns: (string | RegExp)[]): (value: string) => boolean {
  return (value: string): boolean => {
    const normalizedValue = value.toLowerCase();
    
    return patterns.some(pattern => {
      if (typeof pattern === 'string') {
        return normalizedValue.includes(pattern.toLowerCase());
      } else if (pattern instanceof RegExp) {
        return pattern.test(value);
      }
      return false;
    });
  };
}

/**
 * Execute a function if a condition is met
 * @param condition - Boolean or function that returns boolean
 * @param onTrue - Function to execute if condition is true
 * @param onFalse - Optional function to execute if condition is false
 */
export function conditionalExecute<T>(
  condition: boolean | (() => boolean),
  onTrue: () => T,
  onFalse?: () => T
): T | undefined {
  const shouldExecute = typeof condition === 'function' ? condition() : condition;
  
  if (shouldExecute) {
    return onTrue();
  } else if (onFalse) {
    return onFalse();
  }
  
  return undefined;
}

/**
 * Create a switch-like mapper for string values
 * @param cases - Object containing case mappings
 * @param defaultCase - Default value if no cases match
 * @returns A function that maps strings based on cases
 */
export function createSwitchMapper<T>(
  cases: Record<string, T>,
  defaultCase?: T | ((value: string) => T)
) {
  return (value: string): T => {
    if (value in cases) {
      return cases[value];
    }
    
    if (defaultCase !== undefined) {
      return typeof defaultCase === 'function'
        ? (defaultCase as (value: string) => T)(value)
        : defaultCase;
    }
    
    throw new Error(`No case found for value: ${value}`);
  };
}

/**
 * Process a value through a series of conditions
 * Similar to a pipe but with conditional execution
 */
export function conditionalPipe<T>(...processors: Array<{
  condition: (value: T) => boolean;
  transform: (value: T) => T;
}>): (value: T) => T {
  return (value: T): T => {
    let result = value;
    
    for (const { condition, transform } of processors) {
      if (condition(result)) {
        result = transform(result);
      }
    }
    
    return result;
  };
}

/**
 * Execute nested conditional chains
 * Useful for reducing duplication in complex conditional structures
 */
export interface ConditionalChainItem {
  condition: boolean | (() => boolean);
  action: () => void | Promise<void>;
  nested?: ConditionalChainItem[];
}

export async function conditionalChain(
  chains: ConditionalChainItem[]
): Promise<void> {
  for (const { condition, action, nested } of chains) {
    const shouldExecute = typeof condition === 'function' ? condition() : condition;
    
    if (shouldExecute) {
      await action();
      
      if (nested && nested.length > 0) {
        await conditionalChain(nested);
      }
    }
  }
}

/**
 * Synchronous version of conditionalChain for non-async operations
 */
export function conditionalChainSync(
  chains: Array<{
    condition: boolean | (() => boolean);
    action: () => void;
    nested?: Array<{
      condition: boolean | (() => boolean);
      action: () => void;
    }>;
  }>
): void {
  chains.forEach(({ condition, action, nested }) => {
    const shouldExecute = typeof condition === 'function' ? condition() : condition;
    
    if (shouldExecute) {
      action();
      
      if (nested) {
        conditionalChainSync(nested);
      }
    }
  });
}