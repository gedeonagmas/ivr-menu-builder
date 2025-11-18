import { useEffect, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';

function addArrowMarker(svgElement: SVGElement): boolean {
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

function findReactFlowSVG(): SVGElement | null {
  // Try multiple selectors to find the ReactFlow SVG element
  const selectors = [
    '.react-flow__edges svg',
    '.react-flow svg',
    '[class*="react-flow"] svg',
    'svg.react-flow__edges',
  ];

  for (const selector of selectors) {
    const element = document.querySelector<SVGElement>(selector);
    if (element) {
      return element;
    }
  }

  // Try to find any SVG within the ReactFlow container
  const reactFlowContainer = document.querySelector('.react-flow');
  if (reactFlowContainer) {
    const svg = reactFlowContainer.querySelector<SVGElement>('svg');
    if (svg) {
      return svg;
    }
  }

  return null;
}

export function ArrowMarker() {
  const { getViewport } = useReactFlow();
  const observerRef = useRef<MutationObserver | null>(null);
  const addedRef = useRef(false);

  useEffect(() => {
    if (addedRef.current) {
      return;
    }

    const tryAddMarker = () => {
      const svgElement = findReactFlowSVG();
      if (svgElement && addArrowMarker(svgElement)) {
        addedRef.current = true;
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
        return true;
      }
      return false;
    };

    // Try immediately
    if (tryAddMarker()) {
      return;
    }

    // Use MutationObserver to watch for SVG creation
    const observer = new MutationObserver(() => {
      if (tryAddMarker()) {
        observer.disconnect();
        observerRef.current = null;
      }
    });

    // Observe the document body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    observerRef.current = observer;

    // Also try after a short delay
    const timeoutId = setTimeout(() => {
      tryAddMarker();
    }, 100);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      clearTimeout(timeoutId);
    };
  }, [getViewport]);

  return null;
}

