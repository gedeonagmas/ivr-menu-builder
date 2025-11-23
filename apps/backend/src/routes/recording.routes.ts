import { Router } from 'express';
import { prisma } from '../database/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';

export const recordingRoutes = Router();

recordingRoutes.use(authenticate);

// Get all recordings for organization
recordingRoutes.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { page = 1, limit = 50, callId, workflowId } = req.query;

    const recordings = await prisma.recording.findMany({
      where: {
        organizationId: req.user!.organizationId || undefined,
        ...(callId && { callId: callId as string }),
        ...(workflowId && { workflowId: workflowId as string }),
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
      include: {
        call: {
          select: {
            id: true,
            fromNumber: true,
            toNumber: true,
            startedAt: true,
          },
        },
        workflow: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const total = await prisma.call.count({
      where: {
        organizationId: req.user!.organizationId || undefined,
        ...(callId && { callId: callId as string }),
        ...(workflowId && { workflowId: workflowId as string }),
      },
    });

    res.json({
      recordings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single recording
recordingRoutes.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const recording = await prisma.recording.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId || undefined,
      },
      include: {
        call: true,
        workflow: true,
      },
    });

    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }

    res.json({ recording });
  } catch (error) {
    next(error);
  }
});

