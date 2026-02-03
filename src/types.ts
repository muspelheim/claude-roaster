/**
 * Claude Roaster - TypeScript Type Definitions
 * Comprehensive types for the multi-perspective UI/UX roasting plugin
 */

// =============================================================================
// AGENT TYPES
// =============================================================================

/**
 * Available roaster agent identifiers
 */
export type RoasterAgentId =
  | 'roaster'
  | 'roaster-designer'
  | 'roaster-developer'
  | 'roaster-user'
  | 'roaster-a11y'
  | 'roaster-marketing'
  | 'roaster-performance'
  | 'roaster-copy'
  | 'roaster-privacy'
  | 'roaster-i18n'
  | 'roaster-flow';

/**
 * Specialist agent identifiers (excludes main orchestrator)
 */
export type SpecialistAgentId = Exclude<RoasterAgentId, 'roaster'>;

/**
 * Model types available for agents
 */
export type AgentModel = 'opus' | 'sonnet' | 'haiku';

/**
 * Agent configuration with metadata
 */
export interface AgentConfig {
  id: RoasterAgentId;
  name: string;
  description: string;
  model: AgentModel;
  perspective: string;
  focusAreas: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

// =============================================================================
// SEVERITY TYPES
// =============================================================================

/**
 * Issue severity levels
 */
export type Severity = 'critical' | 'major' | 'minor';

/**
 * Severity configuration with display properties
 */
export interface SeverityConfig {
  level: Severity;
  emoji: string;
  label: string;
  description: string;
  priority: number;
}

/**
 * A single roast issue/finding
 */
export interface RoastIssue {
  id: string;
  severity: Severity;
  title: string;
  source: SpecialistAgentId;
  impact: string;
  fix: string;
  details?: string;
  wcagCriteria?: string; // For a11y issues
  timeEstimate?: string;
}

// =============================================================================
// ROAST SESSION TYPES
// =============================================================================

/**
 * Target types for roasting
 */
export type RoastTargetType = 'screen' | 'component' | 'flow' | 'audit';

/**
 * Screenshot capture methods
 */
export type ScreenshotMethod = 'xcode-mcp' | 'playwright-mcp' | 'user-upload';

/**
 * Fix mode preferences
 */
export type FixMode = 'auto-implement' | 'report-only' | 'cherry-pick' | 'skip';

/**
 * Focus area filters
 */
export type FocusArea =
  | 'accessibility'
  | 'conversion'
  | 'usability'
  | 'visual'
  | 'implementation'
  | 'all';

/**
 * Roast session configuration
 */
export interface RoastSessionConfig {
  target: string;
  targetType: RoastTargetType;
  iterations: number;
  fixMode: FixMode;
  focusAreas: FocusArea[];
  screenshotMethod?: ScreenshotMethod;
  flowSteps?: string[];
}

/**
 * Roast session state
 */
export interface RoastSession {
  id: string;
  config: RoastSessionConfig;
  currentIteration: number;
  startedAt: Date;
  status: 'active' | 'paused' | 'completed' | 'aborted';
  iterations: RoastIteration[];
}

// =============================================================================
// ITERATION & REPORT TYPES
// =============================================================================

/**
 * Single iteration data
 */
export interface RoastIteration {
  number: number;
  screenshotPath: string;
  timestamp: Date;
  issues: RoastIssue[];
  fixesApplied: string[];
  perspectives: PerspectiveAnalysis[];
  scores: IterationScores;
}

/**
 * Perspective-specific analysis
 */
export interface PerspectiveAnalysis {
  agent: SpecialistAgentId;
  rawAnalysis: string;
  issues: RoastIssue[];
  score: number;
  highlights: string[];
}

/**
 * Scores for a single iteration
 */
export interface IterationScores {
  visual: number;
  usability: number;
  accessibility: number;
  implementation: number;
  conversion: number;
  overall: number;
}

/**
 * Final report structure
 */
export interface FinalReport {
  session: RoastSession;
  beforeAfter: {
    before: IterationScores;
    after: IterationScores;
    delta: IterationScores;
  };
  totalIssuesFound: number;
  totalIssuesFixed: number;
  resolutionRate: number;
  outstandingIssues: RoastIssue[];
  keyLearnings: string[];
  recommendations: string[];
}

// =============================================================================
// WCAG & ACCESSIBILITY TYPES
// =============================================================================

/**
 * WCAG compliance levels
 */
export type WcagLevel = 'fail' | 'A' | 'AA' | 'AAA';

/**
 * Color blindness types
 */
export type ColorBlindnessType = 'deuteranopia' | 'protanopia' | 'tritanopia';

/**
 * Contrast check result
 */
export interface ContrastCheck {
  element: string;
  foreground: string;
  background: string;
  ratio: number;
  required: number;
  passes: boolean;
  fix?: string;
}

/**
 * Touch target check result
 */
export interface TouchTargetCheck {
  element: string;
  currentSize: { width: number; height: number };
  requiredSize: { width: number; height: number };
  passes: boolean;
}

/**
 * Accessibility audit result
 */
export interface AccessibilityAudit {
  wcagLevel: WcagLevel;
  contrastIssues: ContrastCheck[];
  touchTargetIssues: TouchTargetCheck[];
  screenReaderIssues: string[];
  keyboardNavIssues: string[];
  colorBlindnessResults: Record<ColorBlindnessType, 'pass' | 'fail'>;
  legalRiskLevel: 'low' | 'medium' | 'high';
}

// =============================================================================
// PLATFORM TYPES
// =============================================================================

/**
 * Platform detection result
 */
export type Platform = 'ios' | 'android' | 'web' | 'macos' | 'unknown';

/**
 * Platform-specific configuration
 */
export interface PlatformConfig {
  platform: Platform;
  screenshotMethod: ScreenshotMethod;
  touchTargetMinimum: { width: number; height: number };
  safeAreaRequired: boolean;
  dynamicTypeSupport: boolean;
}

// =============================================================================
// CLI & PLUGIN TYPES
// =============================================================================

/**
 * CLI command arguments
 */
export interface RoastCommandArgs {
  target?: string;
  iterations?: number;
  focus?: FocusArea;
  mode?: FixMode;
}

/**
 * Plugin configuration (user preferences)
 */
export interface PluginConfig {
  defaultIterations: number;
  defaultFixMode: FixMode;
  reportOutputDir: string;
  screenshotOutputDir: string;
  verboseReports: boolean;
  includeCompetitorAnalysis: boolean;
}

/**
 * Plugin metadata
 */
export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  agents: RoasterAgentId[];
  commands: string[];
  skills: string[];
}

