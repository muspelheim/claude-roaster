/**
 * Claude Roaster - Utility Functions
 * Helper functions for report generation, file management, and data processing
 */

import type {
  Severity,
  RoastIssue,
  IterationScores,
  RoastSession,
  FinalReport,
  SpecialistAgentId,
  RoastTargetType,
} from './types.js';
import { SEVERITIES, PERSPECTIVE_DISPLAY, FILE_PATTERNS, SCORE_THRESHOLDS } from './constants.js';
import { ConfigurationError, ValidationError } from './errors.js';

// =============================================================================
// STRING UTILITIES
// =============================================================================

/**
 * Sanitize a topic string for use in filenames
 * "Login Screen" → "login-screen"
 */
export function sanitizeTopic(topic: string): string {
  return topic
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')          // Spaces to hyphens
    .replace(/-+/g, '-')           // Multiple hyphens to single
    .replace(/^-|-$/g, '');        // Trim leading/trailing hyphens
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `roast-${timestamp}-${random}`;
}

/**
 * Parse iteration count from user input
 */
export function parseIterationCount(input: string | number | undefined, defaultValue = 3): number {
  if (input === undefined) return defaultValue;
  const parsed = typeof input === 'string' ? parseInt(input, 10) : input;
  if (isNaN(parsed) || parsed < 1) return defaultValue;
  return Math.min(parsed, 10); // Cap at 10
}

// =============================================================================
// FILE PATH UTILITIES
// =============================================================================

/**
 * Generate report filename for an iteration
 */
export function getReportPath(topic: string, iteration: number, baseDir = 'reports/roast'): string {
  const sanitized = sanitizeTopic(topic);
  return `${baseDir}/${FILE_PATTERNS.report(sanitized, iteration)}`;
}

/**
 * Generate final report filename
 */
export function getFinalReportPath(topic: string, baseDir = 'reports/roast'): string {
  const sanitized = sanitizeTopic(topic);
  return `${baseDir}/${FILE_PATTERNS.finalReport(sanitized)}`;
}

/**
 * Generate screenshot filename for an iteration
 */
export function getScreenshotPath(topic: string, iteration: number, baseDir = 'reports/roast/screenshots'): string {
  const sanitized = sanitizeTopic(topic);
  return `${baseDir}/${FILE_PATTERNS.screenshot(sanitized, iteration)}`;
}

/**
 * Generate final screenshot filename
 */
export function getFinalScreenshotPath(topic: string, baseDir = 'reports/roast/screenshots'): string {
  const sanitized = sanitizeTopic(topic);
  return `${baseDir}/${FILE_PATTERNS.finalScreenshot(sanitized)}`;
}

// =============================================================================
// ISSUE UTILITIES
// =============================================================================

/**
 * Sort issues by severity (critical first)
 */
export function sortIssuesBySeverity(issues: RoastIssue[]): RoastIssue[] {
  return [...issues].sort((a, b) => {
    const priorityA = SEVERITIES[a.severity]?.priority ?? 99;
    const priorityB = SEVERITIES[b.severity]?.priority ?? 99;
    return priorityA - priorityB;
  });
}

/**
 * Group issues by severity level
 */
export function groupIssuesBySeverity(issues: RoastIssue[]): Record<Severity, RoastIssue[]> {
  return {
    critical: issues.filter(i => i.severity === 'critical'),
    major: issues.filter(i => i.severity === 'major'),
    minor: issues.filter(i => i.severity === 'minor'),
  };
}

/**
 * Group issues by source agent
 */
export function groupIssuesBySource(issues: RoastIssue[]): Record<SpecialistAgentId, RoastIssue[]> {
  const grouped: Record<string, RoastIssue[]> = {};
  for (const issue of issues) {
    if (!grouped[issue.source]) {
      grouped[issue.source] = [];
    }
    grouped[issue.source].push(issue);
  }
  return grouped as Record<SpecialistAgentId, RoastIssue[]>;
}

/**
 * Count issues by severity
 */
export function countIssuesBySeverity(issues: RoastIssue[]): Record<Severity, number> {
  return {
    critical: issues.filter(i => i.severity === 'critical').length,
    major: issues.filter(i => i.severity === 'major').length,
    minor: issues.filter(i => i.severity === 'minor').length,
  };
}

