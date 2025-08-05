import { OrgTree } from './OrgTreeBuilder';

export interface ExpandedState {
  [employeeId: number]: boolean;
}

export class VisibilityCalculator {
  calculateVisibleNodes(
    tree: OrgTree,
    expandedState: ExpandedState,
    isVisible: boolean = true
  ): OrgTree[] {
    const visibleNodes: OrgTree[] = [];

    if (isVisible) {
      visibleNodes.push(tree);
    }

    const isExpanded = expandedState[tree.employee.id] ?? false;
    if (isVisible && isExpanded) {
      tree.children.forEach((child) => {
        visibleNodes.push(
          ...this.calculateVisibleNodes(child, expandedState, true)
        );
      });
    }

    return visibleNodes;
  }

  initializeExpandedState(tree: OrgTree): ExpandedState {
    const expandedState: ExpandedState = {};
    
    this.traverseTree(tree, (node) => {
      expandedState[node.employee.id] = false;
    });
    
    return expandedState;
  }

  private traverseTree(node: OrgTree, callback: (node: OrgTree) => void): void {
    callback(node);
    node.children.forEach(child => this.traverseTree(child, callback));
  }
}