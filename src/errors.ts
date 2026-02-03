/**
 * Claude Roaster - Error Classes
 * Custom error types for comprehensive error handling and debugging
 */

// =============================================================================
// BASE ERROR CLASS
// =============================================================================

/**
 * Base error class for all Roaster errors
 */
export class RoasterError extends Error {
  /**
   * Unique error code for programmatic handling
   */
  readonly code: string;

  /**
   * Additional error details
   */
  readonly details?: Record<string, unknown>;

  /**
   * Whether this error is recoverable
   */
  readonly recoverable: boolean;

  /**
   * Original error that caused this error (if any)
   */
  readonly cause?: Error;

  constructor(
    message: string,
    options: {
      code: string;
      details?: Record<string, unknown>;
      recoverable?: boolean;
      cause?: Error;
    }
  ) {
    super(message);
    this.name = 'RoasterError';
    this.code = options.code;
    this.details = options.details;
    this.recoverable = options.recoverable ?? false;
    this.cause = options.cause;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      recoverable: this.recoverable,
      stack: this.stack,
      cause: this.cause ? {
        name: this.cause.name,
        message: this.cause.message,
        stack: this.cause.stack,
      } : undefined,
    };
  }

  /**
   * Format error for display
   */
  toString(): string {
    let result = `${this.name} [${this.code}]: ${this.message}`;
    if (this.details && Object.keys(this.details).length > 0) {
      result += `\nDetails: ${JSON.stringify(this.details, null, 2)}`;
    }
    if (this.cause) {
      result += `\nCaused by: ${this.cause.message}`;
    }
    return result;
  }
}

// =============================================================================
// CONFIGURATION ERRORS
// =============================================================================

/**
 * Configuration-related errors
 */
export class ConfigurationError extends RoasterError {
  constructor(
    message: string,
    options: {
      details?: Record<string, unknown>;
      recoverable?: boolean;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      code: 'CONFIG_ERROR',
      ...options,
    });
    this.name = 'ConfigurationError';
  }

  /**
   * Invalid configuration value
   */
  static invalidValue(field: string, value: unknown, expected: string): ConfigurationError {
    return new ConfigurationError(
      `Invalid configuration value for "${field}": expected ${expected}`,
      {
        details: { field, value, expected },
        recoverable: true,
      }
    );
  }

  /**
   * Missing required configuration
   */
  static missingRequired(field: string): ConfigurationError {
    return new ConfigurationError(
      `Missing required configuration: "${field}"`,
      {
        details: { field },
        recoverable: true,
      }
    );
  }

  /**
   * Configuration file not found
   */
  static fileNotFound(path: string): ConfigurationError {
    return new ConfigurationError(
      `Configuration file not found: ${path}`,
      {
        details: { path },
        recoverable: true,
      }
    );
  }

  /**
   * Configuration file parse error
   */
  static parseError(path: string, cause: Error): ConfigurationError {
    return new ConfigurationError(
      `Failed to parse configuration file: ${path}`,
      {
        details: { path },
        recoverable: false,
        cause,
      }
    );
  }
}

// =============================================================================
// SESSION ERRORS
// =============================================================================

/**
 * Session management errors
 */
export class SessionError extends RoasterError {
  constructor(
    message: string,
    options: {
      details?: Record<string, unknown>;
      recoverable?: boolean;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      code: 'SESSION_ERROR',
      ...options,
    });
    this.name = 'SessionError';
  }

  /**
   * Session not found
   */
  static notFound(sessionId: string): SessionError {
    return new SessionError(
      `Session not found: ${sessionId}`,
      {
        details: { sessionId },
        recoverable: false,
      }
    );
  }

  /**
   * Session already exists
   */
  static alreadyExists(sessionId: string): SessionError {
    return new SessionError(
      `Session already exists: ${sessionId}`,
      {
        details: { sessionId },
        recoverable: true,
      }
    );
  }

  /**
   * Session initialization failed
   */
  static initFailed(reason: string, cause?: Error): SessionError {
    return new SessionError(
      `Failed to initialize session: ${reason}`,
      {
        details: { reason },
        recoverable: false,
        cause,
      }
    );
  }

  /**
   * Session state invalid
   */
  static invalidState(expectedState: string, actualState: string): SessionError {
    return new SessionError(
      `Invalid session state: expected "${expectedState}", got "${actualState}"`,
      {
        details: { expectedState, actualState },
        recoverable: false,
      }
    );
  }

  /**
   * Maximum iterations exceeded
   */
  static maxIterationsExceeded(max: number): SessionError {
    return new SessionError(
      `Maximum iterations exceeded: ${max}`,
      {
        details: { max },
        recoverable: false,
      }
    );
  }
}

