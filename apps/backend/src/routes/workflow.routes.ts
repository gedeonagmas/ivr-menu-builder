import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../database/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';
import { workflowExecutionEngine } from '../services/workflow-execution-engine.js';
import { twilioService } from '../services/twilio.service.js';
import { fusionpbxService } from '../services/fusionpbx.service.js';
import { logger } from '../utils/logger.js';

export const workflowRoutes = Router();

// All routes require authentication
workflowRoutes.use(authenticate);

// Get all workflows for user's organization
workflowRoutes.get('/', async (req: AuthRequest, res, next) => {
  try {
    const workflows = await prisma.workflow.findMany({
      where: {
        organizationId: req.user!.organizationId || undefined,
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        version: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ workflows });
  } catch (error) {
    next(error);
  }
});

// Get single workflow
workflowRoutes.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId || undefined,
      },
    });

    if (!workflow) {
      throw new AppError('Workflow not found', 404);
    }

    res.json({ workflow });
  } catch (error) {
    next(error);
  }
});

// Create workflow
workflowRoutes.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('diagram').isObject(),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, diagram } = req.body;

      logger.info('POST /api/workflows - Creating workflow', {
        name,
        nodeCount: diagram?.nodes?.length || 0,
        edgeCount: diagram?.edges?.length || 0,
        nodeTypes: diagram?.nodes?.map((n: any) => n.data?.type) || []
      });

      const workflow = await prisma.workflow.create({
        data: {
          name,
          description,
          diagram: diagram as any,
          organizationId: req.user!.organizationId!,
          userId: req.user!.id,
        },
      });

      // Create IVR menu in FusionPBX if diagram has gather-input nodes with menuOptions
      try {
        logger.info('Checking for IVR menu nodes in workflow', {
          nodeCount: diagram.nodes?.length || 0,
          nodes: diagram.nodes?.map((n: any) => ({
            id: n.id,
            type: n.data?.type,
            hasMenuOptions: !!n.data?.properties?.menuOptions,
            extension: n.data?.properties?.extension,
            menuOptionsType: typeof n.data?.properties?.menuOptions,
            menuOptionsCount: Array.isArray(n.data?.properties?.menuOptions) ? n.data.properties.menuOptions.length : 
                           (typeof n.data?.properties?.menuOptions === 'string' ? 'string' : 0)
          }))
        });

        // Check for ivr-menu nodes or gather-input nodes with menuOptions
        const ivrMenuNode = diagram.nodes?.find((n: any) => n.data?.type === 'ivr-menu');
        const hasGatherInputWithMenu = diagram.nodes?.some((n: any) => {
          if (n.data?.type !== 'gather-input') return false;
          
          const menuOptions = n.data?.properties?.menuOptions;
          if (!menuOptions) return false;
          
          // Handle both string (JSON) and array formats
          let parsedOptions: any[] = [];
          if (typeof menuOptions === 'string') {
            try {
              parsedOptions = JSON.parse(menuOptions);
            } catch (e) {
              logger.warn('Failed to parse menuOptions as JSON', { error: e, menuOptions });
              return false;
            }
          } else if (Array.isArray(menuOptions)) {
            parsedOptions = menuOptions;
          } else {
            return false;
          }
          
          return parsedOptions.length > 0;
        });

        const hasIvrMenu = !!ivrMenuNode;
        logger.info('IVR menu check result', { 
          hasIvrMenu, 
          hasGatherInputWithMenu, 
          ivrMenuNodeId: ivrMenuNode?.id,
          ivrMenuNodeProps: ivrMenuNode ? {
            extension: ivrMenuNode.data?.properties?.extension,
            hasMenuOptions: !!ivrMenuNode.data?.properties?.menuOptions,
            menuOptionsType: typeof ivrMenuNode.data?.properties?.menuOptions
          } : null
        });

        if (hasIvrMenu || hasGatherInputWithMenu) {
          // If we have an ivr-menu node, use its properties
          let extension = '1000';
          let context = 'default';
          let menuName = name;
          
          if (ivrMenuNode) {
            const props = ivrMenuNode.data?.properties || {};
            extension = props.extension || extension;
            context = props.context || context;
            menuName = props.label || name;
          }
          
          const ivrMenuUuid = await fusionpbxService.createOrUpdateIvrMenu(
            workflow.fusionpbxIvrMenuUuid || undefined,
            menuName,
            diagram,
            extension,
            context,
          );

          // Update workflow with IVR menu UUID
          await prisma.workflow.update({
            where: { id: workflow.id },
            data: { fusionpbxIvrMenuUuid: ivrMenuUuid },
          });

          workflow.fusionpbxIvrMenuUuid = ivrMenuUuid;
        }
      } catch (ivrError: any) {
        // Log error but don't fail the workflow creation
        logger.error('Failed to create IVR menu', { 
          error: ivrError.message,
          stack: ivrError.stack,
          response: ivrError.response?.data,
          status: ivrError.response?.status,
          workflowId: workflow.id,
          diagram: JSON.stringify(diagram).substring(0, 200)
        });
      }

      res.status(201).json({ workflow });
    } catch (error) {
      next(error);
    }
  },
);

