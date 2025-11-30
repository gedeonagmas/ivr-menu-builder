import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../database/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';
import { twilioService } from '../services/twilio.service.js';
import { fusionpbxService } from '../services/fusionpbx.service.js';

export const callRoutes = Router();

callRoutes.use(authenticate);

// Get all calls for organization
callRoutes.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { page = 1, limit = 50, workflowId, status } = req.query;

    const calls = await prisma.call.findMany({
      where: {
        organizationId: req.user!.organizationId || undefined,
        ...(workflowId && { workflowId: workflowId as string }),
        ...(status && { status: status as string }),
      },
      orderBy: { startedAt: 'desc' },
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
      include: {
        workflow: {
          select: {
            id: true,
            name: true,
          },
        },
        phoneNumber: {
          select: {
            id: true,
            number: true,
          },
        },
      },
    });

    const total = await prisma.call.count({
      where: {
        organizationId: req.user!.organizationId || undefined,
        ...(workflowId && { workflowId: workflowId as string }),
        ...(status && { status: status as string }),
      },
    });

    res.json({
      calls,
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

// Get single call with events
callRoutes.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const call = await prisma.call.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId || undefined,
      },
      include: {
        workflow: true,
        phoneNumber: true,
        events: {
          orderBy: { timestamp: 'asc' },
        },
        recordings: true,
      },
    });

    if (!call) {
      throw new AppError('Call not found', 404);
    }

    res.json({ call });
  } catch (error) {
    next(error);
  }
});

// Make outbound call
callRoutes.post(
  '/',
  [
    body('to').isMobilePhone(),
    body('workflowId').isUUID(),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { to, workflowId } = req.body;

      // Get workflow
      const workflow = await prisma.workflow.findFirst({
        where: {
          id: workflowId,
          organizationId: req.user!.organizationId || undefined,
          isActive: true,
        },
      });

      if (!workflow || (!workflow.twilioFlowSid && !workflow.fusionpbxDialplanUuid)) {
        throw new AppError('Workflow not found or not deployed', 404);
      }

      // Get organization phone number
      const phoneNumber = await prisma.phoneNumber.findFirst({
        where: {
          organizationId: req.user!.organizationId!,
          isActive: true,
        },
      });

      if (!phoneNumber) {
        throw new AppError('No active phone number configured', 400);
      }

      // Create call record
      const call = await prisma.call.create({
        data: {
          workflowId: workflow.id,
          phoneNumberId: phoneNumber.id,
          organizationId: req.user!.organizationId!,
          userId: req.user!.id,
          fromNumber: phoneNumber.number,
          toNumber: to,
          status: 'INITIATED',
        },
      });

      let updatedCall;

      if (workflow.deploymentType === 'fusionpbx' && workflow.fusionpbxDialplanUuid) {
        // Make call via FusionPBX
        const fusionpbxCallUuid = await fusionpbxService.makeCall(
          phoneNumber.number,
          to,
          workflow.fusionpbxDialplanUuid,
          { callId: call.id },
        );

        // Update call with FusionPBX UUID
        updatedCall = await prisma.call.update({
          where: { id: call.id },
          data: { fusionpbxCallUuid: fusionpbxCallUuid },
        });
      } else if (workflow.twilioFlowSid) {
        // Make call via Twilio
        const workflowUrl = `${process.env.WEBHOOK_BASE_URL}/api/webhooks/execute-flow/${workflow.twilioFlowSid}`;
        const twilioCallSid = await twilioService.makeCall(
          phoneNumber.number,
          to,
          workflowUrl,
          { callId: call.id },
        );

        // Update call with Twilio SID
        updatedCall = await prisma.call.update({
          where: { id: call.id },
          data: { twilioCallSid: twilioCallSid },
        });
      } else {
        throw new AppError('No valid deployment found for workflow', 400);
      }

      res.status(201).json({ call: updatedCall });
    } catch (error) {
      next(error);
    }
  },
);

