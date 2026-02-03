#!/usr/bin/env node
/**
 * Version Sync Script
 * Synchronizes version across package.json, plugin.json, and constants.ts
 *
 * Usage:
 *   node scripts/version-sync.js [patch|minor|major|<version>]
 *
 * Examples:
 *   node scripts/version-sync.js patch     # 1.0.0 -> 1.0.1
 *   node scripts/version-sync.js minor     # 1.0.0 -> 1.1.0
 *   node scripts/version-sync.js major     # 1.0.0 -> 2.0.0
 *   node scripts/version-sync.js 2.0.0     # Set specific version
 *   node scripts/version-sync.js           # Sync current version to all files
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const FILES = {
  package: join(ROOT, 'package.json'),
  plugin: join(ROOT, '.claude-plugin', 'plugin.json'),
  constants: join(ROOT, 'src', 'constants.ts'),
};

/**
 * Parse semantic version string
 */
function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) throw new Error(`Invalid version: ${version}`);
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || null,
  };
}

/**
 * Format version object to string
 */
function formatVersion(v) {
  const base = `${v.major}.${v.minor}.${v.patch}`;
  return v.prerelease ? `${base}-${v.prerelease}` : base;
}

/**
 * Bump version based on type
 */
function bumpVersion(current, type) {
  const v = parseVersion(current);

  switch (type) {
    case 'major':
      return formatVersion({ major: v.major + 1, minor: 0, patch: 0, prerelease: null });
    case 'minor':
      return formatVersion({ major: v.major, minor: v.minor + 1, patch: 0, prerelease: null });
    case 'patch':
      return formatVersion({ major: v.major, minor: v.minor, patch: v.patch + 1, prerelease: null });
    default:
      // Assume it's a specific version
      parseVersion(type); // Validate
      return type;
  }
}

/**
 * Read current version from package.json
 */
function getCurrentVersion() {
  const pkg = JSON.parse(readFileSync(FILES.package, 'utf-8'));
  return pkg.version;
}

/**
 * Update package.json version
 */
function updatePackageJson(version) {
  const pkg = JSON.parse(readFileSync(FILES.package, 'utf-8'));
  pkg.version = version;
  writeFileSync(FILES.package, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`  ✓ package.json -> ${version}`);
}

/**
 * Update plugin.json version
 */
function updatePluginJson(version) {
  const plugin = JSON.parse(readFileSync(FILES.plugin, 'utf-8'));
  plugin.version = version;
  writeFileSync(FILES.plugin, JSON.stringify(plugin, null, 2) + '\n');
  console.log(`  ✓ plugin.json -> ${version}`);
}

/**
 * Update constants.ts VERSION
 */
function updateConstantsTs(version) {
  let content = readFileSync(FILES.constants, 'utf-8');

  // Update VERSION constant
  content = content.replace(
    /export const VERSION = ['"][\d.]+(?:-[\w.]+)?['"]/,
    `export const VERSION = '${version}'`
  );

  writeFileSync(FILES.constants, content);
  console.log(`  ✓ constants.ts -> ${version}`);
}

/**
 * Main function
 */
function main() {
  const arg = process.argv[2];
  const currentVersion = getCurrentVersion();

  let newVersion;

  if (!arg) {
    // Just sync current version
    newVersion = currentVersion;
    console.log(`\nSyncing version ${newVersion} across all files...\n`);
  } else if (['patch', 'minor', 'major'].includes(arg)) {
    newVersion = bumpVersion(currentVersion, arg);
    console.log(`\nBumping version: ${currentVersion} -> ${newVersion} (${arg})\n`);
  } else {
    newVersion = bumpVersion(currentVersion, arg);
    console.log(`\nSetting version: ${currentVersion} -> ${newVersion}\n`);
  }

  // Update all files
  updatePackageJson(newVersion);
  updatePluginJson(newVersion);
  updateConstantsTs(newVersion);

  console.log(`\n✅ Version ${newVersion} synced successfully!\n`);

  // Output for GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    const output = `version=${newVersion}\nprevious_version=${currentVersion}\n`;
    writeFileSync(process.env.GITHUB_OUTPUT, output, { flag: 'a' });
  }

  return newVersion;
}

main();
