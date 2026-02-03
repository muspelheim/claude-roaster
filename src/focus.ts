/**
 * Claude Roaster - Focus Areas Management
 * Filter and weight agent perspectives based on focus areas
 */

import type { FocusArea, SpecialistAgentId, RoastIssue } from './types.js';
import { AGENTS, SPECIALIST_AGENTS } from './constants.js';

// =============================================================================
// FOCUS AREA TO AGENT MAPPING
// =============================================================================

/**
 * Maps focus areas to the agents that specialize in them
 */
export const FOCUS_AREA_AGENT_MAP: Record<FocusArea, SpecialistAgentId[]> = {
  accessibility: ['roaster-a11y'],
  conversion: ['roaster-marketing'],
  usability: ['roaster-user'],
  visual: ['roaster-designer'],
  implementation: ['roaster-developer'],
  all: SPECIALIST_AGENTS,
};

/**
 * Weight multipliers for focused vs non-focused agents
 */
export const FOCUS_WEIGHTS = {
  focused: 1.5,     // Agents matching the focus area get 1.5x weight
  nonFocused: 0.5,  // Other agents get 0.5x weight
  default: 1.0,     // When no focus is specified, all agents get 1.0x weight
};

// =============================================================================
// FOCUS FILTERING
// =============================================================================

/**
 * Determines which agents should run based on focus areas
 * NOTE: All agents still run, but focus affects synthesis weighting
 *
 * @param focusAreas - Array of focus areas to emphasize
 * @returns Object containing all agents categorized by focus priority
 */
export function categorizeAgentsByFocus(focusAreas: FocusArea[]): {
  focusedAgents: SpecialistAgentId[];
  supportingAgents: SpecialistAgentId[];
  allAgents: SpecialistAgentId[];
} {
  // If 'all' is in focus areas or array is empty, all agents are equal priority
  if (focusAreas.length === 0 || focusAreas.includes('all')) {
    return {
      focusedAgents: [],
      supportingAgents: [],
      allAgents: SPECIALIST_AGENTS,
    };
  }

  // Get all agents that match any of the focus areas
  const focusedAgents = new Set<SpecialistAgentId>();
  for (const focus of focusAreas) {
    const agents = FOCUS_AREA_AGENT_MAP[focus] || [];
    agents.forEach(agent => focusedAgents.add(agent));
  }

  // Supporting agents are all agents not in focused set
  const supportingAgents = SPECIALIST_AGENTS.filter(
    agent => !focusedAgents.has(agent)
  );

  return {
    focusedAgents: Array.from(focusedAgents),
    supportingAgents,
    allAgents: SPECIALIST_AGENTS,
  };
}

/**
 * Gets the weight multiplier for an agent based on focus areas
 *
 * @param agent - Agent ID to get weight for
 * @param focusAreas - Array of focus areas
 * @returns Weight multiplier (0.5, 1.0, or 1.5)
 */
export function getAgentWeight(
  agent: SpecialistAgentId,
  focusAreas: FocusArea[]
): number {
  const { focusedAgents, allAgents } = categorizeAgentsByFocus(focusAreas);

  // No focus specified or 'all' selected - all agents equal weight
  if (focusedAgents.length === 0 && allAgents.length === SPECIALIST_AGENTS.length) {
    return FOCUS_WEIGHTS.default;
  }

  // Agent is in focused set
  if (focusedAgents.includes(agent)) {
    return FOCUS_WEIGHTS.focused;
  }

  // Agent is supporting
  return FOCUS_WEIGHTS.nonFocused;
}

// =============================================================================
// ISSUE WEIGHTING
// =============================================================================

/**
 * Apply focus-based weighting to issues
 * Issues from focused agents get higher priority in synthesis
 *
 * @param issues - Array of roast issues
 * @param focusAreas - Array of focus areas
 * @returns Issues with weight property added
 */
export function applyFocusWeighting(
  issues: RoastIssue[],
  focusAreas: FocusArea[]
): Array<RoastIssue & { weight: number }> {
  return issues.map(issue => ({
    ...issue,
    weight: getAgentWeight(issue.source, focusAreas),
  }));
}

/**
 * Sort issues by weighted priority
 * Takes into account both severity and focus area weighting
 *
 * @param issues - Array of roast issues with weights
 * @returns Sorted issues (highest priority first)
 */
