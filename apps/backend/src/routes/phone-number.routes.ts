import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../database/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';
import { twilioService } from '../services/twilio.service.js';

export const phoneNumberRoutes = Router();

phoneNumberRoutes.use(authenticate);

// Get all phone numbers for organization
phoneNumberRoutes.get('/', async (req: AuthRequest, res, next) => {
  try {
    const phoneNumbers = await prisma.phoneNumber.findMany({
      where: {
        organizationId: req.user!.organizationId || undefined,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ phoneNumbers });
  } catch (error) {
    next(error);
  }
});

// Create phone number directly (for FusionPBX extensions, etc.)
phoneNumberRoutes.post(
  '/',
  [
    body('number').isString().notEmpty(),
    body('friendlyName').optional().isString(),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { number, friendlyName } = req.body;

      // Handle guest mode - create or get guest organization
      let organizationId = req.user!.organizationId;
      if (req.user!.role === 'GUEST' || !organizationId) {
        // Get or create guest organization
        let guestOrg = await prisma.organization.findFirst({
          where: { subdomain: 'guest' },
        });
        if (!guestOrg) {
          guestOrg = await prisma.organization.create({
            data: {
              name: 'Guest Organization',
              subdomain: 'guest',
            },
          });
        }
        organizationId = guestOrg.id;
      }

      if (!organizationId) {
        throw new AppError('Organization required', 400);
      }

      // Check if number already exists
      const existing = await prisma.phoneNumber.findUnique({
        where: { number },
      });

      if (existing) {
        throw new AppError('Phone number already exists', 400);
      }

      // Create phone number
      const phoneNumber = await prisma.phoneNumber.create({
        data: {
          number,
          organizationId,
          friendlyName: friendlyName || undefined,
          isActive: true,
        },
      });

      res.status(201).json({ phoneNumber });
    } catch (error) {
      next(error);
    }
  },
);

// Purchase new phone number
phoneNumberRoutes.post(
  '/purchase',
  [body('areaCode').isLength({ min: 3, max: 3 }).isNumeric()],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { areaCode } = req.body;

      if (!req.user!.organizationId) {
        throw new AppError('Organization required to purchase phone numbers', 400);
      }

      // Purchase from Twilio
      const twilioNumber = await twilioService.purchasePhoneNumber(areaCode);

      // Save to database
      const phoneNumber = await prisma.phoneNumber.create({
        data: {
          number: twilioNumber.phoneNumber,
          organizationId: req.user!.organizationId,
          twilioSid: twilioNumber.sid,
          friendlyName: twilioNumber.friendlyName || undefined,
        },
      });

      res.status(201).json({ phoneNumber });
    } catch (error) {
      next(error);
    }
  },
);

// Update phone number
phoneNumberRoutes.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const phoneNumber = await prisma.phoneNumber.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId || undefined,
      },
    });

    if (!phoneNumber) {
      throw new AppError('Phone number not found', 404);
    }

    const updated = await prisma.phoneNumber.update({
      where: { id: req.params.id },
      data: {
        ...(req.body.friendlyName !== undefined && { friendlyName: req.body.friendlyName }),
        ...(req.body.isActive !== undefined && { isActive: req.body.isActive }),
      },
    });

    res.json({ phoneNumber: updated });
  } catch (error) {
    next(error);
  }
});

// Delete phone number
phoneNumberRoutes.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const phoneNumber = await prisma.phoneNumber.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId || undefined,
      },
    });

    if (!phoneNumber) {
      throw new AppError('Phone number not found', 404);
    }

    // Release from Twilio
    if (phoneNumber.twilioSid) {
      // Twilio doesn't have a direct release API, but you can update it
      // In production, you might want to keep the number but just deactivate it
    }

    await prisma.phoneNumber.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Phone number deleted' });
  } catch (error) {
    next(error);
  }
});

