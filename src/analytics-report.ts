/**
 * Claude Roaster - Analytics Report Generation
 * Advanced report templates and visualizations for team analytics
 */

import type { TeamMetrics, RoastAnalytics, IssueTypeSummary } from './analytics.js';

// =============================================================================
// REPORT TEMPLATES
// =============================================================================

/**
 * Generate a detailed markdown report with all sections
 */
export function generateDetailedReport(metrics: TeamMetrics, analytics: RoastAnalytics[]): string {
  const sections: string[] = [];

  // Title and header
  sections.push('# Claude Roaster - Team Analytics Report');
  sections.push('');
  sections.push(`**Generated**: ${new Date().toLocaleString()}`);
  sections.push(`**Total Sessions**: ${metrics.totalSessions}`);
  sections.push(`**Date Range**: ${getDateRange(analytics)}`);
  sections.push('');
  sections.push('---');
  sections.push('');

  // Executive Summary
  sections.push(generateExecutiveSummary(metrics));
  sections.push('');

  // Key Metrics Dashboard
  sections.push(generateMetricsDashboard(metrics));
  sections.push('');

  // Issue Analysis
  sections.push(generateIssueAnalysis(metrics));
  sections.push('');

  // Performance Trends
  sections.push(generatePerformanceTrends(metrics));
  sections.push('');

  // Focus Area Analysis
  sections.push(generateFocusAreaAnalysis(metrics));
  sections.push('');

  // Platform Breakdown
  sections.push(generatePlatformBreakdown(metrics));
  sections.push('');

  // Recommendations
  sections.push(generateRecommendationsSection(metrics));
  sections.push('');

  return sections.join('\n');
}

/**
 * Generate executive summary section
 */
export function generateExecutiveSummary(metrics: TeamMetrics): string {
  const sections: string[] = [];

  sections.push('## Executive Summary');
  sections.push('');

  // Overall health indicator
  const healthScore = calculateHealthScore(metrics);
  const healthEmoji = healthScore >= 80 ? '🟢' : healthScore >= 60 ? '🟡' : '🔴';
  sections.push(`**Team Health Score**: ${healthEmoji} ${healthScore}/100`);
  sections.push('');

  // Key highlights
  sections.push('### Key Highlights');
  sections.push('');
  sections.push(`- **${metrics.totalSessions}** roast sessions completed`);
  sections.push(`- **${(metrics.avgResolutionRate * 100).toFixed(1)}%** average issue resolution rate`);
  sections.push(`- **+${metrics.avgScoreImprovement.toFixed(1)}** points average quality improvement`);
  sections.push(`- **${metrics.avgIterationsPerSession.toFixed(1)}** iterations per session on average`);
  sections.push('');

  // Top concern or success
  if (metrics.avgResolutionRate < 0.5) {
    sections.push('⚠️  **Action Required**: Resolution rate is below 50%. Consider allocating more time for fixes.');
  } else if (metrics.avgScoreImprovement > 15) {
    sections.push('✨ **Excellent Progress**: Significant quality improvements across sessions.');
  }
  sections.push('');

  return sections.join('\n');
}

/**
 * Generate metrics dashboard section
 */
export function generateMetricsDashboard(metrics: TeamMetrics): string {
  const sections: string[] = [];

  sections.push('## Metrics Dashboard');
  sections.push('');

  // Create a visual dashboard using boxes
  sections.push('```');
  sections.push('┌─────────────────────┬─────────────────────┬─────────────────────┐');
  sections.push(`│ Sessions: ${String(metrics.totalSessions).padEnd(9)}│ Avg Iterations: ${String(metrics.avgIterationsPerSession.toFixed(1)).padEnd(3)}│ Resolution: ${String((metrics.avgResolutionRate * 100).toFixed(1) + '%').padEnd(7)}│`);
  sections.push('├─────────────────────┴─────────────────────┴─────────────────────┤');
  sections.push(`│ Score Improvement: +${metrics.avgScoreImprovement.toFixed(1)} points`.padEnd(65) + '│');
  sections.push('└─────────────────────────────────────────────────────────────────┘');
  sections.push('```');
  sections.push('');

  return sections.join('\n');
}

