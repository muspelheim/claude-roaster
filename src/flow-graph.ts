/**
 * Claude Roaster - Graph-Based Flow Module
 * Handles flow graph creation, analysis, and visualization
 */

import type {
  AppType,
  FlowNode,
  FlowEdge,
  FlowGraph,
  FlowPath,
  FlowGraphAnalysis,
  FlowGraphTemplate,
  FlowNodeType,
  FlowEdgeType,
  FlowActionType,
  FlowCondition,
  RoastIssue,
} from './types.js';

// =============================================================================
// GRAPH CREATION UTILITIES
// =============================================================================

/**
 * Create a new flow node
 */
export function createNode(
  id: string,
  screenName: string,
  type: FlowNodeType = 'screen',
  options: Partial<Omit<FlowNode, 'id' | 'screenName' | 'type'>> = {}
): FlowNode {
  return {
    id,
    type,
    screenName,
    description: options.description || screenName,
    ...options,
  };
}

/**
 * Create a new flow edge
 */
export function createEdge(
  source: string,
  target: string,
  options: Partial<Omit<FlowEdge, 'id' | 'source' | 'target'>> = {}
): FlowEdge {
  return {
    id: `${source}->${target}`,
    source,
    target,
    type: options.type || 'default',
    ...options,
  };
}

/**
 * Create an empty flow graph
 */
export function createEmptyGraph(
  name: string,
  appType: AppType = 'unknown'
): FlowGraph {
  const startNode = createNode('start', 'Start', 'start', { description: 'Flow entry point' });
  const endNode = createNode('end', 'End', 'end', { description: 'Flow completion' });

  return {
    id: `graph-${Date.now()}`,
    name,
    description: '',
    appType,
    version: '1.0.0',
    nodes: [startNode, endNode],
    edges: [],
    startNodeId: 'start',
    endNodeIds: ['end'],
    criticalPath: ['start', 'end'],
    totalScreens: 0,
    totalDecisionPoints: 0,
    estimatedPaths: 1,
  };
}

/**
 * Add a node to a graph
 */
export function addNode(graph: FlowGraph, node: FlowNode): FlowGraph {
  const exists = graph.nodes.find(n => n.id === node.id);
  if (exists) {
    throw new Error(`Node with id "${node.id}" already exists`);
  }

  const totalScreens = node.type === 'screen' ? graph.totalScreens + 1 : graph.totalScreens;
  const totalDecisionPoints = node.type === 'decision' ? graph.totalDecisionPoints + 1 : graph.totalDecisionPoints;

  return {
    ...graph,
    nodes: [...graph.nodes, node],
    totalScreens,
    totalDecisionPoints,
  };
}

/**
 * Add an edge to a graph
 */
export function addEdge(graph: FlowGraph, edge: FlowEdge): FlowGraph {
  // Validate source and target exist
  const sourceNode = graph.nodes.find(n => n.id === edge.source);
  const targetNode = graph.nodes.find(n => n.id === edge.target);

  if (!sourceNode) {
    throw new Error(`Source node "${edge.source}" not found`);
  }
  if (!targetNode) {
    throw new Error(`Target node "${edge.target}" not found`);
  }

  return {
    ...graph,
    edges: [...graph.edges, edge],
    estimatedPaths: calculateEstimatedPaths(graph.nodes, [...graph.edges, edge]),
  };
}

/**
 * Connect two nodes with an edge
 */
export function connectNodes(
  graph: FlowGraph,
  sourceId: string,
  targetId: string,
  options: Partial<Omit<FlowEdge, 'id' | 'source' | 'target'>> = {}
): FlowGraph {
  const edge = createEdge(sourceId, targetId, options);
  return addEdge(graph, edge);
}

/**
 * Insert a node between two connected nodes
 */
export function insertNodeBetween(
  graph: FlowGraph,
  newNode: FlowNode,
  sourceId: string,
  targetId: string
): FlowGraph {
  // Find existing edge
  const existingEdge = graph.edges.find(
    e => e.source === sourceId && e.target === targetId
  );

  if (!existingEdge) {
    throw new Error(`No edge exists between "${sourceId}" and "${targetId}"`);
  }

  // Remove existing edge
  const edgesWithoutOld = graph.edges.filter(e => e.id !== existingEdge.id);

  // Add new node and edges
  const newGraph = addNode({ ...graph, edges: edgesWithoutOld }, newNode);
  const withFirstEdge = connectNodes(newGraph, sourceId, newNode.id, { type: existingEdge.type });
  const withSecondEdge = connectNodes(withFirstEdge, newNode.id, targetId, { type: existingEdge.type });

  return withSecondEdge;
}