export function sortIssuesByWeightedPriority(
  issues: Array<RoastIssue & { weight: number }>
): Array<RoastIssue & { weight: number }> {
  const severityValues = { critical: 3, major: 2, minor: 1 };

  return [...issues].sort((a, b) => {
    // First, compare by severity * weight
    const aScore = severityValues[a.severity] * a.weight;
    const bScore = severityValues[b.severity] * b.weight;

    if (aScore !== bScore) {
      return bScore - aScore; // Higher score first
    }

    // If scores are equal, prefer focused agents
    return b.weight - a.weight;
  });
}

// =============================================================================
// CLI PARSING
// =============================================================================

/**
 * Parse focus flag from CLI arguments
 * Supports comma-separated values: --focus=accessibility,usability
 *
 * @param focusString - Focus string from CLI (e.g., "accessibility,usability")
 * @returns Array of valid focus areas
 */
export function parseFocusFlag(focusString: string | undefined): FocusArea[] {
  if (!focusString) {
    return [];
  }

  const validFocusAreas: FocusArea[] = [
    'accessibility',
    'conversion',
    'usability',
    'visual',
    'implementation',
    'all',
  ];

  // Split by comma and trim
  const parts = focusString.split(',').map(s => s.trim().toLowerCase());

  // Filter to only valid focus areas
  const focusAreas = parts.filter(part =>
    validFocusAreas.includes(part as FocusArea)
  ) as FocusArea[];

  // If 'all' is included, return ['all']
  if (focusAreas.includes('all')) {
    return ['all'];
  }

  return focusAreas;
}

/**
 * Validate a focus area string
 *
 * @param focus - Focus area to validate
 * @returns True if valid, false otherwise
 */
export function isValidFocusArea(focus: string): focus is FocusArea {
  const validFocusAreas: FocusArea[] = [
    'accessibility',
    'conversion',
    'usability',
    'visual',
    'implementation',
    'all',
  ];
  return validFocusAreas.includes(focus as FocusArea);
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

/**
 * Format focus areas for display
 *
 * @param focusAreas - Array of focus areas
 * @returns Human-readable string
 */
export function formatFocusAreas(focusAreas: FocusArea[]): string {
  if (focusAreas.length === 0 || focusAreas.includes('all')) {
    return 'All perspectives (balanced)';
  }

  const labels: Record<Exclude<FocusArea, 'all'>, string> = {
    accessibility: 'Accessibility',
    conversion: 'Conversion & Marketing',
    usability: 'Usability & UX',
    visual: 'Visual Design',
    implementation: 'Implementation',
  };

  return focusAreas
    .filter((area): area is Exclude<FocusArea, 'all'> => area !== 'all')
    .map(area => labels[area])
    .join(', ');
}

/**
 * Get description of what a focus area emphasizes
 *
 * @param focus - Focus area
 * @returns Description string
 */
export function getFocusDescription(focus: FocusArea): string {
  const descriptions: Record<FocusArea, string> = {
    accessibility: 'WCAG compliance, screen readers, keyboard navigation, color contrast, and inclusive design',
    conversion: 'Call-to-actions, trust signals, brand consistency, persuasive copy, and conversion optimization',
    usability: 'Task completion, friction points, cognitive load, user expectations, and intuitiveness',
    visual: 'Visual hierarchy, color theory, typography, spacing, layout, and aesthetic design',
    implementation: 'Component structure, state management, performance, code quality, and platform best practices',
    all: 'All perspectives with equal weighting - comprehensive, balanced analysis',
  };

  return descriptions[focus];
}

/**
 * Generate focus mode summary for reports
 *
 * @param focusAreas - Array of focus areas
 * @returns Markdown-formatted summary
 */
export function generateFocusSummary(focusAreas: FocusArea[]): string {
  const { focusedAgents, supportingAgents } = categorizeAgentsByFocus(focusAreas);

  if (focusedAgents.length === 0) {
    return `**Focus Mode:** All perspectives (balanced analysis)\n\nAll specialist agents contribute equally to this roast.`;
  }

  const focusedAgentNames = focusedAgents
    .map(id => AGENTS[id].name)
    .join(', ');

  const supportingAgentNames = supportingAgents
    .map(id => AGENTS[id].name)
    .join(', ');

  return `**Focus Mode:** ${formatFocusAreas(focusAreas)}

**Primary Focus (${FOCUS_WEIGHTS.focused}x weight):** ${focusedAgentNames}
**Supporting Perspectives (${FOCUS_WEIGHTS.nonFocused}x weight):** ${supportingAgentNames}

This roast emphasizes ${formatFocusAreas(focusAreas).toLowerCase()} while still considering all perspectives.`;
}
