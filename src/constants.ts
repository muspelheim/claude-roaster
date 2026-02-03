/**
 * Claude Roaster - Constants & Configuration
 * Centralized definitions for the plugin
 */

import type {
  AgentConfig,
  SeverityConfig,
  PluginMetadata,
  PluginConfig,
  PlatformConfig,
  RoasterAgentId,
  SpecialistAgentId,
} from './types.js';

// =============================================================================
// PLUGIN METADATA
// =============================================================================

export const PLUGIN_NAME = 'claude-roaster';
export const VERSION = '1.1.0';

export const PLUGIN_METADATA: PluginMetadata = {
  name: PLUGIN_NAME,
  version: VERSION,
  description: 'Brutal UI/UX roasting agent for Claude Code - multi-perspective design critique with no mercy',
  agents: [
    'roaster',
    'roaster-designer',
    'roaster-developer',
    'roaster-user',
    'roaster-a11y',
    'roaster-marketing',
    'roaster-performance',
    'roaster-copy',
    'roaster-privacy',
    'roaster-i18n',
  ],
  commands: ['roast'],
  skills: ['roast'],
};

// =============================================================================
// AGENT CONFIGURATIONS
// =============================================================================

export const AGENTS: Record<RoasterAgentId, AgentConfig> = {
  roaster: {
    id: 'roaster',
    name: 'The Roaster',
    description: 'Main orchestrator - coordinates all perspectives and synthesizes findings',
    model: 'opus',
    perspective: 'orchestration',
    focusAreas: ['coordination', 'synthesis', 'prioritization'],
    priority: 'critical',
  },
  'roaster-designer': {
    id: 'roaster-designer',
    name: 'Designer Roaster',
    description: 'Visual design expert - hierarchy, color theory, typography, spacing',
    model: 'sonnet',
    perspective: 'visual-design',
    focusAreas: ['hierarchy', 'color', 'typography', 'spacing', 'layout'],
    priority: 'high',
  },
  'roaster-developer': {
    id: 'roaster-developer',
    name: 'Developer Roaster',
    description: 'Implementation expert - component structure, state management, performance',
    model: 'sonnet',
    perspective: 'implementation',
    focusAreas: ['components', 'state', 'performance', 'platform-specifics'],
    priority: 'medium',
  },
  'roaster-user': {
    id: 'roaster-user',
    name: 'User Roaster',
    description: 'Usability expert - task completion, friction points, cognitive load',
    model: 'sonnet',
    perspective: 'usability',
    focusAreas: ['task-completion', 'friction', 'cognitive-load', 'expectations'],
    priority: 'high',
  },
  'roaster-a11y': {
    id: 'roaster-a11y',
    name: 'Accessibility Roaster',
    description: 'Accessibility expert - WCAG compliance, screen readers, motor impairments',
    model: 'sonnet',
    perspective: 'accessibility',
    focusAreas: ['wcag', 'contrast', 'screen-readers', 'keyboard-nav', 'touch-targets'],
    priority: 'critical',
  },
  'roaster-marketing': {
    id: 'roaster-marketing',
    name: 'Marketing Roaster',
    description: 'Conversion expert - CTAs, trust signals, brand consistency, persuasion',
    model: 'sonnet',
    perspective: 'conversion',
    focusAreas: ['ctas', 'trust-signals', 'brand', 'persuasion', 'copy'],
    priority: 'medium',
  },
  'roaster-performance': {
    id: 'roaster-performance',
    name: 'Performance Roaster',
    description: 'Performance expert - load times, bundle size, render performance, memory usage',
    model: 'sonnet',
    perspective: 'performance',
    focusAreas: ['load-time', 'bundle-size', 'render-performance', 'memory', 'core-web-vitals'],
    priority: 'high',
  },
  'roaster-copy': {
    id: 'roaster-copy',
    name: 'Copy Roaster',
    description: 'Copy/Content expert - microcopy, UX writing, tone consistency, clarity',
    model: 'sonnet',
    perspective: 'content',
    focusAreas: ['microcopy', 'clarity', 'tone', 'readability', 'error-messages'],
    priority: 'medium',
  },
  'roaster-privacy': {
    id: 'roaster-privacy',
    name: 'Privacy Roaster',
    description: 'Privacy expert - data collection, consent patterns, GDPR/CCPA compliance',
    model: 'sonnet',
    perspective: 'privacy',
    focusAreas: ['consent', 'data-collection', 'gdpr', 'ccpa', 'dark-patterns'],
    priority: 'high',
  },
  'roaster-i18n': {
    id: 'roaster-i18n',
    name: 'i18n Roaster',
    description: 'Internationalization expert - localization readiness, RTL support, cultural considerations',
    model: 'sonnet',
    perspective: 'internationalization',
    focusAreas: ['localization', 'rtl', 'text-expansion', 'cultural', 'formatting'],
    priority: 'medium',
  },
};

/**
 * Specialist agents only (excludes main orchestrator)
 */
export const SPECIALIST_AGENTS: SpecialistAgentId[] = [
  'roaster-designer',
  'roaster-developer',
  'roaster-user',
  'roaster-a11y',
  'roaster-marketing',
  'roaster-performance',
  'roaster-copy',
  'roaster-privacy',
  'roaster-i18n',
];