/**
 * Generate issue analysis section
 */
export function generateIssueAnalysis(metrics: TeamMetrics): string {
  const sections: string[] = [];

  sections.push('## Issue Analysis');
  sections.push('');

  // Severity distribution chart
  sections.push('### Severity Distribution');
  sections.push('');
  const totalIssues =
    metrics.severityDistribution.critical +
    metrics.severityDistribution.major +
    metrics.severityDistribution.minor;

  if (totalIssues > 0) {
    sections.push(
      generateHorizontalBarChart('Critical', metrics.severityDistribution.critical, totalIssues, '🔴')
    );
    sections.push(
      generateHorizontalBarChart('Major', metrics.severityDistribution.major, totalIssues, '🟡')
    );
    sections.push(
      generateHorizontalBarChart('Minor', metrics.severityDistribution.minor, totalIssues, '🟢')
    );
  } else {
    sections.push('No issues recorded.');
  }
  sections.push('');

  // Most common issues
  sections.push('### Most Common Issues');
  sections.push('');
  if (metrics.commonIssueTypes.length > 0) {
    sections.push('| Rank | Issue Type | Count | Percentage |');
    sections.push('|------|------------|-------|------------|');
    const totalCommonIssues = metrics.commonIssueTypes.reduce((sum, i) => sum + i.count, 0);
    metrics.commonIssueTypes.forEach((issue, index) => {
      const percentage = ((issue.count / totalCommonIssues) * 100).toFixed(1);
      sections.push(`| ${index + 1} | ${issue.type} | ${issue.count} | ${percentage}% |`);
    });
  } else {
    sections.push('No issue data available.');
  }
  sections.push('');

  // Category breakdown
  sections.push('### Issue Category Breakdown');
  sections.push('');
  const categories = Object.entries(metrics.categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  if (categories.length > 0) {
    sections.push('```');
    const maxCount = Math.max(...categories.map(([, count]) => count));
    categories.forEach(([category, count]) => {
      const barLength = Math.round((count / maxCount) * 30);
      const bar = '█'.repeat(barLength);
      sections.push(`${category.padEnd(20)} ${bar} ${count}`);
    });
    sections.push('```');
  } else {
    sections.push('No category data available.');
  }
  sections.push('');

  return sections.join('\n');
}

/**
 * Generate performance trends section
 */
export function generatePerformanceTrends(metrics: TeamMetrics): string {
  const sections: string[] = [];

  sections.push('## Performance Trends');
  sections.push('');

  if (metrics.improvementTrend.length === 0) {
    sections.push('Not enough data to show trends.');
    sections.push('');
    return sections.join('\n');
  }

  // Score improvement over time
  sections.push('### Score Trend (Last 30 Days)');
  sections.push('');
  sections.push('```');
  const maxScore = Math.max(...metrics.improvementTrend.map((t) => t.avgScore));
  const minScore = Math.min(...metrics.improvementTrend.map((t) => t.avgScore));
  const range = maxScore - minScore || 1;

  metrics.improvementTrend.slice(-14).forEach((trend) => {
    const normalizedScore = ((trend.avgScore - minScore) / range) * 40;
    const barLength = Math.max(1, Math.round(normalizedScore));
    const bar = '█'.repeat(barLength);
    const dateShort = trend.date.slice(5); // MM-DD
    sections.push(`${dateShort} │ ${bar} ${trend.avgScore.toFixed(1)}`);
  });
  sections.push('```');
  sections.push('');

  // Trend analysis
  const trendDirection = analyzeTrend(metrics.improvementTrend);
  sections.push(`**Trend**: ${trendDirection.emoji} ${trendDirection.description}`);
  sections.push('');

  return sections.join('\n');
}

/**
 * Generate focus area analysis section
 */
export function generateFocusAreaAnalysis(metrics: TeamMetrics): string {
  const sections: string[] = [];

  sections.push('## Focus Area Effectiveness');
  sections.push('');
  sections.push('Analysis of which focus areas yield the best improvements:');
  sections.push('');

  const areas = Object.entries(metrics.focusAreaEffectiveness)
    .filter(([, data]) => data.sessions > 0)
    .sort(([, a], [, b]) => b.avgImprovement - a.avgImprovement);

  if (areas.length > 0) {
    sections.push('| Focus Area | Sessions | Avg Improvement | Effectiveness |');
    sections.push('|------------|----------|-----------------|---------------|');
    areas.forEach(([area, data]) => {
      const effectiveness = getEffectivenessRating(data.avgImprovement);
      sections.push(
        `| ${area} | ${data.sessions} | +${data.avgImprovement.toFixed(1)} | ${effectiveness} |`
      );
    });
  } else {
    sections.push('No focus area data available.');
  }
  sections.push('');

  // Best focus area highlight
  if (areas.length > 0) {
    const [bestArea, bestData] = areas[0];
    sections.push(
      `💡 **Insight**: "${bestArea}" focus area shows the highest ROI with +${bestData.avgImprovement.toFixed(1)} average improvement across ${bestData.sessions} sessions.`
    );
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * Generate platform breakdown section
 */
export function generatePlatformBreakdown(metrics: TeamMetrics): string {
  const sections: string[] = [];

  sections.push('## Platform Distribution');
  sections.push('');

  const platforms = Object.entries(metrics.platformDistribution).sort(([, a], [, b]) => b - a);

  if (platforms.length > 0) {
    sections.push('```');
    const maxCount = Math.max(...platforms.map(([, count]) => count));
    platforms.forEach(([platform, count]) => {
      const percentage = ((count / metrics.totalSessions) * 100).toFixed(1);
      const barLength = Math.round((count / maxCount) * 30);
      const bar = '█'.repeat(barLength);
      sections.push(`${platform.padEnd(15)} ${bar} ${count} (${percentage}%)`);
    });
    sections.push('```');
  } else {
    sections.push('No platform data available.');
  }
  sections.push('');

  return sections.join('\n');
}

/**
 * Generate recommendations section
 */
export function generateRecommendationsSection(metrics: TeamMetrics): string {
  const sections: string[] = [];

  sections.push('## Recommendations');
  sections.push('');
  sections.push('Based on the analysis, here are actionable recommendations:');
  sections.push('');

  const recommendations = generateSmartRecommendations(metrics);

  recommendations.forEach((rec, index) => {
    sections.push(`### ${index + 1}. ${rec.title}`);
    sections.push('');
    sections.push(`**Priority**: ${rec.priority}`);
    sections.push('');
    sections.push(rec.description);
    sections.push('');
    if (rec.action) {
      sections.push(`**Action**: ${rec.action}`);
      sections.push('');
    }
  });

  return sections.join('\n');
}

// =============================================================================
// VISUALIZATION HELPERS
// =============================================================================

/**
 * Generate a horizontal bar chart
 */
function generateHorizontalBarChart(
  label: string,
  value: number,
  total: number,
  emoji: string = ''
): string {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const barLength = Math.round(percentage / 2.5); // 40 chars max
  const bar = '█'.repeat(barLength);
  const emojiPart = emoji ? `${emoji} ` : '';
  return `${emojiPart}${label.padEnd(10)} ${bar.padEnd(40)} ${value.toString().padStart(4)} (${percentage.toFixed(1)}%)`;
}

/**
 * Generate a sparkline chart (mini line chart)
 */
function generateSparkline(values: number[]): string {
  if (values.length === 0) return '';

  const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((val) => {
      const normalized = (val - min) / range;
      const index = Math.min(chars.length - 1, Math.floor(normalized * chars.length));
      return chars[index];
    })
    .join('');
}

/**
 * Create a box drawing for metrics
 */
function createMetricBox(label: string, value: string, width: number = 20): string {
  const paddedLabel = label.padEnd(width - 2);
  const paddedValue = value.padEnd(width - 2);
  return `┌${'─'.repeat(width)}┐\n│ ${paddedLabel} │\n│ ${paddedValue} │\n└${'─'.repeat(width)}┘`;
}

// =============================================================================
// ANALYSIS HELPERS
// =============================================================================

/**
 * Calculate overall health score
 */
function calculateHealthScore(metrics: TeamMetrics): number {
  if (metrics.totalSessions === 0) return 0;

  let score = 0;

  // Resolution rate (40 points)
  score += metrics.avgResolutionRate * 40;

  // Score improvement (30 points)
  const improvementScore = Math.min(30, (metrics.avgScoreImprovement / 20) * 30);
  score += improvementScore;

  // Issue severity balance (20 points)
  const totalIssues =
    metrics.severityDistribution.critical +
    metrics.severityDistribution.major +
    metrics.severityDistribution.minor;
  if (totalIssues > 0) {
    const criticalRate = metrics.severityDistribution.critical / totalIssues;
    const severityScore = (1 - criticalRate) * 20;
    score += severityScore;
  }

  // Iteration efficiency (10 points)
  const iterationEfficiency = Math.max(0, 10 - (metrics.avgIterationsPerSession - 2) * 2);
  score += iterationEfficiency;

  return Math.round(Math.min(100, score));
}

/**
 * Analyze trend direction
 */
function analyzeTrend(
  trend: Array<{ date: string; avgScore: number }>
): { emoji: string; description: string } {
  if (trend.length < 2) {
    return { emoji: '➡️', description: 'Insufficient data' };
  }

  const recent = trend.slice(-7);
  const older = trend.slice(-14, -7);

  if (older.length === 0) {
    return { emoji: '➡️', description: 'Not enough historical data' };
  }

  const recentAvg = recent.reduce((sum, t) => sum + t.avgScore, 0) / recent.length;
  const olderAvg = older.reduce((sum, t) => sum + t.avgScore, 0) / older.length;
  const diff = recentAvg - olderAvg;

  if (diff > 2) {
    return { emoji: '📈', description: 'Strong upward trend - quality is improving' };
  } else if (diff > 0.5) {
    return { emoji: '📊', description: 'Slight upward trend - steady improvement' };
  } else if (diff < -2) {
    return { emoji: '📉', description: 'Downward trend - needs attention' };
  } else if (diff < -0.5) {
    return { emoji: '📉', description: 'Slight downward trend - monitor closely' };
  } else {
    return { emoji: '➡️', description: 'Stable - maintaining consistent quality' };
  }
}

/**
 * Get effectiveness rating
 */
function getEffectivenessRating(improvement: number): string {
  if (improvement >= 15) return '⭐⭐⭐ Excellent';
  if (improvement >= 10) return '⭐⭐ Very Good';
  if (improvement >= 5) return '⭐ Good';
  return '• Fair';
}

/**
 * Get date range from analytics
 */
function getDateRange(analytics: RoastAnalytics[]): string {
  if (analytics.length === 0) return 'N/A';

  const dates = analytics
    .map((a) => a.completedAt || a.startedAt)
    .sort((a, b) => a.getTime() - b.getTime());

  const earliest = dates[0].toLocaleDateString();
  const latest = dates[dates.length - 1].toLocaleDateString();

  return `${earliest} - ${latest}`;
}

/**
 * Generate smart recommendations based on metrics
 */
function generateSmartRecommendations(
  metrics: TeamMetrics
): Array<{ title: string; priority: string; description: string; action?: string }> {
  const recommendations: Array<{
    title: string;
    priority: string;
    description: string;
    action?: string;
  }> = [];

  // Low resolution rate
  if (metrics.avgResolutionRate < 0.5) {
    recommendations.push({
      title: 'Improve Issue Resolution Rate',
      priority: '🔴 High',
      description: `Current resolution rate is ${(metrics.avgResolutionRate * 100).toFixed(1)}%, which is below the 50% threshold. This indicates that issues are being identified but not adequately addressed.`,
      action:
        'Allocate more time per iteration, increase total iterations, or implement a follow-up sprint dedicated to issue resolution.',
    });
  }

  // High critical issues
  const totalIssues =
    metrics.severityDistribution.critical +
    metrics.severityDistribution.major +
    metrics.severityDistribution.minor;
  const criticalRate = totalIssues > 0 ? metrics.severityDistribution.critical / totalIssues : 0;

  if (criticalRate > 0.25) {
    recommendations.push({
      title: 'Reduce Critical Issue Rate',
      priority: '🔴 High',
      description: `Critical issues account for ${(criticalRate * 100).toFixed(1)}% of all issues. High critical issue rates suggest fundamental problems in the development process.`,
      action:
        'Implement earlier design reviews, establish UI/UX guidelines, and conduct pre-roast checklist reviews.',
    });
  }

  // Common issue pattern
  if (metrics.commonIssueTypes.length > 0) {
    const topIssue = metrics.commonIssueTypes[0];
    const issueRate = (topIssue.count / totalIssues) * 100;

    if (issueRate > 20) {
      recommendations.push({
        title: `Address Recurring "${topIssue.type}" Issues`,
        priority: '🟡 Medium',
        description: `"${topIssue.type}" issues account for ${issueRate.toFixed(1)}% of all problems, indicating a systematic pattern.`,
        action: `Create specific guidelines or automated checks to prevent ${topIssue.type} issues during development.`,
      });
    }
  }

  // Low score improvement
  if (metrics.avgScoreImprovement < 5 && metrics.totalSessions > 3) {
    recommendations.push({
      title: 'Boost Quality Improvement Impact',
      priority: '🟡 Medium',
      description: `Average score improvement of +${metrics.avgScoreImprovement.toFixed(1)} is below expected. Sessions may need more focused fixes or better issue prioritization.`,
      action:
        'Focus on high-impact issues first, ensure fixes are properly implemented, and consider increasing iterations.',
    });
  }

  // Platform-specific opportunities
  const platforms = Object.entries(metrics.platformDistribution);
  if (platforms.length > 1) {
    recommendations.push({
      title: 'Create Platform-Specific Guidelines',
      priority: '🟢 Low',
      description: `Sessions span ${platforms.length} different platforms. Platform-specific patterns may not be addressed consistently.`,
      action:
        'Develop platform-specific roast checklists and guidelines to catch platform-specific issues earlier.',
    });
  }

  // Focus area effectiveness
  const effectiveAreas = Object.entries(metrics.focusAreaEffectiveness)
    .filter(([, data]) => data.sessions > 2)
    .sort(([, a], [, b]) => b.avgImprovement - a.avgImprovement);

  if (effectiveAreas.length > 0) {
    const [bestArea, bestData] = effectiveAreas[0];
    const [worstArea, worstData] = effectiveAreas[effectiveAreas.length - 1];

    if (bestData.avgImprovement - worstData.avgImprovement > 5) {
      recommendations.push({
        title: 'Optimize Focus Area Strategy',
        priority: '🟢 Low',
        description: `"${bestArea}" focus shows ${bestData.avgImprovement.toFixed(1)} avg improvement vs "${worstArea}" at ${worstData.avgImprovement.toFixed(1)}. Focus area selection impacts results.`,
        action: `Prioritize "${bestArea}" focus in future sessions, or investigate why "${worstArea}" underperforms.`,
      });
    }
  }

  // Positive reinforcement
  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Maintain Current Trajectory',
      priority: '✅ Excellent',
      description:
        'All metrics are within healthy ranges. The team is effectively identifying and resolving issues with good improvement rates.',
      action: 'Continue current practices and consider documenting successful patterns for team knowledge sharing.',
    });
  }

  return recommendations;
}

// =============================================================================
// EXPORT SUMMARY
// =============================================================================

/**
 * Generate a compact summary for CLI display
 */
export function generateCompactSummary(metrics: TeamMetrics): string {
  const lines: string[] = [];

  lines.push('📊 Analytics Summary');
  lines.push('');
  lines.push(`Sessions: ${metrics.totalSessions} | Resolution: ${(metrics.avgResolutionRate * 100).toFixed(1)}% | Improvement: +${metrics.avgScoreImprovement.toFixed(1)}`);

  if (metrics.commonIssueTypes.length > 0) {
    lines.push(`Top Issue: ${metrics.commonIssueTypes[0].type} (${metrics.commonIssueTypes[0].count})`);
  }

  return lines.join('\n');
}