// Update workflow
workflowRoutes.put(
  '/:id',
  [body('name').optional().trim().notEmpty(), body('diagram').optional().isObject()],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const workflow = await prisma.workflow.findFirst({
        where: {
          id: req.params.id,
          organizationId: req.user!.organizationId || undefined,
        },
      });

      if (!workflow) {
        throw new AppError('Workflow not found', 404);
      }

      const updatedDiagram = req.body.diagram || workflow.diagram;
      const updatedName = req.body.name || workflow.name;

      const updated = await prisma.workflow.update({
        where: { id: req.params.id },
        data: {
          ...(req.body.name && { name: req.body.name }),
          ...(req.body.description !== undefined && { description: req.body.description }),
          ...(req.body.diagram && { diagram: req.body.diagram }),
          version: workflow.version + 1,
        },
      });

      // Update IVR menu in FusionPBX if diagram has ivr-menu nodes or gather-input nodes with menuOptions
      try {
        const ivrMenuNode = updatedDiagram.nodes?.find((n: any) => n.data?.type === 'ivr-menu');
        const hasGatherInputWithMenu = updatedDiagram.nodes?.some((n: any) => {
          if (n.data?.type !== 'gather-input') return false;
          
          const menuOptions = n.data?.properties?.menuOptions;
          if (!menuOptions) return false;
          
          // Handle both string (JSON) and array formats
          let parsedOptions: any[] = [];
          if (typeof menuOptions === 'string') {
            try {
              parsedOptions = JSON.parse(menuOptions);
            } catch (e) {
              logger.warn('Failed to parse menuOptions as JSON', { error: e, menuOptions });
              return false;
            }
          } else if (Array.isArray(menuOptions)) {
            parsedOptions = menuOptions;
          } else {
            return false;
          }
          
          return parsedOptions.length > 0;
        });

        const hasIvrMenu = !!ivrMenuNode;
        if (hasIvrMenu || hasGatherInputWithMenu) {
          // If we have an ivr-menu node, use its properties
          let extension = '1000';
          let context = 'default';
          let menuName = updatedName;
          
          if (ivrMenuNode) {
            const props = ivrMenuNode.data?.properties || {};
            extension = props.extension || extension;
            context = props.context || context;
            menuName = props.label || updatedName;
          }
          
          const ivrMenuUuid = await fusionpbxService.createOrUpdateIvrMenu(
            workflow.fusionpbxIvrMenuUuid || undefined,
            menuName,
            updatedDiagram,
            extension,
            context,
          );

          // Update workflow with IVR menu UUID if it changed
          if (ivrMenuUuid !== workflow.fusionpbxIvrMenuUuid) {
            await prisma.workflow.update({
              where: { id: workflow.id },
              data: { fusionpbxIvrMenuUuid: ivrMenuUuid },
            });
            updated.fusionpbxIvrMenuUuid = ivrMenuUuid;
          }
        } else if (workflow.fusionpbxIvrMenuUuid) {
          // If menu options were removed, delete the IVR menu
          await fusionpbxService.deleteIvrMenu(workflow.fusionpbxIvrMenuUuid);
          await prisma.workflow.update({
            where: { id: workflow.id },
            data: { fusionpbxIvrMenuUuid: null },
          });
          updated.fusionpbxIvrMenuUuid = null;
        }
      } catch (ivrError: any) {
        // Log error but don't fail the workflow update
        logger.error('Failed to update IVR menu', { 
          error: ivrError.message,
          stack: ivrError.stack,
          response: ivrError.response?.data,
          status: ivrError.response?.status,
          workflowId: workflow.id,
          diagram: JSON.stringify(updatedDiagram).substring(0, 200)
        });
      }

      res.json({ workflow: updated });
    } catch (error) {
      next(error);
    }
  },
);

