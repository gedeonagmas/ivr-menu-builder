import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const authRoutes = Router();

// Register
authRoutes.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').optional().trim(),
    body('organizationName').optional().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, organizationName } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new AppError('User already exists', 400);
      }

      // Create organization if provided
      let organizationId: string | undefined;
      if (organizationName) {
        const subdomain = organizationName.toLowerCase().replace(/\s+/g, '-');
        const organization = await prisma.organization.create({
          data: {
            name: organizationName,
            subdomain,
          },
        });
        organizationId = organization.id;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          organizationId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          organizationId: true,
          role: true,
        },
      });

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
      );

      res.status(201).json({
        user,
        token,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Login
authRoutes.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.isActive) {
        throw new AppError('Invalid credentials', 401);
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
      );

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          organizationId: user.organizationId,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get current user
authRoutes.get('/me', authenticate, async (req: any, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        organizationId: true,
        role: true,
        organization: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
      },
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