// =============================================================================
// GRAPH ANALYSIS
// =============================================================================

/**
 * Calculate estimated number of paths through the graph
 */
function calculateEstimatedPaths(nodes: FlowNode[], edges: FlowEdge[]): number {
  const decisionNodes = nodes.filter(n => n.type === 'decision');
  let paths = 1;

  for (const decision of decisionNodes) {
    const outgoingEdges = edges.filter(e => e.source === decision.id);
    if (outgoingEdges.length > 1) {
      paths *= outgoingEdges.length;
    }
  }

  return paths;
}

/**
 * Find all paths from start to end nodes
 */
export function findAllPaths(graph: FlowGraph, maxPaths = 100): FlowPath[] {
  const paths: FlowPath[] = [];
  const visited = new Set<string>();

  function dfs(
    currentId: string,
    currentPath: string[],
    currentEdges: string[]
  ): void {
    if (paths.length >= maxPaths) return;

    currentPath.push(currentId);

    if (graph.endNodeIds.includes(currentId)) {
      paths.push({
        id: `path-${paths.length + 1}`,
        name: `Path ${paths.length + 1}`,
        nodeIds: [...currentPath],
        edgeIds: [...currentEdges],
        isHappyPath: false,
        isCriticalPath: false,
        friction: 'none',
        issues: [],
      });
      currentPath.pop();
      return;
    }

    // Prevent infinite loops
    const pathKey = currentPath.join(',');
    if (visited.has(pathKey)) {
      currentPath.pop();
      return;
    }
    visited.add(pathKey);

    const outgoingEdges = graph.edges.filter(e => e.source === currentId);
    for (const edge of outgoingEdges) {
      dfs(edge.target, currentPath, [...currentEdges, edge.id]);
    }

    visited.delete(pathKey);
    currentPath.pop();
  }

  dfs(graph.startNodeId, [], []);

  // Mark happy path (shortest successful path)
  if (paths.length > 0) {
    const shortestPath = paths.reduce((min, p) =>
      p.nodeIds.length < min.nodeIds.length ? p : min
    );
    shortestPath.isHappyPath = true;
    shortestPath.name = 'Happy Path';
  }

  // Mark critical path
  const criticalPathSet = new Set(graph.criticalPath);
  for (const path of paths) {
    if (path.nodeIds.every(id => criticalPathSet.has(id))) {
      path.isCriticalPath = true;
      if (!path.isHappyPath) {
        path.name = 'Critical Path';
      }
    }
  }

  return paths;
}

/**
 * Find dead end nodes (no outgoing edges, not end nodes)
 */
export function findDeadEnds(graph: FlowGraph): string[] {
  const nodesWithOutgoing = new Set(graph.edges.map(e => e.source));
  const endNodeSet = new Set(graph.endNodeIds);

  return graph.nodes
    .filter(n => !nodesWithOutgoing.has(n.id) && !endNodeSet.has(n.id) && n.type !== 'end')
    .map(n => n.id);
}

/**
 * Find orphan nodes (not reachable from start)
 */
export function findOrphanNodes(graph: FlowGraph): string[] {
  const reachable = new Set<string>();
  const queue = [graph.startNodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (reachable.has(current)) continue;
    reachable.add(current);

    const outgoing = graph.edges.filter(e => e.source === current);
    for (const edge of outgoing) {
      if (!reachable.has(edge.target)) {
        queue.push(edge.target);
      }
    }
  }

  return graph.nodes
    .filter(n => !reachable.has(n.id))
    .map(n => n.id);
}

/**
 * Detect cycles in the graph
 */
