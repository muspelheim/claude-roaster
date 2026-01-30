#!/usr/bin/env node

/**
 * Claude Roaster - CLI Entry Point
 * Post-install setup and CLI commands
 */

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { PLUGIN_METADATA, AGENTS, SPECIALIST_AGENTS } from '../constants.js';
import { PERSPECTIVE_DISPLAY } from '../constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PLUGIN_ROOT = join(__dirname, '..', '..');

/**
 * Display post-install success message
 */
function displayPostInstallMessage(): void {
  console.log('');
  console.log('🔥 ═══════════════════════════════════════════════════════════════');
  console.log('   CLAUDE ROASTER - Brutal UI/UX Critique, Zero Mercy');
  console.log('═══════════════════════════════════════════════════════════════ 🔥');
  console.log('');
  console.log(`   Version: ${PLUGIN_METADATA.version}`);
  console.log(`   Plugin root: ${PLUGIN_ROOT}`);
  console.log('');
  console.log('───────────────────────────────────────────────────────────────────');
  console.log('   📋 AVAILABLE COMMANDS');
  console.log('───────────────────────────────────────────────────────────────────');
  console.log('');
  console.log('   /roast <target>              Start a roast session');
  console.log('   /roast login screen          Roast a specific screen');
  console.log('   /roast checkout flow         Roast a user flow');
  console.log('   /roast app - 5 iterations    Run 5 improvement cycles');
  console.log('');
  console.log('───────────────────────────────────────────────────────────────────');
  console.log('   🎭 THE ROAST SQUAD');
  console.log('───────────────────────────────────────────────────────────────────');
  console.log('');

  // Display main orchestrator
  const orchestrator = AGENTS.roaster;
  console.log(`   🔥 ${orchestrator.name.padEnd(22)} [${orchestrator.model.toUpperCase()}]`);
  console.log(`      └─ ${orchestrator.description}`);
  console.log('');

  // Display specialist agents
  for (const agentId of SPECIALIST_AGENTS) {
    const agent = AGENTS[agentId];
    const display = PERSPECTIVE_DISPLAY[agentId];
    console.log(`   ${display.emoji} ${agent.name.padEnd(22)} [${agent.model.toUpperCase()}]`);
    console.log(`      └─ ${agent.description}`);
  }

  console.log('');
  console.log('───────────────────────────────────────────────────────────────────');
  console.log('   ⚡ QUICK START');
  console.log('───────────────────────────────────────────────────────────────────');
  console.log('');
  console.log('   1. Run your app (simulator, browser, or have a screenshot)');
  console.log('   2. Type: /roast [screen name]');
  console.log('   3. Watch the brutal critique unfold');
  console.log('   4. Fix, iterate, improve!');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('   ✅ Claude Roaster installed and ready to roast!');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
}

/**
 * Display help message
 */
function displayHelp(): void {
  console.log('');
  console.log('Claude Roaster CLI');
  console.log('');
  console.log('Usage:');
  console.log('  claude-roaster postinstall    Run post-install setup');
  console.log('  claude-roaster help           Show this help message');
  console.log('  claude-roaster version        Show version');
  console.log('');
}

/**
 * Display version
 */
function displayVersion(): void {
  console.log(`claude-roaster v${PLUGIN_METADATA.version}`);
}

// Main CLI entry point
const command = process.argv[2];

switch (command) {
  case 'postinstall':
    displayPostInstallMessage();
    break;
  case 'help':
  case '--help':
  case '-h':
    displayHelp();
    break;
  case 'version':
  case '--version':
  case '-v':
    displayVersion();
    break;
  default:
    if (command) {
      console.error(`Unknown command: ${command}`);
      console.log('');
    }
    displayHelp();
    break;
}
