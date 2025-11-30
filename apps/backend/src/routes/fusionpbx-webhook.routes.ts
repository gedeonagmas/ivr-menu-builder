import { Router } from 'express';
import { prisma } from '../database/prisma.js';
import { logger } from '../utils/logger.js';

export const fusionpbxWebhookRoutes = Router();

// FusionPBX call status webhook
fusionpbxWebhookRoutes.post('/call-status', async (req, res) => {
  try {
    const { 
      call_uuid, 
      call_state, 
      caller_id_number, 
      destination_number, 
      call_duration,
      hangup_cause,
      answer_stamp,
      end_stamp
    } = req.body;

    logger.info('FusionPBX call status webhook received', {
      call_uuid,
      call_state,
      caller_id_number,
      destination_number,
      hangup_cause
    });

    // Find call by FusionPBX UUID
    const call = await prisma.call.findUnique({
      where: { fusionpbxCallUuid: call_uuid },
    });

    if (call) {
      const updateData: any = {
        status: mapFusionPBXStatusToCallStatus(call_state),
      };

      // Add duration if call is completed
      if (call_duration) {
        updateData.duration = parseInt(call_duration);
      }

      // Add end time if call is completed
      if (end_stamp && (call_state === 'CS_DESTROY' || call_state === 'CS_HANGUP')) {
        updateData.endedAt = new Date(end_stamp);
      }

      await prisma.call.update({
        where: { id: call.id },
        data: updateData,
      });

      // Create call event
      await prisma.callEvent.create({
        data: {
          callId: call.id,
          eventType: 'status-change',
          data: {
            call_state,
            hangup_cause,
            caller_id_number,
            destination_number
          },
        },
      });
    }

    res.status(200).send('OK');
  } catch (error: any) {
    logger.error('Error processing FusionPBX call status webhook', { error: error.message });
    res.status(500).send('Error');
  }
});

// FusionPBX recording webhook
fusionpbxWebhookRoutes.post('/recording-status', async (req, res) => {
  try {
    const {
      call_uuid,
      recording_uuid,
      recording_path,
      recording_duration,
      recording_status
    } = req.body;

    logger.info('FusionPBX recording webhook received', {
      call_uuid,
      recording_uuid,
      recording_status,
    });

    // Find call
    const call = await prisma.call.findUnique({
      where: { fusionpbxCallUuid: call_uuid },
    });

    if (call && recording_uuid && recording_status === 'completed') {
      await prisma.recording.create({
        data: {
          callId: call.id,
          workflowId: call.workflowId,
          userId: call.userId || undefined,
          organizationId: call.organizationId,
          fusionpbxSid: recording_uuid,
          url: recording_path,
          duration: recording_duration ? parseInt(recording_duration) : null,
        },
      });

      // Create call event
      await prisma.callEvent.create({
        data: {
          callId: call.id,
          eventType: 'recording-completed',
          data: {
            recording_uuid,
            recording_path,
            recording_duration
          },
        },
      });
    }

    res.status(200).send('OK');
  } catch (error: any) {
    logger.error('Error processing FusionPBX recording webhook', { error: error.message });
    res.status(500).send('Error');
  }
});

