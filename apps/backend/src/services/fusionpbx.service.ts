import axios from 'axios';
import { logger } from '../utils/logger.js';

const fusionpbxUrl = process.env.FUSIONPBX_URL || 'http://localhost';
const fusionpbxUsername = process.env.FUSIONPBX_USERNAME || 'admin';
const fusionpbxPassword = process.env.FUSIONPBX_PASSWORD || 'admin';
const fusionpbxDomain = process.env.FUSIONPBX_DOMAIN || 'localhost';

if (!fusionpbxUrl) {
  logger.warn('FusionPBX credentials not configured');
}

class FusionPBXService {
  private baseUrl: string;
  private username: string;
  private password: string;
  private domain: string;

  constructor() {
    this.baseUrl = fusionpbxUrl;
    this.username = fusionpbxUsername;
    this.password = fusionpbxPassword;
    this.domain = fusionpbxDomain;
  }

  /**
   * Create or update a dialplan (replaces Twilio Studio Flow)
   */
  async createOrUpdateFlow(
    existingFlowId: string | undefined,
    flowName: string,
    flowDefinition: any,
  ): Promise<string> {
    try {
      // Convert workflow to FusionPBX dialplan XML
      const dialplanXml = this.convertToDialplan(flowDefinition, flowName);
      
      const dialplanData = {
        dialplan_name: flowName,
        dialplan_number: flowDefinition.extension || '1000',
        dialplan_context: 'default',
        dialplan_continue: 'false',
        dialplan_xml: dialplanXml,
        dialplan_order: '100',
        dialplan_enabled: 'true',
        dialplan_description: `IVR Flow: ${flowName}`,
        domain_uuid: await this.getDomainUuid()
      };

      let response;
      if (existingFlowId) {
        // Update existing dialplan
        response = await axios.put(
          `${this.baseUrl}/app/dialplans/dialplan_edit.php`,
          new URLSearchParams({
            ...dialplanData,
            dialplan_uuid: existingFlowId
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`
            }
          }
        );
      } else {
        // Create new dialplan
        response = await axios.post(
          `${this.baseUrl}/app/dialplans/dialplan_add.php`,
          new URLSearchParams(dialplanData),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`
            }
          }
        );
      }

      // Generate a UUID for the dialplan if not provided
      const dialplanUuid = existingFlowId || this.generateUuid();
      
      logger.info('FusionPBX dialplan created/updated', { 
        dialplanUuid, 
        flowName,
        status: response.status 
      });

      return dialplanUuid;
    } catch (error: any) {
      logger.error('Error creating/updating FusionPBX dialplan', { error: error.message });
      throw new Error(`Failed to deploy to FusionPBX: ${error.message}`);
    }
  }

