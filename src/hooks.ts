/**
 * Claude Roaster - Hooks System
 * Lifecycle hooks for roast session events
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { RoastSession, RoastIteration } from './types.js';

// =============================================================================
// HOOK EVENT TYPES
// =============================================================================

/**
 * Hook event names
 */
export type HookEvent =
  | 'onSessionStart'
  | 'onIterationStart'
  | 'onIterationComplete'
  | 'onReportGenerated'
  | 'onSessionComplete';

/**
 * Hook event data payloads
 */
export interface HookEventData {
  onSessionStart: {
    session: RoastSession;
    timestamp: Date;
  };
  onIterationStart: {
    session: RoastSession;
    iterationNumber: number;
    timestamp: Date;
  };
  onIterationComplete: {
    session: RoastSession;
    iteration: RoastIteration;
    timestamp: Date;
  };
  onReportGenerated: {
    session: RoastSession;
    reportPath: string;
    iterationNumber: number;
    timestamp: Date;
  };
  onSessionComplete: {
    session: RoastSession;
    duration: number;
    timestamp: Date;
  };
}

/**
 * Hook handler function type
 */
export type HookHandler<T extends HookEvent = HookEvent> = (
  data: HookEventData[T]
) => void | Promise<void>;

/**
 * Hook configuration from hooks.json
 */
export interface HookConfig {
  event: HookEvent;
  handler: string; // Path to handler module or inline code
  enabled: boolean;
  description?: string;
}

/**
 * Hook registry structure
 */
export interface HookRegistry {
  description: string;
  hooks: Record<HookEvent, HookConfig[]>;
}

// =============================================================================
// HOOK MANAGER
// =============================================================================

/**
 * Hook manager class for loading and executing hooks
 */
export class HookManager {
  private handlers: Map<HookEvent, HookHandler[]> = new Map();
  private hooksPath: string;

  constructor(projectRoot: string = process.cwd()) {
    this.hooksPath = join(projectRoot, 'hooks', 'hooks.json');
    this.loadHooks();
  }

  /**
   * Load hooks from hooks.json
   */
  private loadHooks(): void {
    if (!existsSync(this.hooksPath)) {
      console.warn(`No hooks configuration found at ${this.hooksPath}`);
      return;
    }

    try {
      const fileContent = readFileSync(this.hooksPath, 'utf-8');
      const registry: HookRegistry = JSON.parse(fileContent);

      // Register handlers for each hook event
      for (const [event, configs] of Object.entries(registry.hooks)) {
        const handlers: HookHandler[] = [];

        for (const config of configs) {
          if (!config.enabled) continue;

          // For now, we'll use default no-op handlers
          // In the future, this could load external modules
          handlers.push(this.createDefaultHandler(event as HookEvent, config));
        }

        if (handlers.length > 0) {
          this.handlers.set(event as HookEvent, handlers);
        }
      }
    } catch (error) {
      console.warn(`Failed to load hooks: ${error}`);
    }
  }

  /**
   * Create a default logging handler for a hook
   */
  private createDefaultHandler(event: HookEvent, config: HookConfig): HookHandler {
    return async (data: any) => {
      console.log(`[Hook: ${event}] ${config.description || 'Executing hook'}`);
      // Default implementation: just log the event
      // Users can extend this by providing custom handler modules
    };
  }

  /**
   * Register a custom hook handler programmatically
   *
   * @param event - Hook event name
   * @param handler - Handler function
   */
  public register<T extends HookEvent>(event: T, handler: HookHandler<T>): void {
    const existing = this.handlers.get(event) || [];
    this.handlers.set(event, [...existing, handler as HookHandler]);
  }

  /**
   * Execute all handlers for a specific hook event
   *
   * @param event - Hook event name
   * @param data - Event data payload
   */
  public async execute<T extends HookEvent>(
    event: T,
    data: HookEventData[T]
  ): Promise<void> {
    const handlers = this.handlers.get(event) || [];

    if (handlers.length === 0) {
      return;
    }

    // Execute all handlers in parallel
    await Promise.all(
      handlers.map(handler =>
        Promise.resolve(handler(data as any)).catch(error => {
          console.error(`Hook handler error for ${event}:`, error);
        })
      )
    );
  }

  /**
   * Check if any handlers are registered for an event
   *
   * @param event - Hook event name
   * @returns True if handlers exist
   */
  public hasHandlers(event: HookEvent): boolean {
    const handlers = this.handlers.get(event);
    return !!handlers && handlers.length > 0;
  }

  /**
   * Get count of registered handlers for an event
   *
   * @param event - Hook event name
   * @returns Number of handlers
   */
  public getHandlerCount(event: HookEvent): number {
    return this.handlers.get(event)?.length || 0;
  }

