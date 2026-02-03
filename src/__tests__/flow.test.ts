/**
 * Flow Module Tests
 * Comprehensive tests for user flow parsing, templates, and utilities
 */

import { describe, it, expect } from 'vitest';
import {
  detectAppType,
  getSuggestedFlows,
  getCriticalFlows,
  parseNaturalLanguageFlow,
  createFlowFromNaturalLanguage,
  generateStepId,
  createStepFromTemplate,
  createFlowFromTemplate,
  validateFlowDefinition,
  sortFlowSteps,
  getStepById,
  getNextStep,
  getPreviousStep,
  formatFlowAsJourneyMap,
  formatFlowAsStepList,
  FLOW_TEMPLATES,
} from '../flow.js';
import type { FlowStep, FlowDefinition } from '../types.js';

// =============================================================================
// APP TYPE DETECTION
// =============================================================================

describe('detectAppType', () => {
  it('detects ecommerce apps', () => {
    expect(detectAppType('shopping cart checkout')).toBe('ecommerce');
    expect(detectAppType('product listing page')).toBe('ecommerce');
    expect(detectAppType('add to cart button')).toBe('ecommerce');
    expect(detectAppType('order confirmation')).toBe('ecommerce');
  });

  it('detects saas apps', () => {
    expect(detectAppType('user dashboard settings')).toBe('saas');
    expect(detectAppType('subscription billing')).toBe('saas');
    expect(detectAppType('team workspace admin')).toBe('saas');
    expect(detectAppType('api key management')).toBe('saas');
  });

  it('detects social apps', () => {
    expect(detectAppType('user profile feed')).toBe('social');
    expect(detectAppType('post comment share')).toBe('social');
    expect(detectAppType('follow friend message')).toBe('social');
  });

  it('detects fintech apps', () => {
    expect(detectAppType('account balance transfer')).toBe('fintech');
    expect(detectAppType('bank transaction history')).toBe('fintech');
    expect(detectAppType('payment card management')).toBe('fintech');
  });

  it('detects healthcare apps', () => {
    expect(detectAppType('patient appointment booking')).toBe('healthcare');
    expect(detectAppType('doctor prescription records')).toBe('healthcare');
    expect(detectAppType('medical health portal')).toBe('healthcare');
  });

  it('detects education apps', () => {
    expect(detectAppType('course lesson quiz')).toBe('education');
    expect(detectAppType('student grade assignment')).toBe('education');
    expect(detectAppType('learning class schedule')).toBe('education');
  });

  it('detects media apps', () => {
    expect(detectAppType('video streaming playlist')).toBe('media');
    expect(detectAppType('watch episode channel')).toBe('media');
    expect(detectAppType('subscribe to channel')).toBe('media');
  });

  it('detects productivity apps', () => {
    expect(detectAppType('task project calendar')).toBe('productivity');
    expect(detectAppType('note reminder schedule')).toBe('productivity');
    expect(detectAppType('collaborate on project')).toBe('productivity');
  });

  it('detects marketplace apps', () => {
    expect(detectAppType('listing seller buyer')).toBe('marketplace');
    expect(detectAppType('bid auction review')).toBe('marketplace');
    expect(detectAppType('seller rating review')).toBe('marketplace');
  });

  it('detects gaming apps', () => {
    expect(detectAppType('play level score')).toBe('gaming');
    expect(detectAppType('achievement leaderboard')).toBe('gaming');
    expect(detectAppType('character inventory')).toBe('gaming');
  });

  it('returns unknown for unrecognized apps', () => {
    expect(detectAppType('random text here')).toBe('unknown');
    expect(detectAppType('')).toBe('unknown');
    expect(detectAppType('xyz abc 123')).toBe('unknown');
  });

  it('is case insensitive', () => {
    expect(detectAppType('SHOPPING CART')).toBe('ecommerce');
    expect(detectAppType('Dashboard Settings')).toBe('saas');
  });
});

// =============================================================================
// FLOW TEMPLATES
// =============================================================================

