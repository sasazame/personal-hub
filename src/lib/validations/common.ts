import { z } from 'zod';

/**
 * Common field validators
 */
export const commonValidators = {
  // Required string with min/max length
  requiredString: (minLength = 1, maxLength = 255) =>
    z.string()
      .min(minLength, `Must be at least ${minLength} characters`)
      .max(maxLength, `Must be at most ${maxLength} characters`),

  // Optional string with max length
  optionalString: (maxLength = 1000) =>
    z.string()
      .max(maxLength, `Must be at most ${maxLength} characters`)
      .optional()
      .nullable(),

  // Email validation
  email: () =>
    z.string()
      .email('Invalid email address')
      .toLowerCase(),

  // URL validation
  url: () =>
    z.string()
      .url('Invalid URL')
      .optional()
      .nullable(),

  // Date/DateTime validation
  date: () =>
    z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),

  dateTime: () =>
    z.string()
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/, 'Invalid datetime format'),

  // Numeric validations
  positiveInt: () =>
    z.number()
      .int('Must be an integer')
      .positive('Must be positive'),

  percentage: () =>
    z.number()
      .min(0, 'Must be at least 0')
      .max(100, 'Must be at most 100'),

  // Boolean with default
  booleanWithDefault: (defaultValue = false) =>
    z.boolean().default(defaultValue),

  // Enum validation
  enum: <T extends readonly [string, ...string[]]>(values: T) =>
    z.enum(values),

  // Array validations
  nonEmptyArray: <T extends z.ZodTypeAny>(schema: T) =>
    z.array(schema).min(1, 'At least one item is required'),

  uniqueArray: <T extends z.ZodTypeAny>(schema: T, getKey?: (item: z.infer<T>) => string) =>
    z.array(schema).refine(
      (items) => {
        if (!getKey) return true;
        const keys = items.map(getKey);
        return new Set(keys).size === keys.length;
      },
      { message: 'Items must be unique' }
    ),
};

/**
 * Common schema patterns
 */
export const commonSchemas = {
  // ID (for updates)
  id: z.number().positive(),

  // Timestamps
  timestamps: z.object({
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  }),

  // Pagination
  pagination: z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),

  // Date range
  dateRange: z.object({
    startDate: commonValidators.date(),
    endDate: commonValidators.date(),
  }).refine(
    (data) => new Date(data.startDate) <= new Date(data.endDate),
    { message: 'Start date must be before or equal to end date' }
  ),

  // Address
  address: z.object({
    street: commonValidators.requiredString(),
    city: commonValidators.requiredString(),
    state: commonValidators.requiredString(2, 2),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
    country: commonValidators.requiredString(2, 2).default('US'),
  }),

  // Contact info
  contactInfo: z.object({
    email: commonValidators.email(),
    phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number').optional(),
    website: commonValidators.url(),
  }),
};

/**
 * Factory functions for common patterns
 */
export const schemaFactories = {
  // CRUD schemas for an entity
  crud: <T extends z.ZodRawShape>(
    baseSchema: T,
    options?: {
      omitOnCreate?: Array<keyof T>;
      omitOnUpdate?: Array<keyof T>;
    }
  ) => {
    const base = z.object(baseSchema);
    
    // Create schema - omit specified fields
    let createSchema = base;
    if (options?.omitOnCreate) {
      createSchema = base.omit(
        options.omitOnCreate.reduce((acc, key) => ({ ...acc, [key]: true }), {})
      );
    }

    // Update schema - make all fields optional by default
    let updateSchema = base.partial();
    if (options?.omitOnUpdate) {
      updateSchema = updateSchema.omit(
        options.omitOnUpdate.reduce((acc, key) => ({ ...acc, [key]: true }), {})
      );
    }

    return {
      create: createSchema,
      update: updateSchema,
      base,
    };
  },

  // List/filter schemas
  listQuery: <T extends z.ZodRawShape>(filterSchema?: T) => {
    const base = commonSchemas.pagination;
    
    if (filterSchema) {
      return base.extend(filterSchema);
    }
    
    return base;
  },

  // Form with validation
  formWithValidation: <T extends z.ZodRawShape>(
    schema: T,
    customValidations?: Array<(data: z.infer<z.ZodObject<T>>) => boolean | string>
  ) => {
    const formSchema = z.object(schema);
    
    if (!customValidations || customValidations.length === 0) {
      return formSchema;
    }
    
    // Apply all validations to the schema
    let refinedSchema = formSchema as z.ZodSchema;
    
    for (const validation of customValidations) {
      refinedSchema = refinedSchema.refine(
        (data: z.infer<typeof formSchema>) => {
          const result = validation(data);
          return typeof result === 'boolean' ? result : false;
        },
        (data: z.infer<typeof formSchema>) => {
          const result = validation(data);
          return {
            message: typeof result === 'string' ? result : 'Validation failed',
          };
        }
      );
    }
    
    return refinedSchema;
  },
};

/**
 * Utility type for inferred schemas
 */
export type InferSchema<T extends z.ZodType> = z.infer<T>;