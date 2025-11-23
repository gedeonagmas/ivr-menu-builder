import { useEffect, useRef } from 'react';
import useStore from '@/store/store';
import { WorkflowBuilderNode } from '@workflow-builder/types/node-data';

// TTS Engine
class TTSEngine {
  private synth: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  speak(text: string, options?: { voice?: string; language?: string; speed?: number; volume?: number }) {
    if (!this.synth) {
      console.warn('Speech synthesis not available');
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      // Cancel any ongoing speech
      this.synth!.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options?.language || 'en-US';
      utterance.rate = options?.speed || 1;
      utterance.volume = (options?.volume || 100) / 100;

      if (options?.voice) {
        const voices = this.synth!.getVoices();
        const voice = voices.find(v => v.name.includes(options!.voice!));
        if (voice) utterance.voice = voice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      this.synth!.speak(utterance);
    });
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

const ttsEngine = new TTSEngine();

// Audio playback
function playAudio(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('Audio playback failed'));
    audio.play().catch(reject);
  });
}

// Execute a node
async function executeNode(node: WorkflowBuilderNode): Promise<void> {
  const nodeType = node.data?.type;
  const properties = node.data?.properties;

  if (!properties) return;

  switch (nodeType) {
    case 'play-audio-tts': {
      const messageType = properties.messageType;
      const messageText = properties.messageText as string;
      const audioFile = properties.audioFile as string;
      const voice = properties.voice as string;
      const language = properties.language as string;
      const speed = (properties.speed as number) || 1;
      const volume = (properties.volume as number) || 100;

      if (messageType === 'tts' && messageText) {
        await ttsEngine.speak(messageText, { voice, language, speed, volume });
      } else if (messageType === 'audio' && audioFile) {
        await playAudio(audioFile);
      }
      break;
    }
    case 'gather-input': {
      // For simulation, we'll just wait a bit to simulate input gathering
      await new Promise(resolve => setTimeout(resolve, 2000));
      break;
    }
    case 'send-sms': {
      // Simulate SMS sending
      console.log('Sending SMS:', properties.message);
      await new Promise(resolve => setTimeout(resolve, 1000));
      break;
    }
    default:
      // Default: wait a short time for other nodes
      await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

export function useSimulation() {
  const isSimulating = useStore(state => state.isSimulating);
  const isPaused = useStore(state => state.isPaused);
  const activeNodeId = useStore(state => state.activeNodeId);
  const executionPath = useStore(state => state.executionPath);
  const currentStep = useStore(state => state.currentStep);
  const nodes = useStore(state => state.nodes);
  const edges = useStore(state => state.edges);
  const setActiveNode = useStore(state => state.setActiveNode);
  const setCurrentStep = useStore(state => state.setCurrentStep);
  const stopSimulation = useStore(state => state.stopSimulation);

  const executionRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!isSimulating || isPaused || executionPath.length === 0) {
      return;
    }

    if (currentStep >= executionPath.length) {
      // Simulation complete
      stopSimulation();
      ttsEngine.stop();
      return;
    }

    const nodeId = executionPath[currentStep];
    const node = nodes.find(n => n.id === nodeId);

    if (!node) {
      // Skip invalid nodes
      if (currentStep < executionPath.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        stopSimulation();
      }
      return;
    }

    // Set active node
    setActiveNode(nodeId);

    // Execute the node
    let cancelled = false;
    executionRef.current = executeNode(node)
      .then(() => {
        if (!cancelled && currentStep < executionPath.length - 1) {
          // Move to next step
          setCurrentStep(currentStep + 1);
        } else if (!cancelled) {
          // Simulation complete
          stopSimulation();
          ttsEngine.stop();
        }
      })
      .catch((error) => {
        console.error('Error executing node:', error);
        if (!cancelled && currentStep < executionPath.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          stopSimulation();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isSimulating, isPaused, currentStep, executionPath, nodes, setActiveNode, setCurrentStep, stopSimulation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ttsEngine.stop();
    };
  }, []);
}

