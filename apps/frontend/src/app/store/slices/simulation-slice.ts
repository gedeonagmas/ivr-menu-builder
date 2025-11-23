import { GetDiagramState, SetDiagramState } from '@/store/store';
import { WorkflowBuilderNode, WorkflowBuilderEdge } from '@workflow-builder/types/node-data';

export type SimulationState = {
  isSimulating: boolean;
  isPaused: boolean;
  activeNodeId: string | null;
  executionPath: string[];
  currentStep: number;
};

export function useSimulationSlice(set: SetDiagramState, get: GetDiagramState) {
  return {
    isSimulating: false,
    isPaused: false,
    activeNodeId: null,
    executionPath: [],
    currentStep: 0,
    startSimulation: () => {
      const { nodes, edges } = get();
      if (nodes.length === 0) {
        return;
      }

      // Find start node (no incoming edges)
      const nodeIds = new Set(nodes.map(n => n.id));
      const nodesWithIncoming = new Set(edges.map(e => e.target));
      const startNodes = nodes.filter(n => !nodesWithIncoming.has(n.id));
      const startNode = startNodes.length > 0 ? startNodes[0] : nodes[0];

      if (!startNode) return;

      // Build execution path
      const path: string[] = [];
      const visited = new Set<string>();
      const nodeMap = new Map(nodes.map(n => [n.id, n]));

      function traverse(nodeId: string) {
        if (visited.has(nodeId) || !nodeMap.has(nodeId)) return;
        visited.add(nodeId);
        path.push(nodeId);

        const outgoingEdges = edges.filter(e => e.source === nodeId);
        if (outgoingEdges.length > 0) {
          traverse(outgoingEdges[0].target);
        }
      }

      traverse(startNode.id);

      set({
        isSimulating: true,
        isPaused: false,
        activeNodeId: path[0] || null,
        executionPath: path,
        currentStep: 0,
      });
    },
    pauseSimulation: () => {
      set({ isPaused: true });
    },
    resumeSimulation: () => {
      set({ isPaused: false });
    },
    stopSimulation: () => {
      set({
        isSimulating: false,
        isPaused: false,
        activeNodeId: null,
        executionPath: [],
        currentStep: 0,
      });
    },
    setActiveNode: (nodeId: string | null) => {
      set({ activeNodeId: nodeId });
    },
    setCurrentStep: (step: number) => {
      set({ currentStep: step });
    },
  };
}

