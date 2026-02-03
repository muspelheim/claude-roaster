/**
 * Claude Roaster Plugin
 * Brutal UI/UX roasting with multi-perspective analysis
 *
 * @packageDocumentation
 */

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  // Agent types
  RoasterAgentId,
  SpecialistAgentId,
  AgentModel,
  AgentConfig,

  // Severity types
  Severity,
  SeverityConfig,
  RoastIssue,

  // Session types
  RoastTargetType,
  ScreenshotMethod,
  FixMode,
  FocusArea,
  RoastSessionConfig,
  RoastSession,

  // Iteration & report types
  RoastIteration,
  PerspectiveAnalysis,
  IterationScores,
  FinalReport,

  // Accessibility types
  WcagLevel,
  ColorBlindnessType,
  ContrastCheck,
  TouchTargetCheck,
  AccessibilityAudit,

  // Platform types
  Platform,
  PlatformConfig,

  // CLI & plugin types
  RoastCommandArgs,
  PluginConfig,
  PluginMetadata,
} from './types.js';

// =============================================================================
// CONSTANT EXPORTS
// =============================================================================

export {
  // Plugin metadata
  PLUGIN_NAME,
  VERSION,
  PLUGIN_METADATA,

  // Agent configurations
  AGENTS,
  SPECIALIST_AGENTS,

  // Severity configurations
  SEVERITIES,

  // Default configurations
  DEFAULT_CONFIG,
  ITERATION_LIMITS,

  // Platform configurations
  PLATFORM_CONFIGS,

  // WCAG standards
  WCAG,

  // File patterns
  FILE_PATTERNS,

  // Display helpers
  PERSPECTIVE_DISPLAY,
  SCORE_THRESHOLDS,
  getScoreCategory,
} from './constants.js';

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export {
  // String utilities
  sanitizeTopic,
  generateSessionId,
  parseIterationCount,

  // File path utilities
  getReportPath,
  getFinalReportPath,
  getScreenshotPath,
  getFinalScreenshotPath,

  // Issue utilities
  sortIssuesBySeverity,
  groupIssuesBySeverity,
  groupIssuesBySource,
  countIssuesBySeverity,
  generateIssueId,

  // Score utilities
  calculateOverallScore,
  calculateScoreDelta,
  formatScore,
  formatScoreDelta,

  // Report generation utilities
  getSeverityHeader,
  getPerspectiveHeader,
  formatIssueRow,
  generateIssuesTable,
  calculateResolutionRate,

  // Target type utilities
  inferTargetType,
  getTargetTypeDescription,

  // Datetime utilities
  formatReportDate,
  calculateDuration,

  // Validation utilities
  validateSessionConfig,
  validateSessionConfigStrict,
  isPassingScore,
  passesA11yMinimum,

  // Scoring normalization
  wcagLevelToScore,
  scoreToWcagLevel,
  normalizeScore,
  createUnifiedScores,

  // Error handling wrappers
  sanitizeTopicSafe,
  parseIterationCountSafe,
  validateScore,
  validateSeverity,
  validateTargetType,
  validateFilePath,
  tryExecute,
  tryExecuteAsync,
} from './utils.js';

// =============================================================================
// CONFIGURATION EXPORTS
// =============================================================================

export {
  // Config file paths
  CONFIG_FILENAME,
  getProjectConfigPath,
  getUserConfigPath,
  findConfigPath,

  // Config loading
  loadConfig,
  mergeConfig,

  // Config saving
  saveConfig,
  initConfig,

  // Config updates
  updateConfig,
  resetConfig,

  // Config validation
  validateConfig,

  // Config display
  formatConfigDisplay,
  generateConfigTemplate,
} from './config.js';

// =============================================================================
// LOGGER EXPORTS
// =============================================================================

export {
  // Logger class and instance
  Logger,
  logger,

  // Logger types
  LogLevel,
  type LogCategory,
  type LogEntry,
  type LoggerConfig,

  // Logger configuration
  DEFAULT_LOGGER_CONFIG,

  // Logger utilities
  createCategoryLogger,
  parseLogLevel,
} from './logger.js';

// =============================================================================
// ERROR EXPORTS
// =============================================================================

export {
  // Base error class
  RoasterError,

  // Specific error classes
  ConfigurationError,
  SessionError,
  ScreenshotError,
  AnalysisError,
  ReportError,
  ValidationError,

  // Error utilities
  isRoasterError,
  isRecoverableError,
  getErrorMessage,
  getErrorStack,
  formatErrorForUser,
  wrapError,
} from './errors.js';

// =============================================================================
// CONVENIENCE RE-EXPORTS
// =============================================================================

/**
 * All available agent IDs
 */
export const agents: string[] = [
  'roaster',
  'roaster-designer',
  'roaster-developer',
  'roaster-user',
  'roaster-a11y',
  'roaster-marketing',
];

/**
 * All available commands
 */
export const commands: string[] = ['roast'];

/**
 * All available skills
 */
export const skills: string[] = ['roast'];
