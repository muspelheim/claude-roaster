/**
 * Comprehensive tests for utility functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
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
  // DateTime utilities
  formatReportDate,
  calculateDuration,
  // Validation utilities
  validateSessionConfig,
  isPassingScore,
  passesA11yMinimum,
  // Scoring normalization
  wcagLevelToScore,
  scoreToWcagLevel,
  normalizeScore,
  createUnifiedScores,
} from '../utils.js';
import type { RoastIssue, IterationScores, SpecialistAgentId, Severity } from '../types.js';

// =============================================================================
// STRING UTILITIES TESTS
// =============================================================================

describe('sanitizeTopic', () => {
  it('converts to lowercase', () => {
    expect(sanitizeTopic('Login Screen')).toBe('login-screen');
  });

  it('replaces spaces with hyphens', () => {
    expect(sanitizeTopic('User Profile Page')).toBe('user-profile-page');
  });

  it('removes special characters', () => {
    expect(sanitizeTopic('Payment@#$%^&*Form')).toBe('paymentform');
  });

  it('handles unicode characters', () => {
    expect(sanitizeTopic('Café Menu')).toBe('caf-menu');
  });

  it('handles multiple consecutive spaces', () => {
    expect(sanitizeTopic('Login    Screen')).toBe('login-screen');
  });

  it('removes leading and trailing spaces', () => {
    expect(sanitizeTopic('  Login Screen  ')).toBe('login-screen');
  });

  it('removes leading and trailing hyphens', () => {
    expect(sanitizeTopic('---Login-Screen---')).toBe('login-screen');
  });

  it('handles empty string', () => {
    expect(sanitizeTopic('')).toBe('');
  });

  it('handles only special characters', () => {
    expect(sanitizeTopic('@#$%^&*')).toBe('');
  });

  it('preserves existing hyphens', () => {
    expect(sanitizeTopic('Login-Screen')).toBe('login-screen');
  });

  it('collapses multiple hyphens', () => {
    expect(sanitizeTopic('login---screen')).toBe('login-screen');
  });

  it('handles numbers', () => {
    expect(sanitizeTopic('Screen 123')).toBe('screen-123');
  });
});

describe('generateSessionId', () => {
  it('generates unique IDs', () => {
    const id1 = generateSessionId();
    const id2 = generateSessionId();
    expect(id1).not.toBe(id2);
  });

  it('follows format roast-{timestamp}-{random}', () => {
    const id = generateSessionId();
    expect(id).toMatch(/^roast-[a-z0-9]+-[a-z0-9]{6}$/);
  });

  it('starts with "roast-"', () => {
    const id = generateSessionId();
    expect(id.startsWith('roast-')).toBe(true);
  });

  it('contains timestamp portion', () => {
    const id = generateSessionId();
    const parts = id.split('-');
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe('roast');
  });
});

describe('parseIterationCount', () => {
  it('returns default when undefined', () => {
    expect(parseIterationCount(undefined, 3)).toBe(3);
  });

  it('parses string numbers', () => {
    expect(parseIterationCount('5', 3)).toBe(5);
  });

  it('accepts numeric input', () => {
    expect(parseIterationCount(7, 3)).toBe(7);
  });

  it('caps at 10', () => {
    expect(parseIterationCount(15, 3)).toBe(10);
    expect(parseIterationCount('20', 3)).toBe(10);
  });

  it('returns default for invalid input', () => {
    expect(parseIterationCount('abc', 3)).toBe(3);
    expect(parseIterationCount('', 3)).toBe(3);
  });

  it('returns default for negative numbers', () => {
    expect(parseIterationCount(-5, 3)).toBe(3);
  });

  it('returns default for zero', () => {
    expect(parseIterationCount(0, 3)).toBe(3);
  });

  it('accepts 1 as minimum', () => {
    expect(parseIterationCount(1, 3)).toBe(1);
  });

  it('uses default value 3 when not specified', () => {
    expect(parseIterationCount(undefined)).toBe(3);
  });
});

// =============================================================================
// FILE PATH UTILITIES TESTS
// =============================================================================

describe('getReportPath', () => {
  it('generates correct report path', () => {
    const path = getReportPath('Login Screen', 1);
    expect(path).toBe('reports/roast/roast_login-screen_1.md');
  });

  it('sanitizes topic', () => {
    const path = getReportPath('User@Profile', 2);
    expect(path).toBe('reports/roast/roast_userprofile_2.md');
  });

  it('accepts custom base directory', () => {
    const path = getReportPath('Login', 1, 'custom/dir');
    expect(path).toBe('custom/dir/roast_login_1.md');
  });
});

describe('getFinalReportPath', () => {
  it('generates final report path', () => {
    const path = getFinalReportPath('Login Screen');
    expect(path).toBe('reports/roast/roast_login-screen_final.md');
  });

  it('accepts custom base directory', () => {
    const path = getFinalReportPath('Login', 'custom/dir');
    expect(path).toBe('custom/dir/roast_login_final.md');
  });
});

describe('getScreenshotPath', () => {
  it('generates correct screenshot path', () => {
    const path = getScreenshotPath('Login Screen', 1);
    expect(path).toBe('reports/roast/screenshots/login-screen_1.png');
  });

  it('accepts custom base directory', () => {
    const path = getScreenshotPath('Login', 1, 'custom/screenshots');
    expect(path).toBe('custom/screenshots/login_1.png');
  });
});

describe('getFinalScreenshotPath', () => {
  it('generates final screenshot path', () => {
    const path = getFinalScreenshotPath('Login Screen');
    expect(path).toBe('reports/roast/screenshots/login-screen_final.png');
  });
});

// =============================================================================
// ISSUE UTILITIES TESTS
// =============================================================================

const createMockIssue = (
  severity: Severity,
  source: SpecialistAgentId,
  title: string
): RoastIssue => ({
  id: 'TEST-001',
  severity,
  title,
  impact: 'Test impact',
  fix: 'Test fix',
  source,
});

describe('sortIssuesBySeverity', () => {
  it('sorts critical issues first', () => {
    const issues: RoastIssue[] = [
      createMockIssue('minor', 'roaster-designer', 'Minor issue'),
      createMockIssue('critical', 'roaster-a11y', 'Critical issue'),
      createMockIssue('major', 'roaster-user', 'Major issue'),
    ];

    const sorted = sortIssuesBySeverity(issues);
    expect(sorted[0].severity).toBe('critical');
    expect(sorted[1].severity).toBe('major');
    expect(sorted[2].severity).toBe('minor');
  });

  it('does not mutate original array', () => {
    const issues: RoastIssue[] = [
      createMockIssue('minor', 'roaster-designer', 'Minor'),
      createMockIssue('critical', 'roaster-a11y', 'Critical'),
    ];

    const original = [...issues];
    sortIssuesBySeverity(issues);
    expect(issues).toEqual(original);
  });

  it('handles empty array', () => {
    expect(sortIssuesBySeverity([])).toEqual([]);
  });
});

describe('groupIssuesBySeverity', () => {
  it('groups issues by severity level', () => {
    const issues: RoastIssue[] = [
      createMockIssue('critical', 'roaster-a11y', 'Critical 1'),
      createMockIssue('major', 'roaster-user', 'Major 1'),
      createMockIssue('critical', 'roaster-designer', 'Critical 2'),
      createMockIssue('minor', 'roaster-marketing', 'Minor 1'),
    ];

    const grouped = groupIssuesBySeverity(issues);
    expect(grouped.critical).toHaveLength(2);
    expect(grouped.major).toHaveLength(1);
    expect(grouped.minor).toHaveLength(1);
  });

  it('handles empty severity groups', () => {
    const issues: RoastIssue[] = [
      createMockIssue('critical', 'roaster-a11y', 'Critical'),
    ];

    const grouped = groupIssuesBySeverity(issues);
    expect(grouped.critical).toHaveLength(1);
    expect(grouped.major).toHaveLength(0);
    expect(grouped.minor).toHaveLength(0);
  });
});

describe('groupIssuesBySource', () => {
  it('groups issues by source agent', () => {
    const issues: RoastIssue[] = [
      createMockIssue('critical', 'roaster-a11y', 'A11y 1'),
      createMockIssue('major', 'roaster-designer', 'Designer 1'),
      createMockIssue('critical', 'roaster-a11y', 'A11y 2'),
    ];

    const grouped = groupIssuesBySource(issues);
    expect(grouped['roaster-a11y']).toHaveLength(2);
    expect(grouped['roaster-designer']).toHaveLength(1);
  });
});

describe('countIssuesBySeverity', () => {
  it('counts issues correctly', () => {
    const issues: RoastIssue[] = [
      createMockIssue('critical', 'roaster-a11y', 'C1'),
      createMockIssue('critical', 'roaster-designer', 'C2'),
      createMockIssue('major', 'roaster-user', 'M1'),
      createMockIssue('minor', 'roaster-marketing', 'Min1'),
    ];

    const counts = countIssuesBySeverity(issues);
    expect(counts.critical).toBe(2);
    expect(counts.major).toBe(1);
    expect(counts.minor).toBe(1);
  });

  it('handles empty array', () => {
    const counts = countIssuesBySeverity([]);
    expect(counts.critical).toBe(0);
    expect(counts.major).toBe(0);
    expect(counts.minor).toBe(0);
  });
});

describe('generateIssueId', () => {
  it('generates ID with agent prefix', () => {
    const id = generateIssueId('roaster-designer', 0);
    expect(id).toBe('DES-001');
  });

  it('pads index to 3 digits', () => {
    expect(generateIssueId('roaster-a11y', 0)).toBe('A11-001');
    expect(generateIssueId('roaster-a11y', 9)).toBe('A11-010');
    expect(generateIssueId('roaster-a11y', 99)).toBe('A11-100');
  });

  it('uses first 3 chars after roaster-', () => {
    expect(generateIssueId('roaster-user', 0)).toBe('USE-001');
    expect(generateIssueId('roaster-marketing', 0)).toBe('MAR-001');
  });
});

// =============================================================================
// SCORE UTILITIES TESTS
// =============================================================================

describe('calculateOverallScore', () => {
  it('calculates weighted average correctly', () => {
    const scores = {
      visual: 8,
      usability: 7,
      accessibility: 9,
      implementation: 6,
      conversion: 5,
    };

    const overall = calculateOverallScore(scores);
    // 8*0.2 + 7*0.25 + 9*0.25 + 6*0.15 + 5*0.15 = 1.6 + 1.75 + 2.25 + 0.9 + 0.75 = 7.25
    expect(overall).toBe(7.3); // Rounded
  });

  it('rounds to 1 decimal place', () => {
    const scores = {
      visual: 8.5,
      usability: 7.3,
      accessibility: 9.2,
      implementation: 6.7,
      conversion: 5.8,
    };

    const overall = calculateOverallScore(scores);
    expect(overall.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(1);
  });

  it('handles perfect scores', () => {
    const scores = {
      visual: 10,
      usability: 10,
      accessibility: 10,
      implementation: 10,
      conversion: 10,
    };

    expect(calculateOverallScore(scores)).toBe(10);
  });

  it('handles minimum scores', () => {
    const scores = {
      visual: 1,
      usability: 1,
      accessibility: 1,
      implementation: 1,
      conversion: 1,
    };

    expect(calculateOverallScore(scores)).toBe(1);
  });
});

describe('calculateScoreDelta', () => {
  it('calculates positive deltas', () => {
    const before: IterationScores = {
      visual: 5,
      usability: 6,
      accessibility: 7,
      implementation: 5,
      conversion: 6,
      overall: 6,
    };

    const after: IterationScores = {
      visual: 7,
      usability: 8,
      accessibility: 9,
      implementation: 7,
      conversion: 8,
      overall: 8,
    };

    const delta = calculateScoreDelta(before, after);
    expect(delta.visual).toBe(2);
    expect(delta.usability).toBe(2);
    expect(delta.overall).toBe(2);
  });

  it('calculates negative deltas', () => {
    const before: IterationScores = {
      visual: 8,
      usability: 7,
      accessibility: 9,
      implementation: 6,
      conversion: 7,
      overall: 7.5,
    };

    const after: IterationScores = {
      visual: 6,
      usability: 5,
      accessibility: 7,
      implementation: 4,
      conversion: 5,
      overall: 5.5,
    };

    const delta = calculateScoreDelta(before, after);
    expect(delta.visual).toBe(-2);
    expect(delta.overall).toBe(-2);
  });

  it('rounds to 1 decimal place', () => {
    const before: IterationScores = {
      visual: 5.33,
      usability: 6.67,
      accessibility: 7.89,
      implementation: 5.12,
      conversion: 6.45,
      overall: 6.29,
    };

    const after: IterationScores = {
      visual: 7.11,
      usability: 8.22,
      accessibility: 9.78,
      implementation: 7.56,
      conversion: 8.91,
      overall: 8.32,
    };

    const delta = calculateScoreDelta(before, after);
    expect(delta.visual).toBe(1.8);
    expect(delta.overall).toBe(2);
  });
});

describe('formatScore', () => {
  it('shows star emoji for excellent scores', () => {
    expect(formatScore(9)).toBe('9/10 🌟');
    expect(formatScore(10)).toBe('10/10 🌟');
  });

  it('shows checkmark for good scores', () => {
    expect(formatScore(7)).toBe('7/10 ✅');
    expect(formatScore(8)).toBe('8/10 ✅');
  });

  it('shows warning for moderate scores', () => {
    expect(formatScore(5)).toBe('5/10 ⚠️');
    expect(formatScore(6)).toBe('6/10 ⚠️');
  });

  it('shows alert for poor scores', () => {
    expect(formatScore(3)).toBe('3/10 🚨');
    expect(formatScore(4)).toBe('4/10 🚨');
  });

  it('shows skull for critical scores', () => {
    expect(formatScore(1)).toBe('1/10 💀');
    expect(formatScore(2)).toBe('2/10 💀');
  });
});

describe('formatScoreDelta', () => {
  it('formats positive delta with up arrow', () => {
    expect(formatScoreDelta(2.5)).toBe('+2.5 ↑');
  });

  it('formats negative delta with down arrow', () => {
    expect(formatScoreDelta(-1.5)).toBe('-1.5 ↓');
  });

  it('formats zero delta with arrow', () => {
    expect(formatScoreDelta(0)).toBe('0 →');
  });
});

// =============================================================================
// REPORT GENERATION UTILITIES TESTS
// =============================================================================

describe('getSeverityHeader', () => {
  it('generates critical header', () => {
    const header = getSeverityHeader('critical');
    expect(header).toContain('🔴');
    expect(header).toContain('Critical');
  });

  it('generates major header', () => {
    const header = getSeverityHeader('major');
    expect(header).toContain('🟠');
    expect(header).toContain('Major');
  });

  it('generates minor header', () => {
    const header = getSeverityHeader('minor');
    expect(header).toContain('🟡');
    expect(header).toContain('Minor');
  });
});

describe('getPerspectiveHeader', () => {
  it('generates designer header', () => {
    const header = getPerspectiveHeader('roaster-designer');
    expect(header).toContain('🎨');
    expect(header).toContain('Designer Says');
  });

  it('generates accessibility header', () => {
    const header = getPerspectiveHeader('roaster-a11y');
    expect(header).toContain('♿');
    expect(header).toContain('Accessibility Expert Says');
  });
});

describe('formatIssueRow', () => {
  it('formats issue as table row', () => {
    const issue = createMockIssue('critical', 'roaster-a11y', 'Test Issue');
    const row = formatIssueRow(issue, 0);

    expect(row).toContain('| 1 |');
    expect(row).toContain('Test Issue');
    expect(row).toContain('a11y');
    expect(row).toContain('Test impact');
    expect(row).toContain('Test fix');
  });

  it('increments index correctly', () => {
    const issue = createMockIssue('critical', 'roaster-a11y', 'Test');
    expect(formatIssueRow(issue, 0)).toContain('| 1 |');
    expect(formatIssueRow(issue, 5)).toContain('| 6 |');
  });
});

describe('generateIssuesTable', () => {
  it('generates table for issues', () => {
    const issues: RoastIssue[] = [
      createMockIssue('critical', 'roaster-a11y', 'Issue 1'),
      createMockIssue('critical', 'roaster-designer', 'Issue 2'),
    ];

    const table = generateIssuesTable(issues, 'critical');
    expect(table).toContain('| # | Issue | Source | Impact | Fix |');
    expect(table).toContain('Issue 1');
    expect(table).toContain('Issue 2');
  });

  it('returns "None identified" for empty severity', () => {
    const issues: RoastIssue[] = [
      createMockIssue('critical', 'roaster-a11y', 'Critical'),
    ];

    const table = generateIssuesTable(issues, 'minor');
    expect(table).toBe('*None identified*\n');
  });
});

describe('calculateResolutionRate', () => {
  it('calculates percentage correctly', () => {
    expect(calculateResolutionRate(10, 8)).toBe(80);
    expect(calculateResolutionRate(5, 5)).toBe(100);
    expect(calculateResolutionRate(10, 3)).toBe(30);
  });

  it('returns 100% when no issues found', () => {
    expect(calculateResolutionRate(0, 0)).toBe(100);
  });

  it('rounds to nearest integer', () => {
    expect(calculateResolutionRate(3, 2)).toBe(67);
  });
});

// =============================================================================
// TARGET TYPE UTILITIES TESTS
// =============================================================================

describe('inferTargetType', () => {
  it('infers flow type', () => {
    expect(inferTargetType('User signup flow')).toBe('flow');
    expect(inferTargetType('Checkout journey')).toBe('flow');
    expect(inferTargetType('Onboarding process')).toBe('flow');
  });

  it('infers audit type', () => {
    expect(inferTargetType('Full app audit')).toBe('audit');
    expect(inferTargetType('Entire application')).toBe('audit');
  });

  it('infers component type', () => {
    expect(inferTargetType('Button component')).toBe('component');
    expect(inferTargetType('Navigation bar')).toBe('component');
    expect(inferTargetType('Card design')).toBe('component');
  });

  it('defaults to screen type', () => {
    expect(inferTargetType('Login page')).toBe('screen');
    expect(inferTargetType('Dashboard')).toBe('screen');
  });
});

describe('getTargetTypeDescription', () => {
  it('returns description for each type', () => {
    expect(getTargetTypeDescription('screen')).toBe('Single screen analysis');
    expect(getTargetTypeDescription('component')).toBe('Specific UI component');
    expect(getTargetTypeDescription('flow')).toBe('Multi-screen user flow');
    expect(getTargetTypeDescription('audit')).toBe('Full application audit');
  });
});

// =============================================================================
// DATETIME UTILITIES TESTS
// =============================================================================

describe('formatReportDate', () => {
  it('formats date as YYYY-MM-DD', () => {
    const date = new Date('2025-01-15T12:00:00Z');
    expect(formatReportDate(date)).toBe('2025-01-15');
  });

  it('uses current date when not provided', () => {
    const formatted = formatReportDate();
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('calculateDuration', () => {
  it('calculates duration in minutes and seconds', () => {
    const start = new Date('2025-01-15T12:00:00Z');
    const end = new Date('2025-01-15T12:03:45Z');
    expect(calculateDuration(start, end)).toBe('3m 45s');
  });

  it('handles zero seconds', () => {
    const start = new Date('2025-01-15T12:00:00Z');
    const end = new Date('2025-01-15T12:05:00Z');
    expect(calculateDuration(start, end)).toBe('5m 0s');
  });

  it('handles less than 1 minute', () => {
    const start = new Date('2025-01-15T12:00:00Z');
    const end = new Date('2025-01-15T12:00:30Z');
    expect(calculateDuration(start, end)).toBe('0m 30s');
  });
});

// =============================================================================
// VALIDATION UTILITIES TESTS
// =============================================================================

describe('validateSessionConfig', () => {
  it('validates target is required', () => {
    const errors = validateSessionConfig({ target: '' });
    expect(errors).toContain('Target is required');
  });

  it('validates iterations range', () => {
    expect(validateSessionConfig({ target: 'Login', iterations: 0 })).toContain('Iterations must be between 1 and 10');
    expect(validateSessionConfig({ target: 'Login', iterations: 11 })).toContain('Iterations must be between 1 and 10');
  });

  it('returns empty array for valid config', () => {
    const errors = validateSessionConfig({ target: 'Login', iterations: 5 });
    expect(errors).toHaveLength(0);
  });

  it('allows missing iterations', () => {
    const errors = validateSessionConfig({ target: 'Login' });
    expect(errors).toHaveLength(0);
  });
});

describe('isPassingScore', () => {
  it('returns true for scores >= 7', () => {
    expect(isPassingScore(7)).toBe(true);
    expect(isPassingScore(8)).toBe(true);
    expect(isPassingScore(10)).toBe(true);
  });

  it('returns false for scores < 7', () => {
    expect(isPassingScore(6.9)).toBe(false);
    expect(isPassingScore(5)).toBe(false);
    expect(isPassingScore(1)).toBe(false);
  });
});

describe('passesA11yMinimum', () => {
  it('passes for AA level', () => {
    expect(passesA11yMinimum('AA')).toBe(true);
  });

  it('passes for AAA level', () => {
    expect(passesA11yMinimum('AAA')).toBe(true);
  });

  it('fails for A level', () => {
    expect(passesA11yMinimum('A')).toBe(false);
  });

  it('fails for FAIL', () => {
    expect(passesA11yMinimum('FAIL')).toBe(false);
  });
});

// =============================================================================
// SCORING NORMALIZATION TESTS
// =============================================================================

describe('wcagLevelToScore', () => {
  it('converts AAA to 10', () => {
    expect(wcagLevelToScore('AAA')).toBe(10);
  });

  it('converts AA to 8', () => {
    expect(wcagLevelToScore('AA')).toBe(8);
  });

  it('converts A to 5', () => {
    expect(wcagLevelToScore('A')).toBe(5);
  });

  it('converts FAIL to 2', () => {
    expect(wcagLevelToScore('FAIL')).toBe(2);
  });

  it('handles case insensitivity', () => {
    expect(wcagLevelToScore('aaa')).toBe(10);
    expect(wcagLevelToScore('Aa')).toBe(8);
  });

  it('handles whitespace', () => {
    expect(wcagLevelToScore(' AA ')).toBe(8);
  });

  it('defaults unknown levels to 2', () => {
    expect(wcagLevelToScore('Unknown')).toBe(2);
  });
});

describe('scoreToWcagLevel', () => {
  it('converts high scores to AAA', () => {
    expect(scoreToWcagLevel(9)).toBe('AAA');
    expect(scoreToWcagLevel(10)).toBe('AAA');
  });

  it('converts good scores to AA', () => {
    expect(scoreToWcagLevel(7)).toBe('AA');
    expect(scoreToWcagLevel(8)).toBe('AA');
  });

  it('converts moderate scores to A', () => {
    expect(scoreToWcagLevel(4)).toBe('A');
    expect(scoreToWcagLevel(6)).toBe('A');
  });

  it('converts low scores to Fail', () => {
    expect(scoreToWcagLevel(1)).toBe('Fail');
    expect(scoreToWcagLevel(3)).toBe('Fail');
  });
});

describe('normalizeScore', () => {
  it('handles numeric scores', () => {
    expect(normalizeScore(7, 10)).toBe(7);
    expect(normalizeScore(5, 10)).toBe(5);
  });

  it('handles string scores', () => {
    expect(normalizeScore('8', 10)).toBe(8);
  });

  it('handles X/Y format', () => {
    expect(normalizeScore('8/10', 10)).toBe(8);
    expect(normalizeScore('4/5', 5)).toBe(8);
  });

  it('normalizes different scales to 1-10', () => {
    expect(normalizeScore(5, 5)).toBe(10);
    expect(normalizeScore(50, 100)).toBe(5);
  });

  it('clamps to valid range', () => {
    expect(normalizeScore(15, 10)).toBe(10);
    expect(normalizeScore(-5, 10)).toBe(1);
  });

  it('defaults to 5 for invalid input', () => {
    expect(normalizeScore('invalid', 10)).toBe(5);
    expect(normalizeScore('', 10)).toBe(5);
  });

  it('rounds to 1 decimal place', () => {
    expect(normalizeScore(7.456, 10)).toBe(7.5);
  });

  it('handles X / Y format with spaces', () => {
    expect(normalizeScore('8 / 10', 10)).toBe(8);
  });
});

describe('createUnifiedScores', () => {
  it('normalizes all scores', () => {
    const scores = createUnifiedScores({
      visual: 8,
      usability: '7',
      accessibility: '9/10',
      implementation: 6,
      conversion: 5,
    });

    expect(scores.visual).toBe(8);
    expect(scores.usability).toBe(7);
    expect(scores.accessibility).toBe(9);
    expect(scores.implementation).toBe(6);
    expect(scores.conversion).toBe(5);
  });

  it('defaults missing scores to 5', () => {
    const scores = createUnifiedScores({});
    expect(scores.visual).toBe(5);
    expect(scores.usability).toBe(5);
    expect(scores.accessibility).toBe(5);
    expect(scores.implementation).toBe(5);
    expect(scores.conversion).toBe(5);
  });

  it('handles mixed valid and missing scores', () => {
    const scores = createUnifiedScores({
      visual: 9,
      accessibility: '8/10',
    });

    expect(scores.visual).toBe(9);
    expect(scores.accessibility).toBe(8);
    expect(scores.usability).toBe(5);
    expect(scores.implementation).toBe(5);
    expect(scores.conversion).toBe(5);
  });
});
