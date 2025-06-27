import {
  findMatchingKey,
  createConditionalMapper,
  createPatternMatcher,
  conditionalExecute,
  createSwitchMapper,
  conditionalPipe,
  conditionalChain,
  conditionalChainSync,
  ConditionalRule,
  MatchOptions
} from '../conditionalHelpers';

describe('findMatchingKey', () => {
  const mappings = {
    'error': 'ERROR_HANDLER',
    'warning': 'WARNING_HANDLER',
    'info': 'INFO_HANDLER',
  };

  describe('with default options', () => {
    it('should find case-insensitive matches', () => {
      expect(findMatchingKey('ERROR', mappings)).toBe('ERROR_HANDLER');
      expect(findMatchingKey('Warning', mappings)).toBe('WARNING_HANDLER');
    });

    it('should find partial matches', () => {
      expect(findMatchingKey('This is an error message', mappings)).toBe('ERROR_HANDLER');
      expect(findMatchingKey('warn', mappings)).toBe('WARNING_HANDLER');
    });

    it('should return undefined for no match', () => {
      expect(findMatchingKey('debug', mappings)).toBeUndefined();
    });
  });

  describe('with case-sensitive option', () => {
    const options: MatchOptions = { caseSensitive: true };

    it('should only match exact case', () => {
      expect(findMatchingKey('error', mappings, options)).toBe('ERROR_HANDLER');
      expect(findMatchingKey('ERROR', mappings, options)).toBeUndefined();
    });
  });

  describe('with exact match option', () => {
    const options: MatchOptions = { exact: true };

    it('should only match exact strings', () => {
      expect(findMatchingKey('error', mappings, options)).toBe('ERROR_HANDLER');
      expect(findMatchingKey('error message', mappings, options)).toBeUndefined();
    });
  });

  describe('with includes false option', () => {
    const options: MatchOptions = { includes: false, exact: true };

    it('should require exact matches', () => {
      expect(findMatchingKey('error', mappings, options)).toBe('ERROR_HANDLER');
      expect(findMatchingKey('errors', mappings, options)).toBeUndefined();
    });
  });
});

describe('createConditionalMapper', () => {
  it('should apply rules in order', () => {
    const rules: ConditionalRule<number, string>[] = [
      { test: (n) => n < 0, result: 'negative' },
      { test: (n) => n === 0, result: 'zero' },
      { test: (n) => n > 0, result: 'positive' },
    ];

    const mapper = createConditionalMapper(rules, 'unknown');

    expect(mapper(-5)).toBe('negative');
    expect(mapper(0)).toBe('zero');
    expect(mapper(10)).toBe('positive');
  });

  it('should support function results', () => {
    const rules: ConditionalRule<string, string>[] = [
      { test: (s) => s.startsWith('hello'), result: (s) => s.toUpperCase() },
      { test: (s) => s.startsWith('bye'), result: 'goodbye' },
    ];

    const mapper = createConditionalMapper(rules, (s) => `default: ${s}`);

    expect(mapper('hello world')).toBe('HELLO WORLD');
    expect(mapper('bye friend')).toBe('goodbye');
    expect(mapper('other')).toBe('default: other');
  });

  it('should use default result when no rules match', () => {
    const rules: ConditionalRule<number, string>[] = [
      { test: (n) => n === 1, result: 'one' },
    ];

    const mapper = createConditionalMapper(rules, 'default');
    expect(mapper(2)).toBe('default');
  });

  it('should support function as default result', () => {
    const rules: ConditionalRule<number, string>[] = [];
    const mapper = createConditionalMapper(rules, (n) => `number: ${n}`);
    
    expect(mapper(42)).toBe('number: 42');
  });
});

describe('createPatternMatcher', () => {
  it('should match string patterns case-insensitively', () => {
    const matcher = createPatternMatcher(['error', 'warning']);

    expect(matcher('This is an ERROR')).toBe(true);
    expect(matcher('Warning: something happened')).toBe(true);
    expect(matcher('All good')).toBe(false);
  });

  it('should match regex patterns', () => {
    const matcher = createPatternMatcher([/^\d+$/, /^[A-Z]+$/]);

    expect(matcher('12345')).toBe(true);
    expect(matcher('HELLO')).toBe(true);
    expect(matcher('Hello123')).toBe(false);
  });

  it('should match mixed patterns', () => {
    const matcher = createPatternMatcher(['error', /timeout/i]);

    expect(matcher('An error occurred')).toBe(true);
    expect(matcher('Connection TIMEOUT')).toBe(true);
    expect(matcher('Success')).toBe(false);
  });
});

describe('conditionalExecute', () => {
  it('should execute onTrue when condition is true', () => {
    const onTrue = jest.fn(() => 'true result');
    const onFalse = jest.fn(() => 'false result');

    const result = conditionalExecute(true, onTrue, onFalse);

    expect(result).toBe('true result');
    expect(onTrue).toHaveBeenCalled();
    expect(onFalse).not.toHaveBeenCalled();
  });

  it('should execute onFalse when condition is false', () => {
    const onTrue = jest.fn(() => 'true result');
    const onFalse = jest.fn(() => 'false result');

    const result = conditionalExecute(false, onTrue, onFalse);

    expect(result).toBe('false result');
    expect(onTrue).not.toHaveBeenCalled();
    expect(onFalse).toHaveBeenCalled();
  });

  it('should support function conditions', () => {
    const condition = jest.fn(() => true);
    const onTrue = jest.fn(() => 'result');

    const result = conditionalExecute(condition, onTrue);

    expect(result).toBe('result');
    expect(condition).toHaveBeenCalled();
    expect(onTrue).toHaveBeenCalled();
  });

  it('should return undefined when condition is false and no onFalse', () => {
    const result = conditionalExecute(false, () => 'value');
    expect(result).toBeUndefined();
  });
});

