import { loginSchema, registerSchema } from '../auth';

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('validates valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('requires email', () => {
      const invalidData = {
        email: '',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email is required');
      }
    });

    it('validates email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email format');
      }
    });

    it('requires password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password is required');
      }
    });
  });

  describe('registerSchema', () => {
    const validData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'ValidPass123!',
      confirmPassword: 'ValidPass123!',
    };

    it('validates valid registration data', () => {
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    describe('username validation', () => {
      it('requires minimum length', () => {
        const data = { ...validData, username: 'ab' };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Username must be at least 3 characters');
        }
      });

      it('enforces maximum length', () => {
        const data = { ...validData, username: 'a'.repeat(21) };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Username must be at most 20 characters');
        }
      });

      it('only allows alphanumeric and underscore', () => {
        const data = { ...validData, username: 'user@name' };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Username can only contain letters, numbers, and underscores');
        }
      });

      it('allows valid usernames', () => {
        const validUsernames = ['user123', 'test_user', 'User_123'];
        validUsernames.forEach(username => {
          const data = { ...validData, username };
          const result = registerSchema.safeParse(data);
          expect(result.success).toBe(true);
        });
      });
    });

    describe('password validation', () => {
      it('requires minimum length', () => {
        const data = { ...validData, password: 'Pass1', confirmPassword: 'Pass1' };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('at least 6 characters');
        }
      });

      it('accepts simple passwords meeting minimum length', () => {
        const data = { ...validData, password: 'password123', confirmPassword: 'password123' };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('accepts passwords with only lowercase letters if long enough', () => {
        const data = { ...validData, password: 'validpass', confirmPassword: 'validpass' };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('accepts passwords with only uppercase letters if long enough', () => {
        const data = { ...validData, password: 'VALIDPASS', confirmPassword: 'VALIDPASS' };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('accepts passwords with only numbers if long enough', () => {
        const data = { ...validData, password: '123456', confirmPassword: '123456' };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('accepts passwords without special characters', () => {
        const data = { ...validData, password: 'ValidPass123', confirmPassword: 'ValidPass123' };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    describe('password confirmation', () => {
      it('requires password confirmation', () => {
        const data = { ...validData, confirmPassword: '' };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Please confirm your password');
        }
      });

      it('validates passwords match', () => {
        const data = { ...validData, confirmPassword: 'DifferentPass123!' };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe("Passwords don't match");
        }
      });
    });

    describe('email validation', () => {
      it('requires email', () => {
        const data = { ...validData, email: '' };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Email is required');
        }
      });

      it('validates email format', () => {
        const data = { ...validData, email: 'invalid-email' };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Invalid email format');
        }
      });
    });
  });
});