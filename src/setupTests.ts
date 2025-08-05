import '@testing-library/jest-dom'

// Mock ResizeObserver for ReactFlow
(window as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  callback: ResizeObserverCallback;
  observe() {}
  unobserve() {}
  disconnect() {}
};