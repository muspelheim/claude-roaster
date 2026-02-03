/**
 * Claude Roaster - Analytics System
 * Team analytics and metrics tracking for roast sessions
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  RoastSession,
  RoastIssue,
  Severity,
  FocusArea,
  IterationScores,
} from './types.js';

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

/**
 * Analytics data for a single roast session
 */
export interface RoastAnalytics {
  sessionId: string;
  topic: string;
  startedAt: Date;
  completedAt?: Date;
  iterations: number;
  platform: string;
  issuesByCategory: Record<string, number>;
  issuesBySeverity: Record<Severity, number>;
  resolutionRate: number;
  scoreImprovement: number;
  focusAreas: FocusArea[];
  initialScores: IterationScores;
  finalScores: IterationScores;
}

/**
 * Aggregated team metrics across multiple sessions
 */
export interface TeamMetrics {
  totalSessions: number;
  avgIterationsPerSession: number;
  avgResolutionRate: number;
  commonIssueTypes: Array<{ type: string; count: number }>;
  improvementTrend: Array<{ date: string; avgScore: number }>;
  categoryBreakdown: Record<string, number>;
  severityDistribution: Record<Severity, number>;
  platformDistribution: Record<string, number>;
  avgScoreImprovement: number;
  focusAreaEffectiveness: Record<FocusArea, { sessions: number; avgImprovement: number }>;
}

/**
 * Issue type summary
 */