// FusionPBX DTMF input webhook
fusionpbxWebhookRoutes.post('/dtmf-input', async (req, res) => {
  try {
    const { 
      call_uuid, 
      dtmf_digits, 
      variable_name 
    } = req.body;

    logger.info('FusionPBX DTMF input webhook received', {
      call_uuid,
      dtmf_digits,
      variable_name,
    });

    const call = await prisma.call.findUnique({
      where: { fusionpbxCallUuid: call_uuid },
    });

    if (call) {
      await prisma.callEvent.create({
        data: {
          callId: call.id,
          eventType: 'input-received',
          data: {
            digits: dtmf_digits,
            variable_name: variable_name,
            input_type: 'dtmf'
          },
        },
      });
    }

    // Return XML response to continue call flow
    res.type('text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<document type="freeswitch/xml">
  <section name="result">
    <result status="success"/>
  </section>
</document>`);
  } catch (error: any) {
    logger.error('Error processing FusionPBX DTMF input webhook', { error: error.message });
    res.status(500).send('Error');
  }
});

// FusionPBX speech recognition webhook
fusionpbxWebhookRoutes.post('/speech-input', async (req, res) => {
  try {
    const { 
      call_uuid, 
      speech_result, 
      confidence_score,
      variable_name 
    } = req.body;

    logger.info('FusionPBX speech input webhook received', {
      call_uuid,
      speech_result,
      confidence_score,
    });

    const call = await prisma.call.findUnique({
      where: { fusionpbxCallUuid: call_uuid },
    });

    if (call) {
      await prisma.callEvent.create({
        data: {
          callId: call.id,
          eventType: 'input-received',
          data: {
            speech: speech_result,
            confidence: confidence_score,
            variable_name: variable_name,
            input_type: 'speech'
          },
        },
      });
    }

    // Return XML response to continue call flow
    res.type('text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<document type="freeswitch/xml">
  <section name="result">
    <result status="success"/>
  </section>
</document>`);
  } catch (error: any) {
    logger.error('Error processing FusionPBX speech input webhook', { error: error.message });
    res.status(500).send('Error');
  }
});

// FusionPBX dialplan execution webhook (for workflow flow control)
fusionpbxWebhookRoutes.post('/execute-flow/:dialplan_uuid', async (req, res) => {
  try {
    const { dialplan_uuid } = req.params;
    const { 
      call_uuid,
      caller_id_number,
      destination_number,
      context,
      current_application
    } = req.body;

    logger.info('FusionPBX execute flow webhook received', {
      dialplan_uuid,
      call_uuid,
      caller_id_number,
      destination_number,
    });

    // Find workflow by dialplan UUID
    const workflow = await prisma.workflow.findFirst({
      where: { fusionpbxDialplanUuid: dialplan_uuid },
    });

    if (workflow) {
      // Create or update call record
      let call = await prisma.call.findUnique({
        where: { fusionpbxCallUuid: call_uuid },
      });

      if (!call) {
        // Create new call record for incoming call
        call = await prisma.call.create({
          data: {
            workflowId: workflow.id,
            organizationId: workflow.organizationId,
            fusionpbxCallUuid: call_uuid,
            fromNumber: caller_id_number,
            toNumber: destination_number,
            status: 'IN_PROGRESS',
          },
        });
      }

      // Create call event
      await prisma.callEvent.create({
        data: {
          callId: call.id,
          eventType: 'workflow-started',
          data: {
            workflow_id: workflow.id,
            dialplan_uuid,
            context,
            current_application
          },
        },
      });
    }

    // Return success response
    res.type('text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<document type="freeswitch/xml">
  <section name="result">
    <result status="success"/>
  </section>
</document>`);
  } catch (error: any) {
    logger.error('Error processing FusionPBX execute flow webhook', { error: error.message });
    res.status(500).send('Error');
  }
});

// Helper function to map FusionPBX call states to our call status
function mapFusionPBXStatusToCallStatus(fusionpbxStatus: string): string {
  const statusMap: Record<string, string> = {
    'CS_NEW': 'INITIATED',
    'CS_INIT': 'INITIATED', 
    'CS_ROUTING': 'RINGING',
    'CS_SOFT_EXECUTE': 'RINGING',
    'CS_EXECUTE': 'IN_PROGRESS',
    'CS_EXCHANGE_MEDIA': 'IN_PROGRESS',
    'CS_PARK': 'IN_PROGRESS',
    'CS_CONSUME_MEDIA': 'IN_PROGRESS',
    'CS_HIBERNATE': 'IN_PROGRESS',
    'CS_RESET': 'FAILED',
    'CS_HANGUP': 'COMPLETED',
    'CS_REPORTING': 'COMPLETED',
    'CS_DESTROY': 'COMPLETED',
    // Additional states
    'EARLY': 'RINGING',
    'ACTIVE': 'IN_PROGRESS',
    'HELD': 'IN_PROGRESS',
    'HANGUP': 'COMPLETED',
    'DESTROY': 'COMPLETED',
  };
  
  return statusMap[fusionpbxStatus] || 'FAILED';
}




