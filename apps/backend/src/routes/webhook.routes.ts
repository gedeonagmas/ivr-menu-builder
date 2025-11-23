import { Router } from 'express';
import { prisma } from '../database/prisma.js';
import { logger } from '../utils/logger.js';
import { twilioService } from '../services/twilio.service.js';

export const webhookRoutes = Router();

// Twilio webhook signature validation would go here in production
// For now, we'll accept webhooks (in production, validate Twilio signatures)

// Call status webhook
webhookRoutes.post('/call-status', async (req, res) => {
  try {
    const { CallSid, CallStatus, From, To, CallDuration } = req.body;

    logger.info('Call status webhook received', {
      CallSid,
      CallStatus,
      From,
      To,
    });

    // Find call by Twilio SID
    const call = await prisma.call.findUnique({
      where: { twilioCallSid: CallSid },
    });

    if (call) {
      await prisma.call.update({
        where: { id: call.id },
        data: {
          status: mapTwilioStatusToCallStatus(CallStatus),
          duration: CallDuration ? parseInt(CallDuration) : null,
          endedAt: CallStatus === 'completed' ? new Date() : null,
        },
      });
    }

    res.status(200).send('OK');
  } catch (error: any) {
    logger.error('Error processing call status webhook', { error: error.message });
    res.status(500).send('Error');
  }
});

// Recording status webhook
webhookRoutes.post('/recording-status', async (req, res) => {
  try {
    const {
      CallSid,
      RecordingSid,
      RecordingUrl,
      RecordingDuration,
      RecordingStatus,
      TranscriptionText,
    } = req.body;

    logger.info('Recording status webhook received', {
      CallSid,
      RecordingSid,
      RecordingStatus,
    });

    // Find call
    const call = await prisma.call.findUnique({
      where: { twilioCallSid: CallSid },
    });

    if (call && RecordingSid) {
      await prisma.recording.create({
        data: {
          callId: call.id,
          workflowId: call.workflowId,
          userId: call.userId || undefined,
          organizationId: call.organizationId,
          twilioSid: RecordingSid,
          url: RecordingUrl,
          duration: RecordingDuration ? parseInt(RecordingDuration) : null,
          transcription: TranscriptionText || null,
        },
      });
    }

    res.status(200).send('OK');
  } catch (error: any) {
    logger.error('Error processing recording status webhook', { error: error.message });
    res.status(500).send('Error');
  }
});

// Gather input webhook (for DTMF/Speech input)
webhookRoutes.post('/gather-input', async (req, res) => {
  try {
    const { CallSid, Digits, SpeechResult } = req.body;

    logger.info('Gather input webhook received', {
      CallSid,
      Digits,
      SpeechResult,
    });

    const call = await prisma.call.findUnique({
      where: { twilioCallSid: CallSid },
    });

    if (call) {
      await prisma.callEvent.create({
        data: {
          callId: call.id,
          eventType: 'input-received',
          data: {
            digits: Digits,
            speech: SpeechResult,
          },
        },
      });
    }

    // Return TwiML to continue flow
    res.type('text/xml');
    res.send(`
      <Response>
        <Redirect>${process.env.WEBHOOK_BASE_URL}/api/webhooks/continue-flow?CallSid=${CallSid}</Redirect>
      </Response>
    `);
  } catch (error: any) {
    logger.error('Error processing gather input webhook', { error: error.message });
    res.status(500).send('Error');
  }
});

function mapTwilioStatusToCallStatus(twilioStatus: string): string {
  const statusMap: Record<string, string> = {
    queued: 'INITIATED',
    ringing: 'RINGING',
    'in-progress': 'IN_PROGRESS',
    completed: 'COMPLETED',
    busy: 'BUSY',
    'no-answer': 'NO_ANSWER',
    failed: 'FAILED',
    canceled: 'CANCELED',
  };
  return statusMap[twilioStatus] || 'INITIATED';
}