export interface IssueTypeSummary {
  type: string;
  count: number;
  severity: Severity;
  avgResolutionRate: number;
  examples: string[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

const ANALYTICS_DIR = '.roaster-analytics';
const SESSIONS_DIR = 'sessions';
const AGGREGATE_FILE = 'aggregate.json';

// =============================================================================
// CORE ANALYTICS FUNCTIONS
// =============================================================================

/**
 * Save analytics data for a roast session
 */
export async function saveSessionAnalytics(session: RoastSession): Promise<void> {
  const analytics = sessionToAnalytics(session);

  // Ensure analytics directory exists
  const sessionsDir = path.join(process.cwd(), ANALYTICS_DIR, SESSIONS_DIR);
  await fs.mkdir(sessionsDir, { recursive: true });

  // Save individual session file
  const sessionFile = path.join(sessionsDir, `${session.id}.json`);
  await fs.writeFile(sessionFile, JSON.stringify(analytics, null, 2), 'utf-8');

  // Update aggregate metrics
  await updateAggregateMetrics();
}

/**
 * Load all analytics data from the analytics directory
 */
export async function loadAnalytics(dir?: string): Promise<RoastAnalytics[]> {
  const sessionsDir = path.join(dir || process.cwd(), ANALYTICS_DIR, SESSIONS_DIR);

  try {
    const files = await fs.readdir(sessionsDir);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    const analytics: RoastAnalytics[] = [];
    for (const file of jsonFiles) {
      const filePath = path.join(sessionsDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      // Convert date strings back to Date objects
      data.startedAt = new Date(data.startedAt);
      if (data.completedAt) {
        data.completedAt = new Date(data.completedAt);
      }

      analytics.push(data);
    }

    return analytics;
  } catch (error) {
    // Directory doesn't exist or is empty
    return [];
  }
}

/**
 * Calculate team metrics from analytics data
 */
export function calculateTeamMetrics(analytics: RoastAnalytics[]): TeamMetrics {
  if (analytics.length === 0) {
    return {
      totalSessions: 0,
      avgIterationsPerSession: 0,
      avgResolutionRate: 0,
      commonIssueTypes: [],
      improvementTrend: [],
      categoryBreakdown: {},
      severityDistribution: { critical: 0, major: 0, minor: 0 },
      platformDistribution: {},
      avgScoreImprovement: 0,
      focusAreaEffectiveness: {
        all: { sessions: 0, avgImprovement: 0 },
        accessibility: { sessions: 0, avgImprovement: 0 },
        conversion: { sessions: 0, avgImprovement: 0 },
        usability: { sessions: 0, avgImprovement: 0 },
        visual: { sessions: 0, avgImprovement: 0 },
        implementation: { sessions: 0, avgImprovement: 0 },
      },
    };
  }

  const totalSessions = analytics.length;
  const totalIterations = analytics.reduce((sum, a) => sum + a.iterations, 0);
  const totalResolutionRate = analytics.reduce((sum, a) => sum + a.resolutionRate, 0);
  const totalScoreImprovement = analytics.reduce((sum, a) => sum + a.scoreImprovement, 0);

  // Issue type aggregation
  const issueTypes: Record<string, number> = {};
  const categoryBreakdown: Record<string, number> = {};
  const severityDistribution: Record<Severity, number> = {
    critical: 0,
    major: 0,
    minor: 0,
  };
  const platformDistribution: Record<string, number> = {};

  analytics.forEach((a) => {
    // Aggregate issue categories
    Object.entries(a.issuesByCategory).forEach(([category, count]) => {
      issueTypes[category] = (issueTypes[category] || 0) + count;
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + count;
    });

    // Aggregate severity
    Object.entries(a.issuesBySeverity).forEach(([severity, count]) => {
      severityDistribution[severity as Severity] += count;
    });

    // Aggregate platforms
    platformDistribution[a.platform] = (platformDistribution[a.platform] || 0) + 1;
  });

  // Sort and limit common issues
  const commonIssueTypes = Object.entries(issueTypes)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Calculate improvement trend (by day)
  const improvementTrend = calculateImprovementTrend(analytics);

  // Calculate focus area effectiveness
  const focusAreaEffectiveness = calculateFocusAreaEffectiveness(analytics);

  return {
    totalSessions,
    avgIterationsPerSession: totalIterations / totalSessions,
    avgResolutionRate: totalResolutionRate / totalSessions,
    commonIssueTypes,
    improvementTrend,
    categoryBreakdown,
    severityDistribution,
    platformDistribution,
    avgScoreImprovement: totalScoreImprovement / totalSessions,
    focusAreaEffectiveness,
  };
}

/**
 * Generate a formatted analytics report from team metrics
 */
export function generateAnalyticsReport(metrics: TeamMetrics): string {
  if (metrics.totalSessions === 0) {
    return '# Team Analytics Report\n\nNo roast sessions recorded yet.';
  }

  const sections: string[] = [];

  // Header
  sections.push('# Team Analytics Report');
  sections.push('');
  sections.push(`Generated: ${new Date().toLocaleString()}`);
  sections.push('');

  // Summary statistics
  sections.push('## Summary Statistics');
  sections.push('');
  sections.push(`- **Total Sessions**: ${metrics.totalSessions}`);
  sections.push(`- **Avg Iterations per Session**: ${metrics.avgIterationsPerSession.toFixed(1)}`);
  sections.push(`- **Avg Resolution Rate**: ${(metrics.avgResolutionRate * 100).toFixed(1)}%`);
  sections.push(`- **Avg Score Improvement**: +${metrics.avgScoreImprovement.toFixed(1)} points`);
  sections.push('');

  // Common issues
  sections.push('## Most Common Issues');
  sections.push('');
  if (metrics.commonIssueTypes.length > 0) {
    sections.push('| Issue Type | Count | % of Total |');
    sections.push('|------------|-------|------------|');
    const totalIssues = metrics.commonIssueTypes.reduce((sum, i) => sum + i.count, 0);
    metrics.commonIssueTypes.forEach((issue) => {
      const percentage = ((issue.count / totalIssues) * 100).toFixed(1);
      sections.push(`| ${issue.type} | ${issue.count} | ${percentage}% |`);
    });
  } else {
    sections.push('No issues recorded.');
  }
  sections.push('');

  // Severity distribution
  sections.push('## Issue Severity Distribution');
  sections.push('');
  const totalSeverity =
    metrics.severityDistribution.critical +
    metrics.severityDistribution.major +
    metrics.severityDistribution.minor;
  if (totalSeverity > 0) {
    sections.push(generateBarChart('Critical', metrics.severityDistribution.critical, totalSeverity));
    sections.push(generateBarChart('Major', metrics.severityDistribution.major, totalSeverity));
    sections.push(generateBarChart('Minor', metrics.severityDistribution.minor, totalSeverity));
  } else {
    sections.push('No severity data available.');
  }
  sections.push('');

  // Platform distribution
  sections.push('## Platform Distribution');
  sections.push('');
  if (Object.keys(metrics.platformDistribution).length > 0) {
    Object.entries(metrics.platformDistribution)
      .sort(([, a], [, b]) => b - a)
      .forEach(([platform, count]) => {
        const percentage = ((count / metrics.totalSessions) * 100).toFixed(1);
        sections.push(`- **${platform}**: ${count} sessions (${percentage}%)`);
      });
  } else {
    sections.push('No platform data available.');
  }
  sections.push('');

  // Focus area effectiveness
  sections.push('## Focus Area Effectiveness');
  sections.push('');
  sections.push('| Focus Area | Sessions | Avg Improvement |');
  sections.push('|------------|----------|-----------------|');
  Object.entries(metrics.focusAreaEffectiveness)
    .filter(([, data]) => data.sessions > 0)
    .sort(([, a], [, b]) => b.avgImprovement - a.avgImprovement)
    .forEach(([area, data]) => {
      sections.push(`| ${area} | ${data.sessions} | +${data.avgImprovement.toFixed(1)} |`);
    });
  sections.push('');

  // Improvement trend
  sections.push('## Improvement Trend');
  sections.push('');
  if (metrics.improvementTrend.length > 0) {
    sections.push('```');
    const maxScore = Math.max(...metrics.improvementTrend.map((t) => t.avgScore));
    metrics.improvementTrend.forEach((trend) => {
      const barLength = Math.round((trend.avgScore / maxScore) * 40);
      const bar = '█'.repeat(barLength);
      sections.push(`${trend.date}: ${bar} ${trend.avgScore.toFixed(1)}`);
    });
    sections.push('```');
  } else {
    sections.push('No trend data available.');
  }
  sections.push('');

  // Recommendations
  sections.push('## Recommendations');
  sections.push('');
  const recommendations = generateRecommendations(metrics);
  recommendations.forEach((rec) => {
    sections.push(`- ${rec}`);
  });
  sections.push('');

  return sections.join('\n');
}

/**
 * Get the most common issues across sessions
 */
export function getMostCommonIssues(
  analytics: RoastAnalytics[],
  limit: number = 10
): IssueTypeSummary[] {
  const issueMap: Record<string, { count: number; severities: Severity[]; examples: string[] }> = {};

  analytics.forEach((session) => {
    Object.entries(session.issuesByCategory).forEach(([type, count]) => {
      if (!issueMap[type]) {
        issueMap[type] = { count: 0, severities: [], examples: [] };
      }
      issueMap[type].count += count;
    });
  });

  return Object.entries(issueMap)
    .map(([type, data]) => ({
      type,
      count: data.count,
      severity: 'major' as Severity, // Default, would need issue details to determine
      avgResolutionRate: 0, // Would need more detailed tracking
      examples: data.examples.slice(0, 3),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get improvement trend over a time period
 */
export function getImprovementTrend(
  analytics: RoastAnalytics[],
  days: number = 30
): Array<{ date: string; avgScore: number; sessions: number }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentSessions = analytics.filter((a) => {
    const sessionDate = a.completedAt || a.startedAt;
    return sessionDate >= cutoffDate;
  });

  // Group by date
  const byDate: Record<string, { scores: number[]; count: number }> = {};
  recentSessions.forEach((session) => {
    const date = (session.completedAt || session.startedAt).toISOString().split('T')[0];
    if (!byDate[date]) {
      byDate[date] = { scores: [], count: 0 };
    }
    byDate[date].scores.push(session.finalScores.overall);
    byDate[date].count++;
  });

  return Object.entries(byDate)
    .map(([date, data]) => ({
      date,
      avgScore: data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length,
      sessions: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Convert a RoastSession to RoastAnalytics
 */
function sessionToAnalytics(session: RoastSession): RoastAnalytics {
  const allIssues: RoastIssue[] = [];
  session.iterations.forEach((iter) => {
    allIssues.push(...iter.issues);
  });

  const issuesByCategory: Record<string, number> = {};
  const issuesBySeverity: Record<Severity, number> = {
    critical: 0,
    major: 0,
    minor: 0,
  };

  allIssues.forEach((issue) => {
    // Category is derived from source agent
    const category = issue.source;
    issuesByCategory[category] = (issuesByCategory[category] || 0) + 1;
    issuesBySeverity[issue.severity]++;
  });

  const firstIteration = session.iterations[0];
  const lastIteration = session.iterations[session.iterations.length - 1];

  const totalFixed = session.iterations.reduce((sum, iter) => sum + iter.fixesApplied.length, 0);
  const resolutionRate = allIssues.length > 0 ? totalFixed / allIssues.length : 0;
  const scoreImprovement = lastIteration.scores.overall - firstIteration.scores.overall;

  return {
    sessionId: session.id,
    topic: session.config.target,
    startedAt: session.startedAt,
    completedAt: session.status === 'completed' ? new Date() : undefined,
    iterations: session.currentIteration,
    platform: detectPlatform(session.config.target),
    issuesByCategory,
    issuesBySeverity,
    resolutionRate,
    scoreImprovement,
    focusAreas: session.config.focusAreas,
    initialScores: firstIteration.scores,
    finalScores: lastIteration.scores,
  };
}

/**
 * Detect platform from target string
 */
function detectPlatform(target: string): string {
  const lower = target.toLowerCase();
  if (lower.includes('ios') || lower.includes('iphone') || lower.includes('ipad')) {
    return 'ios';
  }
  if (lower.includes('android')) {
    return 'android';
  }
  if (lower.includes('web') || lower.includes('http')) {
    return 'web';
  }
  if (lower.includes('macos')) {
    return 'macos';
  }
  return 'unknown';
}

/**
 * Calculate improvement trend by date
 */
function calculateImprovementTrend(
  analytics: RoastAnalytics[]
): Array<{ date: string; avgScore: number }> {
  const byDate: Record<string, number[]> = {};

  analytics.forEach((a) => {
    const date = (a.completedAt || a.startedAt).toISOString().split('T')[0];
    if (!byDate[date]) {
      byDate[date] = [];
    }
    byDate[date].push(a.finalScores.overall);
  });

  return Object.entries(byDate)
    .map(([date, scores]) => ({
      date,
      avgScore: scores.reduce((sum, s) => sum + s, 0) / scores.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30); // Last 30 days
}

/**
 * Calculate effectiveness of each focus area
 */
function calculateFocusAreaEffectiveness(
  analytics: RoastAnalytics[]
): Record<FocusArea, { sessions: number; avgImprovement: number }> {
  const effectiveness: Record<FocusArea, { sessions: number; totalImprovement: number }> = {
    all: { sessions: 0, totalImprovement: 0 },
    accessibility: { sessions: 0, totalImprovement: 0 },
    conversion: { sessions: 0, totalImprovement: 0 },
    usability: { sessions: 0, totalImprovement: 0 },
    visual: { sessions: 0, totalImprovement: 0 },
    implementation: { sessions: 0, totalImprovement: 0 },
  };

  analytics.forEach((a) => {
    a.focusAreas.forEach((area) => {
      effectiveness[area].sessions++;
      effectiveness[area].totalImprovement += a.scoreImprovement;
    });
  });

  return Object.fromEntries(
    Object.entries(effectiveness).map(([area, data]) => [
      area,
      {
        sessions: data.sessions,
        avgImprovement: data.sessions > 0 ? data.totalImprovement / data.sessions : 0,
      },
    ])
  ) as Record<FocusArea, { sessions: number; avgImprovement: number }>;
}

/**
 * Generate recommendations based on metrics
 */
function generateRecommendations(metrics: TeamMetrics): string[] {
  const recommendations: string[] = [];

  // Low resolution rate
  if (metrics.avgResolutionRate < 0.5) {
    recommendations.push(
      'Consider increasing iterations or allocating more time for fixes. Current resolution rate is below 50%.'
    );
  }

  // High critical issues
  const criticalRate = metrics.severityDistribution.critical /
    (metrics.severityDistribution.critical + metrics.severityDistribution.major + metrics.severityDistribution.minor);
  if (criticalRate > 0.3) {
    recommendations.push(
      'High percentage of critical issues detected. Consider earlier design reviews or more rigorous testing.'
    );
  }

  // Common issue patterns
  if (metrics.commonIssueTypes.length > 0) {
    const topIssue = metrics.commonIssueTypes[0];
    recommendations.push(
      `Focus on preventing "${topIssue.type}" issues, which account for the highest issue count.`
    );
  }

  // Platform-specific
  const platforms = Object.keys(metrics.platformDistribution);
  if (platforms.length > 1) {
    recommendations.push(
      'Consider creating platform-specific guidelines to address recurring issues across different platforms.'
    );
  }

  // Focus area effectiveness
  const effectiveAreas = Object.entries(metrics.focusAreaEffectiveness)
    .filter(([, data]) => data.sessions > 2)
    .sort(([, a], [, b]) => b.avgImprovement - a.avgImprovement);

  if (effectiveAreas.length > 0) {
    const [bestArea, bestData] = effectiveAreas[0];
    recommendations.push(
      `"${bestArea}" focus area shows highest improvement (+${bestData.avgImprovement.toFixed(1)} avg). Consider prioritizing this in future sessions.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('Keep up the good work! Metrics look healthy.');
  }

  return recommendations;
}

/**
 * Generate a simple ASCII bar chart
 */
function generateBarChart(label: string, value: number, total: number): string {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const barLength = Math.round(percentage / 2); // 50 chars max
  const bar = '█'.repeat(barLength);
  return `${label.padEnd(10)} ${bar} ${value} (${percentage.toFixed(1)}%)`;
}

/**
 * Update the aggregate metrics cache
 */
async function updateAggregateMetrics(): Promise<void> {
  const analytics = await loadAnalytics();
  const metrics = calculateTeamMetrics(analytics);

  const aggregateFile = path.join(process.cwd(), ANALYTICS_DIR, AGGREGATE_FILE);
  await fs.writeFile(aggregateFile, JSON.stringify(metrics, null, 2), 'utf-8');
}

/**
 * Load cached aggregate metrics (faster than recalculating)
 */
export async function loadAggregateMetrics(): Promise<TeamMetrics | null> {
  const aggregateFile = path.join(process.cwd(), ANALYTICS_DIR, AGGREGATE_FILE);

  try {
    const content = await fs.readFile(aggregateFile, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}
