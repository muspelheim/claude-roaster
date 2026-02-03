---
description: Launch brutal UI/UX roasting session with multi-perspective analysis
---

# 🔥 UI/UX ROAST SESSION

**Command:** `/roast [mode] [target] [options]`

## Syntax

```bash
# Explicit modes (recommended)
/roast screen <target>              # Single screen analysis
/roast flow <target>                # Multi-screen journey
/roast audit                        # Full app review

# Options (all optional, smart defaults applied)
--iterations=<1-10>                 # Number of roast cycles (default: 3)
--focus=<area>                      # Prioritize: a11y|conversion|usability|visual|implementation
--output=<path>                     # Custom output directory (default: reports/roast/)
--fix=<mode>                        # Fix mode: auto|report|ask (default: ask)
--agents=<preset|list>              # Which agents: fast|core|full|custom (default: core)
--skip=<agents>                     # Skip specific agents: a11y,performance,flow

# Agent presets
--agents=fast                       # Designer + User only (fastest, ~30s)
--agents=core                       # Designer + Developer + User + Marketing (default, ~1min)
--agents=full                       # All 8 agents including a11y, performance, copy, flow (~3min)

# Skip specific slow agents
--skip=a11y                         # Skip accessibility (slowest)
--skip=a11y,performance,flow        # Skip multiple agents

# Examples
/roast screen login                             # Core agents (fast)
/roast screen login --agents=fast               # Fastest: 2 agents
/roast screen login --agents=full               # All 8 agents (thorough)
/roast screen login --skip=a11y                 # Core minus a11y
/roast screen settings --focus=a11y --agents=full  # Full with a11y focus
/roast flow checkout --iterations=5
/roast audit --output=./audit-results
```

## Mode Detection

If no explicit mode given, infer from target:
- Contains "flow", "journey", "process" → **Flow Mode**
- Contains "entire", "full", "audit", "app" → **Audit Mode**
- Otherwise → **Screen Mode** (default)

## Execution Workflow

### Phase 1: Initialize (Immediate Start)

```
🔥 ROAST SESSION STARTED
├─ Mode: [screen|flow|audit]
├─ Target: [target name]
├─ Iterations: [n]
├─ Focus: [area or "balanced"]
└─ Output: [path]
```

**Do NOT ask configuration questions upfront.** Use smart defaults and start immediately.

### Phase 2: Screenshot Acquisition

Detect and use screenshot method automatically:

```
📸 Capturing screenshot...
├─ Checking Xcode MCP... [found|not found]
├─ Checking Playwright MCP... [found|not found]
└─ Method: [xcode|playwright|manual]
```

**Detection order:**
1. `mcp__xcodebuildmcp__screenshot` → iOS/macOS simulator
2. `mcp__playwright__browser_take_screenshot` → Web browser
3. Manual upload request → Fallback

**IMPORTANT: Always specify screenshot path explicitly:**

```typescript
// For Playwright MCP - MUST specify filename with correct path
mcp__playwright__browser_take_screenshot({
  type: "png",
  filename: "reports/roast/screenshots/[target]_[iteration].png"
})

// For Xcode MCP
mcp__xcodebuildmcp__screenshot({
  path: "reports/roast/screenshots/[target]_[iteration].png"
})
```

**Create directory first:**
```bash
mkdir -p reports/roast/screenshots
```

Without explicit path, Playwright saves to `.playwright-mcp/` which is incorrect.

### Phase 3: Parallel Analysis

**Agent Presets:**

| Preset | Agents | Speed | Use Case |
|--------|--------|-------|----------|
| `fast` | Designer, User | ~30s | Quick feedback |
| `core` | Designer, Developer, User, Marketing | ~1min | Default, balanced |
| `full` | All 8 agents | ~3min | Thorough audit |

**Agents by preset:**

```
fast: roaster-designer, roaster-user
core: roaster-designer, roaster-developer, roaster-user, roaster-marketing
full: + roaster-a11y, roaster-performance, roaster-copy, roaster-flow
```

**Launch agents based on preset:**

