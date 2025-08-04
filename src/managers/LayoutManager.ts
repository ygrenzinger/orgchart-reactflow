import {
  LayoutResult,
  LayoutOrientation,
} from "../types/layoutStrategy";
import { DagreLayoutStrategy } from "../strategies/DagreLayoutStrategy";
import { OrgNode, ExpandedState } from "../utils/orgChartLayout";
import { BaseLayoutProcessor } from "../processors/BaseLayoutProcessor";

export class LayoutManager {
  private layoutStrategy: DagreLayoutStrategy;
  private currentOrientation: LayoutOrientation;
  private processor: BaseLayoutProcessor;

  constructor(defaultOrientation: LayoutOrientation = 'vertical') {
    this.layoutStrategy = new DagreLayoutStrategy();
    this.currentOrientation = defaultOrientation;
    this.processor = new BaseLayoutProcessor();
  }

  setOrientation(orientation: LayoutOrientation): void {
    this.currentOrientation = orientation;
  }

  getCurrentOrientation(): LayoutOrientation {
    return this.currentOrientation;
  }

  getCurrentOrientationName(): string {
    return this.currentOrientation === 'vertical' ? 'Vertical Layout' : 'Horizontal Layout';
  }

  getAvailableOrientations(): Array<{ orientation: LayoutOrientation; name: string }> {
    return [
      { orientation: 'vertical', name: 'Vertical Layout' },
      { orientation: 'horizontal', name: 'Horizontal Layout' },
    ];
  }

  calculateLayout(
    orgTree: OrgNode,
    expandedState: ExpandedState
  ): LayoutResult {
    if (!orgTree) return { nodes: [], edges: [] };

    // Step 1: Use processor to collect visible nodes and create nodes/edges
    const visibleNodes = this.processor.collectVisibleNodes(orgTree, expandedState);
    const { nodes, edges } = this.processor.createNodesAndEdges(visibleNodes, expandedState);

    // Step 2: Apply layout with current orientation
    return this.layoutStrategy.applyLayout(nodes, edges, this.currentOrientation);
  }
}
