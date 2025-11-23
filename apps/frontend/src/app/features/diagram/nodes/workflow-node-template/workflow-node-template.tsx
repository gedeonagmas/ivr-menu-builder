import { Handle } from '@xyflow/react';
import { IconType, LayoutDirection } from '@workflow-builder/types/common';
import { memo, useMemo } from 'react';
import { Collapsible, NodeDescription, NodeIcon, NodePanel, Status } from '@synergycodes/axiom';
import { Icon } from '@workflow-builder/icons';
import { getHandleId } from '../../handles/get-handle-id';
import { getHandlePosition } from '../../handles/get-handle-position';
import useStore from '@/store/store';
import clsx from 'clsx';

import styles from './workflow-node-template.module.css';
import { withOptionalPlugins } from '@/features/plugins/utils/adapter-components';
import { NodeData } from '@workflow-builder/types/node-data';

type WorkflowNodeTemplateProps = {
  id: string;
  icon: IconType;
  label: string;
  description: string;
  data?: NodeData;
  selected?: boolean;
  layoutDirection?: LayoutDirection;
  isConnecting?: boolean;
  showHandles?: boolean;
  isValid?: boolean;
  children?: React.ReactNode;
};

const WorkflowNodeTemplateComponent = memo(
  ({
    id,
    icon,
    label,
    description,
    layoutDirection = 'RIGHT',
    selected = false,
    showHandles = true,
    isValid,
    children,
    data,
  }: WorkflowNodeTemplateProps) => {
    const handleTargetId = getHandleId({ nodeId: id, handleType: 'target' });
    const handleSourceId = getHandleId({ nodeId: id, handleType: 'source' });

    const handleTargetPosition = getHandlePosition({ direction: layoutDirection, handleType: 'target' });
    const handleSourcePosition = getHandlePosition({ direction: layoutDirection, handleType: 'source' });

    const nodeType = data?.type || '';
    const iconColor = nodeType === 'hang-up-call' || nodeType === 'stop-call-recording' ? '#ef4444' : 'currentColor';
    const iconElement = useMemo(() => <Icon name={icon} size="large" color={iconColor} />, [icon, iconColor]);

    const hasContent = !!children;
    const activeNodeId = useStore((store) => store.activeNodeId);
    const isActive = activeNodeId === id;

    const nodeTypeClass = nodeType ? styles[`node-type-${nodeType}`] : '';

    return (
      <Collapsible>
        <NodePanel.Root 
          selected={selected} 
          className={clsx(styles['content'], nodeTypeClass, {
            [styles['simulating']]: isActive,
          })} 
          data-node-type={nodeType}
        >
          <NodePanel.Header>
            <Status status={isValid === false ? 'invalid' : undefined} />
            <NodeIcon icon={iconElement} />
            <NodeDescription label={label} description={description} />
            {hasContent && <Collapsible.Button />}
          </NodePanel.Header>
          <NodePanel.Content isVisible={hasContent}>
            <Collapsible.Content>
              <div className={styles['collapsible']}>{children}</div>
            </Collapsible.Content>
          </NodePanel.Content>
          <NodePanel.Handles isVisible={showHandles} alignment={hasContent ? 'header' : 'center'}>
            <Handle id={handleTargetId} position={handleTargetPosition} type="target" />
            <Handle id={handleSourceId} position={handleSourcePosition} type="source" />
          </NodePanel.Handles>
        </NodePanel.Root>
      </Collapsible>
    );
  },
);

export const WorkflowNodeTemplate = withOptionalPlugins(WorkflowNodeTemplateComponent, 'WorkflowNodeTemplate');
