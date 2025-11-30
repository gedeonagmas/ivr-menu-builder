import { logger } from '../utils/logger.js';

// Type definitions (matching frontend types)
type WorkflowBuilderNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data?: {
    type?: string;
    properties?: Record<string, any>;
  };
};

type WorkflowBuilderEdge = {
  id: string;
  source: string;
  target: string;
  data?: {
    label?: string;
  };
};

/**
 * Converts ReactFlow diagram to FusionPBX Dialplan or Twilio Studio Flow JSON
 */
class WorkflowExecutionEngine {
  /**
   * Convert ReactFlow diagram to FusionPBX Dialplan definition
   */
  async convertToFusionPBXFlow(diagram: {
    nodes: WorkflowBuilderNode[];
    edges: WorkflowBuilderEdge[];
  }): Promise<any> {
    const { nodes, edges } = diagram;

    if (nodes.length === 0) {
      throw new Error('Workflow must have at least one node');
    }

    // Find start node (no incoming edges)
    const nodeIds = new Set(nodes.map(n => n.id));
    const nodesWithIncoming = new Set(edges.map(e => e.target));
    const startNodes = nodes.filter(n => !nodesWithIncoming.has(n.id));
    const startNode = startNodes[0] || nodes[0];

    if (!startNode) {
      throw new Error('No start node found');
    }

    // Build FusionPBX Dialplan structure
    const states: Record<string, any> = {};

    // Convert each node to a FusionPBX state
    for (const node of nodes) {
      const state = this.convertNodeToFusionPBXState(node, edges);
      states[node.id] = state;
    }

    const flow = {
      description: 'IVR Flow generated from Workflow Builder',
      extension: '1000', // Default extension
      states: states,
      initial_state: startNode.id,
    };

    return flow;
  }

  /**
   * Convert ReactFlow diagram to Twilio Studio Flow definition
   */
  async convertToTwilioFlow(diagram: {
    nodes: WorkflowBuilderNode[];
    edges: WorkflowBuilderEdge[];
  }): Promise<any> {
    const { nodes, edges } = diagram;

    if (nodes.length === 0) {
      throw new Error('Workflow must have at least one node');
    }

    // Find start node (no incoming edges)
    const nodeIds = new Set(nodes.map(n => n.id));
    const nodesWithIncoming = new Set(edges.map(e => e.target));
    const startNodes = nodes.filter(n => !nodesWithIncoming.has(n.id));
    const startNode = startNodes[0] || nodes[0];

    if (!startNode) {
      throw new Error('No start node found');
    }

    // Build Twilio Studio Flow
    const states: Record<string, any> = {};
    const transitions: Record<string, any> = {};

    // Convert each node to a Twilio state
    for (const node of nodes) {
      const state = this.convertNodeToTwilioState(node, edges);
      states[node.id] = state;
    }

    // Set start state
    const flow = {
      description: 'IVR Flow generated from Workflow Builder',
      states: {
        [startNode.id]: states[startNode.id],
        ...Object.fromEntries(
          nodes
            .filter(n => n.id !== startNode.id)
            .map(n => [n.id, states[n.id]]),
        ),
      },
      initial_state: startNode.id,
      flags: {
        allow_concurrent_calls: false,
      },
    };

    return flow;
  }

