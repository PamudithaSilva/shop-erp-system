import crypto from 'crypto';

/**
 * Generates a password-reset token pair.
 * @returns rawToken  – send this to the user (via email or response body in dev)
 * @returns hashedToken – store this in the database
 */
export const generateResetToken = (): {
  rawToken: string;
  hashedToken: string;
} => {
  const rawToken    = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
};

/**
 * Hashes an incoming raw token so it can be compared against the stored hash.
 */
export const hashToken = (rawToken: string): string =>
  crypto.createHash('sha256').update(rawToken).digest('hex');
