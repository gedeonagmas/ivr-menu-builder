import { useState, useEffect, useCallback } from 'react';
import { Button } from '@synergycodes/axiom';
import { Play, Pause, Stop, ArrowRight } from '@phosphor-icons/react';
import clsx from 'clsx';
import styles from './simulation.module.css';
import { WorkflowBuilderNode, WorkflowBuilderEdge } from '@workflow-builder/types/node-data';

type SimulationProps = {
  nodes: WorkflowBuilderNode[];
  edges: WorkflowBuilderEdge[];
  onClose: () => void;
};

type SimulationState = 'idle' | 'running' | 'paused' | 'completed';
type ExecutionStep = {
  nodeId: string;
  nodeLabel: string;
  timestamp: number;
};

export function Simulation({ nodes, edges, onClose }: SimulationProps) {
  const [state, setState] = useState<SimulationState>('idle');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [executionPath, setExecutionPath] = useState<ExecutionStep[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  // Find the starting node (usually the first node or one without incoming edges)
  const findStartNode = useCallback(() => {
    if (nodes.length === 0) return null;
    
    // Find nodes with no incoming edges
    const nodeIds = new Set(nodes.map(n => n.id));
    const nodesWithIncoming = new Set(edges.map(e => e.target));
    const startNodes = nodes.filter(n => !nodesWithIncoming.has(n.id));
    
    return startNodes.length > 0 ? startNodes[0] : nodes[0];
  }, [nodes, edges]);

  // Trace execution path through the workflow
  const traceExecutionPath = useCallback(() => {
    const startNode = findStartNode();
    if (!startNode) return [];

    const path: ExecutionStep[] = [];
    const visited = new Set<string>();
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    function traverse(nodeId: string) {
      if (visited.has(nodeId) || !nodeMap.has(nodeId)) return;
      
      visited.add(nodeId);
      const node = nodeMap.get(nodeId)!;
      const nodeLabel = node.data?.properties?.label || node.type || nodeId;
      
      path.push({
        nodeId,
        nodeLabel: String(nodeLabel),
        timestamp: Date.now(),
      });

      // Find outgoing edges
      const outgoingEdges = edges.filter(e => e.source === nodeId);
      
      // For now, take the first edge (in a real simulation, this would evaluate conditions)
      if (outgoingEdges.length > 0) {
        const nextNodeId = outgoingEdges[0].target;
        traverse(nextNodeId);
      }
    }

    traverse(startNode.id);
    return path;
  }, [nodes, edges, findStartNode]);

  useEffect(() => {
    if (state === 'running' && executionPath.length > 0) {
      if (currentStep < executionPath.length) {
        const step = executionPath[currentStep];
        setActiveNodeId(step.nodeId);
        
        const timer = setTimeout(() => {
          if (currentStep < executionPath.length - 1) {
            setCurrentStep(prev => prev + 1);
          } else {
            setState('completed');
            setActiveNodeId(null);
          }
        }, 2000); // 2 seconds per step

        return () => clearTimeout(timer);
      }
    }
  }, [state, currentStep, executionPath]);

  const handleStart = () => {
    const path = traceExecutionPath();
    if (path.length === 0) {
      alert('No valid execution path found. Please check your workflow.');
      return;
    }
    
    setExecutionPath(path);
    setCurrentStep(0);
    setState('running');
  };

  const handlePause = () => {
    setState('paused');
  };

  const handleResume = () => {
    setState('running');
  };

  const handleStop = () => {
    setState('idle');
    setCurrentStep(0);
    setExecutionPath([]);
    setActiveNodeId(null);
  };

  const getNodeDisplayName = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return nodeId;
    return node.data?.properties?.label || node.type || nodeId;
  };

  return (
    <div className={styles['container']}>
      <div className={styles['controls']}>
        {state === 'idle' && (
          <Button onClick={handleStart} icon={<Play />}>
            Start Simulation
          </Button>
        )}
        {state === 'running' && (
          <>
            <Button onClick={handlePause} icon={<Pause />} variant="secondary">
              Pause
            </Button>
            <Button onClick={handleStop} icon={<Stop />} variant="secondary">
              Stop
            </Button>
          </>
        )}
        {state === 'paused' && (
          <>
            <Button onClick={handleResume} icon={<Play />}>
              Resume
            </Button>
            <Button onClick={handleStop} icon={<Stop />} variant="secondary">
              Stop
            </Button>
          </>
        )}
        {state === 'completed' && (
          <>
            <Button onClick={handleStart} icon={<Play />}>
              Restart
            </Button>
            <Button onClick={onClose} variant="secondary">
              Close
            </Button>
          </>
        )}
      </div>

      <div className={styles['status']}>
        <div className={styles['status-label']}>
          Status: <span className={styles[`status-${state}`]}>{state.toUpperCase()}</span>
        </div>
        {executionPath.length > 0 && (
          <div className={styles['progress']}>
            Step {currentStep + 1} of {executionPath.length}
          </div>
        )}
      </div>

      <div className={styles['execution-path']}>
        <h3 className={styles['path-title']}>Execution Path</h3>
        {executionPath.length === 0 ? (
          <p className={styles['empty-message']}>
            Click "Start Simulation" to trace the execution path through your IVR flow.
          </p>
        ) : (
          <div className={styles['path-list']}>
            {executionPath.map((step, index) => (
              <div
                key={step.nodeId}
                className={clsx(styles['path-item'], {
                  [styles['active']]: index === currentStep && state === 'running',
                  [styles['completed']]: index < currentStep,
                  [styles['pending']]: index > currentStep,
                })}
              >
                <div className={styles['step-number']}>{index + 1}</div>
                <div className={styles['step-content']}>
                  <div className={styles['step-label']}>{step.nodeLabel}</div>
                  <div className={styles['step-type']}>{getNodeDisplayName(step.nodeId)}</div>
                </div>
                {index < executionPath.length - 1 && (
                  <ArrowRight className={styles['arrow']} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {activeNodeId && (
        <div className={styles['active-node']}>
          <strong>Currently executing:</strong> {getNodeDisplayName(activeNodeId)}
        </div>
      )}

      {state === 'completed' && (
        <div className={styles['completion-message']}>
          ✓ Simulation completed successfully! The call flow has been traced through all nodes.
        </div>
      )}
    </div>
  );
}

