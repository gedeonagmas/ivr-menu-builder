import { Connection, OnConnect, addEdge, Node } from '@xyflow/react';
import { GetDiagramState, SetDiagramState } from '@/store/store';
import {
  ConnectionBeingDragged,
  DiagramModel,
  LayoutDirection,
  WorkflowBuilderReactFlowInstance,
} from '@workflow-builder/types/common';
import { WorkflowBuilderNode, WorkflowBuilderEdge } from '@workflow-builder/types/node-data';
import { getEdgeZIndex } from '@/features/diagram/edges/get-edge-z-index';

export type DiagramState = {
  nodes: WorkflowBuilderNode[];
  edges: WorkflowBuilderEdge[];
  reactFlowInstance: WorkflowBuilderReactFlowInstance | null;
  documentName: string | null;
  currentWorkflowId: string | null;
  isReadOnlyMode: boolean;
  layoutDirection: LayoutDirection;
  showGrid: boolean;
  onConnect: OnConnect;
  onInit: (instance: WorkflowBuilderReactFlowInstance) => void;
  setDocumentName: (name: string) => void;
  setDiagramModel: (model?: DiagramModel, workflowId?: string | null) => void;
  setCurrentWorkflowId: (id: string | null) => void;
  createNewFlow: (name?: string) => void;
  clearCanvas: () => void;
  setToggleReadOnlyMode: (value?: boolean) => void;
  setLayoutDirection: (value: LayoutDirection) => void;
  setShowGrid: (value: boolean) => void;
  setConnectionBeingDragged: (nodeId: string | null, handleId: string | null) => void;
  connectionBeingDragged: ConnectionBeingDragged | null;
  draggedSegmentDestinationId: string | null;
  setDraggedSegmentDestinationId: (id: string | null) => void;
  getNodes: () => Node[];
};

export function useDiagramSlice(set: SetDiagramState, get: GetDiagramState) {
  return {
    nodes: [],
    edges: [],
    reactFlowInstance: null,
    documentName: null,
    currentWorkflowId: null,
    isReadOnlyMode: false,
    layoutDirection: 'RIGHT' as LayoutDirection,
    showGrid: true,
    connectionBeingDragged: null,
    draggedSegmentDestinationId: null,
    onConnect: (connection: Connection) => {
      set({
        edges: addEdge(
          {
            ...connection,
            zIndex: getEdgeZIndex(connection),
            type: 'labelEdge',
          },
          get().edges,
        ),
      });
    },
    onInit: (instance: WorkflowBuilderReactFlowInstance) => {
      set({
        reactFlowInstance: instance,
      });
    },
    setDiagramModel: async (model?: DiagramModel, workflowId?: string | null) => {
      const nodes = model?.diagram.nodes || [];
      const edges = model?.diagram.edges || [];
      const documentName = model?.name || 'Untitled';
      const layoutDirection = model?.layoutDirection || 'RIGHT';

      set({
        nodes,
        layoutDirection,
        documentName,
        currentWorkflowId: workflowId ?? null,
      });

      set({
        edges: edges,
      });
    },
    setDocumentName: (name: string) => {
      set({
        documentName: name,
      });
    },
    setCurrentWorkflowId: (id: string | null) => {
      set({
        currentWorkflowId: id,
      });
    },
    createNewFlow: (name?: string) => {
      // Clear nodes and edges first
      set({ nodes: [] });
      set({ edges: [] });
      // Set document name and workflow ID
      set({
        documentName: name || 'Untitled',
        currentWorkflowId: null,
      });
      // Reset viewport after a short delay to ensure state is updated
      setTimeout(() => {
        const instance = get().reactFlowInstance;
        if (instance) {
          instance.setViewport({ x: 0, y: 0, zoom: 1 });
        }
      }, 0);
    },
    clearCanvas: () => {
      // Clear nodes and edges, but preserve workflow ID and document name
      // Use separate set calls to avoid state update conflicts
      set({ nodes: [] });
      set({ edges: [] });
      // Reset viewport to center after state updates
      setTimeout(() => {
        const instance = get().reactFlowInstance;
        if (instance) {
          instance.setViewport({ x: 0, y: 0, zoom: 1 });
        }
      }, 0);
    },
    setToggleReadOnlyMode: (value?: boolean) => {
      set({
        isReadOnlyMode: value ?? !get().isReadOnlyMode,
      });
    },
    setLayoutDirection: (value: LayoutDirection) => {
      set({
        layoutDirection: value,
      });
    },
    setShowGrid: (value: boolean) => {
      set({
        showGrid: value,
      });
    },
    setConnectionBeingDragged: (nodeId: string | null, handleId: string | null) => {
      if (handleId && nodeId) {
        set({
          connectionBeingDragged: {
            handleId,
            nodeId,
          },
        });
      } else {
        set({
          connectionBeingDragged: null,
        });
      }
    },
    setDraggedSegmentDestinationId: (id: string | null) => {
      set({ draggedSegmentDestinationId: id });
    },
    getNodes: () => get().nodes,
  };
}
