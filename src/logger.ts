/**
 * Claude Roaster - Logger
 * Comprehensive logging system with structured output and configurable verbosity
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

// =============================================================================
// LOG LEVEL
// =============================================================================

/**
 * Log levels in order of severity
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Log categories for structured logging
 */
export type LogCategory = 'session' | 'analysis' | 'report' | 'hook' | 'system' | 'config';

// =============================================================================
// LOG ENTRY
// =============================================================================

/**
 * Structured log entry
 */
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: Record<string, unknown>;
  error?: Error;
}

// =============================================================================
// LOGGER CONFIGURATION
// =============================================================================

/**
 * Logger configuration options
 */
export interface LoggerConfig {
  /** Minimum log level to output */
  level: LogLevel;

  /** Enable console output */
  console: boolean;

  /** Enable color-coded output for terminal */
  colors: boolean;

  /** File path for log output (optional) */
  file?: string;

  /** Include timestamps in console output */
  timestamps: boolean;

  /** Include category in console output */
  showCategory: boolean;

  /** Pretty print details object */
  prettyDetails: boolean;
}

/**
 * Default logger configuration
 */
export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  console: true,
  colors: true,
  timestamps: true,
  showCategory: true,
  prettyDetails: false,
};

// =============================================================================
// ANSI COLOR CODES
// =============================================================================

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',

  // Background colors
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
};

/**
 * Color scheme for log levels
 */
const LEVEL_COLORS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: COLORS.gray,
  [LogLevel.INFO]: COLORS.blue,
  [LogLevel.WARN]: COLORS.yellow,
  [LogLevel.ERROR]: COLORS.red,
};

/**
 * Color scheme for categories
 */
const CATEGORY_COLORS: Record<LogCategory, string> = {
  session: COLORS.magenta,
  analysis: COLORS.cyan,
  report: COLORS.green,
  hook: COLORS.yellow,
  system: COLORS.blue,
  config: COLORS.white,
};

/**
 * Log level labels
 */
const LEVEL_LABELS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO ',
  [LogLevel.WARN]: 'WARN ',
  [LogLevel.ERROR]: 'ERROR',
};

// =============================================================================
// LOGGER CLASS
// =============================================================================

/**
 * Main logger class with configurable output and formatting
 */