  /**
   * Convert a single node to FusionPBX state
   */
  private convertNodeToFusionPBXState(
    node: WorkflowBuilderNode,
    edges: WorkflowBuilderEdge[],
  ): any {
    const nodeType = node.data?.type;
    const properties = node.data?.properties || {};

    // Get outgoing edges
    const outgoingEdges = edges.filter(e => e.source === node.id);

    switch (nodeType) {
      case 'answer-call': {
        return {
          type: 'say-play',
          name: node.id,
          transitions: {
            next: outgoingEdges[0]?.target || null,
          },
          properties: {
            say: 'Welcome to our IVR system!',
          },
        };
      }

      case 'play-audio-tts': {
        const messageType = properties.messageType;
        const messageText = properties.messageText as string;
        const audioFile = properties.audioFile as string;

        if (messageType === 'tts' && messageText) {
          return {
            type: 'say-play',
            name: node.id,
            transitions: {
              next: outgoingEdges[0]?.target || null,
            },
            properties: {
              say: messageText,
            },
          };
        } else if (messageType === 'audio' && audioFile) {
          return {
            type: 'say-play',
            name: node.id,
            transitions: {
              next: outgoingEdges[0]?.target || null,
            },
            properties: {
              play: audioFile,
            },
          };
        }
        break;
      }

      case 'gather-input': {
        const maxDigits = properties.maxDigits as number || 10;
        const timeout = properties.timeout as number || 5;
        const finishOnKey = properties.finishOnKey as string || '#';

        return {
          type: 'gather',
          name: node.id,
          transitions: {
            next: outgoingEdges[0]?.target || null,
            timeout: outgoingEdges.find(e => e.data?.label === 'timeout')?.target || null,
          },
          properties: {
            timeout: timeout * 1000, // FusionPBX uses milliseconds
            finish_on_key: finishOnKey,
            num_digits: maxDigits,
          },
        };
      }

      case 'hang-up-call': {
        return {
          type: 'hangup',
          name: node.id,
          transitions: {},
          properties: {
            reason: properties.reason as string || 'Call completed',
          },
        };
      }

      case 'forward-to-phone': {
        const phoneNumber = properties.phoneNumber as string;

        return {
          type: 'connect',
          name: node.id,
          transitions: {
            answered: outgoingEdges.find(e => e.data?.label === 'Success')?.target || null,
            failed: outgoingEdges.find(e => e.data?.label === 'Error')?.target || null,
          },
          properties: {
            to: phoneNumber,
          },
        };
      }

      case 'start-call-recording':
      case 'voicemail-recording': {
        const maxDuration = properties.maxDuration as number || 300;
        const finishOnKey = properties.finishOnKey as string || '#';

        return {
          type: 'record-voice',
          name: node.id,
          transitions: {
            recording_complete: outgoingEdges[0]?.target || null,
          },
          properties: {
            max_length: maxDuration,
            finish_on_key: finishOnKey,
            play_beep: properties.playBeep as boolean || true,
          },
        };
      }

      case 'send-sms': {
        const phoneNumber = properties.phoneNumber as string;
        const message = properties.message as string;

        return {
          type: 'send-message',
          name: node.id,
          transitions: {
            sent: outgoingEdges[0]?.target || null,
            failed: outgoingEdges.find(e => e.data?.label === 'Failure')?.target || null,
          },
          properties: {
            to: phoneNumber,
            body: message,
          },
        };
      }

      default: {
        // Default: pass through to next node
        return {
          type: 'say-play',
          name: node.id,
          transitions: {
            next: outgoingEdges[0]?.target || null,
          },
          properties: {
            say: `Processing ${nodeType}`,
          },
        };
      }
    }

    // Fallback
    return {
      type: 'say-play',
      name: node.id,
      transitions: {
        next: outgoingEdges[0]?.target || null,
      },
      properties: {
        say: 'Processing...',
      },
    };
  }

