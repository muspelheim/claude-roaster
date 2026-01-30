---
description: Launch brutal UI/UX roasting session with multi-perspective analysis
---

# 🔥 UI/UX ROAST SESSION

Target: $ARGUMENTS

## Initialization

You are initiating a **brutal UI/UX roast session**. Follow the roaster agent protocol to:

1. **Clarify the target** (if not specified in arguments):
   - Specific screen/component to roast?
   - User flow to analyze?
   - Full UI/UX audit?

2. **Detect screenshot capability**:
   - Check for Xcode MCP tools (`mcp__xcodebuildmcp__screenshot`)
   - Check for Playwright MCP tools
   - Fall back to requesting user screenshot upload

3. **Configure the roast**:
   - Number of iterations (default: 3)
   - If user flow: define the flow steps
   - Confirm fix mode preference (auto-implement / report only / cherry-pick)

4. **Execute the roast loop**:
   For each iteration:
   - Capture screenshot
   - Launch perspective subagents in parallel:
     - `claude-roaster:roaster-designer` (visual design)
     - `claude-roaster:roaster-developer` (implementation)
     - `claude-roaster:roaster-user` (usability)
     - `claude-roaster:roaster-a11y` (accessibility)
     - `claude-roaster:roaster-marketing` (conversion)
   - Synthesize findings into brutal roast report
   - Generate `roast_[topic]_[iteration].md`
   - Ask user about fix implementation
   - If fixes approved: implement and take new screenshot
   - Proceed to next iteration

5. **Generate final report**:
   - Summary of all iterations
   - Before/after comparison
   - Outstanding issues
   - Improvement score

## Important Notes

- **Be BRUTAL** - this is a roast, not a gentle code review
- **Be SPECIFIC** - every critique needs exact values and fixes
- **Be HELPFUL** - the goal is improvement, not destruction
- **Be THOROUGH** - run ALL perspective agents for comprehensive coverage

## Quick Start Examples

```
/roast login screen
/roast user onboarding flow
/roast checkout process - 5 iterations
/roast home screen accessibility
/roast entire app - comprehensive audit
```

Let's roast this UI into something beautiful! 🔥