/**
 * Generate a unique issue ID
 */
export function generateIssueId(source: SpecialistAgentId, index: number): string {
  const prefix = source.replace('roaster-', '').substring(0, 3).toUpperCase();
  return `${prefix}-${String(index + 1).padStart(3, '0')}`;
}

// =============================================================================
// SCORE UTILITIES
// =============================================================================

/**
 * Calculate overall score from individual scores
 */
export function calculateOverallScore(scores: Omit<IterationScores, 'overall'>): number {
  const weights = {
    visual: 0.2,
    usability: 0.25,
    accessibility: 0.25,
    implementation: 0.15,
    conversion: 0.15,
  };

  const weighted =
    scores.visual * weights.visual +
    scores.usability * weights.usability +
    scores.accessibility * weights.accessibility +
    scores.implementation * weights.implementation +
    scores.conversion * weights.conversion;

  return Math.round(weighted * 10) / 10;
}

/**
 * Calculate score delta between two iterations
 */
export function calculateScoreDelta(before: IterationScores, after: IterationScores): IterationScores {
  return {
    visual: Math.round((after.visual - before.visual) * 10) / 10,
    usability: Math.round((after.usability - before.usability) * 10) / 10,
    accessibility: Math.round((after.accessibility - before.accessibility) * 10) / 10,
    implementation: Math.round((after.implementation - before.implementation) * 10) / 10,
    conversion: Math.round((after.conversion - before.conversion) * 10) / 10,
    overall: Math.round((after.overall - before.overall) * 10) / 10,
  };
}

/**
 * Format score with emoji indicator
 */
export function formatScore(score: number): string {
  const emoji = score >= 9 ? '🌟' :
                score >= 7 ? '✅' :
                score >= 5 ? '⚠️' :
                score >= 3 ? '🚨' : '💀';
  return `${score}/10 ${emoji}`;
}

/**
 * Format score delta with arrow indicator
 */
export function formatScoreDelta(delta: number): string {
  if (delta > 0) return `+${delta} ↑`;
  if (delta < 0) return `${delta} ↓`;
  return '0 →';
}

// =============================================================================
// REPORT GENERATION UTILITIES
// =============================================================================

/**
 * Generate severity section header
 */
export function getSeverityHeader(severity: Severity): string {
  const config = SEVERITIES[severity];
  return `### ${config.emoji} ${config.label} (${config.description})`;
}

/**
 * Generate perspective section header
 */
export function getPerspectiveHeader(agent: SpecialistAgentId): string {
  const display = PERSPECTIVE_DISPLAY[agent];
  return `### ${display.emoji} ${display.label}`;
}

/**
 * Generate issue markdown row for table
 */
export function formatIssueRow(issue: RoastIssue, index: number): string {
  return `| ${index + 1} | ${issue.title} | ${issue.source.replace('roaster-', '')} | ${issue.impact} | ${issue.fix} |`;
}

/**
 * Generate issues table for a severity level
 */
export function generateIssuesTable(issues: RoastIssue[], severity: Severity): string {
  const filtered = issues.filter(i => i.severity === severity);
  if (filtered.length === 0) return '*None identified*\n';

  const header = '| # | Issue | Source | Impact | Fix |\n|---|-------|--------|--------|-----|';
  const rows = filtered.map((issue, i) => formatIssueRow(issue, i)).join('\n');

  return `${header}\n${rows}\n`;
}

/**
 * Calculate resolution rate percentage
 */
export function calculateResolutionRate(found: number, fixed: number): number {
  if (found === 0) return 100;
  return Math.round((fixed / found) * 100);
}

// =============================================================================
// TARGET TYPE UTILITIES
// =============================================================================

/**
 * Infer target type from user input
 */
export function inferTargetType(input: string): RoastTargetType {
  const lower = input.toLowerCase();

  if (lower.includes('flow') || lower.includes('journey') || lower.includes('process')) {
    return 'flow';
  }
  if (lower.includes('audit') || lower.includes('entire') || lower.includes('full')) {
    return 'audit';
  }
  if (lower.includes('component') || lower.includes('button') || lower.includes('card') || lower.includes('nav')) {
    return 'component';
  }

  return 'screen';
}

