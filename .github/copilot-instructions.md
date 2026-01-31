# GitHub Copilot Instructions for Claude Roaster

## Repository Overview

Claude Roaster is a Claude Code plugin that provides brutal UI/UX critique with multi-perspective analysis. It's a TypeScript-based project that delivers no-mercy design feedback from 5 professional perspectives: Designer, Developer, User, Accessibility Expert, and Marketing.

## Project Structure

- **agents/**: Contains agent definitions for different roasting perspectives
  - `roaster.md`: Main roaster agent orchestrator
  - `roaster-designer.md`: Visual design perspective
  - `roaster-developer.md`: Implementation perspective
  - `roaster-user.md`: Usability perspective
  - `roaster-a11y.md`: Accessibility perspective
  - `roaster-marketing.md`: Conversion/marketing perspective
- **commands/**: Command definitions for the plugin
  - `roast.md`: Main `/roast` command definition
- **skills/**: Skill definitions for the plugin
- **hooks/**: Plugin hooks
- **src/**: TypeScript source code
- **.claude-plugin/**: Plugin metadata and configuration
  - `plugin.json`: Plugin metadata
  - `marketplace.json`: Marketplace information

## Build and Development

This is a TypeScript project. Key commands:

```bash
# Build the project
npm run build

# Development mode with watch
npm run dev

# Install dependencies
npm install
```

Build output goes to `dist/` directory.

## Code Style and Conventions

- Use TypeScript with strict type checking
- Follow ESM module syntax (type: "module" in package.json)
- Agent definitions are in Markdown format
- Commands follow Claude Code plugin conventions
- Keep feedback brutal but actionable - every critique should come with a specific fix

## Testing and Quality

- No existing test infrastructure currently
- Manual testing through Claude Code plugin system
- Focus on agent behavior and command execution

## Key Patterns

1. **Agent Architecture**: Each roasting perspective is a separate agent that analyzes independently
2. **Multi-Agent Coordination**: The main roaster agent coordinates the 5 specialist agents
3. **Iterative Improvement**: Support configurable roast-fix-roast cycles
4. **Platform Integration**: Support for Xcode MCP, Playwright MCP, and manual screenshot upload
5. **Report Generation**: Generate detailed markdown reports with severity levels

## Important Files

- `package.json`: Project metadata, dependencies, and scripts
- `tsconfig.json`: TypeScript configuration
- `.claude-plugin/plugin.json`: Plugin metadata for Claude Code
- `README.md`: User-facing documentation

## Guidelines for Code Changes

1. **Maintain Agent Personality**: Keep the roasting tone brutal but fair
2. **Specific Feedback**: Always provide exact values (colors, sizes, etc.) in critiques
3. **Accessibility First**: A11y issues are always critical priority
4. **Multi-Perspective**: Ensure all 5 perspectives are represented
5. **Actionable**: Every critique must have a clear fix

## Dependencies

- Node.js >= 18.0.0
- TypeScript 5.7.2+
- Minimal dependencies - keep it lean

## Integration Points

- Claude Code plugin system
- MCP servers (Xcode, Playwright)
- Screenshot capture and analysis
- Markdown report generation
