import { Node, Edge } from 'reactflow';

export interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
}

export type LayoutOrientation = 'vertical' | 'horizontal';

export interface LayoutConfig {
  orientation: LayoutOrientation;
}