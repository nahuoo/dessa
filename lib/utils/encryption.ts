import CryptoJS from 'crypto-js';

/**
 * Utilidad para cifrar y descifrar datos sensibles
 * Usa AES-256 para el cifrado simétrico
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';

if (!ENCRYPTION_KEY) {
  console.error('ENCRYPTION_KEY no está definida en las variables de entorno');
  throw new Error('ENCRYPTION_KEY no está definida en las variables de entorno');
}

/**
 * Cifra un string usando AES-256
 * @param text - Texto plano a cifrar
 * @returns String cifrado en formato Base64
 */
export function encrypt(text: string): string {
  if (!text) return '';

  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Error al cifrar:', error);
    throw new Error('Error al cifrar los datos');
  }
}

/**
 * Descifra un string cifrado con AES-256
 * @param encryptedText - Texto cifrado en Base64
 * @returns Texto plano descifrado
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';

  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Error al descifrar:', error);
    throw new Error('Error al descifrar los datos');
  }
}

/**
 * Cifra un objeto completo, cifrando solo los campos sensibles especificados
 * @param data - Objeto con datos
 * @param sensitiveFields - Array de nombres de campos a cifrar
 * @returns Objeto con campos sensibles cifrados
 */
export function encryptObject<T extends Record<string, unknown>>(
  data: T,
  sensitiveFields: (keyof T)[]
): T {
  const encrypted = { ...data };

  sensitiveFields.forEach((field) => {
    const value = data[field];
    if (typeof value === 'string' && value) {
      encrypted[field] = encrypt(value) as T[keyof T];
    }
  });

  return encrypted;
}

/**
 * Descifra un objeto, descifrando solo los campos sensibles especificados
 * @param data - Objeto con datos cifrados
 * @param sensitiveFields - Array de nombres de campos a descifrar
 * @returns Objeto con campos sensibles descifrados
 */
export function decryptObject<T extends Record<string, unknown>>(
  data: T,
  sensitiveFields: (keyof T)[]
): T {
  const decrypted = { ...data };

  sensitiveFields.forEach((field) => {
    const value = data[field];
    if (typeof value === 'string' && value) {
      decrypted[field] = decrypt(value) as T[keyof T];
    }
  });

  return decrypted;
}

/**
 * Genera un hash SHA-256 de un string (para prompts de IA, etc.)
 * @param text - Texto a hashear
 * @returns Hash SHA-256 en formato hex
 */
export function hash(text: string): string {
  return CryptoJS.SHA256(text).toString(CryptoJS.enc.Hex);
}