export function detectCycles(graph: FlowGraph): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];

  function dfs(nodeId: string): void {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const outgoing = graph.edges.filter(e => e.source === nodeId);
    for (const edge of outgoing) {
      if (!visited.has(edge.target)) {
        dfs(edge.target);
      } else if (recursionStack.has(edge.target)) {
        // Found a cycle
        const cycleStart = path.indexOf(edge.target);
        const cycle = path.slice(cycleStart);
        cycle.push(edge.target); // Complete the cycle
        cycles.push(cycle);
      }
    }

    path.pop();
    recursionStack.delete(nodeId);
  }

  for (const node of graph.nodes) {
    if (!visited.has(node.id)) {
      dfs(node.id);
    }
  }

  return cycles;
}

/**
 * Analyze a flow graph completely
 */
export function analyzeFlowGraph(graph: FlowGraph): FlowGraphAnalysis {
  const paths = findAllPaths(graph);
  const deadEnds = findDeadEnds(graph);
  const orphanNodes = findOrphanNodes(graph);
  const cycles = detectCycles(graph);

  const pathLengths = paths.map(p => p.nodeIds.length);

  return {
    graph,
    paths,
    metrics: {
      totalNodes: graph.nodes.length,
      totalEdges: graph.edges.length,
      totalPaths: paths.length,
      maxPathLength: pathLengths.length > 0 ? Math.max(...pathLengths) : 0,
      minPathLength: pathLengths.length > 0 ? Math.min(...pathLengths) : 0,
      avgPathLength: pathLengths.length > 0
        ? pathLengths.reduce((a, b) => a + b, 0) / pathLengths.length
        : 0,
      decisionPoints: graph.totalDecisionPoints,
      deadEnds,
      orphanNodes,
      cycles,
    },
    nodeIssues: new Map(),
    edgeIssues: new Map(),
    pathIssues: new Map(),
    recommendations: {
      simplify: [],
      combine: [],
      reorder: [],
      addPath: [],
    },
  };
}

// =============================================================================
// GRAPH VISUALIZATION
// =============================================================================

/**
 * Generate Mermaid flowchart from graph
 */
