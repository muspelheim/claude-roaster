/**
 * Tests for flow-graph.ts - Graph-based flow module
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  // Graph creation
  createNode,
  createEdge,
  createEmptyGraph,
  addNode,
  addEdge,
  connectNodes,
  insertNodeBetween,
  // Graph analysis
  findAllPaths,
  findDeadEnds,
  findOrphanNodes,
  detectCycles,
  analyzeFlowGraph,
  // Visualization
  toMermaid,
  toASCII,
  toMarkdownSummary,
  // Templates
  GRAPH_TEMPLATES,
  createGraphFromTemplate,
  getSuggestedGraphTemplates,
} from '../flow-graph.js';
import type { FlowGraph, FlowNode, FlowEdge } from '../types.js';

// =============================================================================
// GRAPH CREATION UTILITIES
// =============================================================================

describe('createNode', () => {
  it('creates a basic screen node with defaults', () => {
    const node = createNode('test-id', 'Test Screen');

    expect(node.id).toBe('test-id');
    expect(node.screenName).toBe('Test Screen');
    expect(node.type).toBe('screen');
    expect(node.description).toBe('Test Screen');
  });

  it('creates a node with specified type', () => {
    const node = createNode('decision-1', 'Choose Option', 'decision');

    expect(node.type).toBe('decision');
  });

  it('creates a node with custom options', () => {
    const node = createNode('cart', 'Shopping Cart', 'screen', {
      description: 'Review your items',
      action: 'verify',
      expectedState: 'items in cart',
      metadata: { priority: 'high' },
    });

    expect(node.description).toBe('Review your items');
    expect(node.action).toBe('verify');
    expect(node.expectedState).toBe('items in cart');
    expect(node.metadata).toEqual({ priority: 'high' });
  });

  it('creates all node types', () => {
    const types = ['screen', 'decision', 'merge', 'start', 'end', 'error', 'external'] as const;

    for (const type of types) {
      const node = createNode(`${type}-node`, `${type} Screen`, type);
      expect(node.type).toBe(type);
    }
  });

  it('handles special characters in screen name', () => {
    const node = createNode('special', 'Screen "with" quotes & symbols');
    expect(node.screenName).toBe('Screen "with" quotes & symbols');
  });
});

describe('createEdge', () => {
  it('creates a basic edge with defaults', () => {
    const edge = createEdge('node-a', 'node-b');

    expect(edge.id).toBe('node-a->node-b');
    expect(edge.source).toBe('node-a');
    expect(edge.target).toBe('node-b');
    expect(edge.type).toBe('default');
  });

  it('creates an edge with specified type', () => {
    const edge = createEdge('login', 'dashboard', { type: 'success' });

    expect(edge.type).toBe('success');
  });

  it('creates an edge with label', () => {
    const edge = createEdge('decision', 'option-a', {
      type: 'conditional',
      label: 'Option A',
    });

    expect(edge.label).toBe('Option A');
  });

  it('creates an edge with condition', () => {
    const edge = createEdge('check', 'premium', {
      type: 'conditional',
      condition: {
        field: 'user.isPremium',
        operator: 'equals',
        value: true,
        label: 'Premium user',
      },
    });

    expect(edge.condition).toBeDefined();
    expect(edge.condition?.field).toBe('user.isPremium');
    expect(edge.condition?.operator).toBe('equals');
  });

  it('creates edges with all types', () => {
    const types = ['default', 'success', 'error', 'conditional', 'optional', 'back', 'exit'] as const;

    for (const type of types) {
      const edge = createEdge('source', 'target', { type });
      expect(edge.type).toBe(type);
    }
  });

  it('creates an edge with friction level', () => {
    const edge = createEdge('complex-form', 'next', {
      friction: 'high',
    });

    expect(edge.friction).toBe('high');
  });
});

describe('createEmptyGraph', () => {
  it('creates an empty graph with start and end nodes', () => {
    const graph = createEmptyGraph('Test Flow');

    expect(graph.name).toBe('Test Flow');
    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges).toHaveLength(0);
    expect(graph.startNodeId).toBe('start');
    expect(graph.endNodeIds).toContain('end');
  });

  it('creates a graph with specified app type', () => {
    const graph = createEmptyGraph('Checkout', 'ecommerce');

    expect(graph.appType).toBe('ecommerce');
  });

  it('initializes graph metrics', () => {
    const graph = createEmptyGraph('Test');

    expect(graph.totalScreens).toBe(0);
    expect(graph.totalDecisionPoints).toBe(0);
    expect(graph.estimatedPaths).toBe(1);
    expect(graph.version).toBe('1.0.0');
  });

  it('sets correct node types for start and end', () => {
    const graph = createEmptyGraph('Test');

    const startNode = graph.nodes.find(n => n.id === 'start');
    const endNode = graph.nodes.find(n => n.id === 'end');

    expect(startNode?.type).toBe('start');
    expect(endNode?.type).toBe('end');
  });

  it('generates graph ID with correct format', () => {
    const graph = createEmptyGraph('Test');

    expect(graph.id).toMatch(/^graph-\d+$/);
  });
});

describe('addNode', () => {
  let graph: FlowGraph;

  beforeEach(() => {
    graph = createEmptyGraph('Test Flow');
  });

  it('adds a new node to the graph', () => {
    const node = createNode('cart', 'Shopping Cart');
    const newGraph = addNode(graph, node);

    expect(newGraph.nodes).toHaveLength(3);
    expect(newGraph.nodes.find(n => n.id === 'cart')).toBeDefined();
  });

  it('increments totalScreens for screen nodes', () => {
    const node = createNode('cart', 'Shopping Cart', 'screen');
    const newGraph = addNode(graph, node);

    expect(newGraph.totalScreens).toBe(1);
  });

  it('increments totalDecisionPoints for decision nodes', () => {
    const node = createNode('auth-choice', 'Login or Register', 'decision');
    const newGraph = addNode(graph, node);

    expect(newGraph.totalDecisionPoints).toBe(1);
  });

  it('does not modify original graph (immutability)', () => {
    const node = createNode('cart', 'Shopping Cart');
    addNode(graph, node);

    expect(graph.nodes).toHaveLength(2);
  });

  it('throws error for duplicate node ID', () => {
    const node = createNode('start', 'Duplicate Start');

    expect(() => addNode(graph, node)).toThrow('Node with id "start" already exists');
  });

  it('does not increment counters for non-screen/decision types', () => {
    const errorNode = createNode('error', 'Error State', 'error');
    const mergeNode = createNode('merge', 'Merge Point', 'merge');

    let newGraph = addNode(graph, errorNode);
    newGraph = addNode(newGraph, mergeNode);

    expect(newGraph.totalScreens).toBe(0);
    expect(newGraph.totalDecisionPoints).toBe(0);
  });
});

describe('addEdge', () => {
  let graph: FlowGraph;

  beforeEach(() => {
    graph = createEmptyGraph('Test Flow');
    const cartNode = createNode('cart', 'Shopping Cart');
    graph = addNode(graph, cartNode);
  });

  it('adds an edge between existing nodes', () => {
    const edge = createEdge('start', 'cart');
    const newGraph = addEdge(graph, edge);

    expect(newGraph.edges).toHaveLength(1);
    expect(newGraph.edges[0].source).toBe('start');
    expect(newGraph.edges[0].target).toBe('cart');
  });

  it('throws error if source node does not exist', () => {
    const edge = createEdge('nonexistent', 'cart');

    expect(() => addEdge(graph, edge)).toThrow('Source node "nonexistent" not found');
  });

  it('throws error if target node does not exist', () => {
    const edge = createEdge('start', 'nonexistent');

    expect(() => addEdge(graph, edge)).toThrow('Target node "nonexistent" not found');
  });

  it('updates estimatedPaths when adding edges', () => {
    // Add a decision node with multiple outgoing edges
    const decisionNode = createNode('decision', 'Choose', 'decision');
    let newGraph = addNode(graph, decisionNode);

    const optionA = createNode('option-a', 'Option A');
    const optionB = createNode('option-b', 'Option B');
    newGraph = addNode(newGraph, optionA);
    newGraph = addNode(newGraph, optionB);

    newGraph = addEdge(newGraph, createEdge('start', 'decision'));
    newGraph = addEdge(newGraph, createEdge('decision', 'option-a'));
    newGraph = addEdge(newGraph, createEdge('decision', 'option-b'));

    expect(newGraph.estimatedPaths).toBe(2);
  });

  it('does not modify original graph (immutability)', () => {
    const edge = createEdge('start', 'cart');
    addEdge(graph, edge);

    expect(graph.edges).toHaveLength(0);
  });
});

describe('connectNodes', () => {
  let graph: FlowGraph;

  beforeEach(() => {
    graph = createEmptyGraph('Test Flow');
    const cartNode = createNode('cart', 'Shopping Cart');
    graph = addNode(graph, cartNode);
  });

  it('connects two nodes with a default edge', () => {
    const newGraph = connectNodes(graph, 'start', 'cart');

    expect(newGraph.edges).toHaveLength(1);
    expect(newGraph.edges[0].id).toBe('start->cart');
  });

  it('connects nodes with edge options', () => {
    const newGraph = connectNodes(graph, 'start', 'cart', {
      type: 'success',
      label: 'Proceed to cart',
    });

    expect(newGraph.edges[0].type).toBe('success');
    expect(newGraph.edges[0].label).toBe('Proceed to cart');
  });

  it('throws error for non-existent source', () => {
    expect(() => connectNodes(graph, 'nonexistent', 'cart'))
      .toThrow('Source node "nonexistent" not found');
  });
});

describe('insertNodeBetween', () => {
  let graph: FlowGraph;

  beforeEach(() => {
    graph = createEmptyGraph('Test Flow');
    graph = connectNodes(graph, 'start', 'end');
  });

  it('inserts a node between two connected nodes', () => {
    const middleNode = createNode('middle', 'Middle Screen');
    const newGraph = insertNodeBetween(graph, middleNode, 'start', 'end');

    expect(newGraph.nodes).toHaveLength(3);
    expect(newGraph.edges).toHaveLength(2);

    const startToMiddle = newGraph.edges.find(e => e.source === 'start' && e.target === 'middle');
    const middleToEnd = newGraph.edges.find(e => e.source === 'middle' && e.target === 'end');

    expect(startToMiddle).toBeDefined();
    expect(middleToEnd).toBeDefined();
  });

  it('preserves edge type when inserting', () => {
    // Create a success edge
    let customGraph = createEmptyGraph('Test');
    customGraph = addEdge(customGraph, createEdge('start', 'end', { type: 'success' }));

    const middleNode = createNode('middle', 'Middle');
    const newGraph = insertNodeBetween(customGraph, middleNode, 'start', 'end');

    const startToMiddle = newGraph.edges.find(e => e.source === 'start');
    const middleToEnd = newGraph.edges.find(e => e.source === 'middle');

    expect(startToMiddle?.type).toBe('success');
    expect(middleToEnd?.type).toBe('success');
  });

  it('removes the original edge', () => {
    const middleNode = createNode('middle', 'Middle Screen');
    const newGraph = insertNodeBetween(graph, middleNode, 'start', 'end');

    const originalEdge = newGraph.edges.find(e => e.source === 'start' && e.target === 'end');
    expect(originalEdge).toBeUndefined();
  });

  it('throws error if no edge exists between nodes', () => {
    const middleNode = createNode('middle', 'Middle');

    expect(() => insertNodeBetween(graph, middleNode, 'end', 'start'))
      .toThrow('No edge exists between "end" and "start"');
  });

  it('increments screen count', () => {
    const screenNode = createNode('screen', 'New Screen', 'screen');
    const newGraph = insertNodeBetween(graph, screenNode, 'start', 'end');

    expect(newGraph.totalScreens).toBe(1);
  });
});

// =============================================================================
// GRAPH ANALYSIS
// =============================================================================

describe('findAllPaths', () => {
  it('finds single path in linear graph', () => {
    let graph = createEmptyGraph('Linear');
    const middle = createNode('middle', 'Middle');
    graph = addNode(graph, middle);
    graph = connectNodes(graph, 'start', 'middle');
    graph = connectNodes(graph, 'middle', 'end');

    const paths = findAllPaths(graph);

    expect(paths).toHaveLength(1);
    expect(paths[0].nodeIds).toEqual(['start', 'middle', 'end']);
    expect(paths[0].isHappyPath).toBe(true);
  });

  it('finds multiple paths through decision nodes', () => {
    let graph = createEmptyGraph('Branching');
    const decision = createNode('decision', 'Choose', 'decision');
    const optionA = createNode('option-a', 'Option A');
    const optionB = createNode('option-b', 'Option B');

    graph = addNode(graph, decision);
    graph = addNode(graph, optionA);
    graph = addNode(graph, optionB);

    graph = connectNodes(graph, 'start', 'decision');
    graph = connectNodes(graph, 'decision', 'option-a');
    graph = connectNodes(graph, 'decision', 'option-b');
    graph = connectNodes(graph, 'option-a', 'end');
    graph = connectNodes(graph, 'option-b', 'end');

    const paths = findAllPaths(graph);

    expect(paths).toHaveLength(2);
  });

  it('marks shortest path as happy path', () => {
    let graph = createEmptyGraph('Mixed');
    const shortPath = createNode('short', 'Short');
    const longPath1 = createNode('long1', 'Long 1');
    const longPath2 = createNode('long2', 'Long 2');
    const decision = createNode('decision', 'Choose', 'decision');

    graph = addNode(graph, decision);
    graph = addNode(graph, shortPath);
    graph = addNode(graph, longPath1);
    graph = addNode(graph, longPath2);

    graph = connectNodes(graph, 'start', 'decision');
    graph = connectNodes(graph, 'decision', 'short');
    graph = connectNodes(graph, 'decision', 'long1');
    graph = connectNodes(graph, 'short', 'end');
    graph = connectNodes(graph, 'long1', 'long2');
    graph = connectNodes(graph, 'long2', 'end');

    const paths = findAllPaths(graph);
    const happyPath = paths.find(p => p.isHappyPath);

    expect(happyPath?.nodeIds).toEqual(['start', 'decision', 'short', 'end']);
  });

  it('respects maxPaths limit', () => {
    // Create a graph with many paths
    let graph = createEmptyGraph('Many Paths');

    for (let i = 0; i < 10; i++) {
      const node = createNode(`node-${i}`, `Node ${i}`);
      graph = addNode(graph, node);
      graph = connectNodes(graph, 'start', `node-${i}`);
      graph = connectNodes(graph, `node-${i}`, 'end');
    }

    const paths = findAllPaths(graph, 5);

    expect(paths.length).toBeLessThanOrEqual(5);
  });

  it('handles cycles without infinite loop', () => {
    let graph = createEmptyGraph('Cyclic');
    const nodeA = createNode('node-a', 'Node A');
    const nodeB = createNode('node-b', 'Node B');

    graph = addNode(graph, nodeA);
    graph = addNode(graph, nodeB);

    graph = connectNodes(graph, 'start', 'node-a');
    graph = connectNodes(graph, 'node-a', 'node-b');
    graph = connectNodes(graph, 'node-b', 'node-a'); // Cycle
    graph = connectNodes(graph, 'node-b', 'end');

    const paths = findAllPaths(graph);

    // Should find path without getting stuck in cycle
    expect(paths.length).toBeGreaterThan(0);
  });

  it('returns empty array for disconnected graph', () => {
    let graph = createEmptyGraph('Disconnected');
    const isolated = createNode('isolated', 'Isolated Node');
    graph = addNode(graph, isolated);
    // No edges connecting start to anything

    const paths = findAllPaths(graph);

    expect(paths).toHaveLength(0);
  });

  it('marks critical path when matching', () => {
    let graph = createEmptyGraph('With Critical');
    const middle = createNode('middle', 'Middle');
    graph = addNode(graph, middle);
    graph = connectNodes(graph, 'start', 'middle');
    graph = connectNodes(graph, 'middle', 'end');
    graph.criticalPath = ['start', 'middle', 'end'];

    const paths = findAllPaths(graph);

    expect(paths[0].isCriticalPath).toBe(true);
  });
});

describe('findDeadEnds', () => {
  it('returns empty array for well-formed graph', () => {
    let graph = createEmptyGraph('Good');
    const middle = createNode('middle', 'Middle');
    graph = addNode(graph, middle);
    graph = connectNodes(graph, 'start', 'middle');
    graph = connectNodes(graph, 'middle', 'end');

    const deadEnds = findDeadEnds(graph);

    expect(deadEnds).toHaveLength(0);
  });

  it('finds nodes with no outgoing edges', () => {
    let graph = createEmptyGraph('With Dead End');
    const deadEnd = createNode('dead-end', 'Dead End');
    graph = addNode(graph, deadEnd);
    graph = connectNodes(graph, 'start', 'dead-end');
    // No edge from dead-end to anywhere

    const deadEnds = findDeadEnds(graph);

    expect(deadEnds).toContain('dead-end');
  });

  it('does not consider end nodes as dead ends', () => {
    const graph = createEmptyGraph('Simple');
    // 'end' node has no outgoing edges but is an end node

    const deadEnds = findDeadEnds(graph);

    expect(deadEnds).not.toContain('end');
  });

  it('finds multiple dead ends', () => {
    let graph = createEmptyGraph('Multiple Dead Ends');
    const dead1 = createNode('dead-1', 'Dead 1');
    const dead2 = createNode('dead-2', 'Dead 2');

    graph = addNode(graph, dead1);
    graph = addNode(graph, dead2);
    graph = connectNodes(graph, 'start', 'dead-1');
    graph = connectNodes(graph, 'start', 'dead-2');

    const deadEnds = findDeadEnds(graph);

    expect(deadEnds).toContain('dead-1');
    expect(deadEnds).toContain('dead-2');
  });
});

describe('findOrphanNodes', () => {
  it('returns empty array when all nodes are reachable', () => {
    let graph = createEmptyGraph('Connected');
    const middle = createNode('middle', 'Middle');
    graph = addNode(graph, middle);
    graph = connectNodes(graph, 'start', 'middle');
    graph = connectNodes(graph, 'middle', 'end');

    const orphans = findOrphanNodes(graph);

    expect(orphans).toHaveLength(0);
  });

  it('finds nodes not reachable from start', () => {
    let graph = createEmptyGraph('With Orphan');
    const orphan = createNode('orphan', 'Orphan Node');
    graph = addNode(graph, orphan);
    // orphan is not connected to anything from start
    graph = connectNodes(graph, 'start', 'end');

    const orphans = findOrphanNodes(graph);

    expect(orphans).toContain('orphan');
  });

  it('finds multiple orphan nodes', () => {
    let graph = createEmptyGraph('Multiple Orphans');
    const orphan1 = createNode('orphan-1', 'Orphan 1');
    const orphan2 = createNode('orphan-2', 'Orphan 2');

    graph = addNode(graph, orphan1);
    graph = addNode(graph, orphan2);
    graph = connectNodes(graph, 'start', 'end');
    graph = connectNodes(graph, 'orphan-1', 'orphan-2'); // Connected to each other but not from start

    const orphans = findOrphanNodes(graph);

    expect(orphans).toContain('orphan-1');
    expect(orphans).toContain('orphan-2');
  });

  it('handles complex graph traversal', () => {
    let graph = createEmptyGraph('Complex');
    const nodes = ['a', 'b', 'c', 'd'];

    for (const id of nodes) {
      graph = addNode(graph, createNode(id, `Node ${id.toUpperCase()}`));
    }

    // Create connected path: start -> a -> b -> end
    graph = connectNodes(graph, 'start', 'a');
    graph = connectNodes(graph, 'a', 'b');
    graph = connectNodes(graph, 'b', 'end');

    // c and d are orphans (connected to each other only)
    graph = connectNodes(graph, 'c', 'd');

    const orphans = findOrphanNodes(graph);

    expect(orphans).toContain('c');
    expect(orphans).toContain('d');
    expect(orphans).not.toContain('a');
    expect(orphans).not.toContain('b');
  });
});

describe('detectCycles', () => {
  it('returns empty array for acyclic graph', () => {
    let graph = createEmptyGraph('Acyclic');
    const middle = createNode('middle', 'Middle');
    graph = addNode(graph, middle);
    graph = connectNodes(graph, 'start', 'middle');
    graph = connectNodes(graph, 'middle', 'end');

    const cycles = detectCycles(graph);

    expect(cycles).toHaveLength(0);
  });

  it('detects simple cycle', () => {
    let graph = createEmptyGraph('Simple Cycle');
    const nodeA = createNode('a', 'Node A');
    const nodeB = createNode('b', 'Node B');

    graph = addNode(graph, nodeA);
    graph = addNode(graph, nodeB);

    graph = connectNodes(graph, 'start', 'a');
    graph = connectNodes(graph, 'a', 'b');
    graph = connectNodes(graph, 'b', 'a'); // Creates cycle
    graph = connectNodes(graph, 'b', 'end');

    const cycles = detectCycles(graph);

    expect(cycles.length).toBeGreaterThan(0);
    // Cycle should contain a and b
    const cycleNodes = cycles.flat();
    expect(cycleNodes).toContain('a');
    expect(cycleNodes).toContain('b');
  });

  it('detects self-loop', () => {
    let graph = createEmptyGraph('Self Loop');
    const loopNode = createNode('loop', 'Loop Node');

    graph = addNode(graph, loopNode);
    graph = connectNodes(graph, 'start', 'loop');
    graph = connectNodes(graph, 'loop', 'loop'); // Self loop
    graph = connectNodes(graph, 'loop', 'end');

    const cycles = detectCycles(graph);

    expect(cycles.length).toBeGreaterThan(0);
  });

  it('detects multiple cycles', () => {
    let graph = createEmptyGraph('Multiple Cycles');
    const nodes = ['a', 'b', 'c', 'd'];

    for (const id of nodes) {
      graph = addNode(graph, createNode(id, `Node ${id}`));
    }

    // Cycle 1: a -> b -> a
    graph = connectNodes(graph, 'start', 'a');
    graph = connectNodes(graph, 'a', 'b');
    graph = connectNodes(graph, 'b', 'a');

    // Cycle 2: c -> d -> c
    graph = connectNodes(graph, 'b', 'c');
    graph = connectNodes(graph, 'c', 'd');
    graph = connectNodes(graph, 'd', 'c');
    graph = connectNodes(graph, 'd', 'end');

    const cycles = detectCycles(graph);

    expect(cycles.length).toBeGreaterThanOrEqual(2);
  });
});

describe('analyzeFlowGraph', () => {
  it('analyzes a simple graph', () => {
    let graph = createEmptyGraph('Simple');
    const middle = createNode('middle', 'Middle', 'screen');
    graph = addNode(graph, middle);
    graph = connectNodes(graph, 'start', 'middle');
    graph = connectNodes(graph, 'middle', 'end');

    const analysis = analyzeFlowGraph(graph);

    expect(analysis.graph).toBe(graph);
    expect(analysis.paths.length).toBeGreaterThan(0);
    expect(analysis.metrics.totalNodes).toBe(3);
    expect(analysis.metrics.totalEdges).toBe(2);
  });

  it('calculates path statistics', () => {
    let graph = createEmptyGraph('Stats');
    const decision = createNode('decision', 'Choose', 'decision');
    const short = createNode('short', 'Short');
    const long1 = createNode('long1', 'Long 1');
    const long2 = createNode('long2', 'Long 2');

    graph = addNode(graph, decision);
    graph = addNode(graph, short);
    graph = addNode(graph, long1);
    graph = addNode(graph, long2);

    graph = connectNodes(graph, 'start', 'decision');
    graph = connectNodes(graph, 'decision', 'short');
    graph = connectNodes(graph, 'decision', 'long1');
    graph = connectNodes(graph, 'short', 'end');
    graph = connectNodes(graph, 'long1', 'long2');
    graph = connectNodes(graph, 'long2', 'end');

    const analysis = analyzeFlowGraph(graph);

    expect(analysis.metrics.totalPaths).toBe(2);
    expect(analysis.metrics.minPathLength).toBe(4); // start -> decision -> short -> end
    expect(analysis.metrics.maxPathLength).toBe(5); // start -> decision -> long1 -> long2 -> end
  });

  it('identifies dead ends', () => {
    let graph = createEmptyGraph('Dead End');
    const deadEnd = createNode('dead', 'Dead End');
    graph = addNode(graph, deadEnd);
    graph = connectNodes(graph, 'start', 'dead');
    graph = connectNodes(graph, 'start', 'end');

    const analysis = analyzeFlowGraph(graph);

    expect(analysis.metrics.deadEnds).toContain('dead');
  });

  it('identifies orphan nodes', () => {
    let graph = createEmptyGraph('Orphan');
    const orphan = createNode('orphan', 'Orphan');
    graph = addNode(graph, orphan);
    graph = connectNodes(graph, 'start', 'end');

    const analysis = analyzeFlowGraph(graph);

    expect(analysis.metrics.orphanNodes).toContain('orphan');
  });

  it('detects cycles', () => {
    let graph = createEmptyGraph('Cyclic');
    const a = createNode('a', 'A');
    const b = createNode('b', 'B');

    graph = addNode(graph, a);
    graph = addNode(graph, b);
    graph = connectNodes(graph, 'start', 'a');
    graph = connectNodes(graph, 'a', 'b');
    graph = connectNodes(graph, 'b', 'a');
    graph = connectNodes(graph, 'b', 'end');

    const analysis = analyzeFlowGraph(graph);

    expect(analysis.metrics.cycles.length).toBeGreaterThan(0);
  });

  it('initializes empty issue maps', () => {
    const graph = createEmptyGraph('Simple');
    const analysis = analyzeFlowGraph(graph);

    expect(analysis.nodeIssues).toBeInstanceOf(Map);
    expect(analysis.edgeIssues).toBeInstanceOf(Map);
    expect(analysis.pathIssues).toBeInstanceOf(Map);
  });

  it('initializes empty recommendations', () => {
    const graph = createEmptyGraph('Simple');
    const analysis = analyzeFlowGraph(graph);

    expect(analysis.recommendations.simplify).toEqual([]);
    expect(analysis.recommendations.combine).toEqual([]);
    expect(analysis.recommendations.reorder).toEqual([]);
    expect(analysis.recommendations.addPath).toEqual([]);
  });
});

// =============================================================================
// VISUALIZATION
// =============================================================================

describe('toMermaid', () => {
  it('generates basic Mermaid flowchart', () => {
    let graph = createEmptyGraph('Simple');
    graph = connectNodes(graph, 'start', 'end');

    const mermaid = toMermaid(graph);

    expect(mermaid).toContain('flowchart TB');
    expect(mermaid).toContain('start');
    expect(mermaid).toContain('end');
    expect(mermaid).toContain('-->');
  });

  it('uses correct node shapes', () => {
    let graph = createEmptyGraph('Shapes');
    const decision = createNode('decision', 'Choose', 'decision');
    const error = createNode('error', 'Error', 'error');
    const external = createNode('external', 'External', 'external');
    const merge = createNode('merge', 'Merge', 'merge');

    graph = addNode(graph, decision);
    graph = addNode(graph, error);
    graph = addNode(graph, external);
    graph = addNode(graph, merge);

    const mermaid = toMermaid(graph);

    expect(mermaid).toContain('decision{"Choose"}'); // Diamond
    expect(mermaid).toContain('error[/"Error"/]'); // Parallelogram
    expect(mermaid).toContain('external[["External"]]'); // Subroutine
    expect(mermaid).toContain('merge(("Merge"))'); // Circle
  });

  it('uses different arrow styles for edge types', () => {
    let graph = createEmptyGraph('Arrows');
    const screen = createNode('screen', 'Screen');
    const success = createNode('success-node', 'Success');
    const errorNode = createNode('error-node', 'Error');

    graph = addNode(graph, screen);
    graph = addNode(graph, success);
    graph = addNode(graph, errorNode);

    graph = addEdge(graph, createEdge('start', 'screen', { type: 'default' }));
    graph = addEdge(graph, createEdge('screen', 'success-node', { type: 'success' }));
    graph = addEdge(graph, createEdge('screen', 'error-node', { type: 'error' }));

    const mermaid = toMermaid(graph);

    expect(mermaid).toContain('==>'); // Success arrow
    expect(mermaid).toContain('-.->'); // Error arrow
  });

  it('supports direction option', () => {
    const graph = createEmptyGraph('LR');

    const mermaidLR = toMermaid(graph, { direction: 'LR' });
    const mermaidTB = toMermaid(graph, { direction: 'TB' });

    expect(mermaidLR).toContain('flowchart LR');
    expect(mermaidTB).toContain('flowchart TB');
  });

  it('includes edge labels when showLabels is true', () => {
    let graph = createEmptyGraph('Labels');
    graph = addEdge(graph, createEdge('start', 'end', { label: 'Continue' }));

    const mermaid = toMermaid(graph, { showLabels: true });

    expect(mermaid).toContain('|Continue|');
  });

  it('supports theme option', () => {
    const graph = createEmptyGraph('Themed');

    const mermaidDark = toMermaid(graph, { theme: 'dark' });
    const mermaidForest = toMermaid(graph, { theme: 'forest' });

    expect(mermaidDark).toContain("'theme': 'dark'");
    expect(mermaidForest).toContain("'theme': 'forest'");
  });

  it('highlights specified path', () => {
    let graph = createEmptyGraph('Highlight');
    const middle = createNode('middle', 'Middle');
    graph = addNode(graph, middle);
    graph = connectNodes(graph, 'start', 'middle');
    graph = connectNodes(graph, 'middle', 'end');

    const mermaid = toMermaid(graph, { highlightPath: ['start', 'middle'] });

    expect(mermaid).toContain(':::highlight');
  });

  it('includes class definitions', () => {
    const graph = createEmptyGraph('Classes');
    const mermaid = toMermaid(graph);

    expect(mermaid).toContain('classDef highlight');
    expect(mermaid).toContain('classDef decision');
    expect(mermaid).toContain('classDef error');
    expect(mermaid).toContain('classDef start');
    expect(mermaid).toContain('classDef end');
  });

  it('escapes quotes in node names', () => {
    let graph = createEmptyGraph('Quotes');
    const quoted = createNode('quoted', 'Screen "with" quotes');
    graph = addNode(graph, quoted);

    const mermaid = toMermaid(graph);

    expect(mermaid).toContain('\\"');
  });
});

describe('toASCII', () => {
  it('generates ASCII representation', () => {
    let graph = createEmptyGraph('ASCII Test');
    const middle = createNode('middle', 'Middle');
    graph = addNode(graph, middle);
    graph = connectNodes(graph, 'start', 'middle');
    graph = connectNodes(graph, 'middle', 'end');

    const ascii = toASCII(graph);

    expect(ascii).toContain('Flow: ASCII Test');
    expect(ascii).toContain('Start');
    expect(ascii).toContain('Middle');
    expect(ascii).toContain('End');
    expect(ascii).toContain('│');
    expect(ascii).toContain('▼');
  });

  it('returns "Empty graph" for disconnected graph', () => {
    const graph = createEmptyGraph('Disconnected');
    // No edges, so no paths

    const ascii = toASCII(graph);

    expect(ascii).toBe('Empty graph');
  });

  it('uses different icons for node types', () => {
    let graph = createEmptyGraph('Icons');
    const decision = createNode('decision', 'Decision', 'decision');

    graph = addNode(graph, decision);
    graph = connectNodes(graph, 'start', 'decision');
    graph = connectNodes(graph, 'decision', 'end');

    const ascii = toASCII(graph);

    expect(ascii).toContain('▶'); // Start icon
    expect(ascii).toContain('◇'); // Decision icon
    expect(ascii).toContain('◼'); // End icon
  });

  it('shows decision branches', () => {
    let graph = createEmptyGraph('Branching');
    const decision = createNode('decision', 'Choose', 'decision');
    const optionA = createNode('option-a', 'Option A');
    const optionB = createNode('option-b', 'Option B');

    graph = addNode(graph, decision);
    graph = addNode(graph, optionA);
    graph = addNode(graph, optionB);

    graph = connectNodes(graph, 'start', 'decision');
    graph = addEdge(graph, createEdge('decision', 'option-a', { label: 'Choice A' }));
    graph = addEdge(graph, createEdge('decision', 'option-b', { label: 'Choice B' }));
    graph = connectNodes(graph, 'option-a', 'end');
    graph = connectNodes(graph, 'option-b', 'end');

    const ascii = toASCII(graph);

    expect(ascii).toContain('Decision Points:');
    expect(ascii).toContain('Choice A');
    expect(ascii).toContain('Choice B');
  });

  it('shows edge labels in path', () => {
    let graph = createEmptyGraph('Labels');
    graph = addEdge(graph, createEdge('start', 'end', { label: 'Continue' }));

    const ascii = toASCII(graph);

    expect(ascii).toContain('Continue');
  });
});

describe('toMarkdownSummary', () => {
  it('generates markdown with overview', () => {
    let graph = createEmptyGraph('Summary Test', 'ecommerce');
    const screen = createNode('screen', 'Screen', 'screen');
    graph = addNode(graph, screen);
    graph = connectNodes(graph, 'start', 'screen');
    graph = connectNodes(graph, 'screen', 'end');

    const analysis = analyzeFlowGraph(graph);
    const markdown = toMarkdownSummary(analysis);

    expect(markdown).toContain('## 📊 Flow Graph Analysis: Summary Test');
    expect(markdown).toContain('**App Type:** ecommerce');
    expect(markdown).toContain('**Total Screens:**');
  });

  it('includes path statistics table', () => {
    let graph = createEmptyGraph('Stats');
    graph = connectNodes(graph, 'start', 'end');

    const analysis = analyzeFlowGraph(graph);
    const markdown = toMarkdownSummary(analysis);

    expect(markdown).toContain('### Path Statistics');
    expect(markdown).toContain('| Metric | Value |');
    expect(markdown).toContain('Shortest Path');
    expect(markdown).toContain('Longest Path');
    expect(markdown).toContain('Average Path');
  });

  it('shows dead ends warning', () => {
    let graph = createEmptyGraph('Dead Ends');
    const deadEnd = createNode('dead', 'Dead End Screen');
    graph = addNode(graph, deadEnd);
    graph = connectNodes(graph, 'start', 'dead');
    graph = connectNodes(graph, 'start', 'end');

    const analysis = analyzeFlowGraph(graph);
    const markdown = toMarkdownSummary(analysis);

    expect(markdown).toContain('### ⚠️ Dead Ends Detected');
    expect(markdown).toContain('Dead End Screen');
  });

  it('shows orphan nodes warning', () => {
    let graph = createEmptyGraph('Orphans');
    const orphan = createNode('orphan', 'Orphan Screen');
    graph = addNode(graph, orphan);
    graph = connectNodes(graph, 'start', 'end');

    const analysis = analyzeFlowGraph(graph);
    const markdown = toMarkdownSummary(analysis);

    expect(markdown).toContain('### ⚠️ Unreachable Nodes');
    expect(markdown).toContain('Orphan Screen');
  });

  it('shows cycles warning', () => {
    let graph = createEmptyGraph('Cycles');
    const a = createNode('a', 'Node A');
    const b = createNode('b', 'Node B');

    graph = addNode(graph, a);
    graph = addNode(graph, b);
    graph = connectNodes(graph, 'start', 'a');
    graph = connectNodes(graph, 'a', 'b');
    graph = connectNodes(graph, 'b', 'a');
    graph = connectNodes(graph, 'b', 'end');

    const analysis = analyzeFlowGraph(graph);
    const markdown = toMarkdownSummary(analysis);

    expect(markdown).toContain('### 🔄 Cycles Detected');
  });

  it('embeds Mermaid diagram', () => {
    const graph = createEmptyGraph('Diagram');
    const analysis = analyzeFlowGraph(graph);
    const markdown = toMarkdownSummary(analysis);

    expect(markdown).toContain('### Flow Diagram');
    expect(markdown).toContain('```mermaid');
    expect(markdown).toContain('flowchart TB');
    expect(markdown).toContain('```');
  });
});

// =============================================================================
// GRAPH TEMPLATES
// =============================================================================

describe('GRAPH_TEMPLATES', () => {
  it('contains expected templates', () => {
    expect(GRAPH_TEMPLATES.length).toBeGreaterThanOrEqual(3);

    const templateIds = GRAPH_TEMPLATES.map(t => t.id);
    expect(templateIds).toContain('ecommerce-checkout-graph');
    expect(templateIds).toContain('saas-onboarding-graph');
    expect(templateIds).toContain('auth-login-graph');
  });

  it('all templates have required properties', () => {
    for (const template of GRAPH_TEMPLATES) {
      expect(template.id).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.description).toBeDefined();
      expect(template.appTypes.length).toBeGreaterThan(0);
      expect(template.priority).toMatch(/^(critical|high|medium|low)$/);
      expect(template.nodes.length).toBeGreaterThan(0);
      expect(template.edges.length).toBeGreaterThan(0);
      expect(template.startNodeId).toBeDefined();
      expect(template.endNodeIds.length).toBeGreaterThan(0);
      expect(template.criticalPath.length).toBeGreaterThan(0);
    }
  });

  it('ecommerce template has decision nodes', () => {
    const ecommerceTemplate = GRAPH_TEMPLATES.find(t => t.id === 'ecommerce-checkout-graph');

    expect(ecommerceTemplate).toBeDefined();

    const decisionNodes = ecommerceTemplate!.nodes.filter(n => n.type === 'decision');
    expect(decisionNodes.length).toBeGreaterThanOrEqual(2);
  });

  it('saas template has optional edges', () => {
    const saasTemplate = GRAPH_TEMPLATES.find(t => t.id === 'saas-onboarding-graph');

    expect(saasTemplate).toBeDefined();

    const optionalEdges = saasTemplate!.edges.filter(e => e.type === 'optional');
    expect(optionalEdges.length).toBeGreaterThan(0);
  });

  it('auth template has error recovery', () => {
    const authTemplate = GRAPH_TEMPLATES.find(t => t.id === 'auth-login-graph');

    expect(authTemplate).toBeDefined();

    const errorNode = authTemplate!.nodes.find(n => n.type === 'error');
    expect(errorNode).toBeDefined();

    const errorEdges = authTemplate!.edges.filter(e => e.type === 'error');
    expect(errorEdges.length).toBeGreaterThan(0);
  });

  it('templates have checkpoints defined', () => {
    for (const template of GRAPH_TEMPLATES) {
      expect(template.checkpoints).toBeDefined();
      expect(template.checkpoints.length).toBeGreaterThan(0);
    }
  });

  it('templates have common issues defined', () => {
    for (const template of GRAPH_TEMPLATES) {
      expect(template.commonIssues).toBeDefined();
      expect(template.commonIssues.length).toBeGreaterThan(0);
    }
  });
});

describe('createGraphFromTemplate', () => {
  it('creates a graph from template', () => {
    const template = GRAPH_TEMPLATES[0];
    const graph = createGraphFromTemplate(template);

    expect(graph.name).toBe(template.name);
    expect(graph.description).toBe(template.description);
    expect(graph.nodes.length).toBe(template.nodes.length);
    expect(graph.edges.length).toBe(template.edges.length);
  });

  it('uses custom name when provided', () => {
    const template = GRAPH_TEMPLATES[0];
    const graph = createGraphFromTemplate(template, 'My Custom Flow');

    expect(graph.name).toBe('My Custom Flow');
  });

  it('sets app type from template', () => {
    const template = GRAPH_TEMPLATES.find(t => t.appTypes.includes('ecommerce'));
    const graph = createGraphFromTemplate(template!);

    expect(graph.appType).toBe('ecommerce');
  });

  it('copies nodes and edges (not reference)', () => {
    const template = GRAPH_TEMPLATES[0];
    const graph = createGraphFromTemplate(template);

    // Modify the graph's nodes
    graph.nodes[0].screenName = 'Modified';

    // Template should be unchanged
    expect(template.nodes[0].screenName).not.toBe('Modified');
  });

  it('calculates correct screen and decision counts', () => {
    const template = GRAPH_TEMPLATES[0];
    const graph = createGraphFromTemplate(template);

    const expectedScreens = template.nodes.filter(n => n.type === 'screen').length;
    const expectedDecisions = template.nodes.filter(n => n.type === 'decision').length;

    expect(graph.totalScreens).toBe(expectedScreens);
    expect(graph.totalDecisionPoints).toBe(expectedDecisions);
  });

  it('calculates estimated paths', () => {
    const template = GRAPH_TEMPLATES[0];
    const graph = createGraphFromTemplate(template);

    expect(graph.estimatedPaths).toBeGreaterThanOrEqual(1);
  });

  it('copies critical path', () => {
    const template = GRAPH_TEMPLATES[0];
    const graph = createGraphFromTemplate(template);

    expect(graph.criticalPath).toEqual(template.criticalPath);

    // Verify it's a copy, not reference
    graph.criticalPath.push('extra');
    expect(template.criticalPath).not.toContain('extra');
  });

  it('sets tags from common issues', () => {
    const template = GRAPH_TEMPLATES[0];
    const graph = createGraphFromTemplate(template);

    expect(graph.tags).toEqual(template.commonIssues);
  });

  it('generates graph ID with correct format', () => {
    const template = GRAPH_TEMPLATES[0];
    const graph = createGraphFromTemplate(template);

    expect(graph.id).toMatch(/^graph-\d+$/);
  });
});

describe('getSuggestedGraphTemplates', () => {
  it('returns templates for ecommerce', () => {
    const templates = getSuggestedGraphTemplates('ecommerce');

    expect(templates.length).toBeGreaterThan(0);
    expect(templates.every(t => t.appTypes.includes('ecommerce'))).toBe(true);
  });

  it('returns templates for saas', () => {
    const templates = getSuggestedGraphTemplates('saas');

    expect(templates.length).toBeGreaterThan(0);
    expect(templates.every(t => t.appTypes.includes('saas'))).toBe(true);
  });

  it('returns all templates for unknown app type', () => {
    const templates = getSuggestedGraphTemplates('unknown');

    expect(templates.length).toBe(GRAPH_TEMPLATES.length);
  });

  it('sorts templates by priority', () => {
    const templates = getSuggestedGraphTemplates('ecommerce');

    const priorities = templates.map(t => t.priority);
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

    for (let i = 0; i < priorities.length - 1; i++) {
      expect(priorityOrder[priorities[i]]).toBeLessThanOrEqual(priorityOrder[priorities[i + 1]]);
    }
  });

  it('returns empty array for app type with no templates', () => {
    const templates = getSuggestedGraphTemplates('gaming');

    // Gaming doesn't have specific templates in current implementation
    expect(templates.length).toBe(0);
  });

  it('returns templates that match multiple app types', () => {
    const fintech = getSuggestedGraphTemplates('fintech');
    const saas = getSuggestedGraphTemplates('saas');

    // Auth template should appear in both
    const authInFintech = fintech.some(t => t.id === 'auth-login-graph');
    const authInSaas = saas.some(t => t.id === 'auth-login-graph');

    expect(authInFintech).toBe(true);
    expect(authInSaas).toBe(true);
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('Flow Graph Integration', () => {
  it('can build and analyze a complete checkout flow', () => {
    // Build the flow step by step
    let graph = createEmptyGraph('Custom Checkout', 'ecommerce');

    // Add screens
    const cart = createNode('cart', 'Shopping Cart', 'screen');
    const shipping = createNode('shipping', 'Shipping', 'screen');
    const payment = createNode('payment', 'Payment', 'screen');
    const confirm = createNode('confirm', 'Confirmation', 'screen');

    graph = addNode(graph, cart);
    graph = addNode(graph, shipping);
    graph = addNode(graph, payment);
    graph = addNode(graph, confirm);

    // Connect nodes
    graph = connectNodes(graph, 'start', 'cart');
    graph = connectNodes(graph, 'cart', 'shipping');
    graph = connectNodes(graph, 'shipping', 'payment');
    graph = connectNodes(graph, 'payment', 'confirm');
    graph = connectNodes(graph, 'confirm', 'end', { type: 'success' });

    // Analyze
    const analysis = analyzeFlowGraph(graph);

    expect(analysis.metrics.totalNodes).toBe(6); // start + 4 screens + end
    expect(analysis.metrics.totalEdges).toBe(5);
    expect(analysis.metrics.totalPaths).toBe(1);
    expect(analysis.metrics.deadEnds).toHaveLength(0);
    expect(analysis.metrics.orphanNodes).toHaveLength(0);
    expect(analysis.metrics.cycles).toHaveLength(0);

    // Generate visualizations
    const mermaid = toMermaid(graph);
    expect(mermaid).toContain('Shopping Cart');

    const ascii = toASCII(graph);
    expect(ascii).toContain('Custom Checkout');

    const markdown = toMarkdownSummary(analysis);
    expect(markdown).toContain('ecommerce');
  });

  it('can build flow with branches and analyze paths', () => {
    let graph = createEmptyGraph('Branching Flow');

    // Add decision point
    const decision = createNode('auth-check', 'Authentication?', 'decision');
    const login = createNode('login', 'Login', 'screen');
    const register = createNode('register', 'Register', 'screen');
    const dashboard = createNode('dashboard', 'Dashboard', 'screen');

    graph = addNode(graph, decision);
    graph = addNode(graph, login);
    graph = addNode(graph, register);
    graph = addNode(graph, dashboard);

    graph = connectNodes(graph, 'start', 'auth-check');
    graph = addEdge(graph, createEdge('auth-check', 'login', {
      type: 'conditional',
      label: 'Has Account'
    }));
    graph = addEdge(graph, createEdge('auth-check', 'register', {
      type: 'conditional',
      label: 'New User'
    }));
    graph = connectNodes(graph, 'login', 'dashboard');
    graph = connectNodes(graph, 'register', 'dashboard');
    graph = connectNodes(graph, 'dashboard', 'end');

    const analysis = analyzeFlowGraph(graph);

    expect(analysis.metrics.decisionPoints).toBe(1);
    expect(analysis.metrics.totalPaths).toBe(2);

    const paths = analysis.paths;
    const happyPath = paths.find(p => p.isHappyPath);
    expect(happyPath).toBeDefined();
  });

  it('can insert screens into existing flow', () => {
    // Start with a simple flow
    let graph = createEmptyGraph('Expandable Flow');
    const checkout = createNode('checkout', 'Checkout', 'screen');
    graph = addNode(graph, checkout);
    graph = connectNodes(graph, 'start', 'checkout');
    graph = connectNodes(graph, 'checkout', 'end');

    // Insert a screen between start and checkout
    const landing = createNode('landing', 'Landing Page', 'screen');
    graph = insertNodeBetween(graph, landing, 'start', 'checkout');

    // Verify structure
    const startEdges = graph.edges.filter(e => e.source === 'start');
    expect(startEdges[0].target).toBe('landing');

    const landingEdges = graph.edges.filter(e => e.source === 'landing');
    expect(landingEdges[0].target).toBe('checkout');

    // Verify no direct start->checkout edge
    const directEdge = graph.edges.find(
      e => e.source === 'start' && e.target === 'checkout'
    );
    expect(directEdge).toBeUndefined();
  });

  it('template graphs are valid and analyzable', () => {
    for (const template of GRAPH_TEMPLATES) {
      const graph = createGraphFromTemplate(template);
      const analysis = analyzeFlowGraph(graph);

      // All template graphs should have at least one valid path
      expect(analysis.metrics.totalPaths).toBeGreaterThanOrEqual(1);

      // Templates should not have orphan nodes
      expect(analysis.metrics.orphanNodes).toHaveLength(0);

      // Critical path should exist in paths
      const criticalPathNodes = new Set(graph.criticalPath);
      const hasMatchingPath = analysis.paths.some(
        p => p.nodeIds.every(id => criticalPathNodes.has(id) ||
                                   !graph.criticalPath.includes(id))
      );
      expect(hasMatchingPath).toBe(true);
    }
  });
});
