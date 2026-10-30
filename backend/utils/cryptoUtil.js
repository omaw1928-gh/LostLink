const crypto = require('crypto');

// Derive 32-byte key from environment or fallback
const getKey = () => {
  const secret = process.env.MFA_ENCRYPTION_KEY || process.env.JWT_SECRET || 'lostlink_default_mfa_enc_key_32_bytes!';
  return crypto.createHash('sha256').update(String(secret)).digest();
};

/**
 * Encrypt plaintext using AES-256-GCM
 * Output format: iv:authTag:encryptedHex
 */
const encrypt = (plainText) => {
  if (!plainText) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypt ciphertext using AES-256-GCM
 */
const decrypt = (cipherText) => {
  if (!cipherText) return '';
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) {
      // Legacy unencrypted string fallback
      return cipherText;
    }
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('[CryptoUtil Error] Decryption failed:', err.message);
    return null;
  }
};

module.exports = {
  encrypt,
  decrypt,
};
