/**
 * Validation Utilities
 * 
 * Provides validation functions for profile fields, dates, contacts, and other data.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { valid: true }; // Email is optional
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  
  return { valid: true };
}

/**
 * Validate phone number format (US and international)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { valid: true }; // Phone is optional
  }
  
  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Check if it's all digits (with optional + prefix)
  if (!/^\+?\d+$/.test(cleaned)) {
    return { valid: false, error: 'Please enter a valid phone number' };
  }
  
  // Check minimum length (at least 7 digits)
  if (cleaned.replace('+', '').length < 7) {
    return { valid: false, error: 'Phone number is too short' };
  }
  
  // Check maximum length (reasonable limit)
  if (cleaned.replace('+', '').length > 15) {
    return { valid: false, error: 'Phone number is too long' };
  }
  
  return { valid: true };
}

/**
 * Validate date string
 */
export function validateDate(dateString: string): ValidationResult {
  if (!dateString || dateString.trim() === '') {
    return { valid: true }; // Date is optional
  }
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Please enter a valid date' };
  }
  
  // Check if date is not too far in the future (reasonable limit: 10 years)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 10);
  if (date > maxDate) {
    return { valid: false, error: 'Date cannot be more than 10 years in the future' };
  }
  
  // Check if date is not too far in the past (reasonable limit: 150 years)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 150);
  if (date < minDate) {
    return { valid: false, error: 'Date cannot be more than 150 years in the past' };
  }
  
  return { valid: true };
}

/**
 * Validate date of death (must be in the past)
 */
export function validateDateOfDeath(dateString: string): ValidationResult {
  if (!dateString || dateString.trim() === '') {
    return { valid: true }; // Date is optional
  }
  
  const baseValidation = validateDate(dateString);
  if (!baseValidation.valid) {
    return baseValidation;
  }
  
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  if (date > today) {
    return { valid: false, error: 'Date of death cannot be in the future' };
  }
  
  return { valid: true };
}

/**
 * Validate name field
 */
export function validateName(name: string, fieldName: string = 'Name'): ValidationResult {
  if (!name || name.trim() === '') {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, error: `${fieldName} must be at least 2 characters` };
  }
  
  if (name.length > 100) {
    return { valid: false, error: `${fieldName} is too long (maximum 100 characters)` };
  }
  
  // Check for invalid characters (allow letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-'\.]+$/.test(name)) {
    return { valid: false, error: `${fieldName} contains invalid characters` };
  }
  
  return { valid: true };
}

/**
 * Validate relationship field
 */
export function validateRelationship(relationship: string): ValidationResult {
  if (!relationship || relationship.trim() === '') {
    return { valid: true }; // Relationship is optional
  }
  
  if (relationship.length > 50) {
    return { valid: false, error: 'Relationship is too long (maximum 50 characters)' };
  }
  
  return { valid: true };
}

/**
 * Validate address field
 */
export function validateAddress(address: string, fieldName: string = 'Address'): ValidationResult {
  if (!address || address.trim() === '') {
    return { valid: true }; // Address is optional
  }
  
  if (address.length > 200) {
    return { valid: false, error: `${fieldName} is too long (maximum 200 characters)` };
  }
  
  return { valid: true };
}

/**
 * Validate website URL
 */
export function validateWebsite(url: string): ValidationResult {
  if (!url || url.trim() === '') {
    return { valid: true }; // Website is optional
  }
  
  // Add protocol if missing
  let urlToCheck = url.trim();
  if (!urlToCheck.match(/^https?:\/\//i)) {
    urlToCheck = 'https://' + urlToCheck;
  }
  
  try {
    const urlObj = new URL(urlToCheck);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'Website must use http:// or https://' };
    }
  } catch {
    return { valid: false, error: 'Please enter a valid website URL' };
  }
  
  return { valid: true };
}

/**
 * Validate contact entry
 */
export interface ContactValidationResult {
  valid: boolean;
  errors: {
    name?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
}

export function validateContact(contact: {
  name: string;
  phone?: string;
  email?: string;
  website?: string;
}): ContactValidationResult {
  const errors: ContactValidationResult['errors'] = {};
  
  const nameValidation = validateName(contact.name, 'Contact name');
  if (!nameValidation.valid) {
    errors.name = nameValidation.error;
  }
  
  if (contact.phone) {
    const phoneValidation = validatePhone(contact.phone);
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.error;
    }
  }
  
  if (contact.email) {
    const emailValidation = validateEmail(contact.email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.error;
    }
  }
  
  if (contact.website) {
    const websiteValidation = validateWebsite(contact.website);
    if (!websiteValidation.valid) {
      errors.website = websiteValidation.error;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate profile
 */
export interface ProfileValidationResult {
  valid: boolean;
  errors: {
    deceasedName?: string;
    relationship?: string;
    dateOfDeath?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    region?: string;
    country?: string;
  };
}

/** Profile fields that must be completed before save */
export const PROFILE_REQUIRED_FIELDS: (keyof ProfileValidationResult['errors'])[] = ['relationship'];

export function validateProfile(profile: {
  deceasedName?: string;
  relationship?: string;
  dateOfDeath?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
}): ProfileValidationResult {
  const errors: ProfileValidationResult['errors'] = {};
  
  if (!profile.relationship || String(profile.relationship).trim() === '') {
    errors.relationship = 'Your relationship is required';
  }
  
  if (profile.deceasedName) {
    const nameValidation = validateName(profile.deceasedName, 'Deceased name');
    if (!nameValidation.valid) {
      errors.deceasedName = nameValidation.error;
    }
  }
  
  if (profile.relationship) {
    const relationshipValidation = validateRelationship(profile.relationship);
    if (!relationshipValidation.valid) {
      errors.relationship = relationshipValidation.error;
    }
  }
  
  if (profile.dateOfDeath) {
    const dateValidation = validateDateOfDeath(profile.dateOfDeath);
    if (!dateValidation.valid) {
      errors.dateOfDeath = dateValidation.error;
    }
  }
  
  if (profile.email) {
    const emailValidation = validateEmail(profile.email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.error;
    }
  }
  
  if (profile.phone) {
    const phoneValidation = validatePhone(profile.phone);
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.error;
    }
  }
  
  if (profile.address) {
    const addressValidation = validateAddress(profile.address);
    if (!addressValidation.valid) {
      errors.address = addressValidation.error;
    }
  }
  
  if (profile.city) {
    if (profile.city.length > 100) {
      errors.city = 'City is too long (maximum 100 characters)';
    }
  }
  
  if (profile.region) {
    if (profile.region.length > 100) {
      errors.region = 'State/Region is too long (maximum 100 characters)';
    }
  }
  
  if (profile.country) {
    if (profile.country.length > 100) {
      errors.country = 'Country is too long (maximum 100 characters)';
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

