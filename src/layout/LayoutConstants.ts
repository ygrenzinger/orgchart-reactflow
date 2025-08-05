export const LAYOUT_CONFIG = {
  NODE: {
    WIDTH: 240,
    HEIGHT: 120,
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