describe('FLOW_TEMPLATES', () => {
  it('has templates defined', () => {
    expect(FLOW_TEMPLATES.length).toBeGreaterThan(0);
  });

  it('all templates have required fields', () => {
    for (const template of FLOW_TEMPLATES) {
      expect(template.id).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.description).toBeDefined();
      expect(template.appTypes.length).toBeGreaterThan(0);
      expect(template.steps.length).toBeGreaterThan(0);
      expect(template.priority).toMatch(/^(critical|high|medium|low)$/);
    }
  });

  it('all template steps have required fields', () => {
    for (const template of FLOW_TEMPLATES) {
      for (const step of template.steps) {
        expect(step.order).toBeGreaterThan(0);
        expect(step.screenName).toBeDefined();
        expect(step.action).toBeDefined();
        expect(step.description).toBeDefined();
      }
    }
  });
});

describe('getSuggestedFlows', () => {
  it('returns flows for ecommerce', () => {
    const flows = getSuggestedFlows('ecommerce');
    expect(flows.length).toBeGreaterThan(0);
    expect(flows.some(f => f.appTypes.includes('ecommerce'))).toBe(true);
  });

  it('returns flows for saas', () => {
    const flows = getSuggestedFlows('saas');
    expect(flows.length).toBeGreaterThan(0);
  });

  it('returns all flows for unknown app type', () => {
    const flows = getSuggestedFlows('unknown');
    expect(flows.length).toBeGreaterThan(0);
  });

  it('sorts by priority (critical first)', () => {
    const flows = getSuggestedFlows('ecommerce');
    const criticalIndex = flows.findIndex(f => f.priority === 'critical');
    const lowIndex = flows.findIndex(f => f.priority === 'low');

    if (criticalIndex !== -1 && lowIndex !== -1) {
      expect(criticalIndex).toBeLessThan(lowIndex);
    }
  });
});

describe('getCriticalFlows', () => {
  it('returns only critical flows', () => {
    const flows = getCriticalFlows();
    expect(flows.length).toBeGreaterThan(0);
    expect(flows.every(f => f.priority === 'critical')).toBe(true);
  });
});

// =============================================================================
// NATURAL LANGUAGE PARSING
// =============================================================================

describe('parseNaturalLanguageFlow', () => {
  it('parses arrow notation', () => {
    const result = parseNaturalLanguageFlow('login -> dashboard -> settings');
    expect(result.parsedSteps).toEqual(['login', 'dashboard', 'settings']);
  });

  it('parses unicode arrow notation', () => {
    const result = parseNaturalLanguageFlow('login → dashboard → settings');
    expect(result.parsedSteps).toEqual(['login', 'dashboard', 'settings']);
  });

  it('parses numbered list', () => {
    const result = parseNaturalLanguageFlow('1. Login 2. Dashboard 3. Settings');
    expect(result.parsedSteps).toEqual(['Login', 'Dashboard', 'Settings']);
  });

  it('parses "then" notation', () => {
    const result = parseNaturalLanguageFlow('login then dashboard then settings');
    expect(result.parsedSteps).toEqual(['login', 'dashboard', 'settings']);
  });

  it('parses comma separated', () => {
    const result = parseNaturalLanguageFlow('login, dashboard, settings');
    expect(result.parsedSteps).toEqual(['login', 'dashboard', 'settings']);
  });

  it('parses newline separated', () => {
    const result = parseNaturalLanguageFlow('login\ndashboard\nsettings');
    expect(result.parsedSteps).toEqual(['login', 'dashboard', 'settings']);
  });

  it('handles single step', () => {
    const result = parseNaturalLanguageFlow('login screen');
    expect(result.parsedSteps).toEqual(['login screen']);
  });

  it('infers app type from content', () => {
    const ecommerce = parseNaturalLanguageFlow('cart -> checkout -> payment');
    expect(ecommerce.inferredAppType).toBe('ecommerce');

    const saas = parseNaturalLanguageFlow('dashboard -> settings -> billing');
    expect(saas.inferredAppType).toBe('saas');
  });

  it('sets confidence based on step count', () => {
    const single = parseNaturalLanguageFlow('login');
    expect(single.confidence).toBe(0.5);

    const multi = parseNaturalLanguageFlow('login -> dashboard -> settings');
    expect(multi.confidence).toBe(0.8);
  });

  it('preserves raw input', () => {
    const input = 'login -> dashboard -> settings';
    const result = parseNaturalLanguageFlow(input);
    expect(result.rawInput).toBe(input);
  });

  it('trims whitespace from steps', () => {
    const result = parseNaturalLanguageFlow('  login  ->  dashboard  ->  settings  ');
    expect(result.parsedSteps).toEqual(['login', 'dashboard', 'settings']);
  });

  it('filters empty steps', () => {
    const result = parseNaturalLanguageFlow('login -> -> dashboard');
    expect(result.parsedSteps).toEqual(['login', 'dashboard']);
  });
});

