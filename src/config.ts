/**
 * Claude Roaster - Configuration Management
 * Load, save, and manage user preferences
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { homedir } from 'os';
import type { PluginConfig, FixMode, FocusArea } from './types.js';
import { DEFAULT_CONFIG } from './constants.js';

// =============================================================================
// CONFIGURATION FILE PATHS
// =============================================================================

/**
 * Configuration filename
 */
export const CONFIG_FILENAME = '.claude-roaster.config.json';

/**
 * Get the project-level config path
 */
export function getProjectConfigPath(projectRoot: string = process.cwd()): string {
  return join(projectRoot, CONFIG_FILENAME);
}

/**
 * Get the user-level config path (in home directory)
 */
export function getUserConfigPath(): string {
  return join(homedir(), '.config', 'claude-roaster', 'config.json');
}

/**
 * Find the config file, checking project first, then user home
 * Returns null if no config file exists
 */
export function findConfigPath(projectRoot: string = process.cwd()): string | null {
  const projectPath = getProjectConfigPath(projectRoot);
  if (existsSync(projectPath)) {
    return projectPath;
  }

  const userPath = getUserConfigPath();
  if (existsSync(userPath)) {
    return userPath;
  }

  return null;
}

// =============================================================================
// CONFIGURATION LOADING
// =============================================================================

/**
 * Load configuration from file
 * Merges with defaults for any missing values
 */
export function loadConfig(projectRoot: string = process.cwd()): PluginConfig {
  const configPath = findConfigPath(projectRoot);

  if (!configPath) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const fileContent = readFileSync(configPath, 'utf-8');
    const userConfig = JSON.parse(fileContent) as Partial<PluginConfig>;
    return mergeConfig(userConfig);
  } catch (error) {
    console.warn(`Warning: Could not parse config file at ${configPath}. Using defaults.`);
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Merge partial user config with defaults
 */
export function mergeConfig(userConfig: Partial<PluginConfig>): PluginConfig {
  return {
    defaultIterations: userConfig.defaultIterations ?? DEFAULT_CONFIG.defaultIterations,
    defaultFixMode: userConfig.defaultFixMode ?? DEFAULT_CONFIG.defaultFixMode,
    reportOutputDir: userConfig.reportOutputDir ?? DEFAULT_CONFIG.reportOutputDir,
    screenshotOutputDir: userConfig.screenshotOutputDir ?? DEFAULT_CONFIG.screenshotOutputDir,
    verboseReports: userConfig.verboseReports ?? DEFAULT_CONFIG.verboseReports,
    includeCompetitorAnalysis: userConfig.includeCompetitorAnalysis ?? DEFAULT_CONFIG.includeCompetitorAnalysis,
  };
}

// =============================================================================
// CONFIGURATION SAVING
// =============================================================================

/**
 * Save configuration to file
 * @param config - Configuration to save
 * @param location - 'project' or 'user' level
 * @param projectRoot - Project root directory (for project-level config)
 */
export function saveConfig(
  config: PluginConfig,
  location: 'project' | 'user' = 'project',
  projectRoot: string = process.cwd()
): string {
  const configPath = location === 'project'
    ? getProjectConfigPath(projectRoot)
    : getUserConfigPath();

  // Ensure directory exists
  const dir = dirname(configPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const content = JSON.stringify(config, null, 2);
  writeFileSync(configPath, content, 'utf-8');

  return configPath;
}

/**
 * Initialize a new configuration file with defaults
 */
export function initConfig(
  location: 'project' | 'user' = 'project',
  projectRoot: string = process.cwd()
): string {
  return saveConfig(DEFAULT_CONFIG, location, projectRoot);
}

// =============================================================================
// CONFIGURATION UPDATES
// =============================================================================

/**
 * Update specific config values
 */
export function updateConfig(
  updates: Partial<PluginConfig>,
  projectRoot: string = process.cwd()
): PluginConfig {
  const current = loadConfig(projectRoot);
  const updated = mergeConfig({ ...current, ...updates });

  // Save to the same location it was loaded from, or project if new
  const existingPath = findConfigPath(projectRoot);
  const location = existingPath?.includes(homedir()) ? 'user' : 'project';

  saveConfig(updated, location, projectRoot);
  return updated;
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(
  location: 'project' | 'user' = 'project',
  projectRoot: string = process.cwd()
): PluginConfig {
  saveConfig(DEFAULT_CONFIG, location, projectRoot);
  return { ...DEFAULT_CONFIG };
}

// =============================================================================
// CONFIGURATION VALIDATION
// =============================================================================

/**
 * Validate a configuration object
 * Returns array of error messages (empty if valid)
 */
export function validateConfig(config: Partial<PluginConfig>): string[] {
  const errors: string[] = [];

  if (config.defaultIterations !== undefined) {
    if (typeof config.defaultIterations !== 'number' ||
        config.defaultIterations < 1 ||
        config.defaultIterations > 10) {
      errors.push('defaultIterations must be a number between 1 and 10');
    }
  }

  if (config.defaultFixMode !== undefined) {
    const validModes: FixMode[] = ['auto-implement', 'report-only', 'cherry-pick', 'skip'];
    if (!validModes.includes(config.defaultFixMode)) {
      errors.push(`defaultFixMode must be one of: ${validModes.join(', ')}`);
    }
  }

  if (config.reportOutputDir !== undefined) {
    if (typeof config.reportOutputDir !== 'string' || config.reportOutputDir.length === 0) {
      errors.push('reportOutputDir must be a non-empty string');
    }
  }

  if (config.screenshotOutputDir !== undefined) {
    if (typeof config.screenshotOutputDir !== 'string' || config.screenshotOutputDir.length === 0) {
      errors.push('screenshotOutputDir must be a non-empty string');
    }
  }

  return errors;
}

// =============================================================================
// CONFIGURATION DISPLAY
// =============================================================================

/**
 * Format configuration for display
 */
export function formatConfigDisplay(config: PluginConfig): string {
  return `
Claude Roaster Configuration
═════════════════════════════

  Iterations:          ${config.defaultIterations} (default)
  Fix Mode:            ${config.defaultFixMode}
  Report Output:       ${config.reportOutputDir}
  Screenshot Output:   ${config.screenshotOutputDir}
  Verbose Reports:     ${config.verboseReports ? 'Yes' : 'No'}
  Competitor Analysis: ${config.includeCompetitorAnalysis ? 'Yes' : 'No'}
`.trim();
}

/**
 * Generate example config file content with comments
 */
export function generateConfigTemplate(): string {
  return `{
  // Number of roast iterations (1-10, default: 3)
  "defaultIterations": 3,

  // Fix mode: "auto-implement" | "report-only" | "cherry-pick" | "skip"
  "defaultFixMode": "cherry-pick",

  // Where to save roast reports
  "reportOutputDir": "reports/roast",

  // Where to save screenshots
  "screenshotOutputDir": "reports/roast/screenshots",

  // Include full perspective breakdowns in reports
  "verboseReports": true,

  // Include competitor comparison section
  "includeCompetitorAnalysis": false
}`;
}
