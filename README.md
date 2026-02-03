# 🔥 Claude Roaster

[![CI](https://github.com/muspelheim/claude-roaster/actions/workflows/ci.yml/badge.svg)](https://github.com/muspelheim/claude-roaster/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/muspelheim/claude-roaster/branch/main/graph/badge.svg)](https://codecov.io/gh/muspelheim/claude-roaster)
[![npm version](https://badge.fury.io/js/claude-roaster.svg)](https://badge.fury.io/js/claude-roaster)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Brutal UI/UX critique with multi-perspective analysis** - No mercy, maximum improvement.

A Claude Code plugin that roasts your UI/UX from multiple professional perspectives, with iterative improvement cycles and comprehensive user flow analysis.

## What is This?

Ever wanted Gordon Ramsay to review your UI? This is it. The Roaster agent tears apart your interface with surgical precision, then helps you rebuild it better.

**Features:**
- 🎯 **Multi-perspective analysis** - 5 core specialists + 6 domain experts
- 🔄 **Iterative improvement** - Roast → Fix → Roast → Fix (1-10 configurable cycles)
- 📸 **Platform-aware screenshots** - Xcode MCP, Playwright MCP, or manual upload
- 🗺️ **User flow analysis** - Multi-screen journey analysis with friction detection
- 📊 **Detailed reports** - Markdown reports with linked screenshots
- 🎚️ **Focus areas** - Emphasize specific perspectives (accessibility, conversion, etc.)
- 🔌 **Lifecycle hooks** - Extensible hook system for custom integrations
- 🔥 **Brutal honesty** - No sugar-coating, but always actionable

## Installation

```bash
# Via Claude Code plugin marketplace
/plugin marketplace add https://github.com/muspelheim/claude-roaster
/plugin install claude-roaster
```

## Usage

### Quick Start

```bash
# Single screen roast
/roast login screen

# User flow analysis
/roast flow checkout
/roast user onboarding flow

# Multiple iterations
/roast checkout process - 5 iterations

# Focus on specific area
/roast screen --focus=accessibility

# Comprehensive audit
/roast entire app - comprehensive audit
```

### What Happens

1. **Target Selection** - Specify what to roast (screen, flow, or full audit)
2. **Screenshot Capture** - Auto-detects platform (Xcode/Playwright) or asks for upload
3. **Multi-Agent Analysis** - Specialists analyze in parallel
4. **Brutal Report** - Synthesized roast with prioritized issues
5. **Fix Decision** - Auto-implement, cherry-pick, or just report
6. **Iteration** - Repeat for continuous improvement

## How It Works

### Roast Modes

| Mode | Command | What Gets Analyzed | Screenshots |
|------|---------|-------------------|-------------|
| **Screen** | `/roast login screen` | Single screen/view | 1 per iteration |
| **Flow** | `/roast flow checkout` | Multi-screen journey | 1 per step |
| **Audit** | `/roast entire app` | Full app review | Multiple key screens |

**Screen Mode:** Analyzes one screen in depth. Best for focused improvements on specific views (login, settings, profile).

**Flow Mode:** Analyzes a user journey across multiple screens. Captures screenshots at each step, checks cross-screen consistency, identifies drop-off points.

**Audit Mode:** Comprehensive review of the entire application. Identifies critical screens automatically, analyzes key user paths.

### MCP Detection

Claude Roaster automatically detects available screenshot tools in this order:

```
1. Check: Is Xcode MCP available?
   └─ Yes → Use mcp__xcodebuildmcp__screenshot (iOS/macOS simulator)
   └─ No  → Continue...

2. Check: Is Playwright MCP available?
   └─ Yes → Use mcp__playwright__browser_take_screenshot (web browser)
   └─ No  → Continue...

3. Fallback: Request manual screenshot upload from user
```

**How detection works:**
- Checks Claude Code's available MCP tools at session start
- No configuration needed - just have the MCP server running
- Falls back gracefully if no automation available

**Requirements by platform:**

| Platform | MCP Required | Setup |
|----------|-------------|-------|
| iOS/macOS | xcodebuildmcp | Simulator running or device connected |
| Web | Playwright MCP | Browser context active via `browser_navigate` |
| Any | None (manual) | User uploads screenshots when prompted |

### Analysis Scope

**What gets analyzed:**

| Category | Checks |
|----------|--------|
| Visual | Hierarchy, contrast, spacing, typography, color consistency |
| Usability | Cognitive load, tap targets, feedback, error states |
| Accessibility | WCAG AA/AAA, screen reader, color blindness, motor impairments |
| Implementation | Component structure, state management, performance hints |
| Conversion | CTA visibility, trust signals, friction points |

**What is NOT analyzed:**
- Backend/API performance (frontend only)
- Business logic correctness
- Content accuracy (copy tone is checked, not facts)
- Security vulnerabilities (use security-review for that)

### Output Location

All reports and screenshots are saved to:

```
reports/roast/
├── roast_[target]_1.md      # Iteration 1 report
├── roast_[target]_2.md      # Iteration 2 report
├── roast_[target]_final.md  # Final summary with before/after
└── screenshots/
    ├── [target]_1.png       # Screenshot for iteration 1
    ├── [target]_2.png       # Screenshot for iteration 2
    └── [target]_final.png   # Final state screenshot
```

## The Roast Squad

### Core Specialists

| Agent | Perspective | What They Check |
|-------|-------------|-----------------|
| 🎨 **Designer** | Visual Design | Hierarchy, color theory, typography, spacing |
| 💻 **Developer** | Implementation | Component structure, state management, performance |
| 👤 **User** | Usability | Friction points, cognitive load, task completion |
| ♿ **A11y Expert** | Accessibility | WCAG compliance, screen readers, motor impairments |
| 📈 **Marketing** | Conversion | CTAs, trust signals, persuasion psychology |

### Domain Experts

| Agent | Focus | What They Check |
|-------|-------|-----------------|
| 🗺️ **Flow** | User Journeys | Cross-screen consistency, transitions, drop-off risks |
| ⚡ **Performance** | Speed | Load times, bundle size, render performance, memory |
| ✍️ **Copy** | Content | Messaging, tone, clarity, microcopy, brand voice |
| 🔒 **Privacy** | Data Handling | Compliance, consent patterns, transparency, trust |
| 🌍 **i18n** | Internationalization | Localization readiness, RTL support, cultural considerations |

The main orchestrator (Opus) synthesizes findings from all specialists into a unified, prioritized report.

## User Flow Analysis

Analyze entire user journeys across multiple screens, not just individual pages.

### Flow Commands

```bash
# Analyze a specific flow
/roast flow checkout
/roast flow onboarding
/roast flow password-reset

# Natural language flow description
/roast user registration to first purchase flow
```

### App Type Detection

Claude Roaster automatically detects your app type and applies relevant flow templates:

| App Type | Example Flows |
|----------|---------------|
| **E-commerce** | Browse → Cart → Checkout → Confirmation |
| **SaaS** | Signup → Onboarding → Dashboard → Settings |
| **Social** | Feed → Profile → Messaging → Notifications |
| **Fintech** | Login → Accounts → Transfer → Confirmation |
| **Healthcare** | Appointment → Records → Prescriptions |
| **Education** | Courses → Lessons → Quizzes → Progress |
| **Media** | Browse → Player → Playlist → Downloads |
| **Productivity** | Create → Edit → Share → Collaborate |
| **Marketplace** | Search → Listing → Contact → Transaction |
| **Gaming** | Menu → Gameplay → Inventory → Achievements |

### Flow Analysis Features

- **Friction detection** - Identifies drop-off points and confusing steps
- **Cross-screen consistency** - Checks visual and interaction patterns
- **Path analysis** - Evaluates happy path and error states
- **Bottleneck identification** - Finds steps with high cognitive load
- **Journey mapping** - Visual representation of user flows

### Graph-Based Flow Analysis

For complex flows, Claude Roaster builds a graph representation:

```typescript
// Node types: screen, decision, merge, start, end, error, external
// Edge types: default, success, error, conditional, optional, back, exit

// Analysis includes:
// - Cycle detection
// - Dead-end analysis
// - Orphan node detection
// - Critical path identification
// - Mermaid diagram generation
```

## Report Format

Each iteration generates a report:

```
reports/roast/
├── screenshots/
│   ├── login-screen_1.png
│   └── login-screen_2.png
├── roast_login-screen_1.md
├── roast_login-screen_2.md
└── roast_login-screen_final.md
```

Reports include:
- Screenshot with linked image
- Issues by severity (🔴 Critical, 🟠 Major, 🟡 Minor)
- Perspective breakdowns from each specialist
- Specific fixes with exact values (hex colors, pixel sizes)
- Cross-screen consistency tables (for flows)
- Before/after comparison (final report)
- Improvement scoring across iterations

## Configuration

### Iteration Count

```bash
/roast login screen - 5 iterations   # More cycles (max 10)
/roast login screen - 1 iteration    # Single roast
```

Default: 3 iterations

### Focus Areas

```bash
/roast screen --focus=accessibility  # Prioritize a11y (1.5x weight)
/roast screen --focus=conversion     # Prioritize marketing
/roast screen --focus=usability      # Prioritize UX
/roast screen --focus=visual         # Prioritize design
/roast screen --focus=implementation # Prioritize code
/roast screen --focus=all            # Balanced (default)
```

When focus is specified, matching agents get **1.5x weight** while others provide supporting analysis at **0.5x weight**. All agents still run - focus just emphasizes specific perspectives in the synthesis.

### Fix Mode

When issues are found, you choose:
- **Auto-implement** - Agent makes all code changes
- **Cherry-pick** - You select which fixes to apply
- **Report only** - Document only, no changes
- **Skip** - Continue to next iteration

## Hooks System

Claude Roaster supports lifecycle hooks to customize behavior at key points in the roast session.

### Available Hook Events

| Event | Trigger Point | Use Cases |
|-------|--------------|-----------|
| `onSessionStart` | Before roast begins | Initialize tracking, send notifications |
| `onIterationStart` | Before each iteration | Prepare tools, log progress |
| `onIterationComplete` | After each iteration | Analyze results, update dashboards |
| `onReportGenerated` | After report is written | Post-process, upload to cloud |
| `onSessionComplete` | After all iterations done | Generate summaries, cleanup |

### Hook Configuration

Create or modify `hooks/hooks.json`:

```json
{
  "description": "Claude Roaster hooks for UI/UX analysis sessions",
  "hooks": {
    "onSessionStart": [
      {
        "event": "onSessionStart",
        "handler": "default",
        "enabled": true,
        "description": "Log session initialization"
      }
    ],
    "onIterationComplete": [
      {
        "event": "onIterationComplete",
        "handler": "default",
        "enabled": true,
        "description": "Log iteration summary"
      }
    ]
  }
}
```

### Programmatic Hook Usage

```typescript
import { createHookManager } from 'claude-roaster';

const hooks = createHookManager(process.cwd());

// Register custom handler
hooks.register('onIterationComplete', async (data) => {
  console.log(`Iteration ${data.iteration.number} found ${data.iteration.issues.length} issues`);

  // Send to external service
  await fetch('https://analytics.example.com/roast', {
    method: 'POST',
    body: JSON.stringify({
      sessionId: data.session.id,
      iteration: data.iteration.number,
      issueCount: data.iteration.issues.length,
      score: data.iteration.scores.overall
    })
  });
});
```

## Platform Support

### iOS/macOS (Xcode MCP)
Automatically uses `mcp__xcodebuildmcp__screenshot` if available.
Requires simulator running or device connected.

### Web (Playwright MCP)
Automatically uses Playwright screenshot tools if available.
Requires browser context active.

### Manual Upload
Falls back to requesting screenshot upload if no automation available.

## Programmatic API

Claude Roaster exports TypeScript types and utilities for programmatic use:

```typescript
import {
  // Types
  RoastSession,
  RoastIteration,
  RoastIssue,
  Severity,
  FlowDefinition,
  FlowGraph,
  AppType,

  // Flow utilities
  detectAppType,
  getSuggestedFlows,
  getCriticalFlows,
  parseNaturalLanguageFlow,
  createFlowFromNaturalLanguage,
  validateFlowDefinition,

  // Graph utilities
  createNode,
  createEdge,
  createEmptyGraph,
  addNode,
  addEdge,
  analyzeFlowGraph,
  toMermaid,

  // Constants
  AGENTS,
  SEVERITIES,
  FLOW_TEMPLATES,
  GRAPH_TEMPLATES,
} from 'claude-roaster';

// Detect app type from codebase keywords
const appType = detectAppType(codebaseKeywords); // 'ecommerce' | 'saas' | ...

// Get suggested flows for app type
const flows = getSuggestedFlows(appType);
const critical = getCriticalFlows();

// Parse natural language to flow definition (two-step process)
const parsed = parseNaturalLanguageFlow('user signup -> dashboard -> settings');
const flow = createFlowFromNaturalLanguage(parsed, 'User Onboarding');

// Create and analyze flow graph
let graph = createEmptyGraph('checkout-flow', 'ecommerce');
const cartNode = createNode('cart', 'Shopping Cart', 'screen');
const checkoutNode = createNode('checkout', 'Checkout', 'screen');
graph = addNode(graph, cartNode);
graph = addNode(graph, checkoutNode);
graph = addEdge(graph, createEdge('cart', 'checkout'));

const analysis = analyzeFlowGraph(graph);
// Returns: paths, metrics (cycles, deadEnds, orphanNodes, etc.)

// Generate Mermaid diagram
const mermaid = toMermaid(graph);
```

## Example Roast

**Before (the problem):**
> "This call-to-action button is playing hide and seek with your users - and it's winning."

**After (the fix):**
> "Make it pop with your brand color (#2563eb), bump to font-weight 600, move it above the fold, and make it at least 48px tall for touch targets."

## Philosophy

- **Brutal but fair** - Every critique comes with a specific fix
- **No vague feedback** - Exact colors, sizes, and values
- **Accessibility is non-negotiable** - Always checked, always critical
- **The goal is improvement** - We roast because we care

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode
npm run dev
npm run test:watch

# Coverage
npm run test:coverage
```

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Ideas for contributions:
- Add new roaster perspectives
- Improve the roast voice
- Add platform integrations
- Enhance report templates
- Add flow templates for new app types

## License

MIT

---

**Now go make that UI something to be proud of!** 🔥