  /**
   * Convert a single node to Twilio Studio state
   */
  private convertNodeToTwilioState(
    node: WorkflowBuilderNode,
    edges: WorkflowBuilderEdge[],
  ): any {
    const nodeType = node.data?.type;
    const properties = node.data?.properties || {};

    // Get outgoing edges
    const outgoingEdges = edges.filter(e => e.source === node.id);

    switch (nodeType) {
      case 'answer-call': {
        return {
          type: 'say-play',
          name: node.id,
          transitions: {
            next: outgoingEdges[0]?.target || null,
          },
          properties: {
            say: 'Welcome!',
            voice: 'alice',
            language: 'en-US',
          },
        };
      }

      case 'play-audio-tts': {
        const messageType = properties.messageType;
        const messageText = properties.messageText as string;
        const audioFile = properties.audioFile as string;
        const voice = properties.voice as string || 'alice';
        const language = properties.language as string || 'en-US';

        if (messageType === 'tts' && messageText) {
          return {
            type: 'say-play',
            name: node.id,
            transitions: {
              next: outgoingEdges[0]?.target || null,
            },
            properties: {
              say: messageText,
              voice: this.mapVoiceToTwilio(voice),
              language: language,
            },
          };
        } else if (messageType === 'audio' && audioFile) {
          return {
            type: 'say-play',
            name: node.id,
            transitions: {
              next: outgoingEdges[0]?.target || null,
            },
            properties: {
              play: audioFile,
            },
          };
        }
        break;
      }

      case 'gather-input': {
        const inputType = properties.inputType as string;
        const maxDigits = properties.maxDigits as number || 10;
        const timeout = properties.timeout as number || 5;
        const finishOnKey = properties.finishOnKey as string || '#';

        return {
          type: 'gather',
          name: node.id,
          transitions: {
            next: outgoingEdges[0]?.target || null,
            timeout: outgoingEdges.find(e => e.data?.label === 'timeout')?.target || null,
          },
          properties: {
            timeout: timeout,
            finish_on_key: finishOnKey,
            num_digits: maxDigits,
            input: inputType === 'speech' ? 'speech' : 'dtmf',
          },
        };
      }

      case 'hang-up-call': {
        return {
          type: 'hangup',
          name: node.id,
          transitions: {},
          properties: {
            reason: properties.reason as string || 'Call completed',
          },
        };
      }

      case 'forward-to-phone': {
        const phoneNumber = properties.phoneNumber as string;
        const timeout = properties.timeout as number || 30;

        // Find edge labels for different outcomes
        const successEdge = outgoingEdges.find(e => e.data?.label === 'Success');
        const noAnswerEdge = outgoingEdges.find(e => e.data?.label === 'No Answer');
        const busyEdge = outgoingEdges.find(e => e.data?.label === 'Busy');
        const declineEdge = outgoingEdges.find(e => e.data?.label === 'Decline');
        const errorEdge = outgoingEdges.find(e => e.data?.label === 'Error');

        return {
          type: 'connect',
          name: node.id,
          transitions: {
            answered: successEdge?.target || null,
            no_answer: noAnswerEdge?.target || null,
            busy: busyEdge?.target || null,
            failed: errorEdge?.target || null,
          },
          properties: {
            timeout: timeout,
            to: phoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER,
          },
        };
      }

      case 'start-call-recording': {
        return {
          type: 'record-voice',
          name: node.id,
          transitions: {
            recording_complete: outgoingEdges[0]?.target || null,
          },
          properties: {
            recording_status_callback: `${process.env.WEBHOOK_BASE_URL}/api/webhooks/recording-status`,
            recording_status_callback_method: 'POST',
          },
        };
      }

      case 'voicemail-recording': {
        const maxDuration = properties.maxDuration as number || 300;
        const finishOnKey = properties.finishOnKey as string || '#';

        return {
          type: 'record-voice',
          name: node.id,
          transitions: {
            recording_complete: outgoingEdges[0]?.target || null,
          },
          properties: {
            max_length: maxDuration,
            finish_on_key: finishOnKey,
            play_beep: properties.playBeep as boolean || true,
            recording_status_callback: `${process.env.WEBHOOK_BASE_URL}/api/webhooks/recording-status`,
            recording_status_callback_method: 'POST',
          },
        };
      }

      case 'send-sms': {
        const phoneNumber = properties.phoneNumber as string;
        const message = properties.message as string;

        return {
          type: 'send-message',
          name: node.id,
          transitions: {
            sent: outgoingEdges[0]?.target || null,
            failed: outgoingEdges.find(e => e.data?.label === 'Failure')?.target || null,
          },
          properties: {
            to: phoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER,
            body: message,
          },
        };
      }

      default: {
        // Default: pass through to next node
        return {
          type: 'say-play',
          name: node.id,
          transitions: {
            next: outgoingEdges[0]?.target || null,
          },
          properties: {
            say: `Executing ${nodeType}`,
            voice: 'alice',
          },
        };
      }
    }

    // Fallback
    return {
      type: 'say-play',
      name: node.id,
      transitions: {
        next: outgoingEdges[0]?.target || null,
      },
      properties: {
        say: 'Processing...',
        voice: 'alice',
      },
    };
  }

  /**
   * Map voice names to Twilio voice names
   */
  private mapVoiceToTwilio(voice: string): string {
    const voiceMap: Record<string, string> = {
      default: 'alice',
      male: 'alice',
      female: 'alice',
      neutral: 'alice',
    };
    return voiceMap[voice.toLowerCase()] || 'alice';
  }

  /**
   * Execute workflow node (for simulation/testing)
   */
  async executeNode(node: WorkflowBuilderNode, context: Record<string, any>): Promise<any> {
    const nodeType = node.data?.type;
    const properties = node.data?.properties || {};

    logger.info(`Executing node: ${nodeType}`, { nodeId: node.id, context });

    // This is used for simulation - actual execution happens in Twilio
    return {
      nodeId: node.id,
      nodeType,
      result: 'success',
      data: {},
    };
  }
}

export const workflowExecutionEngine = new WorkflowExecutionEngine();