export function toMermaid(graph: FlowGraph, options: {
  direction?: 'TB' | 'LR' | 'BT' | 'RL';
  showLabels?: boolean;
  highlightPath?: string[];
  theme?: 'default' | 'dark' | 'forest' | 'neutral';
} = {}): string {
  const {
    direction = 'TB',
    showLabels = true,
    highlightPath = [],
    theme = 'default',
  } = options;

  const lines: string[] = [
    `%%{init: {'theme': '${theme}'}}%%`,
    `flowchart ${direction}`,
  ];

  // Define node shapes based on type
  const nodeShapes: Record<FlowNodeType, [string, string]> = {
    start: ['([', '])'],      // Stadium shape
    end: ['([', '])'],        // Stadium shape
    screen: ['[', ']'],       // Rectangle
    decision: ['{', '}'],     // Diamond
    merge: ['((', '))'],      // Circle
    error: ['[/', '/]'],      // Parallelogram
    external: ['[[', ']]'],   // Subroutine
  };

  // Add nodes
  for (const node of graph.nodes) {
    const [open, close] = nodeShapes[node.type] || ['[', ']'];
    const label = node.screenName.replace(/"/g, '\\"');
    const highlight = highlightPath.includes(node.id) ? ':::highlight' : '';
    lines.push(`    ${node.id}${open}"${label}"${close}${highlight}`);
  }

  lines.push('');

  // Add edges
  for (const edge of graph.edges) {
    let arrow = '-->';
    let style = '';

    switch (edge.type) {
      case 'success':
        arrow = '==>';
        style = '|Success|';
        break;
      case 'error':
        arrow = '-.->';
        style = '|Error|';
        break;
      case 'conditional':
        style = edge.label ? `|${edge.label}|` : '|Conditional|';
        break;
      case 'optional':
        arrow = '-.->';
        style = edge.label ? `|${edge.label}|` : '|Optional|';
        break;
      case 'back':
        arrow = '-->';
        style = '|Back|';
        break;
      default:
        style = showLabels && edge.label ? `|${edge.label}|` : '';
    }

    const highlight = highlightPath.includes(edge.source) && highlightPath.includes(edge.target)
      ? ':::highlightEdge'
      : '';
    lines.push(`    ${edge.source} ${arrow}${style} ${edge.target}${highlight}`);
  }

  // Add styles
  lines.push('');
  lines.push('    classDef highlight fill:#f9f,stroke:#333,stroke-width:2px');
  lines.push('    classDef highlightEdge stroke:#f9f,stroke-width:2px');
  lines.push('    classDef decision fill:#ffd,stroke:#333');
  lines.push('    classDef error fill:#fdd,stroke:#933');
  lines.push('    classDef start fill:#dfd,stroke:#393');
  lines.push('    classDef end fill:#ddf,stroke:#339');

  // Apply node type classes
  const nodesByType = new Map<FlowNodeType, string[]>();
  for (const node of graph.nodes) {
    const nodes = nodesByType.get(node.type) || [];
    nodes.push(node.id);
    nodesByType.set(node.type, nodes);
  }

  for (const [type, nodes] of nodesByType) {
    if (type !== 'screen' && nodes.length > 0) {
      lines.push(`    class ${nodes.join(',')} ${type}`);
    }
  }

  return lines.join('\n');
}

/**
 * Generate ASCII flow diagram
 */
export function toASCII(graph: FlowGraph): string {
  const paths = findAllPaths(graph, 1);
  if (paths.length === 0) return 'Empty graph';

  const happyPath = paths.find(p => p.isHappyPath) || paths[0];
  const lines: string[] = [];

  lines.push(`Flow: ${graph.name}`);
  lines.push('═'.repeat(40));
  lines.push('');

  for (let i = 0; i < happyPath.nodeIds.length; i++) {
    const nodeId = happyPath.nodeIds[i];
    const node = graph.nodes.find(n => n.id === nodeId);
    if (!node) continue;

    const icon = getNodeIcon(node.type);
    const box = `${icon} ${node.screenName}`;
    const padding = ' '.repeat(Math.max(0, 20 - box.length / 2));

    lines.push(`${padding}┌${'─'.repeat(box.length + 2)}┐`);
    lines.push(`${padding}│ ${box} │`);
    lines.push(`${padding}└${'─'.repeat(box.length + 2)}┘`);

    if (i < happyPath.nodeIds.length - 1) {
      const edge = graph.edges.find(
        e => e.source === nodeId && e.target === happyPath.nodeIds[i + 1]
      );
      const edgeLabel = edge?.label || '';
      const labelLine = edgeLabel ? ` ${edgeLabel}` : '';
      lines.push(`${' '.repeat(20)}│${labelLine}`);
      lines.push(`${' '.repeat(20)}▼`);
    }
  }

  // Show decision branches
  const decisions = graph.nodes.filter(n => n.type === 'decision');
  if (decisions.length > 0) {
    lines.push('');
    lines.push('Decision Points:');
    lines.push('─'.repeat(40));

    for (const decision of decisions) {
      const outgoing = graph.edges.filter(e => e.source === decision.id);
      lines.push(`  ${decision.screenName}:`);
      for (const edge of outgoing) {
        const target = graph.nodes.find(n => n.id === edge.target);
        const label = edge.label || edge.type;
        lines.push(`    ├─[${label}]─> ${target?.screenName || edge.target}`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Get icon for node type
 */
function getNodeIcon(type: FlowNodeType): string {
  const icons: Record<FlowNodeType, string> = {
    start: '▶',
    end: '◼',
    screen: '□',
    decision: '◇',
    merge: '○',
    error: '⚠',
    external: '↗',
  };
  return icons[type] || '□';
}

/**
 * Generate summary statistics as markdown
 */
export function toMarkdownSummary(analysis: FlowGraphAnalysis): string {
  const { graph, paths, metrics } = analysis;
  const lines: string[] = [];

  lines.push(`## 📊 Flow Graph Analysis: ${graph.name}`);
  lines.push('');
  lines.push('### Overview');
  lines.push(`- **App Type:** ${graph.appType}`);
  lines.push(`- **Total Screens:** ${graph.totalScreens}`);
  lines.push(`- **Decision Points:** ${metrics.decisionPoints}`);
  lines.push(`- **Total Paths:** ${metrics.totalPaths}`);
  lines.push('');

  lines.push('### Path Statistics');
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Shortest Path | ${metrics.minPathLength} steps |`);
  lines.push(`| Longest Path | ${metrics.maxPathLength} steps |`);
  lines.push(`| Average Path | ${metrics.avgPathLength.toFixed(1)} steps |`);
  lines.push('');

  if (metrics.deadEnds.length > 0) {
    lines.push('### ⚠️ Dead Ends Detected');
    for (const deadEnd of metrics.deadEnds) {
      const node = graph.nodes.find(n => n.id === deadEnd);
      lines.push(`- ${node?.screenName || deadEnd}`);
    }
    lines.push('');
  }

  if (metrics.orphanNodes.length > 0) {
    lines.push('### ⚠️ Unreachable Nodes');
    for (const orphan of metrics.orphanNodes) {
      const node = graph.nodes.find(n => n.id === orphan);
      lines.push(`- ${node?.screenName || orphan}`);
    }
    lines.push('');
  }

  if (metrics.cycles.length > 0) {
    lines.push('### 🔄 Cycles Detected');
    for (const cycle of metrics.cycles) {
      const names = cycle.map(id => {
        const node = graph.nodes.find(n => n.id === id);
        return node?.screenName || id;
      });
      lines.push(`- ${names.join(' → ')}`);
    }
    lines.push('');
  }

  lines.push('### Flow Diagram');
  lines.push('```mermaid');
  lines.push(toMermaid(graph));
  lines.push('```');

  return lines.join('\n');
}

// =============================================================================
// GRAPH TEMPLATES
// =============================================================================

export const GRAPH_TEMPLATES: FlowGraphTemplate[] = [
  // E-commerce checkout with branches
  {
    id: 'ecommerce-checkout-graph',
    name: 'E-commerce Checkout (with branches)',
    description: 'Complete checkout flow with guest/login options and payment alternatives',
    appTypes: ['ecommerce', 'marketplace'],
    priority: 'critical',
    nodes: [
      { id: 'start', type: 'start', screenName: 'Start', description: 'Begin checkout' },
      { id: 'cart', type: 'screen', screenName: 'Shopping Cart', description: 'Review cart items', action: 'verify' },
      { id: 'auth-decision', type: 'decision', screenName: 'Account Check', description: 'Guest or login?' },
      { id: 'login', type: 'screen', screenName: 'Login', description: 'Sign in to account', action: 'authenticate' },
      { id: 'guest', type: 'screen', screenName: 'Guest Info', description: 'Enter email for guest checkout', action: 'input' },
      { id: 'shipping', type: 'screen', screenName: 'Shipping Address', description: 'Enter shipping details', action: 'input' },
      { id: 'shipping-method', type: 'screen', screenName: 'Shipping Method', description: 'Choose shipping speed', action: 'select' },
      { id: 'payment-decision', type: 'decision', screenName: 'Payment Method', description: 'Choose payment type' },
      { id: 'card-payment', type: 'screen', screenName: 'Card Payment', description: 'Enter card details', action: 'input' },
      { id: 'paypal', type: 'external', screenName: 'PayPal', description: 'PayPal checkout', action: 'authenticate' },
      { id: 'apple-pay', type: 'screen', screenName: 'Apple Pay', description: 'Apple Pay confirmation', action: 'authenticate' },
      { id: 'review', type: 'screen', screenName: 'Order Review', description: 'Final review before purchase', action: 'verify' },
      { id: 'processing', type: 'screen', screenName: 'Processing', description: 'Order being placed', action: 'wait' },
      { id: 'confirmation', type: 'end', screenName: 'Confirmation', description: 'Order confirmed' },
      { id: 'error', type: 'error', screenName: 'Payment Error', description: 'Payment failed' },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'cart', type: 'default' },
      { id: 'e2', source: 'cart', target: 'auth-decision', type: 'default', label: 'Checkout' },
      { id: 'e3', source: 'auth-decision', target: 'login', type: 'conditional', label: 'Sign In' },
      { id: 'e4', source: 'auth-decision', target: 'guest', type: 'conditional', label: 'Guest' },
      { id: 'e5', source: 'login', target: 'shipping', type: 'success' },
      { id: 'e6', source: 'guest', target: 'shipping', type: 'default' },
      { id: 'e7', source: 'shipping', target: 'shipping-method', type: 'default' },
      { id: 'e8', source: 'shipping-method', target: 'payment-decision', type: 'default' },
      { id: 'e9', source: 'payment-decision', target: 'card-payment', type: 'conditional', label: 'Card' },
      { id: 'e10', source: 'payment-decision', target: 'paypal', type: 'conditional', label: 'PayPal' },
      { id: 'e11', source: 'payment-decision', target: 'apple-pay', type: 'conditional', label: 'Apple Pay' },
      { id: 'e12', source: 'card-payment', target: 'review', type: 'default' },
      { id: 'e13', source: 'paypal', target: 'review', type: 'success' },
      { id: 'e14', source: 'apple-pay', target: 'review', type: 'success' },
      { id: 'e15', source: 'review', target: 'processing', type: 'default', label: 'Place Order' },
      { id: 'e16', source: 'processing', target: 'confirmation', type: 'success' },
      { id: 'e17', source: 'processing', target: 'error', type: 'error' },
      { id: 'e18', source: 'error', target: 'payment-decision', type: 'back', label: 'Try Again' },
    ],
    startNodeId: 'start',
    endNodeIds: ['confirmation'],
    criticalPath: ['start', 'cart', 'auth-decision', 'guest', 'shipping', 'shipping-method', 'payment-decision', 'card-payment', 'review', 'processing', 'confirmation'],
    commonIssues: ['Hidden costs', 'Too many steps', 'No guest option', 'Payment failure recovery'],
    checkpoints: ['cart', 'shipping', 'review', 'confirmation'],
  },

  // SaaS onboarding with optional steps
  {
    id: 'saas-onboarding-graph',
    name: 'SaaS Onboarding (with optional steps)',
    description: 'User onboarding with skippable personalization',
    appTypes: ['saas', 'productivity'],
    priority: 'critical',
    nodes: [
      { id: 'start', type: 'start', screenName: 'Start', description: 'Begin onboarding' },
      { id: 'signup', type: 'screen', screenName: 'Sign Up', description: 'Create account', action: 'input' },
      { id: 'verify-email', type: 'screen', screenName: 'Verify Email', description: 'Confirm email', action: 'verify' },
      { id: 'profile-decision', type: 'decision', screenName: 'Profile Setup?', description: 'Setup profile now?' },
      { id: 'profile', type: 'screen', screenName: 'Profile Setup', description: 'Add profile info', action: 'input' },
      { id: 'team-decision', type: 'decision', screenName: 'Create Team?', description: 'Setup team now?' },
      { id: 'team', type: 'screen', screenName: 'Team Setup', description: 'Create or join team', action: 'input' },
      { id: 'invite', type: 'screen', screenName: 'Invite Members', description: 'Invite team members', action: 'input' },
      { id: 'tour-decision', type: 'decision', screenName: 'Product Tour?', description: 'Take the tour?' },
      { id: 'tour', type: 'screen', screenName: 'Product Tour', description: 'Guided walkthrough', action: 'navigate' },
      { id: 'dashboard', type: 'end', screenName: 'Dashboard', description: 'Main app dashboard' },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'signup', type: 'default' },
      { id: 'e2', source: 'signup', target: 'verify-email', type: 'default' },
      { id: 'e3', source: 'verify-email', target: 'profile-decision', type: 'success' },
      { id: 'e4', source: 'profile-decision', target: 'profile', type: 'conditional', label: 'Setup Now' },
      { id: 'e5', source: 'profile-decision', target: 'team-decision', type: 'optional', label: 'Skip' },
      { id: 'e6', source: 'profile', target: 'team-decision', type: 'default' },
      { id: 'e7', source: 'team-decision', target: 'team', type: 'conditional', label: 'Create Team' },
      { id: 'e8', source: 'team-decision', target: 'tour-decision', type: 'optional', label: 'Skip' },
      { id: 'e9', source: 'team', target: 'invite', type: 'default' },
      { id: 'e10', source: 'invite', target: 'tour-decision', type: 'default' },
      { id: 'e11', source: 'tour-decision', target: 'tour', type: 'conditional', label: 'Yes' },
      { id: 'e12', source: 'tour-decision', target: 'dashboard', type: 'optional', label: 'Skip' },
      { id: 'e13', source: 'tour', target: 'dashboard', type: 'default' },
    ],
    startNodeId: 'start',
    endNodeIds: ['dashboard'],
    criticalPath: ['start', 'signup', 'verify-email', 'profile-decision', 'team-decision', 'tour-decision', 'dashboard'],
    commonIssues: ['Too many steps before value', 'No skip options', 'Email verification delay'],
    checkpoints: ['signup', 'verify-email', 'dashboard'],
  },

  // Authentication with error recovery
  {
    id: 'auth-login-graph',
    name: 'Login Flow (with error recovery)',
    description: 'Authentication flow with forgot password and error handling',
    appTypes: ['saas', 'ecommerce', 'social', 'fintech'],
    priority: 'critical',
    nodes: [
      { id: 'start', type: 'start', screenName: 'Start', description: 'Begin login' },
      { id: 'login', type: 'screen', screenName: 'Login', description: 'Enter credentials', action: 'input' },
      { id: 'auth-check', type: 'decision', screenName: 'Verify', description: 'Check credentials' },
      { id: '2fa', type: 'screen', screenName: '2FA', description: 'Enter verification code', action: 'input' },
      { id: 'forgot', type: 'screen', screenName: 'Forgot Password', description: 'Reset password', action: 'input' },
      { id: 'reset-sent', type: 'screen', screenName: 'Reset Sent', description: 'Check email message', action: 'verify' },
      { id: 'locked', type: 'error', screenName: 'Account Locked', description: 'Too many attempts' },
      { id: 'dashboard', type: 'end', screenName: 'Dashboard', description: 'Login successful' },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'login', type: 'default' },
      { id: 'e2', source: 'login', target: 'auth-check', type: 'default', label: 'Submit' },
      { id: 'e3', source: 'login', target: 'forgot', type: 'optional', label: 'Forgot?' },
      { id: 'e4', source: 'auth-check', target: '2fa', type: 'conditional', label: '2FA Required' },
      { id: 'e5', source: 'auth-check', target: 'dashboard', type: 'success', label: 'Valid' },
      { id: 'e6', source: 'auth-check', target: 'login', type: 'error', label: 'Invalid' },
      { id: 'e7', source: 'auth-check', target: 'locked', type: 'error', label: 'Locked' },
      { id: 'e8', source: '2fa', target: 'dashboard', type: 'success' },
      { id: 'e9', source: '2fa', target: 'login', type: 'error', label: 'Invalid Code' },
      { id: 'e10', source: 'forgot', target: 'reset-sent', type: 'default' },
      { id: 'e11', source: 'reset-sent', target: 'login', type: 'back', label: 'Back to Login' },
    ],
    startNodeId: 'start',
    endNodeIds: ['dashboard'],
    criticalPath: ['start', 'login', 'auth-check', 'dashboard'],
    commonIssues: ['Poor error messages', 'No password visibility', 'Unclear lockout policy'],
    checkpoints: ['login', 'dashboard'],
  },
];

/**
 * Create flow graph from template
 */
export function createGraphFromTemplate(
  template: FlowGraphTemplate,
  customName?: string
): FlowGraph {
  return {
    id: `graph-${Date.now()}`,
    name: customName || template.name,
    description: template.description,
    appType: template.appTypes[0],
    version: '1.0.0',
    nodes: template.nodes.map(n => ({ ...n })),
    edges: template.edges.map(e => ({ ...e })),
    startNodeId: template.startNodeId,
    endNodeIds: template.endNodeIds,
    criticalPath: [...template.criticalPath],
    totalScreens: template.nodes.filter(n => n.type === 'screen').length,
    totalDecisionPoints: template.nodes.filter(n => n.type === 'decision').length,
    estimatedPaths: calculateEstimatedPaths(template.nodes as FlowNode[], template.edges as FlowEdge[]),
    tags: [...template.commonIssues],
  };
}

/**
 * Get suggested graph templates for app type
 */
export function getSuggestedGraphTemplates(appType: AppType): FlowGraphTemplate[] {
  return GRAPH_TEMPLATES.filter(
    t => t.appTypes.includes(appType) || appType === 'unknown'
  ).sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.priority] - order[b.priority];
  });
}
