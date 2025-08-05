import { LayoutResult, LayoutOrientation } from "../types/layoutStrategy";
import { DagreLayoutStrategy } from "../strategies/DagreLayoutStrategy";
import { OrgTree } from "../domain/OrgTreeBuilder";
import { ExpandedState, VisibilityCalculator } from "../domain/VisibilityCalculator";
import { NodeEdgeFactory } from "./NodeEdgeFactory";

export interface OrientationOption {
  orientation: LayoutOrientation;
  name: string;
}

export class LayoutEngine {
  private layoutStrategy: DagreLayoutStrategy;
  private currentOrientation: LayoutOrientation;
  private visibilityCalculator: VisibilityCalculator;
  private nodeEdgeFactory: NodeEdgeFactory;

  constructor(defaultOrientation: LayoutOrientation = 'vertical') {
    this.layoutStrategy = new DagreLayoutStrategy();
    this.currentOrientation = defaultOrientation;
    this.visibilityCalculator = new VisibilityCalculator();
    this.nodeEdgeFactory = new NodeEdgeFactory();
  }

  setOrientation(orientation: LayoutOrientation): void {
    this.currentOrientation = orientation;
  }

  getCurrentOrientation(): LayoutOrientation {
    return this.currentOrientation;
  }

  getAvailableOrientations(): OrientationOption[] {
    return [
      { orientation: 'vertical', name: 'Vertical Layout' },
      { orientation: 'horizontal', name: 'Horizontal Layout' },
    ];
  }

  calculateLayout(
    orgTree: OrgTree,
    expandedState: ExpandedState
  ): LayoutResult {
    if (!orgTree) return { nodes: [], edges: [] };

    // Step 1: Calculate visible nodes based on expanded state
    const visibleNodes = this.visibilityCalculator.calculateVisibleNodes(orgTree, expandedState);
    
    // Step 2: Create ReactFlow nodes and edges
    const nodes = this.nodeEdgeFactory.createNodes(visibleNodes, expandedState, this.currentOrientation);
    const edges = this.nodeEdgeFactory.createEdges(visibleNodes, expandedState);

    // Step 3: Apply layout strategy with current orientation
    return this.layoutStrategy.applyLayout(nodes, edges, this.currentOrientation);
  }

  initializeExpandedState(orgTree: OrgTree): ExpandedState {
    return this.visibilityCalculator.initializeExpandedState(orgTree);
  }
}