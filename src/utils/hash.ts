import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * @author Member A
 * @param {string} password 
 * @returns {Promise<string>} 
 */

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}