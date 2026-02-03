/**
 * Claude Roaster - User Flow Module
 * Handles flow definition, parsing, and template management
 */

import type {
  AppType,
  FlowStep,
  FlowDefinition,
  FlowTemplate,
  FlowActionType,
  NaturalLanguageFlowInput,
} from './types.js';

// =============================================================================
// APP TYPE DETECTION
// =============================================================================

/**
 * Keywords that indicate app type
 */
const APP_TYPE_KEYWORDS: Record<AppType, string[]> = {
  ecommerce: ['shop', 'cart', 'checkout', 'product', 'buy', 'store', 'order', 'payment', 'shipping'],
  saas: ['dashboard', 'settings', 'subscription', 'billing', 'team', 'workspace', 'admin', 'api'],
  social: ['profile', 'feed', 'post', 'follow', 'like', 'comment', 'share', 'message', 'friend'],
  fintech: ['account', 'transfer', 'balance', 'transaction', 'payment', 'bank', 'card', 'invest'],
  healthcare: ['appointment', 'patient', 'doctor', 'prescription', 'health', 'medical', 'record'],
  education: ['course', 'lesson', 'quiz', 'student', 'grade', 'assignment', 'learn', 'class'],
  media: ['video', 'stream', 'playlist', 'watch', 'episode', 'channel', 'subscribe'],
  productivity: ['task', 'project', 'calendar', 'note', 'reminder', 'schedule', 'collaborate'],
  marketplace: ['listing', 'seller', 'buyer', 'bid', 'auction', 'review', 'rating'],
  gaming: ['play', 'level', 'score', 'achievement', 'leaderboard', 'character', 'inventory'],
  unknown: [],
};

/**
 * Detect app type from context (file paths, screen names, descriptions)
 */
export function detectAppType(context: string): AppType {
  const lower = context.toLowerCase();
  const scores: Record<AppType, number> = {
    ecommerce: 0, saas: 0, social: 0, fintech: 0, healthcare: 0,
    education: 0, media: 0, productivity: 0, marketplace: 0, gaming: 0, unknown: 0,
  };

  for (const [appType, keywords] of Object.entries(APP_TYPE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        scores[appType as AppType] += 1;
      }
    }
  }

  const sorted = Object.entries(scores)
    .filter(([type]) => type !== 'unknown')
    .sort(([, a], [, b]) => b - a);

  return sorted[0][1] > 0 ? (sorted[0][0] as AppType) : 'unknown';
}

// =============================================================================
// FLOW TEMPLATES BY APP TYPE
// =============================================================================