export class Logger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_LOGGER_CONFIG, ...config };
  }

  /**
   * Update logger configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Enable/disable colors
   */
  setColors(enabled: boolean): void {
    this.config.colors = enabled;
  }

  /**
   * Log a debug message
   */
  debug(category: LogCategory, message: string, details?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, category, message, details);
  }

  /**
   * Log an info message
   */
  info(category: LogCategory, message: string, details?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, category, message, details);
  }

  /**
   * Log a warning message
   */
  warn(category: LogCategory, message: string, details?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, category, message, details);
  }

  /**
   * Log an error message
   */
  error(category: LogCategory, message: string, error?: Error, details?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, category, message, details, error);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    details?: Record<string, unknown>,
    error?: Error
  ): void {
    // Filter by log level
    if (level < this.config.level) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      details,
      error,
    };

    // Store in buffer
    this.logBuffer.push(entry);

    // Output to console
    if (this.config.console) {
      this.outputConsole(entry);
    }

    // Output to file
    if (this.config.file) {
      this.outputFile(entry);
    }
  }

  /**
   * Format and output to console
   */
  private outputConsole(entry: LogEntry): void {
    const parts: string[] = [];

    // Timestamp
    if (this.config.timestamps) {
      const timestamp = this.formatTimestamp(entry.timestamp);
      parts.push(this.colorize(timestamp, COLORS.dim));
    }

    // Log level
    const levelLabel = LEVEL_LABELS[entry.level];
    const levelColor = LEVEL_COLORS[entry.level];
    parts.push(this.colorize(`[${levelLabel}]`, this.config.colors ? levelColor : ''));

    // Category
    if (this.config.showCategory) {
      const categoryColor = CATEGORY_COLORS[entry.category];
      parts.push(this.colorize(`[${entry.category}]`, this.config.colors ? categoryColor : ''));
    }

    // Message
    parts.push(entry.message);

    // Output the main log line
    console.log(parts.join(' '));

    // Details
    if (entry.details) {
      if (this.config.prettyDetails) {
        console.log(this.colorize(JSON.stringify(entry.details, null, 2), COLORS.dim));
      } else {
        console.log(this.colorize(JSON.stringify(entry.details), COLORS.dim));
      }
    }

    // Error
    if (entry.error) {
      console.error(this.colorize(`  ${entry.error.name}: ${entry.error.message}`, COLORS.red));
      if (entry.error.stack) {
        console.error(this.colorize(this.indent(entry.error.stack, 4), COLORS.dim));
      }
    }
  }

  /**
   * Format and output to file
   */
  private outputFile(entry: LogEntry): void {
    if (!this.config.file) return;

    try {
      // Ensure directory exists
      const dir = dirname(this.config.file);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      // Format as JSON line
      const line = JSON.stringify({
        timestamp: entry.timestamp.toISOString(),
        level: LogLevel[entry.level],
        category: entry.category,
        message: entry.message,
        details: entry.details,
        error: entry.error ? {
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack,
        } : undefined,
      }) + '\n';

      // Append to file
      writeFileSync(this.config.file, line, { flag: 'a' });
    } catch (err) {
      // Fallback to console if file write fails
      console.error('Failed to write to log file:', err);
    }
  }

  /**
   * Apply color codes to text
   */
  private colorize(text: string, color: string): string {
    if (!this.config.colors || !color) {
      return text;
    }
    return `${color}${text}${COLORS.reset}`;
  }

  /**
   * Format timestamp for display
   */
  private formatTimestamp(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
  }

  /**
   * Indent multi-line text
   */
  private indent(text: string, spaces: number): string {
    const prefix = ' '.repeat(spaces);
    return text.split('\n').map(line => prefix + line).join('\n');
  }

  /**
   * Get all log entries
   */
  getEntries(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Get log entries filtered by level
   */
  getEntriesByLevel(level: LogLevel): LogEntry[] {
    return this.logBuffer.filter(entry => entry.level === level);
  }

  /**
   * Get log entries filtered by category
   */
  getEntriesByCategory(category: LogCategory): LogEntry[] {
    return this.logBuffer.filter(entry => entry.category === category);
  }

  /**
   * Clear log buffer
   */
  clear(): void {
    this.logBuffer = [];
  }

  /**
   * Get log statistics
   */
  getStats(): Record<string, number> {
    return {
      total: this.logBuffer.length,
      debug: this.getEntriesByLevel(LogLevel.DEBUG).length,
      info: this.getEntriesByLevel(LogLevel.INFO).length,
      warn: this.getEntriesByLevel(LogLevel.WARN).length,
      error: this.getEntriesByLevel(LogLevel.ERROR).length,
    };
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

/**
 * Default global logger instance
 */
export const logger = new Logger();

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create a scoped logger with a fixed category
 */
export function createCategoryLogger(category: LogCategory, config?: Partial<LoggerConfig>): {
  debug: (message: string, details?: Record<string, unknown>) => void;
  info: (message: string, details?: Record<string, unknown>) => void;
  warn: (message: string, details?: Record<string, unknown>) => void;
  error: (message: string, error?: Error, details?: Record<string, unknown>) => void;
} {
  const scopedLogger = new Logger(config);

  return {
    debug: (message: string, details?: Record<string, unknown>) =>
      scopedLogger.debug(category, message, details),
    info: (message: string, details?: Record<string, unknown>) =>
      scopedLogger.info(category, message, details),
    warn: (message: string, details?: Record<string, unknown>) =>
      scopedLogger.warn(category, message, details),
    error: (message: string, error?: Error, details?: Record<string, unknown>) =>
      scopedLogger.error(category, message, error, details),
  };
}

/**
 * Parse log level from string
 */
export function parseLogLevel(level: string): LogLevel {
  const normalized = level.toUpperCase();
  switch (normalized) {
    case 'DEBUG':
      return LogLevel.DEBUG;
    case 'INFO':
      return LogLevel.INFO;
    case 'WARN':
    case 'WARNING':
      return LogLevel.WARN;
    case 'ERROR':
      return LogLevel.ERROR;
    default:
      return LogLevel.INFO;
  }
}