/**
 * Get target type description
 */
export function getTargetTypeDescription(type: RoastTargetType): string {
  const descriptions: Record<RoastTargetType, string> = {
    screen: 'Single screen analysis',
    component: 'Specific UI component',
    flow: 'Multi-screen user flow',
    audit: 'Full application audit',
  };
  return descriptions[type];
}

// =============================================================================
// DATETIME UTILITIES
// =============================================================================

/**
 * Format date for report headers
 */
export function formatReportDate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/**
 * Calculate session duration
 */
export function calculateDuration(startedAt: Date, endedAt: Date = new Date()): string {
  const ms = endedAt.getTime() - startedAt.getTime();
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validate roast session configuration
 * @throws {ValidationError} if validation fails
 */
export function validateSessionConfig(config: Partial<RoastSession['config']>): string[] {
  const errors: string[] = [];

  if (!config.target || config.target.trim().length === 0) {
    errors.push('Target is required');
  }

  if (config.iterations !== undefined && (config.iterations < 1 || config.iterations > 10)) {
    errors.push('Iterations must be between 1 and 10');
  }

  return errors;
}

/**
 * Validate roast session configuration and throw on error
 * @throws {ValidationError} if validation fails
 */
export function validateSessionConfigStrict(config: Partial<RoastSession['config']>): void {
  const errors = validateSessionConfig(config);
  if (errors.length > 0) {
    throw ValidationError.fromErrors(errors);
  }
}

/**
 * Check if a score is passing (>= 7)
 */
export function isPassingScore(score: number): boolean {
  return score >= 7;
}

/**
 * Check if accessibility audit passes minimum requirements
 */
export function passesA11yMinimum(wcagLevel: string): boolean {
  return wcagLevel === 'AA' || wcagLevel === 'AAA';
}

// =============================================================================
// SCORING NORMALIZATION
// =============================================================================

/**
 * Convert WCAG compliance level to 1-10 score for consistency
 * This enables unified scoring across all perspectives
 */
export function wcagLevelToScore(level: string): number {
  const normalizedLevel = level.toUpperCase().trim();

  switch (normalizedLevel) {
    case 'AAA':
      return 10;
    case 'AA':
      return 8;
    case 'A':
      return 5;
    case 'FAIL':
    default:
      return 2;
  }
}

/**
 * Convert 1-10 score to approximate WCAG level
 */
export function scoreToWcagLevel(score: number): string {
  if (score >= 9) return 'AAA';
  if (score >= 7) return 'AA';
  if (score >= 4) return 'A';
  return 'Fail';
}

/**
 * Normalize any score to 1-10 scale
 * Handles various input formats
 */
export function normalizeScore(value: number | string, maxValue = 10): number {
  let numValue: number;

  if (typeof value === 'string') {
    // Handle "X/10" format
    const match = value.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+)$/);
    if (match) {
      numValue = parseFloat(match[1]);
      maxValue = parseFloat(match[2]);
    } else {
      numValue = parseFloat(value);
    }
  } else {
    numValue = value;
  }

  if (isNaN(numValue)) return 5; // Default to middle

  // Normalize to 1-10 scale
  if (maxValue !== 10) {
    numValue = (numValue / maxValue) * 10;
  }

  // Clamp to valid range
  return Math.max(1, Math.min(10, Math.round(numValue * 10) / 10));
}

/**
 * Create a unified score object from various perspective scores
 */
export function createUnifiedScores(scores: {
  visual?: number | string;
  usability?: number | string;
  accessibility?: number | string;
  implementation?: number | string;
  conversion?: number | string;
}): Record<string, number> {
  return {
    visual: normalizeScore(scores.visual ?? 5),
    usability: normalizeScore(scores.usability ?? 5),
    accessibility: normalizeScore(scores.accessibility ?? 5),
    implementation: normalizeScore(scores.implementation ?? 5),
    conversion: normalizeScore(scores.conversion ?? 5),
  };
}

// =============================================================================
// ERROR HANDLING WRAPPERS
// =============================================================================