  /**
   * Clear all handlers for an event
   *
   * @param event - Hook event name
   */
  public clearHandlers(event: HookEvent): void {
    this.handlers.delete(event);
  }

  /**
   * Clear all handlers
   */
  public clearAll(): void {
    this.handlers.clear();
  }
}

// =============================================================================
// DEFAULT HOOK IMPLEMENTATIONS
// =============================================================================

/**
 * Default onSessionStart handler - logs session initialization
 */
export const defaultSessionStartHandler: HookHandler<'onSessionStart'> = async (data) => {
  console.log('\n=== Roast Session Started ===');
  console.log(`Session ID: ${data.session.id}`);
  console.log(`Target: ${data.session.config.target}`);
  console.log(`Iterations: ${data.session.config.iterations}`);
  console.log(`Fix Mode: ${data.session.config.fixMode}`);
  console.log(`Focus: ${data.session.config.focusAreas.join(', ') || 'all'}`);
  console.log('============================\n');
};

/**
 * Default onIterationStart handler - logs iteration start
 */
export const defaultIterationStartHandler: HookHandler<'onIterationStart'> = async (data) => {
  console.log(`\n>>> Starting Iteration ${data.iterationNumber}/${data.session.config.iterations}`);
};

/**
 * Default onIterationComplete handler - logs iteration summary
 */
export const defaultIterationCompleteHandler: HookHandler<'onIterationComplete'> = async (data) => {
  console.log(`\n<<< Iteration ${data.iteration.number} Complete`);
  console.log(`Issues found: ${data.iteration.issues.length}`);
  console.log(`Fixes applied: ${data.iteration.fixesApplied.length}`);
  console.log(`Overall score: ${data.iteration.scores.overall}/10`);
};

/**
 * Default onReportGenerated handler - logs report path
 */
export const defaultReportGeneratedHandler: HookHandler<'onReportGenerated'> = async (data) => {
  console.log(`\n📄 Report generated: ${data.reportPath}`);
};

/**
 * Default onSessionComplete handler - logs session summary
 */
export const defaultSessionCompleteHandler: HookHandler<'onSessionComplete'> = async (data) => {
  const durationMinutes = Math.round(data.duration / 1000 / 60);
  console.log('\n=== Roast Session Complete ===');
  console.log(`Session ID: ${data.session.id}`);
  console.log(`Duration: ${durationMinutes} minutes`);
  console.log(`Iterations: ${data.session.iterations.length}`);
  console.log(`Status: ${data.session.status}`);
  console.log('==============================\n');
};

// =============================================================================
// HOOK UTILITIES
// =============================================================================

/**
 * Create a hook manager instance with default handlers
 *
 * @param projectRoot - Project root directory
 * @param includeDefaults - Whether to register default handlers
 * @returns Configured hook manager
 */
export function createHookManager(
  projectRoot: string = process.cwd(),
  includeDefaults: boolean = true
): HookManager {
  const manager = new HookManager(projectRoot);

  if (includeDefaults) {
    manager.register('onSessionStart', defaultSessionStartHandler);
    manager.register('onIterationStart', defaultIterationStartHandler);
    manager.register('onIterationComplete', defaultIterationCompleteHandler);
    manager.register('onReportGenerated', defaultReportGeneratedHandler);
    manager.register('onSessionComplete', defaultSessionCompleteHandler);
  }

  return manager;
}

/**
 * Get all available hook events with descriptions
 *
 * @returns Array of hook event information
 */
export function getAvailableHooks(): Array<{ event: HookEvent; description: string }> {
  return [
    {
      event: 'onSessionStart',
      description: 'Triggered before the roast session begins',
    },
    {
      event: 'onIterationStart',
      description: 'Triggered before each roast iteration starts',
    },
    {
      event: 'onIterationComplete',
      description: 'Triggered after each roast iteration completes',
    },
    {
      event: 'onReportGenerated',
      description: 'Triggered after a report markdown file is written',
    },
    {
      event: 'onSessionComplete',
      description: 'Triggered after all iterations are done and session ends',
    },
  ];
}

/**
 * Validate hook configuration
 *
 * @param config - Hook configuration to validate
 * @returns Array of error messages (empty if valid)
 */
export function validateHookConfig(config: HookConfig): string[] {
  const errors: string[] = [];

  const validEvents: HookEvent[] = [
    'onSessionStart',
    'onIterationStart',
    'onIterationComplete',
    'onReportGenerated',
    'onSessionComplete',
  ];

  if (!validEvents.includes(config.event)) {
    errors.push(`Invalid event: ${config.event}. Must be one of: ${validEvents.join(', ')}`);
  }

  if (typeof config.enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }

  if (!config.handler || typeof config.handler !== 'string') {
    errors.push('handler must be a non-empty string');
  }

  return errors;
}