// =============================================================================
// SEVERITY CONFIGURATIONS
// =============================================================================

export const SEVERITIES: Record<string, SeverityConfig> = {
  critical: {
    level: 'critical',
    emoji: '🔴',
    label: 'Critical',
    description: 'Fix NOW - blocks usability or accessibility',
    priority: 1,
  },
  major: {
    level: 'major',
    emoji: '🟠',
    label: 'Major',
    description: 'Fix Soon - significant impact on user experience',
    priority: 2,
  },
  minor: {
    level: 'minor',
    emoji: '🟡',
    label: 'Minor',
    description: 'Nice to Have - polish and refinement',
    priority: 3,
  },
};

// =============================================================================
// DEFAULT CONFIGURATIONS
// =============================================================================

export const DEFAULT_CONFIG: PluginConfig = {
  defaultIterations: 3,
  defaultFixMode: 'cherry-pick',
  reportOutputDir: 'reports/roast',
  screenshotOutputDir: 'reports/roast/screenshots',
  verboseReports: true,
  includeCompetitorAnalysis: false,
};

export const ITERATION_LIMITS = {
  min: 1,
  max: 10,
  default: 3,
  recommended: { min: 3, max: 5 },
};

// =============================================================================
// PLATFORM CONFIGURATIONS
// =============================================================================

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  ios: {
    platform: 'ios',
    screenshotMethod: 'xcode-mcp',
    touchTargetMinimum: { width: 44, height: 44 },
    safeAreaRequired: true,
    dynamicTypeSupport: true,
  },
  android: {
    platform: 'android',
    screenshotMethod: 'user-upload',
    touchTargetMinimum: { width: 48, height: 48 },
    safeAreaRequired: true,
    dynamicTypeSupport: true,
  },
  web: {
    platform: 'web',
    screenshotMethod: 'playwright-mcp',
    touchTargetMinimum: { width: 44, height: 44 },
    safeAreaRequired: false,
    dynamicTypeSupport: false,
  },
  macos: {
    platform: 'macos',
    screenshotMethod: 'xcode-mcp',
    touchTargetMinimum: { width: 24, height: 24 },
    safeAreaRequired: false,
    dynamicTypeSupport: true,
  },
};

// =============================================================================
// WCAG STANDARDS
// =============================================================================

export const WCAG = {
  contrastRatios: {
    normalText: { AA: 4.5, AAA: 7 },
    largeText: { AA: 3, AAA: 4.5 },
    nonText: { AA: 3 },
  },
  touchTargets: {
    ios: { width: 44, height: 44 },
    android: { width: 48, height: 48 },
    web: { width: 44, height: 44 },
  },
};

// =============================================================================
// FILE PATTERNS
// =============================================================================

export const FILE_PATTERNS = {
  report: (topic: string, iteration: number) => `roast_${topic}_${iteration}.md`,
  finalReport: (topic: string) => `roast_${topic}_final.md`,
  screenshot: (topic: string, iteration: number) => `${topic}_${iteration}.png`,
  finalScreenshot: (topic: string) => `${topic}_final.png`,
};

// =============================================================================
// PERSPECTIVE EMOJIS & LABELS
// =============================================================================

export const PERSPECTIVE_DISPLAY = {
  'roaster-designer': { emoji: '🎨', label: 'Designer Says' },
  'roaster-developer': { emoji: '💻', label: 'Developer Says' },
  'roaster-user': { emoji: '👤', label: 'User Says' },
  'roaster-a11y': { emoji: '♿', label: 'Accessibility Expert Says' },
  'roaster-marketing': { emoji: '📈', label: 'Marketing Says' },
  'roaster-performance': { emoji: '⚡', label: 'Performance Expert Says' },
  'roaster-copy': { emoji: '✍️', label: 'Copy Expert Says' },
  'roaster-privacy': { emoji: '🔒', label: 'Privacy Expert Says' },
  'roaster-i18n': { emoji: '🌍', label: 'i18n Expert Says' },
} as const;

// =============================================================================
// SCORE THRESHOLDS
// =============================================================================

export const SCORE_THRESHOLDS = {
  excellent: { min: 9, label: 'Excellent', emoji: '🌟' },
  good: { min: 7, label: 'Good', emoji: '✅' },
  needsWork: { min: 5, label: 'Needs Work', emoji: '⚠️' },
  poor: { min: 3, label: 'Poor', emoji: '🚨' },
  critical: { min: 0, label: 'Critical', emoji: '💀' },
};

/**
 * Get score category based on numeric score
 */
export function getScoreCategory(score: number): keyof typeof SCORE_THRESHOLDS {
  if (score >= SCORE_THRESHOLDS.excellent.min) return 'excellent';
  if (score >= SCORE_THRESHOLDS.good.min) return 'good';
  if (score >= SCORE_THRESHOLDS.needsWork.min) return 'needsWork';
  if (score >= SCORE_THRESHOLDS.poor.min) return 'poor';
  return 'critical';
}