describe('createFlowFromNaturalLanguage', () => {
  it('creates flow definition from parsed input', () => {
    const input = parseNaturalLanguageFlow('login -> dashboard -> settings');
    const flow = createFlowFromNaturalLanguage(input);

    expect(flow.id).toBeDefined();
    expect(flow.steps.length).toBe(3);
    expect(flow.totalScreens).toBe(3);
    expect(flow.appType).toBe(input.inferredAppType);
  });

  it('uses custom name when provided', () => {
    const input = parseNaturalLanguageFlow('login -> dashboard');
    const flow = createFlowFromNaturalLanguage(input, 'My Custom Flow');

    expect(flow.name).toBe('My Custom Flow');
  });

  it('generates name from steps when not provided', () => {
    const input = parseNaturalLanguageFlow('login -> dashboard');
    const flow = createFlowFromNaturalLanguage(input);

    expect(flow.name).toContain('Login');
    expect(flow.name).toContain('Dashboard');
  });

  it('sets step order correctly', () => {
    const input = parseNaturalLanguageFlow('a -> b -> c');
    const flow = createFlowFromNaturalLanguage(input);

    expect(flow.steps[0].order).toBe(1);
    expect(flow.steps[1].order).toBe(2);
    expect(flow.steps[2].order).toBe(3);
  });

  it('sets transition references', () => {
    const input = parseNaturalLanguageFlow('a -> b -> c');
    const flow = createFlowFromNaturalLanguage(input);

    expect(flow.steps[0].transitionFrom).toBeUndefined();
    expect(flow.steps[0].transitionTo).toBeDefined();
    expect(flow.steps[1].transitionFrom).toBeDefined();
    expect(flow.steps[1].transitionTo).toBeDefined();
    expect(flow.steps[2].transitionFrom).toBeDefined();
    expect(flow.steps[2].transitionTo).toBeUndefined();
  });

  it('detects action types from descriptions', () => {
    const input = parseNaturalLanguageFlow('click login -> enter password -> submit form');
    const flow = createFlowFromNaturalLanguage(input);

    expect(flow.steps[0].action).toBe('click');
    // 'enter password' maps to navigate (default) as 'enter' alone isn't keyword for input
    expect(flow.steps[1].action).toBe('navigate');
    expect(flow.steps[2].action).toBe('submit');
  });

  it('extracts screen names from action descriptions', () => {
    const input = parseNaturalLanguageFlow('go to login page -> navigate to dashboard');
    const flow = createFlowFromNaturalLanguage(input);

    // Screen names are derived from the raw step text, capitalized
    expect(flow.steps[0].screenName).toBe('Login');
    expect(flow.steps[1].screenName).toBe('Dashboard');
  });
});

// =============================================================================
// FLOW STEP UTILITIES
// =============================================================================

describe('generateStepId', () => {
  it('generates unique step ID', () => {
    const id1 = generateStepId('flow-1', 1);
    const id2 = generateStepId('flow-1', 2);
    const id3 = generateStepId('flow-2', 1);

    expect(id1).not.toBe(id2);
    expect(id1).not.toBe(id3);
    expect(id1).toContain('flow-1');
    expect(id1).toContain('1');
  });
});

describe('createStepFromTemplate', () => {
  it('creates step with generated ID', () => {
    const templateStep = {
      order: 1,
      screenName: 'Login',
      action: 'input' as const,
      description: 'Enter credentials',
    };

    const step = createStepFromTemplate(templateStep, 'flow-123');

    expect(step.id).toContain('flow-123');
    expect(step.order).toBe(1);
    expect(step.screenName).toBe('Login');
  });
});