```typescript
// --agents=fast (2 agents)
Task(subagent_type="claude-roaster:roaster-designer", ...)
Task(subagent_type="claude-roaster:roaster-user", ...)

// --agents=core (4 agents, default)
Task(subagent_type="claude-roaster:roaster-designer", ...)
Task(subagent_type="claude-roaster:roaster-developer", ...)
Task(subagent_type="claude-roaster:roaster-user", ...)
Task(subagent_type="claude-roaster:roaster-marketing", ...)

// --agents=full (8 agents)
// All above plus:
Task(subagent_type="claude-roaster:roaster-a11y", ...)
Task(subagent_type="claude-roaster:roaster-performance", ...)
Task(subagent_type="claude-roaster:roaster-copy", ...)
Task(subagent_type="claude-roaster:roaster-flow", ...)
```

**Note:** Progress indicators are shown by Claude Code's native agent UI. The tree view (`ctrl+o` to expand) shows real-time status of each agent.

### Phase 4: Report Generation

Save report immediately:
```
📄 Report saved: reports/roast/roast_[target]_[n].md
```

Display summary in terminal:
```
## 🔥 ROAST RESULTS (Iteration [n])

Found 16 issues:
├─ 🔴 Critical: 2
├─ 🟠 Major: 6
└─ 🟡 Minor: 8

Top 3 Critical Issues:
1. [Issue] - [1-line fix]
2. [Issue] - [1-line fix]
3. [Issue] - [1-line fix]

Full report: reports/roast/roast_[target]_[n].md
```

### Phase 5: Fix Decision (Ask AFTER Results)

Only NOW ask about fixes:

```
AskUserQuestion:
  question: "How should we handle these 16 issues?"
  options:
    - label: "Auto-fix critical & major"
      description: "Implement 8 fixes automatically, skip minor"
    - label: "Fix all issues"
      description: "Implement all 16 fixes"
    - label: "Cherry-pick"
      description: "Let me choose which to fix"
    - label: "Report only"
      description: "Continue without code changes"
```

### Phase 6: Implementation (If Chosen)

```
🔧 Implementing fixes...
├─ [1/8] Fixing: [issue description]... ✓
├─ [2/8] Fixing: [issue description]... ✓
├─ [3/8] Fixing: [issue description]... ✓
...
└─ ✓ All fixes applied

📸 Capturing new screenshot...
```

### Phase 7: Iteration Loop

```
Iteration [n+1] of [total]
[Repeat Phase 2-6]
```

### Phase 8: Final Summary

```
## 🔥 FINAL ROAST SUMMARY

Session Complete!
├─ Iterations: [n]
├─ Total issues found: [x]
├─ Issues fixed: [y]
└─ Resolution rate: [z%]

Before → After:
├─ 📸 reports/roast/screenshots/[target]_1.png
└─ 📸 reports/roast/screenshots/[target]_final.png

Score Improvement:
| Category      | Before | After | Change |
|---------------|--------|-------|--------|
| Visual        | 4/10   | 8/10  | +4     |
| Usability     | 5/10   | 9/10  | +4     |
| Accessibility | 3/10   | 8/10  | +5     |
| Overall       | 4/10   | 8/10  | +4     |

Full report: reports/roast/roast_[target]_final.md
```

## Roaster Voice Guidelines

- **Be BRUTAL** - This is a roast, not gentle feedback
- **Be SPECIFIC** - Exact values: "#2563eb", "48px", "font-weight: 600"
- **Be ACTIONABLE** - Every critique has a concrete fix
- **Be FAST** - Start immediately, ask questions later

## Flow Mode Additional Steps

For flow mode, capture screenshot at each step:

```
🗺️ Flow: checkout (5 steps)
├─ [1/5] Cart → 📸 captured, analyzing...
├─ [2/5] Shipping → 📸 captured, analyzing...
├─ [3/5] Payment → 📸 captured, analyzing...
├─ [4/5] Review → 📸 captured, analyzing...
└─ [5/5] Confirmation → 📸 captured, analyzing...

Cross-screen analysis:
├─ Consistency check...
├─ Transition friction...
└─ Drop-off risk assessment...
```

## Audit Mode Additional Steps

For audit mode, auto-detect critical screens:

```
🔍 Detecting critical screens...
├─ Found: Login
├─ Found: Dashboard
├─ Found: Settings
├─ Found: Checkout
└─ Found: Profile

Roasting 5 screens with 3 iterations each...
```