// Deploy workflow to Twilio or FusionPBX
workflowRoutes.post('/:id/deploy', async (req: AuthRequest, res, next) => {
  try {
    const { deploymentType = 'fusionpbx', phoneNumberId } = req.body; // Default to FusionPBX

    const workflow = await prisma.workflow.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId || undefined,
      },
    });

    if (!workflow) {
      throw new AppError('Workflow not found', 404);
    }

    let updated;

    if (deploymentType === 'fusionpbx') {
      // Deploy to FusionPBX
      const fusionpbxFlow = await workflowExecutionEngine.convertToFusionPBXFlow(workflow.diagram as any);

      // If phoneNumberId is provided, get the phone number for inbound routing
      let phoneNumber: string | undefined;
      let context: 'default' | 'public' = 'default';
      if (phoneNumberId) {
        const phone = await prisma.phoneNumber.findFirst({
          where: {
            id: phoneNumberId,
            organizationId: req.user!.organizationId || undefined,
          },
        });
        if (phone) {
          phoneNumber = phone.number;
          // If it's a 4-digit extension (like 2000), use 'default' context
          // Otherwise use 'public' for full phone numbers
          context = /^\d{3,4}$/.test(phone.number) ? 'default' : 'public';
        }
      }

      const fusionpbxDialplanUuid = await fusionpbxService.createOrUpdateFlow(
        workflow.fusionpbxDialplanUuid || undefined,
        workflow.name,
        fusionpbxFlow,
        phoneNumber ? { phoneNumber, context } : undefined,
      );

      // Update workflow
      updated = await prisma.workflow.update({
        where: { id: req.params.id },
        data: {
          fusionpbxDialplanUuid,
          deploymentType: 'fusionpbx',
          isActive: true,
          status: 'ACTIVE',
        },
      });

      // Associate phone number with workflow if provided
      if (phoneNumberId) {
        await prisma.phoneNumber.update({
          where: { id: phoneNumberId },
          data: { workflowId: workflow.id },
        });
      }

      // Create deployment record
      await prisma.deployment.create({
        data: {
          workflowId: workflow.id,
          version: workflow.version,
          deployedBy: req.user!.id,
          status: 'SUCCESS',
        },
      });

      res.json({ workflow: updated, fusionpbxDialplanUuid, phoneNumber });
    } else {
      // Deploy to Twilio (existing functionality)
      const twilioFlow = await workflowExecutionEngine.convertToTwilioFlow(workflow.diagram as any);

      const twilioFlowSid = await twilioService.createOrUpdateFlow(
        workflow.twilioFlowSid || undefined,
        workflow.name,
        twilioFlow,
      );

      // Update workflow
      updated = await prisma.workflow.update({
        where: { id: req.params.id },
        data: {
          twilioFlowSid,
          deploymentType: 'twilio',
          isActive: true,
          status: 'ACTIVE',
        },
      });

      // Create deployment record
      await prisma.deployment.create({
        data: {
          workflowId: workflow.id,
          version: workflow.version,
          deployedBy: req.user!.id,
          status: 'SUCCESS',
        },
      });

      res.json({ workflow: updated, twilioFlowSid });
    }
  } catch (error) {
    next(error);
  }
});

// Delete workflow
workflowRoutes.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId || undefined,
      },
    });

    if (!workflow) {
      throw new AppError('Workflow not found', 404);
    }

    // If deployed, delete from appropriate service
    if (workflow.twilioFlowSid) {
      await twilioService.deleteFlow(workflow.twilioFlowSid);
    }
    if (workflow.fusionpbxDialplanUuid) {
      await fusionpbxService.deleteFlow(workflow.fusionpbxDialplanUuid);
    }
    if (workflow.fusionpbxIvrMenuUuid) {
      await fusionpbxService.deleteIvrMenu(workflow.fusionpbxIvrMenuUuid);
    }

    await prisma.workflow.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Workflow deleted' });
  } catch (error) {
    next(error);
  }
});

