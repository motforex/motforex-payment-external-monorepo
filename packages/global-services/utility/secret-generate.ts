import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-ctr';
const IV_LENGTH = 16; // Initialization Vector length

// Encrypt a number
export function encryptSecret(number: number, key: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
  const encryptedBuffer = Buffer.concat([cipher.update(number.toString()), cipher.final()]);
  return iv.toString('hex') + ':' + encryptedBuffer.toString('hex');
}

// Decrypt a number
export function decryptSecret(encryptedText: string, key: string): number {
  const [ivHex, encryptedHex] = encryptedText.split(':');

  if (!ivHex || !encryptedHex) {
    throw new Error('Invalid encrypted format');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const encryptedBuffer = Buffer.from(encryptedHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
  const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
  return parseFloat(decrypted.toString());
}