// =============================================================================
// SCREENSHOT ERRORS
// =============================================================================

/**
 * Screenshot capture errors
 */
export class ScreenshotError extends RoasterError {
  constructor(
    message: string,
    options: {
      details?: Record<string, unknown>;
      recoverable?: boolean;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      code: 'SCREENSHOT_ERROR',
      ...options,
    });
    this.name = 'ScreenshotError';
  }

  /**
   * Screenshot capture failed
   */
  static captureFailed(method: string, cause?: Error): ScreenshotError {
    return new ScreenshotError(
      `Failed to capture screenshot using method: ${method}`,
      {
        details: { method },
        recoverable: true,
        cause,
      }
    );
  }

  /**
   * Screenshot file not found
   */
  static fileNotFound(path: string): ScreenshotError {
    return new ScreenshotError(
      `Screenshot file not found: ${path}`,
      {
        details: { path },
        recoverable: false,
      }
    );
  }

  /**
   * Invalid screenshot format
   */
  static invalidFormat(path: string, expectedFormats: string[]): ScreenshotError {
    return new ScreenshotError(
      `Invalid screenshot format: ${path}. Expected one of: ${expectedFormats.join(', ')}`,
      {
        details: { path, expectedFormats },
        recoverable: false,
      }
    );
  }

  /**
   * Screenshot save failed
   */
  static saveFailed(path: string, cause?: Error): ScreenshotError {
    return new ScreenshotError(
      `Failed to save screenshot to: ${path}`,
      {
        details: { path },
        recoverable: false,
        cause,
      }
    );
  }

  /**
   * Screenshot method not available
   */
  static methodUnavailable(method: string, reason: string): ScreenshotError {
    return new ScreenshotError(
      `Screenshot method "${method}" is not available: ${reason}`,
      {
        details: { method, reason },
        recoverable: true,
      }
    );
  }
}

// =============================================================================
// ANALYSIS ERRORS
// =============================================================================

/**
 * Agent analysis errors
 */
export class AnalysisError extends RoasterError {
  constructor(
    message: string,
    options: {
      details?: Record<string, unknown>;
      recoverable?: boolean;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      code: 'ANALYSIS_ERROR',
      ...options,
    });
    this.name = 'AnalysisError';
  }

  /**
   * Agent execution failed
   */
  static agentFailed(agentId: string, cause?: Error): AnalysisError {
    return new AnalysisError(
      `Agent "${agentId}" analysis failed`,
      {
        details: { agentId },
        recoverable: true,
        cause,
      }
    );
  }

  /**
   * Invalid agent response
   */
  static invalidResponse(agentId: string, reason: string): AnalysisError {
    return new AnalysisError(
      `Agent "${agentId}" returned invalid response: ${reason}`,
      {
        details: { agentId, reason },
        recoverable: false,
      }
    );
  }

  /**
   * Agent timeout
   */
  static timeout(agentId: string, timeoutMs: number): AnalysisError {
    return new AnalysisError(
      `Agent "${agentId}" timed out after ${timeoutMs}ms`,
      {
        details: { agentId, timeoutMs },
        recoverable: true,
      }
    );
  }

  /**
   * Missing required field in response
   */
  static missingField(agentId: string, field: string): AnalysisError {
    return new AnalysisError(
      `Agent "${agentId}" response missing required field: "${field}"`,
      {
        details: { agentId, field },
        recoverable: false,
      }
    );
  }

  /**
   * Score parsing failed
   */
  static invalidScore(agentId: string, scoreValue: unknown): AnalysisError {
    return new AnalysisError(
      `Agent "${agentId}" returned invalid score value`,
      {
        details: { agentId, scoreValue },
        recoverable: false,
      }
    );
  }
}