describe('createSwitchMapper', () => {
  const cases = {
    'admin': 'Administrator',
    'user': 'Regular User',
    'guest': 'Guest User',
  };

  it('should map known cases', () => {
    const mapper = createSwitchMapper(cases);

    expect(mapper('admin')).toBe('Administrator');
    expect(mapper('user')).toBe('Regular User');
    expect(mapper('guest')).toBe('Guest User');
  });

  it('should use default case for unknown values', () => {
    const mapper = createSwitchMapper(cases, 'Unknown Role');
    expect(mapper('moderator')).toBe('Unknown Role');
  });

  it('should support function as default case', () => {
    const mapper = createSwitchMapper(cases, (value) => `Unknown: ${value}`);
    expect(mapper('moderator')).toBe('Unknown: moderator');
  });

  it('should throw error when no default and value not found', () => {
    const mapper = createSwitchMapper(cases);
    expect(() => mapper('unknown')).toThrow('No case found for value: unknown');
  });
});

describe('conditionalPipe', () => {
  it('should process value through matching conditions', () => {
    const pipeline = conditionalPipe(
      {
        condition: (n: number) => n < 0,
        transform: (n: number) => Math.abs(n),
      },
      {
        condition: (n: number) => n > 10,
        transform: (n: number) => n / 2,
      },
      {
        condition: (n: number) => n % 2 === 0,
        transform: (n: number) => n + 1,
      }
    );

    expect(pipeline(-20)).toBe(11); // abs(20) = 20, 20/2 = 10, 10+1 = 11
    expect(pipeline(5)).toBe(5); // No conditions match
    expect(pipeline(4)).toBe(5); // 4+1 = 5
  });

  it('should handle empty processors', () => {
    const pipeline = conditionalPipe<number>();
    expect(pipeline(42)).toBe(42);
  });

  it('should process in order', () => {
    const order: number[] = [];
    
    const pipeline = conditionalPipe(
      {
        condition: () => { order.push(1); return true; },
        transform: (n: number) => { order.push(2); return n; },
      },
      {
        condition: () => { order.push(3); return true; },
        transform: (n: number) => { order.push(4); return n; },
      }
    );

    pipeline(1);
    expect(order).toEqual([1, 2, 3, 4]);
  });
});

describe('conditionalChain', () => {
  it('should execute actions when conditions are true', async () => {
    const executed: string[] = [];

    await conditionalChain([
      {
        condition: true,
        action: () => { executed.push('first'); },
      },
      {
        condition: false,
        action: () => { executed.push('second'); },
      },
      {
        condition: () => true,
        action: () => { executed.push('third'); },
      },
    ]);

    expect(executed).toEqual(['first', 'third']);
  });

  it('should handle nested chains', async () => {
    const executed: string[] = [];

    await conditionalChain([
      {
        condition: true,
        action: () => { executed.push('outer'); },
        nested: [
          {
            condition: true,
            action: () => { executed.push('nested1'); },
          },
          {
            condition: false,
            action: () => { executed.push('nested2'); },
          },
          {
            condition: true,
            action: () => { executed.push('nested3'); },
            nested: [
              {
                condition: true,
                action: () => { executed.push('deeply-nested'); },
              },
            ],
          },
        ],
      },
    ]);

    expect(executed).toEqual(['outer', 'nested1', 'nested3', 'deeply-nested']);
  });

  it('should skip nested chains when parent condition is false', async () => {
    const executed: string[] = [];

    await conditionalChain([
      {
        condition: false,
        action: () => { executed.push('outer'); },
        nested: [
          {
            condition: true,
            action: () => { executed.push('should-not-execute'); },
          },
        ],
      },
    ]);

    expect(executed).toEqual([]);
  });

  it('should handle async actions', async () => {
    const executed: string[] = [];

    await conditionalChain([
      {
        condition: true,
        action: async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          executed.push('async1');
        },
      },
      {
        condition: true,
        action: async () => {
          await new Promise(resolve => setTimeout(resolve, 5));
          executed.push('async2');
        },
      },
    ]);

    expect(executed).toEqual(['async1', 'async2']);
  });
});

describe('conditionalChainSync', () => {
  it('should execute actions when conditions are true', () => {
    const executed: string[] = [];

    conditionalChainSync([
      {
        condition: true,
        action: () => { executed.push('first'); },
      },
      {
        condition: false,
        action: () => { executed.push('second'); },
      },
      {
        condition: () => true,
        action: () => { executed.push('third'); },
      },
    ]);

    expect(executed).toEqual(['first', 'third']);
  });

  it('should handle nested chains', () => {
    const executed: string[] = [];

    conditionalChainSync([
      {
        condition: true,
        action: () => { executed.push('outer'); },
        nested: [
          {
            condition: true,
            action: () => { executed.push('nested1'); },
          },
          {
            condition: false,
            action: () => { executed.push('nested2'); },
          },
        ],
      },
    ]);

    expect(executed).toEqual(['outer', 'nested1']);
  });

  it('should handle empty chains', () => {
    expect(() => conditionalChainSync([])).not.toThrow();
  });
});