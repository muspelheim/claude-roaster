# 🔥 Claude Roaster

[![CI](https://github.com/muspelheim/claude-roaster/actions/workflows/ci.yml/badge.svg)](https://github.com/muspelheim/claude-roaster/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/muspelheim/claude-roaster/branch/main/graph/badge.svg)](https://codecov.io/gh/muspelheim/claude-roaster)
[![npm version](https://badge.fury.io/js/claude-roaster.svg)](https://badge.fury.io/js/claude-roaster)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Brutal UI/UX critique with multi-perspective analysis** - No mercy, maximum improvement.

A Claude Code plugin that roasts your UI/UX from 5 professional perspectives, with iterative improvement cycles.

## What is This?

Ever wanted Gordon Ramsay to review your UI? This is it. The Roaster agent tears apart your interface with surgical precision, then helps you rebuild it better.

**Features:**
- 🎯 **Multi-perspective analysis** - Designer, Developer, User, Accessibility Expert, Marketing
- 🔄 **Iterative improvement** - Roast → Fix → Roast → Fix (configurable cycles)
- 📸 **Platform-aware screenshots** - Xcode MCP, Playwright MCP, or manual upload
- 📊 **Detailed reports** - Markdown reports with linked screenshots
- 🔥 **Brutal honesty** - No sugar-coating, but always actionable

## Installation

```bash
/plugin marketplace add https://github.com/muspelheim/claude-roaster
/plugin install claude-roaster
```

## Usage

### Quick Start

```bash
# In Claude Code
/roast login screen

/roast user onboarding flow

/roast checkout process - 5 iterations

/roast entire app - comprehensive audit
```

### What Happens

1. **Target Selection** - Specify what to roast (screen, flow, or full audit)
2. **Screenshot Capture** - Auto-detects platform (Xcode/Playwright) or asks for upload
3. **Multi-Agent Analysis** - 5 specialists analyze in parallel
4. **Brutal Report** - Synthesized roast with prioritized issues
5. **Fix Decision** - Auto-implement, cherry-pick, or just report
6. **Iteration** - Repeat for continuous improvement

## The Roast Squad

| Agent | Perspective | What They Check |
|-------|-------------|-----------------|
| 🎨 **Designer** | Visual Design | Hierarchy, color, typography, spacing |
| 💻 **Developer** | Implementation | Component structure, state management, performance |
| 👤 **User** | Usability | Friction points, cognitive load, task completion |
| ♿ **A11y Expert** | Accessibility | WCAG compliance, screen readers, motor impairments |
| 📈 **Marketing** | Conversion | CTAs, trust signals, persuasion psychology |

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
- Specific fixes with exact values
- Before/after comparison (final report)

## Configuration

### Iteration Count

```bash
/roast login screen - 5 iterations   # More cycles
/roast login screen - 1 iteration    # Single roast
```

### Focus Areas

```bash
/roast screen --focus=accessibility  # Prioritize a11y
/roast screen --focus=conversion     # Prioritize marketing
/roast screen --focus=usability      # Prioritize UX
/roast screen --focus=visual         # Prioritize design
/roast screen --focus=implementation # Prioritize code
```

When focus is specified, matching agents get **1.5x weight** while others provide supporting analysis at **0.5x weight**. All agents still run - focus just emphasizes specific perspectives in the synthesis.

### Fix Mode

When issues are found, you choose:
- **Auto-implement** - Agent makes all code changes
- **Cherry-pick** - You select which fixes to apply
- **Report only** - Document only, no changes
- **Skip** - Continue to next iteration

### Hooks System

Claude Roaster supports lifecycle hooks to customize behavior at key points in the roast session. Hooks are configured in `hooks/hooks.json`.

#### Available Hook Events

| Event | Trigger Point | Use Cases |
|-------|--------------|-----------|
| `onSessionStart` | Before roast begins | Initialize tracking, send notifications, validate setup |
| `onIterationStart` | Before each iteration | Prepare tools, log progress, reset state |
| `onIterationComplete` | After each iteration | Analyze results, update dashboards, notify team |
| `onReportGenerated` | After report is written | Post-process reports, upload to cloud, send alerts |
| `onSessionComplete` | After all iterations done | Generate summaries, cleanup resources, archive results |

#### Hook Configuration

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

#### Default Hooks

By default, Claude Roaster includes logging hooks for all events:

- **onSessionStart** - Logs session ID, target, iterations, fix mode, and focus areas
- **onIterationStart** - Logs iteration number and progress
- **onIterationComplete** - Logs issues found, fixes applied, and scores
- **onReportGenerated** - Logs report file path
- **onSessionComplete** - Logs final session summary with duration

#### Programmatic Hook Usage

You can also register hooks programmatically:

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

// Execute hook
await hooks.execute('onIterationComplete', {
  session: mySession,
  iteration: myIteration,
  timestamp: new Date()
});
```

#### Hook Event Data

Each hook receives specific data:

```typescript
// onSessionStart
{
  session: RoastSession,
  timestamp: Date
}

// onIterationStart
{
  session: RoastSession,
  iterationNumber: number,
  timestamp: Date
}

// onIterationComplete
{
  session: RoastSession,
  iteration: RoastIteration,
  timestamp: Date
}

// onReportGenerated
{
  session: RoastSession,
  reportPath: string,
  iterationNumber: number,
  timestamp: Date
}

// onSessionComplete
{
  session: RoastSession,
  duration: number,  // milliseconds
  timestamp: Date
}
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

## Contributing

Contributions welcome! Feel free to:
- Add new roaster perspectives
- Improve the roast voice
- Add platform integrations
- Enhance report templates

## License

MIT

---

**Now go make that UI something to be proud of!** 🔥
