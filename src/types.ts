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
  | 'roaster-marketing';

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
