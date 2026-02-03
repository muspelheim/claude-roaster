# Contributing to Claude Roaster

Thanks for your interest in contributing to Claude Roaster! This guide will help you get set up and understand the development workflow.

## Development Setup

### Prerequisites

- Node.js >= 18.0.0 (we test on 18, 20, and 22)
- npm (comes with Node.js)
- Git

### Initial Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/claude-roaster.git
   cd claude-roaster
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the project:
   ```bash
   npm run build
   ```

## Development Workflow

### Building

The project uses TypeScript. Build the project with:

```bash
npm run build
```

For development with automatic rebuilds:

```bash
npm run dev
```

### Running Tests Locally

Run the full test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

Run tests in watch mode during development:

```bash
npm test -- --watch
```

### Testing Your Changes

Before submitting a PR, ensure:

1. All tests pass: `npm test`
2. The build completes successfully: `npm run build`
3. No TypeScript errors: `npx tsc --noEmit`

### Local Plugin Testing

To test your changes as a Claude Code plugin:

1. Build the project: `npm run build`
2. Link it globally: `npm link`
3. In Claude Code, use the local plugin:
   ```bash
   /plugin install /path/to/claude-roaster
   ```

## Pull Request Guidelines

### Before Submitting

- Create a new branch for your feature/fix: `git checkout -b feature/my-feature`
- Make your changes with clear, atomic commits
- Write or update tests for your changes
- Ensure all tests pass locally
- Update documentation if needed

### PR Checklist

- [ ] Tests added/updated and passing
- [ ] Code builds without errors
- [ ] Documentation updated (if applicable)
- [ ] Commit messages are clear and descriptive
- [ ] Branch is up to date with main

### PR Title Format

Use clear, descriptive titles:

- `feat: Add multi-iteration roast cycles`
- `fix: Correct screenshot capture on iOS`
- `docs: Update installation instructions`
- `refactor: Simplify agent orchestration`
- `test: Add coverage for roast report generation`

### PR Description

Include in your PR description:

1. **What** - What does this PR do?
2. **Why** - Why is this change needed?
3. **How** - How does it work? (for complex changes)
4. **Testing** - How did you test this?

Example:
```markdown
## What
Adds support for custom roast perspectives beyond the default 5.

## Why
Users want to add domain-specific perspectives (e.g., E-commerce Expert, Mobile Gaming UX).

## How
- New `perspectives` config option in plugin settings
- Extended agent orchestrator to load custom perspective files
- Added validation for custom perspective schemas

## Testing
- Added unit tests for custom perspective loading
- Manually tested with 3 custom perspectives
- All existing tests still pass
```

## Code Style

### TypeScript Guidelines

- Use TypeScript strict mode (enabled in `tsconfig.json`)
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Document public APIs with JSDoc comments

### File Organization

```
claude-roaster/
├── agents/          # Multi-agent roaster logic
├── commands/        # CLI commands
├── skills/          # Claude Code skills
├── hooks/           # Plugin lifecycle hooks
├── src/             # TypeScript source
│   ├── cli/         # CLI implementation
│   └── lib/         # Shared utilities
├── dist/            # Built output (git-ignored)
└── tests/           # Test files (colocated with source)
```

### Naming Conventions

- **Files**: kebab-case (`roast-orchestrator.ts`)
- **Classes**: PascalCase (`RoastOrchestrator`)
- **Functions**: camelCase (`generateReport`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ITERATIONS`)

### Comments

- Write self-documenting code where possible
- Add comments for complex logic or non-obvious decisions
- Use JSDoc for public APIs

Example:
```typescript
/**
 * Orchestrates multi-perspective roast analysis
 * @param target - The UI element to analyze
 * @param iterations - Number of roast/fix cycles
 * @returns Consolidated roast report
 */
export async function orchestrateRoast(
  target: RoastTarget,
  iterations: number
): Promise<RoastReport> {
  // Implementation
}
```

## Testing Standards

### Test Coverage

- Aim for >80% code coverage
- Focus on critical paths and edge cases
- Mock external dependencies (MCPs, file system, etc.)

### Test Structure

Use the Arrange-Act-Assert pattern:

```typescript
import { describe, it, expect } from 'vitest';
import { generateReport } from './roast-reporter';

describe('generateReport', () => {
  it('should include all five perspectives', () => {
    // Arrange
    const roastData = createMockRoastData();

    // Act
    const report = generateReport(roastData);

    // Assert
    expect(report.perspectives).toHaveLength(5);
    expect(report.perspectives).toContain('designer');
    expect(report.perspectives).toContain('developer');
  });
});
```

### What to Test

- **Unit tests**: Individual functions and classes
- **Integration tests**: Agent orchestration and workflows
- **Edge cases**: Empty inputs, invalid data, error conditions
- **Regression tests**: Previously fixed bugs

## Adding New Features

### New Roaster Perspective

1. Create perspective file in `agents/perspectives/`
2. Define the perspective interface
3. Add to orchestrator in `agents/roast-orchestrator.ts`
4. Add tests for the new perspective
5. Update documentation

### New CLI Command

1. Add command file in `commands/`
2. Define command in `.claude-plugin/claude.md`
3. Add tests
4. Update README with usage examples

### New Screenshot Integration

1. Add MCP detection logic
2. Implement screenshot capture
3. Add fallback handling
4. Test on target platform
5. Document platform requirements

## CI/CD Integration

### Automated Checks

When you open a PR, GitHub Actions will automatically:

1. Run tests on Node.js 18, 20, and 22
2. Build the TypeScript project
3. Generate code coverage reports
4. Upload coverage to Codecov

All checks must pass before merging.

### Manual Workflows

You can manually trigger design regression analysis:

1. Go to Actions > Design Regression Analysis
2. Click "Run workflow"
3. Provide target URL and iteration count
4. Review results in workflow summary

## Release Process

Releases are automated via GitHub Actions when version tags are pushed:

1. Update version in `package.json`: `npm version <major|minor|patch>`
2. Push the tag: `git push --tags`
3. GitHub Actions will:
   - Run full test suite
   - Build the package
   - Publish to npm
   - Create GitHub release with changelog

## Getting Help

- **Questions?** Open a [GitHub Discussion](https://github.com/muspelheim/claude-roaster/discussions)
- **Bug?** Open an [Issue](https://github.com/muspelheim/claude-roaster/issues)
- **Feature idea?** Start with a Discussion, then create an Issue

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Assume good intentions

Remember: We roast UIs, not contributors!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Claude Roaster!** 🔥