export const FLOW_TEMPLATES: FlowTemplate[] = [
  // E-commerce flows
  {
    id: 'ecommerce-checkout',
    name: 'Checkout Flow',
    description: 'Complete purchase journey from cart to confirmation',
    appTypes: ['ecommerce', 'marketplace'],
    priority: 'critical',
    steps: [
      { order: 1, screenName: 'Shopping Cart', action: 'verify', description: 'Review cart items and totals' },
      { order: 2, screenName: 'Shipping Address', action: 'input', description: 'Enter or select shipping address' },
      { order: 3, screenName: 'Shipping Method', action: 'select', description: 'Choose shipping speed' },
      { order: 4, screenName: 'Payment', action: 'input', description: 'Enter payment details' },
      { order: 5, screenName: 'Order Review', action: 'verify', description: 'Final review before purchase' },
      { order: 6, screenName: 'Confirmation', action: 'verify', description: 'Order confirmed with details' },
    ],
    commonIssues: ['Hidden costs revealed late', 'Too many steps', 'Guest checkout missing', 'Trust signals absent'],
  },
  {
    id: 'ecommerce-search-purchase',
    name: 'Search to Purchase',
    description: 'Finding and buying a specific product',
    appTypes: ['ecommerce', 'marketplace'],
    priority: 'high',
    steps: [
      { order: 1, screenName: 'Home/Search', action: 'input', description: 'Enter search query' },
      { order: 2, screenName: 'Search Results', action: 'scroll', description: 'Browse results and filter' },
      { order: 3, screenName: 'Product Detail', action: 'verify', description: 'Review product information' },
      { order: 4, screenName: 'Add to Cart', action: 'click', description: 'Add item to shopping cart' },
      { order: 5, screenName: 'Cart', action: 'navigate', description: 'Proceed to checkout' },
    ],
    commonIssues: ['Poor search relevance', 'Missing filters', 'Unclear pricing', 'Out of stock handling'],
  },

  // SaaS flows
  {
    id: 'saas-onboarding',
    name: 'User Onboarding',
    description: 'New user setup and first-value experience',
    appTypes: ['saas', 'productivity'],
    priority: 'critical',
    steps: [
      { order: 1, screenName: 'Sign Up', action: 'input', description: 'Create account with email/OAuth' },
      { order: 2, screenName: 'Email Verification', action: 'verify', description: 'Confirm email address' },
      { order: 3, screenName: 'Profile Setup', action: 'input', description: 'Basic profile information' },
      { order: 4, screenName: 'Workspace Setup', action: 'input', description: 'Configure workspace/organization' },
      { order: 5, screenName: 'Feature Tour', action: 'navigate', description: 'Guided product walkthrough' },
      { order: 6, screenName: 'First Action', action: 'click', description: 'Complete first meaningful action' },
    ],
    commonIssues: ['Too many steps before value', 'Unclear progress', 'Skip option missing', 'No personalization'],
  },
  {
    id: 'saas-upgrade',
    name: 'Plan Upgrade',
    description: 'Upgrading from free to paid plan',
    appTypes: ['saas'],
    priority: 'high',
    steps: [
      { order: 1, screenName: 'Current Plan', action: 'verify', description: 'Review current plan limits' },
      { order: 2, screenName: 'Plan Comparison', action: 'verify', description: 'Compare available plans' },
      { order: 3, screenName: 'Select Plan', action: 'select', description: 'Choose new plan' },
      { order: 4, screenName: 'Billing Info', action: 'input', description: 'Enter payment details' },
      { order: 5, screenName: 'Confirmation', action: 'verify', description: 'Confirm upgrade and new features' },
    ],
    commonIssues: ['Unclear value proposition', 'Hidden fees', 'No trial option', 'Difficult downgrade'],
  },

  // Social flows
  {
    id: 'social-signup-first-post',
    name: 'Sign Up to First Post',
    description: 'New user journey to first content creation',
    appTypes: ['social'],
    priority: 'critical',
    steps: [
      { order: 1, screenName: 'Sign Up', action: 'input', description: 'Create account' },
      { order: 2, screenName: 'Profile Creation', action: 'input', description: 'Set up profile and avatar' },
      { order: 3, screenName: 'Find Friends', action: 'select', description: 'Discover people to follow' },
      { order: 4, screenName: 'Feed', action: 'scroll', description: 'View initial feed' },
      { order: 5, screenName: 'Create Post', action: 'input', description: 'Create first post' },
      { order: 6, screenName: 'Post Published', action: 'verify', description: 'Confirm post is live' },
    ],
    commonIssues: ['Cold start problem', 'Unclear posting mechanics', 'Privacy concerns', 'Empty feed'],
  },

  // Fintech flows
  {
    id: 'fintech-money-transfer',
    name: 'Money Transfer',
    description: 'Send money to another person',
    appTypes: ['fintech'],
    priority: 'critical',
    steps: [
      { order: 1, screenName: 'Home/Dashboard', action: 'click', description: 'Initiate transfer' },
      { order: 2, screenName: 'Select Recipient', action: 'select', description: 'Choose or add recipient' },
      { order: 3, screenName: 'Enter Amount', action: 'input', description: 'Specify transfer amount' },
      { order: 4, screenName: 'Review Transfer', action: 'verify', description: 'Review fees and details' },
      { order: 5, screenName: 'Authenticate', action: 'authenticate', description: 'Confirm with PIN/biometrics' },
      { order: 6, screenName: 'Confirmation', action: 'verify', description: 'Transfer complete with receipt' },
    ],
    commonIssues: ['Hidden fees', 'Unclear exchange rates', 'Slow confirmation', 'Weak security feedback'],
  },

  // Authentication flows (universal)
  {
    id: 'auth-login',
    name: 'Login Flow',
    description: 'Standard authentication flow',
    appTypes: ['saas', 'ecommerce', 'social', 'fintech', 'healthcare', 'education', 'productivity'],
    priority: 'critical',
    steps: [
      { order: 1, screenName: 'Login Screen', action: 'input', description: 'Enter credentials' },
      { order: 2, screenName: '2FA (if enabled)', action: 'input', description: 'Enter verification code' },
      { order: 3, screenName: 'Dashboard/Home', action: 'verify', description: 'Successfully logged in' },
    ],
    commonIssues: ['Poor error messages', 'No password visibility toggle', 'Missing SSO options', 'No remember me'],
  },
  {
    id: 'auth-password-reset',
    name: 'Password Reset',
    description: 'Recover account access',
    appTypes: ['saas', 'ecommerce', 'social', 'fintech', 'healthcare', 'education', 'productivity'],
    priority: 'high',
    steps: [
      { order: 1, screenName: 'Forgot Password', action: 'input', description: 'Enter email address' },
      { order: 2, screenName: 'Check Email', action: 'verify', description: 'Email sent confirmation' },
      { order: 3, screenName: 'Reset Password', action: 'input', description: 'Enter new password' },
      { order: 4, screenName: 'Success', action: 'verify', description: 'Password updated confirmation' },
    ],
    commonIssues: ['Unclear instructions', 'Email deliverability', 'Weak password requirements', 'No session invalidation'],
  },

  // Settings/Profile flows (universal)
  {
    id: 'settings-profile-update',
    name: 'Profile Update',
    description: 'Edit user profile information',
    appTypes: ['saas', 'social', 'ecommerce', 'fintech', 'healthcare', 'education'],
    priority: 'medium',
    steps: [
      { order: 1, screenName: 'Profile View', action: 'navigate', description: 'View current profile' },
      { order: 2, screenName: 'Edit Profile', action: 'click', description: 'Enter edit mode' },
      { order: 3, screenName: 'Update Fields', action: 'input', description: 'Modify profile information' },
      { order: 4, screenName: 'Save Changes', action: 'submit', description: 'Save updated profile' },
      { order: 5, screenName: 'Confirmation', action: 'verify', description: 'Changes saved successfully' },
    ],
    commonIssues: ['No unsaved changes warning', 'Unclear required fields', 'Poor image upload', 'No preview'],
  },
];