describe('createFlowFromTemplate', () => {
  it('creates flow from template', () => {
    const template = FLOW_TEMPLATES[0];
    const flow = createFlowFromTemplate(template);

    expect(flow.id).toBeDefined();
    expect(flow.name).toBe(template.name);
    expect(flow.description).toBe(template.description);
    expect(flow.steps.length).toBe(template.steps.length);
  });

  it('uses custom name when provided', () => {
    const template = FLOW_TEMPLATES[0];
    const flow = createFlowFromTemplate(template, 'Custom Name');

    expect(flow.name).toBe('Custom Name');
  });

  it('assigns unique IDs to steps', () => {
    const template = FLOW_TEMPLATES[0];
    const flow = createFlowFromTemplate(template);

    const ids = flow.steps.map(s => s.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('validateFlowDefinition', () => {
  const validFlow: FlowDefinition = {
    id: 'test-flow',
    name: 'Test Flow',
    description: 'A test flow',
    appType: 'saas',
    steps: [
      { id: 'step-1', order: 1, screenName: 'Login', action: 'input', description: 'Login' },
      { id: 'step-2', order: 2, screenName: 'Dashboard', action: 'verify', description: 'Dashboard' },
    ],
    totalScreens: 2,
    criticalPath: true,
  };

  it('returns no errors for valid flow', () => {
    const errors = validateFlowDefinition(validFlow);
    expect(errors).toHaveLength(0);
  });

  it('returns error for missing name', () => {
    const flow = { ...validFlow, name: '' };
    const errors = validateFlowDefinition(flow);
    expect(errors).toContain('Flow name is required');
  });

  it('returns error for empty steps', () => {
    const flow = { ...validFlow, steps: [] };
    const errors = validateFlowDefinition(flow);
    expect(errors).toContain('Flow must have at least one step');
  });

  it('returns error for duplicate step orders', () => {
    const flow = {
      ...validFlow,
      steps: [
        { id: 'step-1', order: 1, screenName: 'A', action: 'input' as const, description: 'A' },
        { id: 'step-2', order: 1, screenName: 'B', action: 'input' as const, description: 'B' },
      ],
    };
    const errors = validateFlowDefinition(flow);
    expect(errors).toContain('Flow steps must have unique order numbers');
  });

  it('returns error for missing screen name', () => {
    const flow = {
      ...validFlow,
      steps: [
        { id: 'step-1', order: 1, screenName: '', action: 'input' as const, description: 'A' },
      ],
    };
    const errors = validateFlowDefinition(flow);
    expect(errors.some(e => e.includes('missing a screen name'))).toBe(true);
  });
});

describe('sortFlowSteps', () => {
  it('sorts steps by order', () => {
    const steps: FlowStep[] = [
      { id: '3', order: 3, screenName: 'C', action: 'verify', description: 'C' },
      { id: '1', order: 1, screenName: 'A', action: 'input', description: 'A' },
      { id: '2', order: 2, screenName: 'B', action: 'click', description: 'B' },
    ];

    const sorted = sortFlowSteps(steps);

    expect(sorted[0].order).toBe(1);
    expect(sorted[1].order).toBe(2);
    expect(sorted[2].order).toBe(3);
  });

  it('does not mutate original array', () => {
    const steps: FlowStep[] = [
      { id: '2', order: 2, screenName: 'B', action: 'click', description: 'B' },
      { id: '1', order: 1, screenName: 'A', action: 'input', description: 'A' },
    ];

    const sorted = sortFlowSteps(steps);

    expect(steps[0].order).toBe(2);
    expect(sorted[0].order).toBe(1);
  });
});

describe('getStepById', () => {
  const flow: FlowDefinition = {
    id: 'test',
    name: 'Test',
    description: 'Test',
    appType: 'saas',
    steps: [
      { id: 'step-1', order: 1, screenName: 'A', action: 'input', description: 'A' },
      { id: 'step-2', order: 2, screenName: 'B', action: 'click', description: 'B' },
    ],
    totalScreens: 2,
    criticalPath: true,
  };

  it('returns step by ID', () => {
    const step = getStepById(flow, 'step-1');
    expect(step?.screenName).toBe('A');
  });

  it('returns undefined for non-existent ID', () => {
    const step = getStepById(flow, 'non-existent');
    expect(step).toBeUndefined();
  });
});

describe('getNextStep', () => {
  const flow: FlowDefinition = {
    id: 'test',
    name: 'Test',
    description: 'Test',
    appType: 'saas',
    steps: [
      { id: 'step-1', order: 1, screenName: 'A', action: 'input', description: 'A' },
      { id: 'step-2', order: 2, screenName: 'B', action: 'click', description: 'B' },
      { id: 'step-3', order: 3, screenName: 'C', action: 'verify', description: 'C' },
    ],
    totalScreens: 3,
    criticalPath: true,
  };

  it('returns next step', () => {
    const next = getNextStep(flow, 'step-1');
    expect(next?.id).toBe('step-2');
  });

  it('returns undefined for last step', () => {
    const next = getNextStep(flow, 'step-3');
    expect(next).toBeUndefined();
  });

  it('returns undefined for non-existent step', () => {
    const next = getNextStep(flow, 'non-existent');
    expect(next).toBeUndefined();
  });
});

describe('getPreviousStep', () => {
  const flow: FlowDefinition = {
    id: 'test',
    name: 'Test',
    description: 'Test',
    appType: 'saas',
    steps: [
      { id: 'step-1', order: 1, screenName: 'A', action: 'input', description: 'A' },
      { id: 'step-2', order: 2, screenName: 'B', action: 'click', description: 'B' },
      { id: 'step-3', order: 3, screenName: 'C', action: 'verify', description: 'C' },
    ],
    totalScreens: 3,
    criticalPath: true,
  };

  it('returns previous step', () => {
    const prev = getPreviousStep(flow, 'step-2');
    expect(prev?.id).toBe('step-1');
  });

  it('returns undefined for first step', () => {
    const prev = getPreviousStep(flow, 'step-1');
    expect(prev).toBeUndefined();
  });

  it('returns undefined for non-existent step', () => {
    const prev = getPreviousStep(flow, 'non-existent');
    expect(prev).toBeUndefined();
  });
});

// =============================================================================
// FLOW FORMATTING
// =============================================================================

describe('formatFlowAsJourneyMap', () => {
  const flow: FlowDefinition = {
    id: 'test',
    name: 'Test Flow',
    description: 'Test',
    appType: 'saas',
    steps: [
      { id: 'step-1', order: 1, screenName: 'Login', action: 'input', description: 'Enter credentials' },
      { id: 'step-2', order: 2, screenName: 'Dashboard', action: 'verify', description: 'View dashboard' },
    ],
    totalScreens: 2,
    criticalPath: true,
  };

  it('includes flow name', () => {
    const map = formatFlowAsJourneyMap(flow);
    expect(map).toContain('Test Flow');
  });

  it('includes app type', () => {
    const map = formatFlowAsJourneyMap(flow);
    expect(map).toContain('saas');
  });

  it('includes all steps', () => {
    const map = formatFlowAsJourneyMap(flow);
    expect(map).toContain('Login');
    expect(map).toContain('Dashboard');
  });

  it('includes step numbers', () => {
    const map = formatFlowAsJourneyMap(flow);
    expect(map).toContain('[1]');
    expect(map).toContain('[2]');
  });
});

describe('formatFlowAsStepList', () => {
  const flow: FlowDefinition = {
    id: 'test',
    name: 'Test Flow',
    description: 'Test',
    appType: 'saas',
    steps: [
      { id: 'step-1', order: 1, screenName: 'Login', action: 'input', description: 'Enter credentials' },
      { id: 'step-2', order: 2, screenName: 'Dashboard', action: 'verify', description: 'View dashboard' },
    ],
    totalScreens: 2,
    criticalPath: true,
  };

  it('formats as numbered list', () => {
    const list = formatFlowAsStepList(flow);
    expect(list).toContain('1.');
    expect(list).toContain('2.');
  });

  it('includes screen names in bold', () => {
    const list = formatFlowAsStepList(flow);
    expect(list).toContain('**Login**');
    expect(list).toContain('**Dashboard**');
  });

  it('includes descriptions', () => {
    const list = formatFlowAsStepList(flow);
    expect(list).toContain('Enter credentials');
    expect(list).toContain('View dashboard');
  });
});
