import { PaletteItem } from '@workflow-builder/types/common';
import { answerCallNode } from './nodes/answer-call/answer-call';
import { hangUpCallNode } from './nodes/hang-up-call/hang-up-call';
import { playAudioTTSNode } from './nodes/play-audio-tts/play-audio-tts';
import { sendSMSNode } from './nodes/send-sms/send-sms';
import { gatherInputNode } from './nodes/gather-input/gather-input';
import { forwardToPhoneNode } from './nodes/forward-to-phone/forward-to-phone';
import { startCallRecordingNode } from './nodes/start-call-recording/start-call-recording';
import { stopCallRecordingNode } from './nodes/stop-call-recording/stop-call-recording';
import { voicemailRecordingNode } from './nodes/voicemail-recording/voicemail-recording';
import { aiAgent } from './nodes/ai-agent/ai-agent';
import { requestNode } from './nodes/request/request';
import { conditionsNode } from './nodes/conditions/conditions';
import { executeSWMLNode } from './nodes/execute-swml/execute-swml';
import { setVariablesNode } from './nodes/set-variables/set-variables';
import { unsetVariablesNode } from './nodes/unset-variables/unset-variables';
import { ivrMenuNode } from './nodes/ivr-menu/ivr-menu';

export const paletteData: PaletteItem[] = [
  answerCallNode,
  hangUpCallNode,
  playAudioTTSNode,
  sendSMSNode,
  gatherInputNode,
  forwardToPhoneNode,
  startCallRecordingNode,
  stopCallRecordingNode,
  voicemailRecordingNode,
  requestNode,
  conditionsNode,
  executeSWMLNode,
  setVariablesNode,
  unsetVariablesNode,
  aiAgent,
  ivrMenuNode,
];
