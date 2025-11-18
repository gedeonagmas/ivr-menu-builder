import { useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';

function addArrowMarker() {
  // Find the ReactFlow SVG element - try multiple selectors
  const svgElement =
    document.querySelector('.react-flow__edges svg') ||
    document.querySelector('.react-flow svg') ||
    document.querySelector('[data-id="react-flow"] svg');

  if (!svgElement) {
    return false;
  }

  // Check if marker already exists
  let defs = svgElement.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svgElement.insertBefore(defs, svgElement.firstChild);
  }

  // Check if marker already exists
  if (defs.querySelector('#react-flow__arrowclosed')) {
    return true;
  }

  // Create the marker element
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'react-flow__arrowclosed');
  marker.setAttribute('markerWidth', '12.5');
  marker.setAttribute('markerHeight', '12.5');
  marker.setAttribute('viewBox', '-10 -10 20 20');
  marker.setAttribute('markerUnits', 'strokeWidth');
  marker.setAttribute('refX', '0');
  marker.setAttribute('refY', '0');
  marker.setAttribute('orient', 'auto');

  const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  polyline.setAttribute('stroke', 'currentColor');
  polyline.setAttribute('stroke-linecap', 'round');
  polyline.setAttribute('stroke-linejoin', 'round');
  polyline.setAttribute('stroke-width', '1');
  polyline.setAttribute('fill', 'currentColor');
  polyline.setAttribute('points', '-5,-4 0,0 -5,4');

  marker.appendChild(polyline);
  defs.appendChild(marker);

  return true;
}

export function ArrowMarker() {
  const reactFlowInstance = useReactFlow();

  useEffect(() => {
    // Try to add marker immediately
    if (addArrowMarker()) {
      return;
    }

    // If SVG is not ready, wait a bit and try again
    const timeoutId = setTimeout(() => {
      addArrowMarker();
    }, 100);

    // Also try when ReactFlow instance is ready
    const intervalId = setInterval(() => {
      if (addArrowMarker()) {
        clearInterval(intervalId);
      }
    }, 200);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [reactFlowInstance]);

  return null;
}

