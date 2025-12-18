/**
 * Encryption Utility
 * 
 * Provides AES-GCM encryption for local data storage.
 * Uses Web Crypto API for secure, browser-native encryption.
 * 
 * Security:
 * - AES-GCM 256-bit encryption
 * - Key derived from device fingerprint (unique per device)
 * - No keys stored in plaintext
 * - Salt and IV generated per encryption
 */

/**
 * Derive encryption key from device fingerprint
 * Uses PBKDF2 with 100,000 iterations for key derivation
 */
async function deriveEncryptionKey(deviceFingerprint: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const fingerprintBytes = encoder.encode(deviceFingerprint);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    fingerprintBytes,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Create a new ArrayBuffer from the salt to ensure proper typing
  const saltArray = new Uint8Array(salt);
  const saltBuffer = saltArray.buffer.slice(saltArray.byteOffset, saltArray.byteOffset + saltArray.byteLength);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a random salt
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Generate a random IV (Initialization Vector)
 */
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for GCM
}

/**
 * Encrypt data using AES-GCM
 * 
 * @param data - Plaintext data to encrypt
 * @param deviceFingerprint - Device fingerprint for key derivation
 * @returns Encrypted data as base64 string (format: salt:iv:encryptedData)
 */
export async function encryptData(data: string, deviceFingerprint: string): Promise<string> {
  try {
    const salt = generateSalt();
    const iv = generateIV();
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    const key = await deriveEncryptionKey(deviceFingerprint, salt);
    // Create a new Uint8Array from IV to ensure proper buffer type
    const ivArray = new Uint8Array(iv);
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: ivArray,
      },
      key,
      dataBuffer
    );

    // Combine salt, IV, and encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    // Convert to base64 for storage
    // Use Array.from for large arrays to avoid "Maximum call stack size exceeded"
    const binaryString = Array.from(combined, byte => String.fromCharCode(byte)).join('');
    return btoa(binaryString);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data using AES-GCM
 * 
 * @param encryptedData - Base64 encrypted data (format: salt:iv:encryptedData)
 * @param deviceFingerprint - Device fingerprint for key derivation
 * @returns Decrypted plaintext string
 */
export async function decryptData(encryptedData: string, deviceFingerprint: string): Promise<string> {
  try {
    // Decode from base64
    const binaryString = atob(encryptedData);
    const combined = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      combined[i] = binaryString.charCodeAt(i);
    }

    // Extract salt, IV, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);

    const key = await deriveEncryptionKey(deviceFingerprint, salt);
    
    // Create a new ArrayBuffer from encrypted to ensure proper typing
    const encryptedArray = new Uint8Array(encrypted);
    const encryptedBuffer = encryptedArray.buffer.slice(encryptedArray.byteOffset, encryptedArray.byteOffset + encryptedArray.byteLength);
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data. Data may be corrupted or encrypted with different device.');
  }
}

/**
 * Check if a string is encrypted (base64 format check)
 */
export function isEncrypted(data: string): boolean {
  try {
    // Encrypted data is base64, try to decode
    const decoded = atob(data);
    // Encrypted data should be at least salt + IV length (28 bytes)
    return decoded.length >= 28;
  } catch {
    return false;
  }
}