/**
 * Safe wrapper for sanitizeTopic that handles invalid input
 * @throws {ConfigurationError} if topic is invalid
 */
export function sanitizeTopicSafe(topic: string): string {
  if (!topic || typeof topic !== 'string') {
    throw ConfigurationError.invalidValue('topic', topic, 'non-empty string');
  }

  const sanitized = sanitizeTopic(topic);

  if (sanitized.length === 0) {
    throw ConfigurationError.invalidValue('topic', topic, 'string with valid characters');
  }

  return sanitized;
}

/**
 * Safe wrapper for parseIterationCount with validation
 * @throws {ConfigurationError} if iteration count is invalid
 */
export function parseIterationCountSafe(input: string | number | undefined, defaultValue = 3): number {
  const parsed = parseIterationCount(input, defaultValue);

  if (parsed < 1 || parsed > 10) {
    throw ConfigurationError.invalidValue('iterations', input, 'number between 1 and 10');
  }

  return parsed;
}

/**
 * Validate and format a score value
 * @throws {ConfigurationError} if score is invalid
 */
export function validateScore(score: number, context: string): number {
  if (typeof score !== 'number' || isNaN(score)) {
    throw ConfigurationError.invalidValue(context, score, 'valid number');
  }

  if (score < 1 || score > 10) {
    throw ConfigurationError.invalidValue(context, score, 'number between 1 and 10');
  }

  return Math.round(score * 10) / 10;
}

/**
 * Validate severity level
 * @throws {ConfigurationError} if severity is invalid
 */
export function validateSeverity(severity: string): Severity {
  const validSeverities: Severity[] = ['critical', 'major', 'minor'];

  if (!validSeverities.includes(severity as Severity)) {
    throw ConfigurationError.invalidValue(
      'severity',
      severity,
      `one of: ${validSeverities.join(', ')}`
    );
  }

  return severity as Severity;
}

/**
 * Validate target type
 * @throws {ConfigurationError} if target type is invalid
 */
export function validateTargetType(type: string): RoastTargetType {
  const validTypes: RoastTargetType[] = ['screen', 'component', 'flow', 'audit'];

  if (!validTypes.includes(type as RoastTargetType)) {
    throw ConfigurationError.invalidValue(
      'targetType',
      type,
      `one of: ${validTypes.join(', ')}`
    );
  }

  return type as RoastTargetType;
}

/**
 * Validate file path format
 * @throws {ConfigurationError} if path is invalid
 */
export function validateFilePath(path: string, context: string): string {
  if (!path || typeof path !== 'string') {
    throw ConfigurationError.invalidValue(context, path, 'non-empty string');
  }

  if (path.trim().length === 0) {
    throw ConfigurationError.invalidValue(context, path, 'non-empty path');
  }

  // Check for invalid characters
  const invalidChars = /[<>"|?*\x00-\x1F]/;
  if (invalidChars.test(path)) {
    throw ConfigurationError.invalidValue(
      context,
      path,
      'path without invalid characters (<>"|?*)'
    );
  }

  return path;
}

/**
 * Try to execute a function and wrap any errors
 */
export function tryExecute<T>(
  fn: () => T,
  context: string,
  recoverable = false
): T {
  try {
    return fn();
  } catch (error) {
    if (error instanceof ConfigurationError || error instanceof ValidationError) {
      throw error;
    }

    const cause = error instanceof Error ? error : undefined;
    const message = error instanceof Error ? error.message : String(error);

    throw new ConfigurationError(
      `${context}: ${message}`,
      {
        details: { context },
        recoverable,
        cause,
      }
    );
  }
}

/**
 * Try to execute an async function and wrap any errors
 */
export async function tryExecuteAsync<T>(
  fn: () => Promise<T>,
  context: string,
  recoverable = false
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ConfigurationError || error instanceof ValidationError) {
      throw error;
    }

    const cause = error instanceof Error ? error : undefined;
    const message = error instanceof Error ? error.message : String(error);

    throw new ConfigurationError(
      `${context}: ${message}`,
      {
        details: { context },
        recoverable,
        cause,
      }
    );
  }
}
