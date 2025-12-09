import { useState, useEffect, useContext } from 'react';
import { apiService } from '@/services/api.service';
import { showSnackbar } from '@/utils/show-snackbar';
import { SnackbarType } from '@synergycodes/axiom';
import useStore from '@/store/store';
import styles from './workflow-list.module.css';
import { Button } from '@synergycodes/axiom';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { ModalContext } from '../modal-provider';
import { useConfirmationModal } from '../confirmation/use-confirmation-modal';

type Workflow = {
  id: string;
  name: string;
  description?: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export function WorkflowList() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { closeModal } = useContext(ModalContext);
  const { openConfirmation } = useConfirmationModal();
  const setDiagramModel = useStore((state) => state.setDiagramModel);
  const setCurrentWorkflowId = useStore((state) => state.setCurrentWorkflowId);
  const setDocumentName = useStore((state) => state.setDocumentName);
  const reactFlowInstance = useStore((state) => state.reactFlowInstance);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setIsLoading(true);
    try {
      const isGuest = localStorage.getItem('guest_mode') === 'true';
      if (isGuest) {
        // Guest mode: show empty state or localStorage workflows
        setWorkflows([]);
        return;
      }

      const { workflows } = await apiService.getWorkflows();
      setWorkflows(workflows);
    } catch (error: any) {
      showSnackbar({
        title: error.message || 'Failed to load workflows',
        variant: SnackbarType.ERROR,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadWorkflow = async (workflowId: string) => {
    try {
      const { workflow } = await apiService.getWorkflow(workflowId);
      
      // Convert workflow diagram to DiagramModel format
      const model = {
        name: workflow.name,
        layoutDirection: workflow.diagram?.layoutDirection || 'RIGHT',
        diagram: workflow.diagram || { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
      };

      // Load the workflow into the canvas
      await setDiagramModel(model, workflowId);
      setDocumentName(workflow.name);
      setCurrentWorkflowId(workflowId);

      // Reset viewport if available
      if (model.diagram.viewport && reactFlowInstance) {
        reactFlowInstance.setViewport(model.diagram.viewport);
      }

      showSnackbar({
        title: 'Workflow loaded successfully',
        variant: SnackbarType.SUCCESS,
      });

      closeModal();
    } catch (error: any) {
      showSnackbar({
        title: error.message || 'Failed to load workflow',
        variant: SnackbarType.ERROR,
      });
    }
  };

  const handleDelete = async (workflowId: string, workflowName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    openConfirmation({
      message: `Are you sure you want to delete "${workflowName}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
      title: 'Delete Workflow',
      onConfirm: async () => {
        try {
          await apiService.deleteWorkflow(workflowId);
          showSnackbar({
            title: 'Workflow deleted',
            variant: SnackbarType.SUCCESS,
          });
          loadWorkflows();
        } catch (error: any) {
          showSnackbar({
            title: error.message || 'Failed to delete workflow',
            variant: SnackbarType.ERROR,
          });
        }
      },
    });
  };

  return (
    <div className={styles['container']}>
      {isLoading ? (
        <div className={styles['loading']}>Loading workflows...</div>
      ) : workflows.length === 0 ? (
        <div className={styles['empty']}>
          <p>No workflows yet. Create one in the canvas!</p>
        </div>
      ) : (
        <div className={styles['workflow-list']}>
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className={styles['workflow-item']}
              onClick={() => handleLoadWorkflow(workflow.id)}
            >
              <div className={styles['workflow-info']}>
                <h3>{workflow.name}</h3>
                {workflow.description && <p>{workflow.description}</p>}
                <div className={styles['workflow-meta']}>
                  <span className={styles[`status-${workflow.status.toLowerCase()}`]}>
                    {workflow.status}
                  </span>
                  {workflow.isActive && <span className={styles['active-badge']}>Active</span>}
                  <span className={styles['date']}>
                    Updated: {new Date(workflow.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className={styles['workflow-actions']} onClick={(e) => e.stopPropagation()}>
                <Button
                  onClick={() => handleLoadWorkflow(workflow.id)}
                  icon={<PencilSimple />}
                  variant="secondary"
                  size="small"
                >
                  Edit
                </Button>
                <Button
                  onClick={(e) => handleDelete(workflow.id, workflow.name, e)}
                  icon={<Trash />}
                  variant="secondary"
                  size="small"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

