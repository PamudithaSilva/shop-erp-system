import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { IUser } from '../models/User';
import { generateResetToken, hashToken } from '../utils/token';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
};

const signToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id, role: user.role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = await User.create({ name, email: normalizedEmail, password, role });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: signToken(user),
    });
  } catch (error) {
    throw error;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.isActive || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (role && role !== user.role) {
      res.status(403).json({
        message: role === 'admin' ? 'Admin access only' : 'Please use the Admin Login tab for this account',
      });
      return;
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: signToken(user),
    });
  } catch (error) {
    throw error;
  }
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
};

// ─── Password Reset ───────────────────────────────────────────────────────────

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 *
 * Generates a reset token, saves the SHA-256 hash to the user document,
 * and returns the raw token in the response (dev mode).
 * In production, send the token via email instead.
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email });
    // Always return 200 to avoid user-enumeration attacks
    if (!user) {
      res.json({ message: 'If that email exists, a reset token has been generated.' });
      return;
    }

    const { rawToken, hashedToken } = generateResetToken();

    user.resetPasswordToken   = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    console.log(`[DEV] Password reset token for ${email}: ${rawToken}`);

    const response: { message: string; resetToken?: string } = {
      message: 'Reset token generated successfully.',
    };
    if (process.env.NODE_ENV !== 'production') response.resetToken = rawToken;
    res.json(response);
  } catch (error) {
    throw error;
  }
};

/**
 * POST /api/auth/reset-password
 * Body: { token, password }
 *
 * Validates the raw token against the stored hash, checks expiry,
 * updates the password, and clears the reset fields.
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ message: 'Token and new password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }

    const hashedToken = hashToken(token);

    const user = await User.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }

    user.password             = password;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    throw error;
  }
};
