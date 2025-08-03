import { Node, Edge } from 'reactflow';
import { OrgNode, ExpandedState } from '../utils/orgChartLayout';

export interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
}

export interface LayoutStrategy {
  name: string;
  calculateLayout(orgTree: OrgNode, expandedState: ExpandedState): LayoutResult;
}

export enum LayoutType {
  CUSTOM = 'custom',
  DAGRE = 'dagre'
}