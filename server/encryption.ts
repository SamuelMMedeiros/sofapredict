import crypto from "crypto";

/**
 * Encryption utilities for sensitive data (API keys, credentials)
 * Uses AES-256-GCM for authenticated encryption
 */

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Derive encryption key from master key
 */
function getEncryptionKey(): Buffer {
  const masterKey = process.env.ENCRYPTION_MASTER_KEY;
  if (!masterKey) {
    throw new Error("ENCRYPTION_MASTER_KEY environment variable not set");
  }

  // Derive a consistent key from the master key
  return crypto
    .createHash("sha256")
    .update(masterKey)
    .digest();
}

/**
 * Encrypt sensitive data (API keys, etc.)
 */
export function encryptData(plaintext: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    // Combine IV + authTag + encrypted data
    const combined = iv.toString("hex") + authTag.toString("hex") + encrypted;
    return combined;
  } catch (error) {
    console.error("[Encryption] Failed to encrypt data:", error);
    throw new Error("Encryption failed");
  }
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encrypted: string): string {
  try {
    const key = getEncryptionKey();

    // Extract IV, authTag, and encrypted data
    const iv = Buffer.from(encrypted.slice(0, IV_LENGTH * 2), "hex");
    const authTag = Buffer.from(
      encrypted.slice(IV_LENGTH * 2, IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2),
      "hex"
    );
    const encryptedData = encrypted.slice(IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2);

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("[Encryption] Failed to decrypt data:", error);
    throw new Error("Decryption failed");
  }
}

/**
 * Hash sensitive data for comparison (one-way)
 */
export function hashData(data: string): string {
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex");
}

/**
 * Verify hashed data
 */
export function verifyHash(data: string, hash: string): boolean {
  return hashData(data) === hash;
}

/**
 * Generate a secure random token
 */
export function generateToken(length: number = 32): string {
  return crypto
    .randomBytes(length)
    .toString("hex");
}

/**
 * Mask sensitive data for logging (show only last 4 chars)
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) {
    return "*".repeat(data.length);
  }
  return "*".repeat(data.length - visibleChars) + data.slice(-visibleChars);
}
