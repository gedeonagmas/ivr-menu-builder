import twilio from 'twilio';
import { logger } from '../utils/logger.js';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  logger.warn('Twilio credentials not configured');
}

const client = twilio(accountSid, authToken);

class TwilioService {
  /**
   * Create or update a Twilio Studio Flow
   */
  async createOrUpdateFlow(
    existingFlowSid: string | undefined,
    flowName: string,
    flowDefinition: any,
  ): Promise<string> {
    try {
      if (existingFlowSid) {
        // Update existing flow
        const flow = await client.studio.v2.flows(existingFlowSid).update({
          friendlyName: flowName,
          status: 'published',
          definition: flowDefinition,
        });
        return flow.sid;
      } else {
        // Create new flow
        const flow = await client.studio.v2.flows.create({
          friendlyName: flowName,
          status: 'published',
          definition: flowDefinition,
        });
        return flow.sid;
      }
    } catch (error: any) {
      logger.error('Error creating/updating Twilio flow', { error: error.message });
      throw new Error(`Failed to deploy to Twilio: ${error.message}`);
    }
  }

  /**
   * Delete a Twilio Studio Flow
   */
  async deleteFlow(flowSid: string): Promise<void> {
    try {
      await client.studio.v2.flows(flowSid).remove();
    } catch (error: any) {
      logger.error('Error deleting Twilio flow', { error: error.message });
      // Don't throw - flow might already be deleted
    }
  }

  /**
   * Make an outbound call
   */
  async makeCall(
    from: string,
    to: string,
    workflowUrl: string,
    metadata?: Record<string, string>,
  ): Promise<string> {
    try {
      const call = await client.calls.create({
        from,
        to,
        url: workflowUrl,
        method: 'POST',
        statusCallback: `${process.env.WEBHOOK_BASE_URL}/api/webhooks/call-status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
      });

      return call.sid;
    } catch (error: any) {
      logger.error('Error making call', { error: error.message });
      throw new Error(`Failed to make call: ${error.message}`);
    }
  }

  /**
   * Get call details
   */
  async getCall(callSid: string) {
    try {
      return await client.calls(callSid).fetch();
    } catch (error: any) {
      logger.error('Error fetching call', { error: error.message });
      throw new Error(`Failed to fetch call: ${error.message}`);
    }
  }

  /**
   * Get phone number details
   */
  async getPhoneNumber(phoneNumberSid: string) {
    try {
      return await client.incomingPhoneNumbers(phoneNumberSid).fetch();
    } catch (error: any) {
      logger.error('Error fetching phone number', { error: error.message });
      throw new Error(`Failed to fetch phone number: ${error.message}`);
    }
  }

  /**
   * Purchase a phone number
   */
  async purchasePhoneNumber(areaCode: string) {
    try {
      const availableNumbers = await client.availablePhoneNumbers('US').local.list({
        areaCode,
        limit: 1,
      });

      if (availableNumbers.length === 0) {
        throw new Error('No phone numbers available for this area code');
      }

      const phoneNumber = availableNumbers[0];
      const purchased = await client.incomingPhoneNumbers.create({
        phoneNumber: phoneNumber.phoneNumber,
      });

      return purchased;
    } catch (error: any) {
      logger.error('Error purchasing phone number', { error: error.message });
      throw new Error(`Failed to purchase phone number: ${error.message}`);
    }
  }
}

export const twilioService = new TwilioService();