// =============================================================================
// USER FLOW TYPES
// =============================================================================

/**
 * Application types for flow suggestions
 */
export type AppType =
  | 'ecommerce'
  | 'saas'
  | 'social'
  | 'fintech'
  | 'healthcare'
  | 'education'
  | 'media'
  | 'productivity'
  | 'marketplace'
  | 'gaming'
  | 'unknown';

/**
 * User action types within a flow
 */
export type FlowActionType =
  | 'navigate'
  | 'click'
  | 'input'
  | 'scroll'
  | 'swipe'
  | 'wait'
  | 'verify'
  | 'submit'
  | 'select'
  | 'upload'
  | 'authenticate';

/**
 * A single step in a user flow
 */
export interface FlowStep {
  id: string;
  order: number;
  screenName: string;
  action: FlowActionType;
  description: string;
  expectedState?: string;
  screenshotPath?: string;
  issues?: RoastIssue[];
  scores?: IterationScores;
  transitionFrom?: string;
  transitionTo?: string;
}

/**
 * Complete flow definition
 */
export interface FlowDefinition {
  id: string;
  name: string;
  description: string;
  appType: AppType;
  steps: FlowStep[];
  totalScreens: number;
  estimatedDuration?: string;
  criticalPath: boolean;
  tags?: string[];
}

/**
 * Flow template for suggestions
 */
export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  appTypes: AppType[];
  steps: Omit<FlowStep, 'id' | 'screenshotPath' | 'issues' | 'scores'>[];
  commonIssues: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Transition analysis between screens
 */
export interface TransitionAnalysis {
  fromStep: string;
  toStep: string;
  consistency: {
    navigation: boolean;
    branding: boolean;
    layout: boolean;
    typography: boolean;
  };
  friction: {
    level: 'none' | 'low' | 'medium' | 'high';
    reasons: string[];
  };
  issues: RoastIssue[];
}

/**
 * Flow-specific roast session
 */
export interface FlowRoastSession extends RoastSession {
  flow: FlowDefinition;
  stepResults: Map<string, FlowStepResult>;
  transitions: TransitionAnalysis[];
  journeyScore: number;
}

/**
 * Result for a single flow step
 */
export interface FlowStepResult {
  stepId: string;
  screenshotPath: string;
  analysisComplete: boolean;
  perspectives: PerspectiveAnalysis[];
  issues: RoastIssue[];
  scores: IterationScores;
}

/**
 * Flow report structure
 */
export interface FlowReport {
  flow: FlowDefinition;
  stepReports: FlowStepResult[];
  transitions: TransitionAnalysis[];
  journeyMap: string;
  overallScores: IterationScores;
  criticalIssues: RoastIssue[];
  recommendations: string[];
}