/**
 * Get suggested flows for an app type
 */
export function getSuggestedFlows(appType: AppType): FlowTemplate[] {
  return FLOW_TEMPLATES
    .filter(template => template.appTypes.includes(appType) || appType === 'unknown')
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

/**
 * Get all critical flows (should always be tested)
 */
export function getCriticalFlows(): FlowTemplate[] {
  return FLOW_TEMPLATES.filter(template => template.priority === 'critical');
}

// =============================================================================
// NATURAL LANGUAGE FLOW PARSING
// =============================================================================

/**
 * Action keywords for parsing
 */
const ACTION_KEYWORDS: Record<FlowActionType, string[]> = {
  navigate: ['go to', 'navigate', 'open', 'visit', 'access', 'enter'],
  click: ['click', 'tap', 'press', 'select', 'choose'],
  input: ['enter', 'type', 'fill', 'input', 'write'],
  scroll: ['scroll', 'browse', 'look through', 'explore'],
  swipe: ['swipe', 'slide'],
  wait: ['wait', 'loading', 'processing'],
  verify: ['see', 'view', 'check', 'confirm', 'review', 'verify'],
  submit: ['submit', 'send', 'complete', 'finish'],
  select: ['select', 'pick', 'choose'],
  upload: ['upload', 'attach', 'add file'],
  authenticate: ['login', 'sign in', 'authenticate', 'verify identity'],
};

/**
 * Detect action type from description
 */
function detectActionType(description: string): FlowActionType {
  const lower = description.toLowerCase();

  for (const [action, keywords] of Object.entries(ACTION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return action as FlowActionType;
      }
    }
  }

  return 'navigate'; // Default action
}

