/**
 * Comprehensive tests for configuration management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  CONFIG_FILENAME,
  getProjectConfigPath,
  getUserConfigPath,
  findConfigPath,
  loadConfig,
  mergeConfig,
  saveConfig,
  initConfig,
  updateConfig,
  resetConfig,
  validateConfig,
  formatConfigDisplay,
  generateConfigTemplate,
} from '../config.js';
import { DEFAULT_CONFIG } from '../constants.js';
import type { PluginConfig } from '../types.js';

// =============================================================================
// TEST HELPERS
// =============================================================================

let testDir: string;
let originalCwd: string;

beforeEach(() => {
  // Create temporary test directory
  testDir = join(tmpdir(), `claude-roaster-test-${Date.now()}`);
  mkdirSync(testDir, { recursive: true });

  // Save original cwd and change to test directory
  originalCwd = process.cwd();
  process.chdir(testDir);
});

afterEach(() => {
  // Restore original cwd
  process.chdir(originalCwd);

  // Cleanup test directory
  if (existsSync(testDir)) {
    rmSync(testDir, { recursive: true, force: true });
  }
});

const createTestConfig = (overrides: Partial<PluginConfig> = {}): PluginConfig => ({
  ...DEFAULT_CONFIG,
  ...overrides,
});

const writeConfigFile = (path: string, config: PluginConfig) => {
  const dir = path.substring(0, path.lastIndexOf('/'));
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(path, JSON.stringify(config, null, 2), 'utf-8');
};

// =============================================================================
// PATH UTILITIES TESTS
// =============================================================================

describe('getProjectConfigPath', () => {
  it('returns config path in project root', () => {
    const path = getProjectConfigPath('/project/root');
    expect(path).toBe(`/project/root/${CONFIG_FILENAME}`);
  });

  it('uses current directory when not specified', () => {
    const path = getProjectConfigPath();
    expect(path).toBe(join(process.cwd(), CONFIG_FILENAME));
  });
});

describe('getUserConfigPath', () => {
  it('returns config path in user home directory', () => {
    const path = getUserConfigPath();
    expect(path).toContain('.config');
    expect(path).toContain('claude-roaster');
    expect(path).toContain('config.json');
  });
});

describe('findConfigPath', () => {
  it('finds project-level config first', () => {
    const projectConfig = createTestConfig();
    const projectPath = getProjectConfigPath(testDir);
    writeConfigFile(projectPath, projectConfig);

    const found = findConfigPath(testDir);
    expect(found).toBe(projectPath);
  });

  it('returns null when no config exists', () => {
    const found = findConfigPath(testDir);
    expect(found).toBeNull();
  });

  it('prefers project config over user config', () => {
    const projectPath = getProjectConfigPath(testDir);
    const userPath = getUserConfigPath();

    writeConfigFile(projectPath, createTestConfig({ defaultIterations: 5 }));
    writeConfigFile(userPath, createTestConfig({ defaultIterations: 3 }));

    const found = findConfigPath(testDir);
    expect(found).toBe(projectPath);

    // Cleanup user config
    if (existsSync(userPath)) {
      rmSync(userPath, { force: true });
    }
  });
});

// =============================================================================
// CONFIGURATION LOADING TESTS
// =============================================================================

describe('loadConfig', () => {
  it('loads config from file', () => {
    const testConfig = createTestConfig({ defaultIterations: 5, verboseReports: false });
    const configPath = getProjectConfigPath(testDir);
    writeConfigFile(configPath, testConfig);

    const loaded = loadConfig(testDir);
    expect(loaded.defaultIterations).toBe(5);
    expect(loaded.verboseReports).toBe(false);
  });

  it('returns defaults when no config exists', () => {
    const loaded = loadConfig(testDir);
    expect(loaded).toEqual(DEFAULT_CONFIG);
  });

  it('handles malformed JSON gracefully', () => {
    const configPath = getProjectConfigPath(testDir);
    mkdirSync(testDir, { recursive: true });
    writeFileSync(configPath, '{ invalid json }', 'utf-8');

    const loaded = loadConfig(testDir);
    expect(loaded).toEqual(DEFAULT_CONFIG);
  });

  it('merges partial config with defaults', () => {
    const partialConfig = { defaultIterations: 7 };
    const configPath = getProjectConfigPath(testDir);
    writeConfigFile(configPath, partialConfig as PluginConfig);

    const loaded = loadConfig(testDir);
    expect(loaded.defaultIterations).toBe(7);
    expect(loaded.defaultFixMode).toBe(DEFAULT_CONFIG.defaultFixMode);
    expect(loaded.reportOutputDir).toBe(DEFAULT_CONFIG.reportOutputDir);
  });
});

describe('mergeConfig', () => {
  it('merges user config with defaults', () => {
    const userConfig = {
      defaultIterations: 5,
      verboseReports: false,
    };

    const merged = mergeConfig(userConfig);
    expect(merged.defaultIterations).toBe(5);
    expect(merged.verboseReports).toBe(false);
    expect(merged.defaultFixMode).toBe(DEFAULT_CONFIG.defaultFixMode);
    expect(merged.reportOutputDir).toBe(DEFAULT_CONFIG.reportOutputDir);
  });

  it('uses defaults for all missing values', () => {
    const merged = mergeConfig({});
    expect(merged).toEqual(DEFAULT_CONFIG);
  });

  it('preserves all user-provided values', () => {
    const userConfig: PluginConfig = {
      defaultIterations: 7,
      defaultFixMode: 'auto-implement',
      reportOutputDir: 'custom/reports',
      screenshotOutputDir: 'custom/screenshots',
      verboseReports: false,
      includeCompetitorAnalysis: true,
    };

    const merged = mergeConfig(userConfig);
    expect(merged).toEqual(userConfig);
  });
});

// =============================================================================
// CONFIGURATION SAVING TESTS
// =============================================================================

describe('saveConfig', () => {
  it('saves config to project location', () => {
    const config = createTestConfig({ defaultIterations: 8 });
    const savedPath = saveConfig(config, 'project', testDir);

    expect(existsSync(savedPath)).toBe(true);
    const loaded = JSON.parse(readFileSync(savedPath, 'utf-8'));
    expect(loaded.defaultIterations).toBe(8);
  });

  it('creates directory if not exists', () => {
    const config = createTestConfig();
    const subDir = join(testDir, 'nested', 'path');

    saveConfig(config, 'project', subDir);
    const configPath = getProjectConfigPath(subDir);
    expect(existsSync(configPath)).toBe(true);
  });

  it('formats JSON with indentation', () => {
    const config = createTestConfig();
    const savedPath = saveConfig(config, 'project', testDir);

    const content = readFileSync(savedPath, 'utf-8');
    expect(content).toContain('\n');
    expect(content).toContain('  '); // 2-space indentation
  });

  it('returns saved file path', () => {
    const config = createTestConfig();
    const savedPath = saveConfig(config, 'project', testDir);
    expect(savedPath).toBe(getProjectConfigPath(testDir));
  });
});

describe('initConfig', () => {
  it('creates config with defaults', () => {
    const configPath = initConfig('project', testDir);

    expect(existsSync(configPath)).toBe(true);
    const loaded = JSON.parse(readFileSync(configPath, 'utf-8'));
    expect(loaded).toEqual(DEFAULT_CONFIG);
  });

  it('returns created file path', () => {
    const configPath = initConfig('project', testDir);
    expect(configPath).toBe(getProjectConfigPath(testDir));
  });
});

// =============================================================================
// CONFIGURATION UPDATE TESTS
// =============================================================================

describe('updateConfig', () => {
  it('updates existing config values', () => {
    const initial = createTestConfig({ defaultIterations: 3 });
    const configPath = getProjectConfigPath(testDir);
    writeConfigFile(configPath, initial);

    const updated = updateConfig({ defaultIterations: 7 }, testDir);
    expect(updated.defaultIterations).toBe(7);

    const reloaded = loadConfig(testDir);
    expect(reloaded.defaultIterations).toBe(7);
  });

  it('preserves unchanged values', () => {
    const initial = createTestConfig({
      defaultIterations: 3,
      verboseReports: false,
      defaultFixMode: 'report-only',
    });
    const configPath = getProjectConfigPath(testDir);
    writeConfigFile(configPath, initial);

    const updated = updateConfig({ defaultIterations: 5 }, testDir);
    expect(updated.defaultIterations).toBe(5);
    expect(updated.verboseReports).toBe(false);
    expect(updated.defaultFixMode).toBe('report-only');
  });

  it('creates config if none exists', () => {
    const updated = updateConfig({ defaultIterations: 6 }, testDir);
    expect(updated.defaultIterations).toBe(6);

    const configPath = getProjectConfigPath(testDir);
    expect(existsSync(configPath)).toBe(true);
  });
});

describe('resetConfig', () => {
  it('resets config to defaults', () => {
    const custom = createTestConfig({ defaultIterations: 8, verboseReports: false });
    const configPath = getProjectConfigPath(testDir);
    writeConfigFile(configPath, custom);

    const reset = resetConfig('project', testDir);
    expect(reset).toEqual(DEFAULT_CONFIG);

    const reloaded = loadConfig(testDir);
    expect(reloaded).toEqual(DEFAULT_CONFIG);
  });

  it('overwrites existing config', () => {
    const custom = createTestConfig({ defaultIterations: 10 });
    const configPath = getProjectConfigPath(testDir);
    writeConfigFile(configPath, custom);

    resetConfig('project', testDir);

    const loaded = JSON.parse(readFileSync(configPath, 'utf-8'));
    expect(loaded.defaultIterations).toBe(DEFAULT_CONFIG.defaultIterations);
  });
});

// =============================================================================
// CONFIGURATION VALIDATION TESTS
// =============================================================================

describe('validateConfig', () => {
  it('validates defaultIterations range', () => {
    expect(validateConfig({ defaultIterations: 0 })).toContain('defaultIterations must be a number between 1 and 10');
    expect(validateConfig({ defaultIterations: 11 })).toContain('defaultIterations must be a number between 1 and 10');
    expect(validateConfig({ defaultIterations: -1 })).toContain('defaultIterations must be a number between 1 and 10');
  });

  it('validates defaultIterations type', () => {
    expect(validateConfig({ defaultIterations: 'invalid' as any })).toContain('defaultIterations must be a number between 1 and 10');
  });

  it('validates defaultFixMode values', () => {
    expect(validateConfig({ defaultFixMode: 'invalid' as any })).toHaveLength(1);
    expect(validateConfig({ defaultFixMode: 'invalid' as any })[0]).toContain('defaultFixMode must be one of');
  });

  it('accepts valid defaultFixMode values', () => {
    expect(validateConfig({ defaultFixMode: 'auto-implement' })).toHaveLength(0);
    expect(validateConfig({ defaultFixMode: 'report-only' })).toHaveLength(0);
    expect(validateConfig({ defaultFixMode: 'cherry-pick' })).toHaveLength(0);
    expect(validateConfig({ defaultFixMode: 'skip' })).toHaveLength(0);
  });

  it('validates reportOutputDir is non-empty string', () => {
    expect(validateConfig({ reportOutputDir: '' })).toContain('reportOutputDir must be a non-empty string');
    expect(validateConfig({ reportOutputDir: 123 as any })).toContain('reportOutputDir must be a non-empty string');
  });

  it('validates screenshotOutputDir is non-empty string', () => {
    expect(validateConfig({ screenshotOutputDir: '' })).toContain('screenshotOutputDir must be a non-empty string');
  });

  it('returns empty array for valid config', () => {
    const validConfig: PluginConfig = {
      defaultIterations: 5,
      defaultFixMode: 'cherry-pick',
      reportOutputDir: 'reports',
      screenshotOutputDir: 'screenshots',
      verboseReports: true,
      includeCompetitorAnalysis: false,
    };

    expect(validateConfig(validConfig)).toHaveLength(0);
  });

  it('accumulates multiple errors', () => {
    const invalid = {
      defaultIterations: 15,
      defaultFixMode: 'invalid' as any,
      reportOutputDir: '',
    };

    const errors = validateConfig(invalid);
    expect(errors.length).toBeGreaterThan(1);
  });

  it('allows partial config validation', () => {
    expect(validateConfig({ defaultIterations: 5 })).toHaveLength(0);
    expect(validateConfig({ verboseReports: false })).toHaveLength(0);
  });
});

// =============================================================================
// CONFIGURATION DISPLAY TESTS
// =============================================================================

describe('formatConfigDisplay', () => {
  it('formats config for display', () => {
    const config = createTestConfig({
      defaultIterations: 5,
      defaultFixMode: 'auto-implement',
      verboseReports: false,
      includeCompetitorAnalysis: true,
    });

    const display = formatConfigDisplay(config);
    expect(display).toContain('Claude Roaster Configuration');
    expect(display).toContain('Iterations:          5');
    expect(display).toContain('Fix Mode:            auto-implement');
    expect(display).toContain('Verbose Reports:     No');
    expect(display).toContain('Competitor Analysis: Yes');
  });

  it('formats boolean values correctly', () => {
    const config = createTestConfig({ verboseReports: true });
    const display = formatConfigDisplay(config);
    expect(display).toContain('Verbose Reports:     Yes');
  });

  it('includes all config fields', () => {
    const config = DEFAULT_CONFIG;
    const display = formatConfigDisplay(config);

    expect(display).toContain('Iterations:');
    expect(display).toContain('Fix Mode:');
    expect(display).toContain('Report Output:');
    expect(display).toContain('Screenshot Output:');
    expect(display).toContain('Verbose Reports:');
    expect(display).toContain('Competitor Analysis:');
  });
});

describe('generateConfigTemplate', () => {
  it('generates valid JSON template', () => {
    const template = generateConfigTemplate();
    expect(template).toContain('{');
    expect(template).toContain('}');
    expect(template).toContain('defaultIterations');
    expect(template).toContain('defaultFixMode');
  });

  it('includes comments', () => {
    const template = generateConfigTemplate();
    expect(template).toContain('//');
  });

  it('shows example values', () => {
    const template = generateConfigTemplate();
    expect(template).toContain('"auto-implement"');
    expect(template).toContain('"report-only"');
    expect(template).toContain('"cherry-pick"');
    expect(template).toContain('"skip"');
  });

  it('includes all config fields', () => {
    const template = generateConfigTemplate();
    expect(template).toContain('defaultIterations');
    expect(template).toContain('defaultFixMode');
    expect(template).toContain('reportOutputDir');
    expect(template).toContain('screenshotOutputDir');
    expect(template).toContain('verboseReports');
    expect(template).toContain('includeCompetitorAnalysis');
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('config integration', () => {
  it('full lifecycle: init -> load -> update -> reset', () => {
    // Init
    const initPath = initConfig('project', testDir);
    expect(existsSync(initPath)).toBe(true);

    // Load
    const loaded = loadConfig(testDir);
    expect(loaded).toEqual(DEFAULT_CONFIG);

    // Update
    const updated = updateConfig({ defaultIterations: 7 }, testDir);
    expect(updated.defaultIterations).toBe(7);

    // Verify update persisted
    const reloaded = loadConfig(testDir);
    expect(reloaded.defaultIterations).toBe(7);

    // Reset
    const reset = resetConfig('project', testDir);
    expect(reset).toEqual(DEFAULT_CONFIG);

    // Verify reset persisted
    const final = loadConfig(testDir);
    expect(final).toEqual(DEFAULT_CONFIG);
  });

  it('handles concurrent updates correctly', () => {
    initConfig('project', testDir);

    updateConfig({ defaultIterations: 5 }, testDir);
    updateConfig({ verboseReports: false }, testDir);
    updateConfig({ defaultFixMode: 'auto-implement' }, testDir);

    const final = loadConfig(testDir);
    expect(final.defaultIterations).toBe(5);
    expect(final.verboseReports).toBe(false);
    expect(final.defaultFixMode).toBe('auto-implement');
  });

  it('validation catches invalid updates', () => {
    const errors = validateConfig({
      defaultIterations: 20,
      defaultFixMode: 'not-valid' as any,
    });

    expect(errors.length).toBeGreaterThan(0);
  });
});