  /**
   * Delete a dialplan
   */
  async deleteFlow(dialplanUuid: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/app/dialplans/dialplan_delete.php`, {
        data: new URLSearchParams({
          dialplan_uuid: dialplanUuid
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`
        }
      });
      
      logger.info('FusionPBX dialplan deleted', { dialplanUuid });
    } catch (error: any) {
      logger.error('Error deleting FusionPBX dialplan', { error: error.message });
      // Don't throw - dialplan might already be deleted
    }
  }

  /**
   * Make an outbound call using FusionPBX
   */
  async makeCall(
    from: string,
    to: string,
    dialplanUuid: string,
    metadata?: Record<string, string>,
  ): Promise<string> {
    try {
      // Use FusionPBX originate API
      const callUuid = this.generateUuid();
      
      const originateData = {
        caller_id_number: from,
        caller_id_name: 'IVR System',
        destination_number: to,
        context: 'default',
        dialplan_uuid: dialplanUuid,
        timeout: '30',
        variables: JSON.stringify(metadata || {})
      };

      const response = await axios.post(
        `${this.baseUrl}/app/calls/call_originate.php`,
        new URLSearchParams(originateData),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`
          }
        }
      );

      logger.info('FusionPBX call initiated', { 
        callUuid, 
        from, 
        to,
        status: response.status 
      });

      return callUuid;
    } catch (error: any) {
      logger.error('Error making FusionPBX call', { error: error.message });
      throw new Error(`Failed to make call: ${error.message}`);
    }
  }

  /**
   * Get call details
   */
  async getCall(callUuid: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/app/calls/call_details.php`, {
        params: { call_uuid: callUuid },
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`
        }
      });

      return response.data;
    } catch (error: any) {
      logger.error('Error fetching FusionPBX call', { error: error.message });
      throw new Error(`Failed to fetch call: ${error.message}`);
    }
  }

  /**
   * Get available extensions/phone numbers
   */
  async getExtensions() {
    try {
      const response = await axios.get(`${this.baseUrl}/app/extensions/extensions.php`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`
        }
      });

      return response.data;
    } catch (error: any) {
      logger.error('Error fetching FusionPBX extensions', { error: error.message });
      throw new Error(`Failed to fetch extensions: ${error.message}`);
    }
  }

  /**
   * Convert workflow nodes to FusionPBX dialplan XML
   */
  private convertToDialplan(flowDefinition: any, flowName: string): string {
    const extension = flowDefinition.extension || '1000';
    
    let dialplanXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<document type="freeswitch/xml">
  <section name="dialplan" description="IVR Dialplan">
    <context name="default">
      <extension name="${flowName}" continue="false" uuid="${this.generateUuid()}">
        <condition field="destination_number" expression="^${extension}$">
          <action application="answer"/>
          <action application="sleep" data="1000"/>`;

    // Convert each state to dialplan actions
    if (flowDefinition.states) {
      Object.values(flowDefinition.states).forEach((state: any) => {
        dialplanXml += this.convertNodeToDialplanAction(state);
      });
    }

    dialplanXml += `
          <action application="hangup"/>
        </condition>
      </extension>
    </context>
  </section>
</document>`;

    return dialplanXml;
  }

  /**
   * Convert individual workflow nodes to FreeSWITCH dialplan actions
   */
  private convertNodeToDialplanAction(node: any): string {
    switch (node.type) {
      case 'say-play':
        if (node.properties.say) {
          return `\n          <action application="speak" data="flite|kal|${node.properties.say}"/>`;
        } else if (node.properties.play) {
          return `\n          <action application="playback" data="${node.properties.play}"/>`;
        }
        break;

      case 'gather':
        const digits = node.properties.num_digits || 1;
        const timeout = node.properties.timeout || 5000;
        const terminators = node.properties.finish_on_key || '#';
        return `\n          <action application="play_and_get_digits" data="${digits} ${digits} 3 ${timeout} ${terminators} silence_stream://1000 silence_stream://1000 gathered_digits"/>`;

      case 'record-voice':
        const maxLength = node.properties.max_length || 300;
        const recordPath = `/var/lib/freeswitch/recordings/\${uuid}_\${strftime(%Y%m%d_%H%M%S)}.wav`;
        return `\n          <action application="record" data="${recordPath} ${maxLength} 200 5"/>`;

      case 'connect':
        const destination = node.properties.to;
        return `\n          <action application="bridge" data="user/${destination}@${this.domain}"/>`;

      case 'send-message':
        // FusionPBX SMS via mod_sms
        const smsTo = node.properties.to;
        const smsBody = node.properties.body;
        return `\n          <action application="sms" data="${smsTo}|${smsBody}"/>`;

      case 'hangup':
        return `\n          <action application="hangup"/>`;

      default:
        return `\n          <!-- Unknown node type: ${node.type} -->`;
    }
    return '';
  }

  /**
   * Get domain UUID for FusionPBX
   */
  private async getDomainUuid(): Promise<string> {
    try {
      // For localhost, we'll use a default UUID or fetch it from FusionPBX
      // This is a simplified approach - in production you'd query the domains table
      return this.generateUuid();
    } catch (error) {
      logger.warn('Could not fetch domain UUID, using generated UUID');
      return this.generateUuid();
    }
  }

  /**
   * Generate a UUID
   */
  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Test FusionPBX connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/login.php`, {
        timeout: 5000
      });
      
      logger.info('FusionPBX connection test successful', { status: response.status });
      return response.status === 200;
    } catch (error: any) {
      logger.error('FusionPBX connection test failed', { error: error.message });
      return false;
    }
  }
}

export const fusionpbxService = new FusionPBXService();