/**
 * Parse natural language flow description into structured flow
 *
 * Supports formats:
 * - "user logs in -> navigates to settings -> changes password"
 * - "1. Login 2. Dashboard 3. Profile"
 * - "login, then go to settings, then update profile"
 */
export function parseNaturalLanguageFlow(input: string): NaturalLanguageFlowInput {
  const steps: string[] = [];

  // Try different delimiters
  let rawSteps: string[] = [];

  // Check for arrow notation
  if (input.includes('->') || input.includes('→')) {
    rawSteps = input.split(/\s*(?:->|→)\s*/);
  }
  // Check for numbered list
  else if (/\d+\.\s/.test(input)) {
    rawSteps = input.split(/\d+\.\s*/).filter(Boolean);
  }
  // Check for "then" notation
  else if (input.toLowerCase().includes(' then ')) {
    rawSteps = input.split(/\s+then\s+/i);
  }
  // Check for comma separation
  else if (input.includes(',')) {
    rawSteps = input.split(/\s*,\s*/);
  }
  // Check for newlines
  else if (input.includes('\n')) {
    rawSteps = input.split(/\n+/).filter(Boolean);
  }
  // Single step
  else {
    rawSteps = [input];
  }

  // Clean up steps
  for (const step of rawSteps) {
    const cleaned = step.trim();
    if (cleaned.length > 0) {
      steps.push(cleaned);
    }
  }

  // Detect app type from all steps
  const appType = detectAppType(steps.join(' '));

  // Calculate confidence
  const confidence = steps.length >= 2 ? 0.8 : 0.5;

  return {
    rawInput: input,
    parsedSteps: steps,
    inferredAppType: appType,
    confidence,
  };
}

/**
 * Convert parsed natural language to FlowDefinition
 */
export function createFlowFromNaturalLanguage(
  input: NaturalLanguageFlowInput,
  flowName?: string
): FlowDefinition {
  const steps: FlowStep[] = input.parsedSteps.map((description, index) => ({
    id: `step-${index + 1}`,
    order: index + 1,
    screenName: extractScreenName(description),
    action: detectActionType(description),
    description,
    transitionFrom: index > 0 ? `step-${index}` : undefined,
    transitionTo: index < input.parsedSteps.length - 1 ? `step-${index + 2}` : undefined,
  }));

  return {
    id: `flow-${Date.now()}`,
    name: flowName || generateFlowName(input.parsedSteps),
    description: input.rawInput,
    appType: input.inferredAppType,
    steps,
    totalScreens: steps.length,
    criticalPath: true,
  };
}

/**
 * Extract screen name from step description
 */
function extractScreenName(description: string): string {
  // Remove common action words to get the screen/page name
  let screenName = description
    .replace(/^(user\s+)?/i, '')
    .replace(/^(go(es)?\s+to|navigate(s)?\s+to|open(s)?|visit(s)?|access(es)?)\s+/i, '')
    .replace(/^(click(s)?|tap(s)?|press(es)?)\s+(on\s+)?/i, '')
    .replace(/^(enter(s)?|type(s)?|fill(s)?(\s+in)?)\s+/i, '')
    .replace(/\s+(screen|page|view|section)$/i, '')
    .trim();

  // Capitalize first letter of each word
  screenName = screenName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return screenName || 'Unknown Screen';
}

/**
 * Generate a flow name from steps
 */
function generateFlowName(steps: string[]): string {
  if (steps.length === 0) return 'Custom Flow';
  if (steps.length === 1) return `${extractScreenName(steps[0])} Flow`;

  const first = extractScreenName(steps[0]);
  const last = extractScreenName(steps[steps.length - 1]);

  return `${first} to ${last}`;
}

// =============================================================================
// FLOW STEP UTILITIES
// =============================================================================