// =============================================================================
// REPORT ERRORS
// =============================================================================

/**
 * Report generation errors
 */
export class ReportError extends RoasterError {
  constructor(
    message: string,
    options: {
      details?: Record<string, unknown>;
      recoverable?: boolean;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      code: 'REPORT_ERROR',
      ...options,
    });
    this.name = 'ReportError';
  }

  /**
   * Report generation failed
   */
  static generationFailed(reportType: string, cause?: Error): ReportError {
    return new ReportError(
      `Failed to generate ${reportType} report`,
      {
        details: { reportType },
        recoverable: false,
        cause,
      }
    );
  }

  /**
   * Report save failed
   */
  static saveFailed(path: string, cause?: Error): ReportError {
    return new ReportError(
      `Failed to save report to: ${path}`,
      {
        details: { path },
        recoverable: false,
        cause,
      }
    );
  }

  /**
   * Template not found
   */
  static templateNotFound(templateName: string): ReportError {
    return new ReportError(
      `Report template not found: ${templateName}`,
      {
        details: { templateName },
        recoverable: false,
      }
    );
  }

  /**
   * Missing required data
   */
  static missingData(field: string): ReportError {
    return new ReportError(
      `Missing required data for report: "${field}"`,
      {
        details: { field },
        recoverable: false,
      }
    );
  }

  /**
   * Invalid report format
   */
  static invalidFormat(format: string, supportedFormats: string[]): ReportError {
    return new ReportError(
      `Invalid report format: "${format}". Supported formats: ${supportedFormats.join(', ')}`,
      {
        details: { format, supportedFormats },
        recoverable: true,
      }
    );
  }
}

// =============================================================================
// VALIDATION ERRORS
// =============================================================================

/**
 * Validation error
 */
export class ValidationError extends RoasterError {
  readonly validationErrors: string[];

  constructor(
    message: string,
    validationErrors: string[],
    options: {
      details?: Record<string, unknown>;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      code: 'VALIDATION_ERROR',
      ...options,
      recoverable: true,
    });
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }

  /**
   * Create from validation error list
   */
  static fromErrors(errors: string[]): ValidationError {
    return new ValidationError(
      `Validation failed with ${errors.length} error(s)`,
      errors,
      {
        details: { errorCount: errors.length },
      }
    );
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      validationErrors: this.validationErrors,
    };
  }

  /**
   * Format for display
   */
  toString(): string {
    let result = super.toString();
    if (this.validationErrors.length > 0) {
      result += '\nValidation Errors:\n';
      result += this.validationErrors.map((err, i) => `  ${i + 1}. ${err}`).join('\n');
    }
    return result;
  }
}

// =============================================================================
// ERROR UTILITIES
// =============================================================================

/**
 * Check if an error is a RoasterError
 */
export function isRoasterError(error: unknown): error is RoasterError {
  return error instanceof RoasterError;
}

/**
 * Check if an error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  return isRoasterError(error) && error.recoverable;
}

/**
 * Extract error message from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return String(error);
}

/**
 * Extract error stack from any error type
 */
export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
}

/**
 * Create a user-friendly error message
 */
export function formatErrorForUser(error: unknown): string {
  if (isRoasterError(error)) {
    let message = `Error: ${error.message}`;

    if (error.details && Object.keys(error.details).length > 0) {
      message += '\n\nDetails:';
      for (const [key, value] of Object.entries(error.details)) {
        message += `\n  ${key}: ${JSON.stringify(value)}`;
      }
    }

    if (error.recoverable) {
      message += '\n\nThis error is recoverable. Please try again or adjust your configuration.';
    }

    return message;
  }

  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }

  return `Unknown error: ${String(error)}`;
}

/**
 * Wrap an unknown error in a RoasterError
 */
export function wrapError(error: unknown, context: string): RoasterError {
  if (isRoasterError(error)) {
    return error;
  }

  const cause = error instanceof Error ? error : undefined;
  const message = getErrorMessage(error);

  return new RoasterError(
    `${context}: ${message}`,
    {
      code: 'WRAPPED_ERROR',
      details: { context, originalError: String(error) },
      recoverable: false,
      cause,
    }
  );
}