/**
 * Natural language flow input
 */
export interface NaturalLanguageFlowInput {
  rawInput: string;
  parsedSteps: string[];
  inferredAppType: AppType;
  confidence: number;
}

// =============================================================================
// GRAPH-BASED FLOW TYPES
// =============================================================================

/**
 * Node types in a flow graph
 */
export type FlowNodeType =
  | 'screen'        // Regular screen/page
  | 'decision'      // Branch point (user choice or conditional)
  | 'merge'         // Merge point for branches
  | 'start'         // Flow entry point
  | 'end'           // Flow exit point (success)
  | 'error'         // Error state
  | 'external';     // External redirect/link

/**
 * Edge types for transitions
 */
export type FlowEdgeType =
  | 'default'       // Normal navigation
  | 'success'       // Success path
  | 'error'         // Error path
  | 'conditional'   // Conditional based on state
  | 'optional'      // Optional/skippable
  | 'back'          // Back navigation
  | 'exit';         // Exit flow

/**
 * Condition for conditional edges
 */
export interface FlowCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'exists' | 'isEmpty';
  value: string | number | boolean;
  label: string;
}

/**
 * A node in the flow graph (represents a screen or decision point)
 */
export interface FlowNode {
  id: string;
  type: FlowNodeType;
  screenName: string;
  description: string;
  action?: FlowActionType;
  expectedState?: string;
  screenshotPath?: string;
  issues?: RoastIssue[];
  scores?: IterationScores;
  metadata?: Record<string, unknown>;
  position?: { x: number; y: number };  // For visual layout
}

/**
 * An edge in the flow graph (represents a transition)
 */
export interface FlowEdge {
  id: string;
  source: string;       // Source node ID
  target: string;       // Target node ID
  type: FlowEdgeType;
  label?: string;       // Edge label (e.g., "Submit", "Cancel")
  condition?: FlowCondition;
  priority?: number;    // For ordering multiple edges from same source
  friction?: 'none' | 'low' | 'medium' | 'high';
  issues?: RoastIssue[];
}

/**
 * Complete flow graph structure
 */
export interface FlowGraph {
  id: string;
  name: string;
  description: string;
  appType: AppType;
  version: string;

  // Graph structure
  nodes: FlowNode[];
  edges: FlowEdge[];

  // Entry/exit points
  startNodeId: string;
  endNodeIds: string[];

  // Metadata
  criticalPath: string[];  // Node IDs of the critical/happy path
  totalScreens: number;
  totalDecisionPoints: number;
  estimatedPaths: number;
  tags?: string[];

  // Analysis results
  analysisComplete?: boolean;
  overallScore?: number;
}

/**
 * A path through the flow graph
 */
export interface FlowPath {
  id: string;
  name: string;
  nodeIds: string[];
  edgeIds: string[];
  isHappyPath: boolean;
  isCriticalPath: boolean;
  probability?: number;  // Estimated % of users taking this path
  friction: 'none' | 'low' | 'medium' | 'high';
  issues: RoastIssue[];
}

/**
 * Graph-based flow analysis result
 */
export interface FlowGraphAnalysis {
  graph: FlowGraph;
  paths: FlowPath[];

  // Metrics
  metrics: {
    totalNodes: number;
    totalEdges: number;
    totalPaths: number;
    maxPathLength: number;
    minPathLength: number;
    avgPathLength: number;
    decisionPoints: number;
    deadEnds: string[];      // Nodes with no outgoing edges (except end nodes)
    orphanNodes: string[];   // Nodes not reachable from start
    cycles: string[][];      // Detected cycles (potential infinite loops)
  };

  // Issues by location
  nodeIssues: Map<string, RoastIssue[]>;
  edgeIssues: Map<string, RoastIssue[]>;
  pathIssues: Map<string, RoastIssue[]>;

  // Recommendations
  recommendations: {
    simplify: string[];      // Nodes/edges that could be removed
    combine: [string, string][];  // Nodes that could be combined
    reorder: [string, string][];  // Suggested reordering
    addPath: string[];       // Suggested additional paths
  };
}

/**
 * Graph template for common flows
 */
export interface FlowGraphTemplate {
  id: string;
  name: string;
  description: string;
  appTypes: AppType[];
  priority: 'critical' | 'high' | 'medium' | 'low';

  // Template graph structure
  nodes: Omit<FlowNode, 'screenshotPath' | 'issues' | 'scores'>[];
  edges: Omit<FlowEdge, 'issues'>[];
  startNodeId: string;
  endNodeIds: string[];
  criticalPath: string[];

  // Common issues to check
  commonIssues: string[];
  checkpoints: string[];  // Key nodes that must be analyzed
}
