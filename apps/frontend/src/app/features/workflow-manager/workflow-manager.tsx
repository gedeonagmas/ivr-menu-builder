import { useState, useEffect } from 'react';
import { Button } from '@synergycodes/axiom';
import { Play, Trash, CloudArrowUp } from '@phosphor-icons/react';
import { apiService } from '@/services/api.service';
import { showSnackbar } from '@/utils/show-snackbar';
import { SnackbarType } from '@synergycodes/axiom';
import styles from './workflow-manager.module.css';

type Workflow = {
  id: string;
  name: string;
  description?: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export function WorkflowManager() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deployingId, setDeployingId] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
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

  const handleDeploy = async (workflowId: string) => {
    setDeployingId(workflowId);
    try {
      await apiService.deployWorkflow(workflowId);
      showSnackbar({
        title: 'Workflow deployed successfully',
        variant: SnackbarType.SUCCESS,
      });
      loadWorkflows();
    } catch (error: any) {
      showSnackbar({
        title: error.message || 'Failed to deploy workflow',
        variant: SnackbarType.ERROR,
      });
    } finally {
      setDeployingId(null);
    }
  };

  const handleDelete = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) {
      return;
    }

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
  };

  if (isLoading) {
    return <div className={styles['loading']}>Loading workflows...</div>;
  }

  return (
    <div className={styles['container']}>
      <div className={styles['header']}>
        <h2>My Workflows</h2>
        <Button onClick={loadWorkflows}>Refresh</Button>
      </div>

      {workflows.length === 0 ? (
        <div className={styles['empty']}>
          <p>No workflows yet. Create one in the canvas!</p>
        </div>
      ) : (
        <div className={styles['workflow-list']}>
          {workflows.map((workflow) => (
            <div key={workflow.id} className={styles['workflow-item']}>
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
              <div className={styles['workflow-actions']}>
                {!workflow.isActive && (
                  <Button
                    onClick={() => handleDeploy(workflow.id)}
                    disabled={deployingId === workflow.id}
                    icon={<CloudArrowUp />}
                    variant="secondary"
                  >
                    {deployingId === workflow.id ? 'Deploying...' : 'Deploy'}
                  </Button>
                )}
                <Button
                  onClick={() => handleDelete(workflow.id)}
                  icon={<Trash />}
                  variant="secondary"
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

