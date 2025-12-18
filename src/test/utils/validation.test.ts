/**
 * Validation Utility Tests
 */

import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validateDate,
  validateDateOfDeath,
  validateName,
  validateWebsite,
  validateContact,
  validateProfile,
} from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      expect(validateEmail('test@example.com').valid).toBe(true);
      expect(validateEmail('user.name@domain.co.uk').valid).toBe(true);
    });

    it('should accept empty email (optional)', () => {
      expect(validateEmail('').valid).toBe(true);
      expect(validateEmail('   ').valid).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid').valid).toBe(false);
      expect(validateEmail('@example.com').valid).toBe(false);
      expect(validateEmail('test@').valid).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should accept valid phone numbers', () => {
      expect(validatePhone('1234567890').valid).toBe(true);
      expect(validatePhone('+1-234-567-8900').valid).toBe(true);
      expect(validatePhone('(123) 456-7890').valid).toBe(true);
    });

    it('should accept empty phone (optional)', () => {
      expect(validatePhone('').valid).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123').valid).toBe(false); // Too short
      expect(validatePhone('abc123').valid).toBe(false); // Contains letters
    });
  });

  describe('validateDate', () => {
    it('should accept valid dates', () => {
      expect(validateDate('2024-01-01').valid).toBe(true);
      expect(validateDate('2020-12-31').valid).toBe(true);
    });

    it('should accept empty date (optional)', () => {
      expect(validateDate('').valid).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(validateDate('invalid').valid).toBe(false);
      expect(validateDate('2025-13-01').valid).toBe(false);
    });
  });

  describe('validateDateOfDeath', () => {
    it('should accept past dates', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      expect(validateDateOfDeath(pastDate.toISOString().split('T')[0]).valid).toBe(true);
    });

    it('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(validateDateOfDeath(futureDate.toISOString().split('T')[0]).valid).toBe(false);
    });
  });

  describe('validateName', () => {
    it('should accept valid names', () => {
      expect(validateName('John Doe').valid).toBe(true);
      expect(validateName('Mary-Jane O\'Connor').valid).toBe(true);
    });

    it('should reject empty names', () => {
      expect(validateName('').valid).toBe(false);
      expect(validateName('  ').valid).toBe(false);
    });

    it('should reject names that are too short', () => {
      expect(validateName('A').valid).toBe(false);
    });
  });

  describe('validateWebsite', () => {
    it('should accept valid URLs', () => {
      expect(validateWebsite('https://example.com').valid).toBe(true);
      expect(validateWebsite('http://test.org').valid).toBe(true);
      expect(validateWebsite('example.com').valid).toBe(true); // Adds https://
    });

    it('should accept empty website (optional)', () => {
      expect(validateWebsite('').valid).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateWebsite('not a url').valid).toBe(false);
    });
  });

  describe('validateContact', () => {
    it('should validate complete contact', () => {
      const result = validateContact({
        name: 'John Doe',
        phone: '1234567890',
        email: 'john@example.com',
        website: 'https://example.com',
      });
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('should catch validation errors', () => {
      const result = validateContact({
        name: '', // Invalid
        phone: '123', // Too short
        email: 'invalid', // Invalid
        website: 'not a url', // Invalid
      });
      expect(result.valid).toBe(false);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.phone).toBeDefined();
      expect(result.errors.email).toBeDefined();
      expect(result.errors.website).toBeDefined();
    });
  });

  describe('validateProfile', () => {
    it('should validate complete profile', () => {
      const result = validateProfile({
        deceasedName: 'John Doe',
        relationship: 'SPOUSE',
        dateOfDeath: '2023-01-01',
        email: 'user@example.com',
        phone: '1234567890',
      });
      expect(result.valid).toBe(true);
    });

    it('should catch validation errors', () => {
      const result = validateProfile({
        deceasedName: 'A', // Too short
        dateOfDeath: '2025-01-01', // Future date
        email: 'invalid', // Invalid email
      });
      expect(result.valid).toBe(false);
      expect(result.errors.deceasedName).toBeDefined();
      expect(result.errors.dateOfDeath).toBeDefined();
      expect(result.errors.email).toBeDefined();
    });
  });
});

