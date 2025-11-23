import { localStorageKey } from '@workflow-builder/types/consts';
import { showSnackbar } from '@/utils/show-snackbar';
import { SnackbarType } from '@synergycodes/axiom';
import { DiagramState } from '../diagram-slice';
import { apiService } from '@/services/api.service';

export function saveDiagram(get: () => DiagramState) {
  return async (showNotification = true) => {
    try {
      const { reactFlowInstance, documentName, layoutDirection, currentWorkflowId } = get();
      const data = reactFlowInstance?.toObject();
      const model = {
        name: documentName || '',
        layoutDirection: layoutDirection,
        diagram: data,
      };

      // Try to save to API first (skip if guest mode)
      const isGuest = localStorage.getItem('guest_mode') === 'true';
      
      if (!isGuest) {
        try {
          if (currentWorkflowId) {
            // Update existing workflow
            await apiService.updateWorkflow(currentWorkflowId, {
              name: documentName || 'Untitled',
              diagram: data as any,
            });
          } else {
            // Create new workflow
            const result = await apiService.createWorkflow(
              documentName || 'Untitled',
              '',
              data as any,
            );
            // Store workflow ID for future updates
            // This would typically be stored in the store
          }
        } catch (apiError) {
          // Fallback to localStorage if API fails
          console.warn('API save failed, using localStorage fallback:', apiError);
          const json = JSON.stringify(model);
          localStorage.setItem(localStorageKey, json);
        }
      } else {
        // Guest mode: always use localStorage
        const json = JSON.stringify(model);
        localStorage.setItem(localStorageKey, json);
      }

      if (!showNotification) {
        return;
      }

      showSnackbar({
        title: 'saveDiagramSuccess',
        variant: SnackbarType.SUCCESS,
      });
    } catch {
      onError();
    }
  };
}

function onError() {
  showSnackbar({
    title: 'saveDiagramError',
    variant: SnackbarType.ERROR,
  });
}