/**
 * Generate unique step ID
 */
export function generateStepId(flowId: string, order: number): string {
  return `${flowId}-step-${order}`;
}

/**
 * Create a flow step from template step
 */
export function createStepFromTemplate(
  templateStep: Omit<FlowStep, 'id' | 'screenshotPath' | 'issues' | 'scores'>,
  flowId: string
): FlowStep {
  return {
    ...templateStep,
    id: generateStepId(flowId, templateStep.order),
  };
}

/**
 * Create a complete flow from a template
 */
export function createFlowFromTemplate(template: FlowTemplate, customName?: string): FlowDefinition {
  const flowId = `flow-${Date.now()}`;

  return {
    id: flowId,
    name: customName || template.name,
    description: template.description,
    appType: template.appTypes[0],
    steps: template.steps.map(step => createStepFromTemplate(step, flowId)),
    totalScreens: template.steps.length,
    criticalPath: template.priority === 'critical',
    tags: template.commonIssues,
  };
}

/**
 * Validate flow definition
 */
export function validateFlowDefinition(flow: FlowDefinition): string[] {
  const errors: string[] = [];

  if (!flow.name || flow.name.trim().length === 0) {
    errors.push('Flow name is required');
  }

  if (!flow.steps || flow.steps.length === 0) {
    errors.push('Flow must have at least one step');
  }

  if (flow.steps) {
    const orders = flow.steps.map(s => s.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      errors.push('Flow steps must have unique order numbers');
    }

    for (const step of flow.steps) {
      if (!step.screenName || step.screenName.trim().length === 0) {
        errors.push(`Step ${step.order} is missing a screen name`);
      }
    }
  }

  return errors;
}

/**
 * Sort flow steps by order
 */
export function sortFlowSteps(steps: FlowStep[]): FlowStep[] {
  return [...steps].sort((a, b) => a.order - b.order);
}

/**
 * Get step by ID
 */
export function getStepById(flow: FlowDefinition, stepId: string): FlowStep | undefined {
  return flow.steps.find(step => step.id === stepId);
}

/**
 * Get next step in flow
 */
export function getNextStep(flow: FlowDefinition, currentStepId: string): FlowStep | undefined {
  const currentStep = getStepById(flow, currentStepId);
  if (!currentStep) return undefined;

  return flow.steps.find(step => step.order === currentStep.order + 1);
}

/**
 * Get previous step in flow
 */
export function getPreviousStep(flow: FlowDefinition, currentStepId: string): FlowStep | undefined {
  const currentStep = getStepById(flow, currentStepId);
  if (!currentStep || currentStep.order <= 1) return undefined;

  return flow.steps.find(step => step.order === currentStep.order - 1);
}

// =============================================================================
// FLOW FORMATTING
// =============================================================================

/**
 * Format flow as markdown journey map
 */
export function formatFlowAsJourneyMap(flow: FlowDefinition): string {
  const sortedSteps = sortFlowSteps(flow.steps);
  const lines: string[] = [
    `## 🗺️ Journey Map: ${flow.name}`,
    '',
    `**App Type:** ${flow.appType}`,
    `**Total Screens:** ${flow.totalScreens}`,
    `**Critical Path:** ${flow.criticalPath ? 'Yes' : 'No'}`,
    '',
    '```',
  ];

  for (let i = 0; i < sortedSteps.length; i++) {
    const step = sortedSteps[i];
    const isLast = i === sortedSteps.length - 1;

    lines.push(`[${step.order}] ${step.screenName}`);
    lines.push(`    Action: ${step.action}`);
    lines.push(`    ${step.description}`);

    if (!isLast) {
      lines.push('        │');
      lines.push('        ▼');
    }
  }

  lines.push('```');

  return lines.join('\n');
}

/**
 * Format flow steps as numbered list
 */
export function formatFlowAsStepList(flow: FlowDefinition): string {
  const sortedSteps = sortFlowSteps(flow.steps);

  return sortedSteps
    .map(step => `${step.order}. **${step.screenName}** - ${step.description}`)
    .join('\n');
}
