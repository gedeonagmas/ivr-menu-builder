import axios from 'axios';
import { logger } from '../utils/logger.js';

const fusionpbxUrl = process.env.FUSIONPBX_URL || 'http://localhost';
const fusionpbxUsername = process.env.FUSIONPBX_USERNAME || 'admin';
const fusionpbxPassword = process.env.FUSIONPBX_PASSWORD || 'admin';
const fusionpbxDomain = process.env.FUSIONPBX_DOMAIN || 'localhost';

// Configure axios with timeouts to prevent hanging
const axiosInstance = axios.create({
  timeout: 5000, // 5 second timeout
  maxRedirects: 5,
  validateStatus: (status) => status < 500, // Don't throw on 4xx errors
});

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
    routingInfo?: { phoneNumber: string; context: string },
  ): Promise<string> {
    try {
      // Convert workflow to FusionPBX dialplan XML
      const context = routingInfo?.context || 'default';
      const destinationNumber = routingInfo?.phoneNumber || flowDefinition.extension || '1000';
      const dialplanXml = this.convertToDialplan(flowDefinition, flowName, context, destinationNumber);
      
      const dialplanData = {
        dialplan_name: flowName,
        dialplan_number: destinationNumber,
        dialplan_context: context,
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
        response = await axiosInstance.put(
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
        response = await axiosInstance.post(
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
      await axiosInstance.delete(`${this.baseUrl}/app/dialplans/dialplan_delete.php`, {
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

      const response = await axiosInstance.post(
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
      const response = await axiosInstance.get(`${this.baseUrl}/app/calls/call_details.php`, {
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
      const response = await axiosInstance.get(`${this.baseUrl}/app/extensions/extensions.php`, {
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
  private convertToDialplan(
    flowDefinition: any, 
    flowName: string, 
    context: string = 'default',
    destinationNumber: string = '1000'
  ): string {
    // Normalize phone number for regex - escape special chars and create flexible pattern
    // Matches: +1234567890, 1234567890, 123-456-7890, etc.
    const normalizedNumber = destinationNumber.replace(/[\+\s\-\(\)]/g, '');
    // Simple pattern: match exact number or with common formatting
    const regexPattern = `^\\+?${normalizedNumber.replace(/(\d)/g, '\\$1')}$|^${normalizedNumber}$`;
    
    let dialplanXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<document type="freeswitch/xml">
  <section name="dialplan" description="IVR Dialplan">
    <context name="${context}">
      <extension name="${flowName}" continue="false" uuid="${this.generateUuid()}">
        <condition field="destination_number" expression="${regexPattern}">
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
          // Use mod_tts_commandline for better TTS (requires TTS engine installed)
          // Fallback to flite if mod_tts_commandline not available
          const ttsText = (node.properties.say as string).replace(/"/g, '\\"');
          return `\n          <action application="speak" data="flite|kal|${ttsText}"/>`;
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
      const response = await axiosInstance.get(`${this.baseUrl}/login.php`);
      
      logger.info('FusionPBX connection test successful', { status: response.status });
      return response.status === 200;
    } catch (error: any) {
      logger.error('FusionPBX connection test failed', { error: error.message });
      return false;
    }
  }

  /**
   * Create or update an IVR menu in FusionPBX
   * Uses direct database access since FusionPBX PHP pages require session authentication
   */
  async createOrUpdateIvrMenu(
    existingMenuUuid: string | undefined,
    menuName: string,
    diagram: {
      nodes: any[];
      edges: any[];
    },
    extension: string = '1000',
    context: string = 'default',
  ): Promise<string> {
    try {
      // Convert workflow diagram to IVR menu structure
      const ivrMenuData = this.convertDiagramToIvrMenu(diagram, menuName, extension);

      // Get FusionPBX database connection from environment
      // FusionPBX typically uses the same PostgreSQL database
      const fusionpbxDbUrl = process.env.FUSIONPBX_DATABASE_URL || process.env.DATABASE_URL;
      if (!fusionpbxDbUrl) {
        throw new Error('FUSIONPBX_DATABASE_URL or DATABASE_URL not configured');
      }

      // Use raw PostgreSQL client to access FusionPBX database directly
      // FusionPBX stores IVR menus in v_ivr_menus and v_ivr_menu_options tables
      const { Client } = await import('pg');
      const dbClient = new Client({
        connectionString: fusionpbxDbUrl,
      });
      
      logger.info('Connecting to FusionPBX database', {
        dbUrl: fusionpbxDbUrl.replace(/:[^:@]+@/, ':****@') // Hide password
      });
      
      try {
        await dbClient.connect();
        logger.info('Successfully connected to FusionPBX database');
      } catch (dbError: any) {
        logger.error('Failed to connect to FusionPBX database', {
          error: dbError.message,
          code: dbError.code
        });
        throw new Error(`Database connection failed: ${dbError.message}`);
      }

      const domainUuid = await this.getDomainUuid();
      const menuUuid = existingMenuUuid || this.generateUuid();

      logger.info(existingMenuUuid ? 'Updating IVR menu' : 'Creating IVR menu', { 
        menuUuid, 
        name: menuName,
        extension,
        optionsCount: ivrMenuData.options.length
      });

      // Insert or update IVR menu in v_ivr_menus table
      if (existingMenuUuid) {
        // Update existing menu
        logger.info('Updating existing IVR menu', { menuUuid: existingMenuUuid });
        const updateResult = await dbClient.query(`
          UPDATE v_ivr_menus 
          SET 
            ivr_menu_name = $1,
            ivr_menu_extension = $2,
            ivr_menu_context = $3,
            ivr_menu_greet_long = $4,
            ivr_menu_greet_short = $5,
            ivr_menu_timeout = $6,
            ivr_menu_exit_action = $7,
            ivr_menu_direct_dial = $8,
            ivr_menu_ring_back = $9,
            ivr_menu_caller_id_name_prefix = $10,
            ivr_menu_enabled = $11,
            ivr_menu_description = $12
          WHERE ivr_menu_uuid = $13 AND domain_uuid = $14
        `, [
          menuName,
          extension,
          context,
          ivrMenuData.greetLong || '',
          ivrMenuData.greetShort || '',
          ivrMenuData.timeout?.toString() || '3000',
          ivrMenuData.exitAction || '',
          ivrMenuData.directDial ? 'true' : 'false',
          ivrMenuData.ringBack || '',
          ivrMenuData.callerIdNamePrefix || '',
          ivrMenuData.enabled ? 'true' : 'false',
          ivrMenuData.description || `IVR Menu: ${menuName}`,
          existingMenuUuid,
          domainUuid
        ]);
        logger.info('IVR menu update result', { rowCount: updateResult.rowCount });

        // Delete existing options
        const deleteResult = await dbClient.query(`
          DELETE FROM v_ivr_menu_options 
          WHERE ivr_menu_uuid = $1
        `, [existingMenuUuid]);
        logger.info('Deleted existing menu options', { rowCount: deleteResult.rowCount });
      } else {
        // Insert new menu
        logger.info('Inserting new IVR menu', { menuUuid, menuName, extension });
        try {
          const insertResult = await dbClient.query(`
            INSERT INTO v_ivr_menus (
              ivr_menu_uuid, domain_uuid, ivr_menu_name, ivr_menu_extension, 
              ivr_menu_context, ivr_menu_greet_long, ivr_menu_greet_short,
              ivr_menu_timeout, ivr_menu_exit_action, ivr_menu_direct_dial,
              ivr_menu_ring_back, ivr_menu_caller_id_name_prefix, 
              ivr_menu_enabled, ivr_menu_description
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          `, [
            menuUuid,
            domainUuid,
            menuName,
            extension,
            context,
            ivrMenuData.greetLong || '',
            ivrMenuData.greetShort || '',
            ivrMenuData.timeout?.toString() || '3000',
            ivrMenuData.exitAction || '',
            ivrMenuData.directDial ? 'true' : 'false',
            ivrMenuData.ringBack || '',
            ivrMenuData.callerIdNamePrefix || '',
            ivrMenuData.enabled ? 'true' : 'false',
            ivrMenuData.description || `IVR Menu: ${menuName}`
          ]);
          logger.info('IVR menu inserted successfully', { rowCount: insertResult.rowCount });
        } catch (insertError: any) {
          logger.error('Failed to insert IVR menu', {
            error: insertError.message,
            code: insertError.code,
            detail: insertError.detail,
            table: 'v_ivr_menus'
          });
          throw insertError;
        }
      }

      // Insert menu options
      logger.info('Inserting menu options', { count: ivrMenuData.options.length });
      for (const opt of ivrMenuData.options) {
        const optionUuid = this.generateUuid();
        try {
          await dbClient.query(`
            INSERT INTO v_ivr_menu_options (
              ivr_menu_option_uuid, ivr_menu_uuid, ivr_menu_option_digits,
              ivr_menu_option_action, ivr_menu_option_order, 
              ivr_menu_option_description, ivr_menu_option_enabled
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            optionUuid,
            menuUuid,
            opt.option,
            opt.destination,
            opt.order.toString(),
            opt.description,
            opt.enabled ? 'true' : 'false'
          ]);
          logger.debug('Menu option inserted', { option: opt.option, destination: opt.destination });
        } catch (optionError: any) {
          logger.error('Failed to insert menu option', {
            error: optionError.message,
            option: opt.option,
            destination: opt.destination
          });
          // Continue with other options even if one fails
        }
      }

      await dbClient.end();
      logger.info('Database connection closed');

      logger.info('IVR menu saved to database', { 
        menuUuid,
        name: menuName,
        extension,
        optionsCount: ivrMenuData.options.length
      });

      return menuUuid;
    } catch (error: any) {
      logger.error('Error creating/updating FusionPBX IVR menu', { 
        error: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(`Failed to create/update IVR menu: ${error.message}`);
    }
  }

  /**
   * Update IVR menu options
   */
  private async updateIvrMenuOptions(menuUuid: string, options: Array<{
    option: string;
    destination: string;
    order: number;
    description: string;
    enabled: boolean;
  }>): Promise<void> {
    try {
      // Delete existing options first
      // Note: This is a simplified approach - in production you might want to update existing options
      
      // Add each option
      for (const opt of options) {
        const optionData = {
          ivr_menu_uuid: menuUuid,
          ivr_menu_option_digits: opt.option,
          ivr_menu_option_action: opt.destination,
          ivr_menu_option_order: opt.order.toString(),
          ivr_menu_option_description: opt.description,
          ivr_menu_option_enabled: opt.enabled ? 'true' : 'false',
          domain_uuid: await this.getDomainUuid(),
        };

        const optionResponse = await axiosInstance.post(
          `${this.baseUrl}/app/ivr_menus/ivr_menu_option_add.php`,
          new URLSearchParams(optionData),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`
            }
          }
        );

        logger.debug('IVR menu option added', { 
          option: opt.option, 
          status: optionResponse.status,
          response: optionResponse.data?.substring?.(0, 100)
        });
      }

      logger.info('IVR menu options updated', { menuUuid, optionCount: options.length });
    } catch (error: any) {
      logger.error('Error updating IVR menu options', { error: error.message });
      throw error;
    }
  }

  /**
   * Convert workflow diagram to IVR menu structure
   */
  private convertDiagramToIvrMenu(
    diagram: { nodes: any[]; edges: any[] },
    menuName: string,
    extension: string,
  ): {
    greetLong: string;
    greetShort: string;
    timeout: number;
    exitAction: string;
    directDial: boolean;
    ringBack: string;
    callerIdNamePrefix: string;
    enabled: boolean;
    description: string;
    options: Array<{
      option: string;
      destination: string;
      order: number;
      description: string;
      enabled: boolean;
    }>;
  } {
    const { nodes, edges } = diagram;

    // First, check if there's an ivr-menu node - if so, use it directly
    const ivrMenuNode = nodes.find((n: any) => n.data?.type === 'ivr-menu');
    
    logger.info('convertDiagramToIvrMenu - checking for ivr-menu node', {
      hasIvrMenuNode: !!ivrMenuNode,
      nodeId: ivrMenuNode?.id,
      nodeType: ivrMenuNode?.data?.type,
      hasProperties: !!ivrMenuNode?.data?.properties
    });
    
    if (ivrMenuNode) {
      const props = ivrMenuNode.data?.properties || {};
      
      logger.info('Processing ivr-menu node properties', {
        extension: props.extension,
        hasMenuOptions: !!props.menuOptions,
        menuOptionsType: typeof props.menuOptions,
        greetLong: props.greetLong?.substring(0, 50),
        timeout: props.timeout
      });
      
      // Parse menuOptions
      let menuOptions: any[] = [];
      const menuOptionsRaw = props.menuOptions || [];
      if (typeof menuOptionsRaw === 'string') {
        try {
          if (menuOptionsRaw.trim()) {
            menuOptions = JSON.parse(menuOptionsRaw);
          }
        } catch (e) {
          logger.error('Failed to parse menuOptions as JSON from ivr-menu node', { 
            error: e, 
            menuOptionsRaw: menuOptionsRaw.substring(0, 200) 
          });
          menuOptions = [];
        }
      } else if (Array.isArray(menuOptionsRaw)) {
        menuOptions = menuOptionsRaw;
      }
      
      logger.info('Parsed menu options', { 
        count: menuOptions.length,
        options: menuOptions.map((opt: any) => ({
          option: opt.option || opt.key,
          destination: opt.destination || opt.value
        }))
      });
      
      // Convert menu options to the expected format
      const options = menuOptions.map((opt: any, index: number) => ({
        option: opt.option || opt.key || String(index + 1),
        destination: opt.destination || opt.value || '',
        order: opt.order !== undefined ? opt.order : index + 1,
        description: opt.description || opt.label || `Option ${opt.option || index + 1}`,
        enabled: opt.enabled !== undefined ? opt.enabled : true,
      }));
      
      const result = {
        greetLong: props.greetLong || '',
        greetShort: props.greetShort || '',
        timeout: props.timeout || 3000,
        exitAction: props.exitAction || '',
        directDial: props.directDial || false,
        ringBack: props.ringBack || '',
        callerIdNamePrefix: props.callerIdNamePrefix || '',
        enabled: props.enabled !== undefined ? props.enabled : true,
        description: props.description || `IVR Menu: ${menuName}`,
        options,
      };
      
      logger.info('IVR menu data converted from ivr-menu node', {
        optionsCount: result.options.length,
        hasGreetLong: !!result.greetLong,
        timeout: result.timeout
      });
      
      return result;
    }

    // Fallback to gather-input node logic (for backward compatibility)
    // Find the start node (no incoming edges)
    const nodesWithIncoming = new Set(edges.map((e: any) => e.target));
    const startNodes = nodes.filter((n: any) => !nodesWithIncoming.has(n.id));
    const startNode = startNodes[0] || nodes[0];

    // Find greeting nodes (play-audio-tts or answer-call before gather-input)
    let greetLong = '';
    let greetShort = '';
    
    // Find gather-input nodes with menuOptions
    const gatherInputNodes = nodes.filter((n: any) => {
      if (n.data?.type !== 'gather-input') return false;
      
      const menuOptions = n.data?.properties?.menuOptions;
      if (!menuOptions) return false;
      
      // Handle both string (JSON) and array formats
      let parsedOptions: any[] = [];
      if (typeof menuOptions === 'string') {
        try {
          parsedOptions = JSON.parse(menuOptions);
        } catch (e) {
          logger.warn('Failed to parse menuOptions as JSON in convertDiagramToIvrMenu', { error: e });
          return false;
        }
      } else if (Array.isArray(menuOptions)) {
        parsedOptions = menuOptions;
      } else {
        return false;
      }
      
      return parsedOptions.length > 0;
    });

    // Get the first gather-input node for the main menu
    const mainMenuNode = gatherInputNodes[0];

    if (mainMenuNode) {
      // Find greeting nodes before this gather-input
      const pathToGather = this.findPathToNode(nodes, edges, startNode?.id, mainMenuNode.id);
      const greetingNodes = pathToGather
        .map((nodeId: string) => nodes.find((n: any) => n.id === nodeId))
        .filter((n: any) => n?.data?.type === 'play-audio-tts' || n?.data?.type === 'answer-call');

      if (greetingNodes.length > 0) {
        const firstGreeting = greetingNodes[0];
        if (firstGreeting.data?.type === 'play-audio-tts') {
          const props = firstGreeting.data.properties || {};
          if (props.messageType === 'tts' && props.messageText) {
            greetLong = props.messageText;
            greetShort = props.messageText.substring(0, 100); // Short version
          } else if (props.messageType === 'audio' && props.audioFile) {
            greetLong = props.audioFile;
            greetShort = props.audioFile;
          }
        } else if (firstGreeting.data?.type === 'answer-call') {
          greetLong = 'Welcome to our IVR system!';
          greetShort = 'Welcome!';
        }
      }

      // Convert menuOptions to IVR menu options
      // Handle both string (JSON) and array formats
      let menuOptionsRaw = mainMenuNode.data.properties.menuOptions || [];
      let menuOptions: any[] = [];
      
      if (typeof menuOptionsRaw === 'string') {
        try {
          menuOptions = JSON.parse(menuOptionsRaw);
        } catch (e) {
          logger.error('Failed to parse menuOptions as JSON', { error: e, menuOptionsRaw });
          menuOptions = [];
        }
      } else if (Array.isArray(menuOptionsRaw)) {
        menuOptions = menuOptionsRaw;
      }
      const options = menuOptions.map((opt: any, index: number) => {
        // Find the edge from gather-input that matches this option
        const matchingEdge = edges.find((e: any) => 
          e.source === mainMenuNode.id && 
          (e.data?.label === opt.value || e.data?.label === opt.key)
        );

        // Determine destination based on the target node
        let destination = '';
        if (matchingEdge) {
          const targetNode = nodes.find((n: any) => n.id === matchingEdge.target);
          if (targetNode) {
            destination = this.getDestinationForNode(targetNode, nodes, edges);
          }
        }

        return {
          option: opt.key || String(index + 1),
          destination: destination || `menu-exec-app:transfer ${extension} XML default`,
          order: index + 1,
          description: opt.label || `Option ${opt.key || index + 1}`,
          enabled: true,
        };
      });

      // Get timeout from gather-input node
      const timeout = (mainMenuNode.data?.properties?.timeout || 5) * 1000; // Convert to milliseconds

      return {
        greetLong: greetLong || 'Welcome!',
        greetShort: greetShort || 'Welcome!',
        timeout,
        exitAction: 'menu-exec-app:transfer 0 XML default',
        directDial: false,
        ringBack: 'tone_stream://%(500,500,480,620);loops=25',
        callerIdNamePrefix: '',
        enabled: true,
        description: `IVR Menu: ${menuName}`,
        options,
      };
    }

    // Fallback: create a basic menu structure
    return {
      greetLong: 'Welcome!',
      greetShort: 'Welcome!',
      timeout: 3000,
      exitAction: 'menu-exec-app:transfer 0 XML default',
      directDial: false,
      ringBack: 'tone_stream://%(500,500,480,620);loops=25',
      callerIdNamePrefix: '',
      enabled: true,
      description: `IVR Menu: ${menuName}`,
      options: [],
    };
  }

  /**
   * Find path from start node to target node
   */
  private findPathToNode(
    nodes: any[],
    edges: any[],
    startNodeId: string | undefined,
    targetNodeId: string,
    visited: Set<string> = new Set(),
  ): string[] {
    if (!startNodeId || visited.has(startNodeId)) {
      return [];
    }

    if (startNodeId === targetNodeId) {
      return [startNodeId];
    }

    visited.add(startNodeId);

    const outgoingEdges = edges.filter((e: any) => e.source === startNodeId);
    for (const edge of outgoingEdges) {
      const path = this.findPathToNode(nodes, edges, edge.target, targetNodeId, new Set(visited));
      if (path.length > 0) {
        return [startNodeId, ...path];
      }
    }

    return [];
  }

  /**
   * Get destination string for a node
   */
  private getDestinationForNode(node: any, allNodes: any[], allEdges: any[]): string {
    const nodeType = node.data?.type;
    const properties = node.data?.properties || {};

    switch (nodeType) {
      case 'forward-to-phone':
        const phoneNumber = properties.phoneNumber;
        if (phoneNumber) {
          return `menu-exec-app:bridge user/${phoneNumber}@${this.domain}`;
        }
        break;

      case 'hang-up-call':
        return 'menu-exec-app:hangup';

      case 'play-audio-tts':
      case 'gather-input':
        // Continue to next node
        const nextEdge = allEdges.find((e: any) => e.source === node.id);
        if (nextEdge) {
          const nextNode = allNodes.find((n: any) => n.id === nextEdge.target);
          if (nextNode) {
            return this.getDestinationForNode(nextNode, allNodes, allEdges);
          }
        }
        break;

      default:
        // Default: transfer to extension
        return `menu-exec-app:transfer ${properties.extension || '1000'} XML default`;
    }

    return `menu-exec-app:transfer 1000 XML default`;
  }

  /**
   * Delete an IVR menu
   */
  async deleteIvrMenu(menuUuid: string): Promise<void> {
    try {
      await axiosInstance.post(
        `${this.baseUrl}/app/ivr_menus/ivr_menu_delete.php`,
        new URLSearchParams({
          ivr_menu_uuid: menuUuid
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`
          }
        }
      );
      
      logger.info('FusionPBX IVR menu deleted', { menuUuid });
    } catch (error: any) {
      logger.error('Error deleting FusionPBX IVR menu', { error: error.message });
      // Don't throw - menu might already be deleted
    }
  }
}

// Lazy initialization - only create when needed
let _fusionpbxService: FusionPBXService | null = null;

export function getFusionPBXService(): FusionPBXService {
  if (!_fusionpbxService) {
    _fusionpbxService = new FusionPBXService();
  }
  return _fusionpbxService;
}

// Export for backward compatibility, but it's lazy
export const fusionpbxService = new Proxy({} as FusionPBXService, {
  get(target, prop) {
    return getFusionPBXService()[prop as keyof FusionPBXService];
  }
});




