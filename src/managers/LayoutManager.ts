import {
  LayoutStrategy,
  LayoutType,
  LayoutResult,
} from "../types/layoutStrategy";
import { DagreLayoutStrategy } from "../strategies/DagreLayoutStrategy";
import { HorizontalDagreLayoutStrategy } from "../strategies/HorizontalDagreLayoutStrategy.ts";
import { OrgNode, ExpandedState } from "../utils/orgChartLayout";

export class LayoutManager {
  private strategies: Map<LayoutType, LayoutStrategy>;
  private currentStrategy: LayoutType;

  constructor(defaultStrategy: LayoutType = LayoutType.DAGRE) {
    this.strategies = new Map();
    this.currentStrategy = defaultStrategy;

    // Register available strategies
    this.registerStrategy(LayoutType.DAGRE, new DagreLayoutStrategy());
    this.registerStrategy(LayoutType.SIMPLE_DAGRE, new HorizontalDagreLayoutStrategy());
  }

  private registerStrategy(type: LayoutType, strategy: LayoutStrategy): void {
    this.strategies.set(type, strategy);
  }

  setStrategy(strategyType: LayoutType): void {
    if (!this.strategies.has(strategyType)) {
      throw new Error(`Layout strategy '${strategyType}' is not registered`);
    }
    this.currentStrategy = strategyType;
  }

  getCurrentStrategy(): LayoutType {
    return this.currentStrategy;
  }

  getCurrentStrategyName(): string {
    const strategy = this.strategies.get(this.currentStrategy);
    return strategy?.name || "Unknown";
  }

  getAvailableStrategies(): Array<{ type: LayoutType; name: string }> {
    return Array.from(this.strategies.entries()).map(([type, strategy]) => ({
      type,
      name: strategy.name,
    }));
  }

  calculateLayout(
    orgTree: OrgNode,
    expandedState: ExpandedState
  ): LayoutResult {
    const strategy = this.strategies.get(this.currentStrategy);
    if (!strategy) {
      throw new Error(
        `Layout strategy '${this.currentStrategy}' is not available`
      );
    }

    return strategy.calculateLayout(orgTree, expandedState);
  }
}
