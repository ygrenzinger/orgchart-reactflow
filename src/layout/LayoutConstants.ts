export const LAYOUT_CONFIG = {
  NODE: {
    WIDTH: 280,
    HEIGHT: 120,
  },
  SPACING: {
    HORIZONTAL: 60,
    VERTICAL: 100,
    NODE_SEPARATION: 50,
    RANK_SEPARATION: 150,
  },
  MARGINS: {
    X: 50,
    Y: 50,
  },
  DAGRE: {
    VERTICAL: {
      RANKDIR: 'TB' as const,
      NODESEP: 60,
      RANKSEP: 100,
    },
    HORIZONTAL: {
      RANKDIR: 'LR' as const,
      NODESEP: 50,
      RANKSEP: 150,
    },
  },
} as const;