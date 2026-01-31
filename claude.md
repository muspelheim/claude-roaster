# Using Claude with Claude Roaster

This document provides guidance on how to effectively use Claude (AI assistant) when working with the Claude Roaster repository.

## Repository Context

Claude Roaster is a Claude Code plugin that delivers brutal, multi-perspective UI/UX critiques. When working with Claude on this repository, keep these key concepts in mind:

### Core Purpose
- Provide actionable, specific UI/UX feedback from 5 expert perspectives
- Never sugarcoat feedback, but always include concrete solutions
- Support iterative improvement cycles (roast → fix → roast → fix)
- Generate detailed markdown reports with severity-based issue tracking

### Agent Architecture
The plugin uses a multi-agent architecture with specialized roasters:
- **Designer** (🎨): Visual design, hierarchy, color, typography, spacing
- **Developer** (💻): Implementation, component structure, state management, performance
- **User** (👤): Usability, friction points, cognitive load, task completion
- **Accessibility Expert** (♿): WCAG compliance, screen readers, motor impairments
- **Marketing** (📈): CTAs, trust signals, persuasion psychology

## Working with Claude on This Repository

### Understanding the Codebase

When Claude needs to understand the codebase:

1. **Agent Definitions**: All agent personalities and instructions are in `agents/*.md`
2. **Commands**: The `/roast` command definition is in `commands/roast.md`
3. **Plugin Configuration**: Check `.claude-plugin/plugin.json` for metadata
4. **Build System**: TypeScript with ESM modules, output to `dist/`

### Making Changes

When requesting changes from Claude:

#### Agent Modifications
```
Claude, update the Designer agent to also check for proper use of white space
and breathing room in layouts. Maintain the brutal but fair tone.
```

#### Adding New Features
```
Claude, add support for analyzing mobile responsiveness as part of the
Designer agent's critique. Include specific breakpoint recommendations.
```

#### Bug Fixes
```
Claude, the roast command isn't properly handling multiple iterations.
Please investigate and fix the iteration logic.
```

### Code Style Guidelines

When Claude writes code for this project:

1. **TypeScript Style**:
   - Use strict type checking
   - Prefer interfaces over type aliases for object shapes
   - Use ESM import/export syntax
   - Avoid `any` types

2. **Agent Personality**:
   - Keep the roasting tone sharp and direct
   - Every critique must include specific, measurable fixes
   - Use exact values (colors in hex, sizes in px/rem, etc.)
   - Accessibility issues are ALWAYS critical priority

3. **File Structure**:
   - Agent definitions go in `agents/`
   - Commands go in `commands/`
   - TypeScript source goes in `src/`
   - Keep markdown files clean and well-formatted

### Testing Changes

When Claude makes changes, validate them:

```bash
# Build the project
npm run build

# Check for TypeScript errors
npm run build

# Test the plugin in Claude Code
claude plugins install .
```

### Common Tasks

#### Adding a New Roasting Perspective

```
Claude, add a new "Performance" roaster agent that analyzes load times,
bundle sizes, and rendering performance. It should follow the same pattern
as the existing roaster agents in agents/ directory.
```

#### Improving Report Format

```
Claude, enhance the markdown report generation to include a summary table
at the top with counts by severity level (Critical, Major, Minor).
```

#### Platform Integration

```
Claude, add support for Android screenshot capture via ADB commands,
similar to how we support Xcode and Playwright.
```

## Best Practices

### When Asking Claude for Help

1. **Be Specific**: Reference exact files, functions, or agent names
2. **Provide Context**: Mention what you're trying to achieve and why
3. **Include Examples**: Show examples of desired output or behavior
4. **Mention Constraints**: Note any performance, compatibility, or style requirements

### When Reviewing Claude's Changes

1. **Check Agent Personality**: Ensure the roasting tone is maintained
2. **Verify Specificity**: Confirm feedback includes exact values and measurements
3. **Test Iteration Logic**: Make sure roast cycles work correctly
4. **Validate Reports**: Check that generated markdown is properly formatted

## Repository Conventions

### Commit Messages
- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, Refactor)
- Reference issue numbers when applicable

### Documentation
- Update README.md for user-facing changes
- Update this file (claude.md) for Claude-specific guidance
- Keep agent definitions well-documented with examples

### Agent Design Principles
1. **Brutal but Fair**: Harsh criticism with constructive solutions
2. **Specific**: Exact values, not vague suggestions
3. **Actionable**: Every issue has a clear fix
4. **Accessibility First**: A11y is non-negotiable
5. **Multi-Perspective**: Leverage all 5 expert viewpoints

## Integration Points

### Claude Code Plugin System
- Follows Claude Code plugin conventions
- Uses `.claude-plugin/plugin.json` for metadata
- Commands defined in `commands/` directory
- Agents defined in `agents/` directory

### MCP Servers
- **Xcode MCP**: For iOS/macOS screenshot capture
- **Playwright MCP**: For web application screenshot capture
- Graceful fallback to manual upload when MCPs unavailable

### Screenshot Analysis
- Support multiple image sources
- Link screenshots in generated reports
- Maintain screenshot organization in `reports/roast/screenshots/`

## Example Interactions with Claude

### Debugging
```
Claude, the roaster is not properly detecting when Playwright MCP is available.
Please check the platform detection logic and fix it.
```

### Feature Addition
```
Claude, add a --focus flag to the /roast command that allows users to
prioritize a specific perspective (e.g., --focus=accessibility).
The focused agent should get more weight in the final report.
```

### Documentation
```
Claude, update the README with examples of the markdown reports that get
generated, including the severity levels and perspective breakdowns.
```

### Refactoring
```
Claude, the agent coordination logic in roaster.md is getting complex.
Please refactor it to be more maintainable while keeping the same behavior.
```

## Resources

- **Repository**: https://github.com/muspelheim/claude-roaster
- **Issues**: https://github.com/muspelheim/claude-roaster/issues
- **Claude Code Plugin Docs**: (reference Claude Code documentation)
- **MCP Documentation**: (reference MCP documentation for integrations)

## Getting Help

When stuck:
1. Ask Claude to explain the agent architecture
2. Request Claude to trace through the roast command flow
3. Have Claude review and explain specific agent definitions
4. Ask Claude to analyze the build and plugin installation process

---

**Remember**: This plugin is about delivering harsh but helpful UI/UX critique. When working with Claude, maintain that same philosophy - be direct about what you need, and expect specific, actionable solutions in return. 🔥
