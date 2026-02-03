/**
 * Claude Roaster - Competitor Analysis
 * Structure and generate competitor comparison sections for roast reports
 */

import type { RoastTargetType } from './types.js';

// =============================================================================
// COMPETITOR ANALYSIS TYPES
// =============================================================================

/**
 * Competitor analysis data structure
 */
export interface CompetitorAnalysis {
  category: string;
  competitors: CompetitorData[];
  commonPatterns: string[];
  industryStandards: string[];
  differentiators: string[];
  recommendations: string[];
}

/**
 * Individual competitor data
 */
export interface CompetitorData {
  name: string;
  strengths: string[];
  weaknesses: string[];
  keyFeatures: string[];
  targetAudience?: string;
  url?: string;
}

/**
 * App type categories for competitor pattern detection
 */
export type AppType =
  | 'e-commerce'
  | 'saas'
  | 'social'
  | 'productivity'
  | 'finance'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'travel'
  | 'food-delivery'
  | 'general';

// =============================================================================
// COMPETITOR PATTERNS BY APP TYPE
// =============================================================================

/**
 * Common UI/UX patterns for different app types
 * These represent industry best practices and common user expectations
 */
export const COMPETITOR_PATTERNS: Record<AppType, {
  commonPatterns: string[];
  mustHaves: string[];
  differentiators: string[];
}> = {
  'e-commerce': {
    commonPatterns: [
      'Prominent search bar in header (Amazon, eBay, Etsy)',
      'Product images with zoom capability',
      'Clear pricing and "Add to Cart" CTA above the fold',
      'Trust signals: reviews, ratings, security badges',
      'Persistent shopping cart indicator',
      'Guest checkout option',
      'Product filtering and sorting',
    ],
    mustHaves: [
      'Mobile-optimized product images',
      'One-click cart access',
      'Clear shipping/return information',
      'Secure checkout flow',
    ],
    differentiators: [
      'Personalized recommendations',
      'Virtual try-on or AR preview',
      'Social proof widgets',
      'Loyalty program integration',
    ],
  },
  'saas': {
    commonPatterns: [
      'Clear value proposition above the fold (Slack, Notion, Figma)',
      'Free trial or freemium CTA prominently displayed',
      'Feature comparison tables',
      'Customer testimonials and logos',
      'Live demo or interactive preview',
      'Pricing page with multiple tiers',
      'Knowledge base or documentation link',
    ],
    mustHaves: [
      'Fast sign-up flow (< 60 seconds)',
      'Progressive onboarding',
      'Help/support access from any page',
      'Dashboard with clear navigation',
    ],
    differentiators: [
      'Interactive product tour',
      'Integration showcase',
      'ROI calculator',
      'Community or template library',
    ],
  },
  'social': {
    commonPatterns: [
      'Feed-based content layout (Instagram, Twitter, TikTok)',
      'Infinite scroll or pagination',
      'Like/react, comment, share actions',
      'Profile avatars with status indicators',
      'Real-time notifications',
      'Search and discovery features',
      'Direct messaging access',
    ],
    mustHaves: [
      'Quick content creation access',
      'Privacy controls',
      'Block/report functionality',
      'Customizable notification settings',
    ],
    differentiators: [
      'Unique content format',
      'Algorithm transparency',
      'Creator monetization tools',
      'Community moderation features',
    ],
  },
  'productivity': {
    commonPatterns: [
      'Clean, distraction-free interface (Todoist, Trello, Notion)',
      'Quick add/create buttons',
      'Keyboard shortcuts displayed',
      'Drag-and-drop functionality',
      'Multi-view options (list, board, calendar)',
      'Collaboration features',
      'Search and filters',
    ],
    mustHaves: [
      'Fast load times',
      'Offline capability',
      'Undo/redo functionality',
      'Auto-save indicators',
    ],
    differentiators: [
      'Templates and automation',
      'Cross-platform sync',
      'Customizable workflows',
      'AI assistance features',
    ],
  },
  'finance': {
    commonPatterns: [
      'Account balance prominently displayed (Chase, Mint, PayPal)',
      'Recent transactions list',
      'Transfer/send money quick action',
      'Security indicators throughout',
      'Fingerprint/Face ID authentication',
      'Transaction categories and trends',
      'Alerts and notifications settings',
    ],
    mustHaves: [
      'Two-factor authentication',
      'Session timeout security',
      'Transaction confirmation screens',
      'Clear error messages for failed transactions',
    ],
    differentiators: [
      'Spending insights and budgeting',
      'Investment tracking',
      'Bill payment automation',
      'Receipt scanning and organization',
    ],
  },
  'health': {
    commonPatterns: [
      'Dashboard with key metrics (Fitbit, MyFitnessPal, Calm)',
      'Progress tracking and visualization',
      'Goal setting interface',
      'Calendar or streak displays',
      'Reminders and notifications',
      'Data export functionality',
      'Privacy controls for health data',
    ],
    mustHaves: [
      'HIPAA-compliant data handling (if applicable)',
      'Clear data privacy policy',
      'Easy data deletion options',
      'Accessibility for diverse abilities',
    ],
    differentiators: [
      'Personalized recommendations',
      'Integration with wearables',
      'Community challenges',
      'Professional consultation access',
    ],
  },
  'education': {
    commonPatterns: [
      'Progress indicators (Duolingo, Khan Academy, Coursera)',
      'Lesson/module navigation',
      'Interactive exercises or quizzes',
      'Achievement badges or certificates',
      'Bookmarking and note-taking',
      'Resource library access',
      'Discussion forums or Q&A',
    ],
    mustHaves: [
      'Clear learning path',
      'Save progress functionality',
      'Offline content access',
      'Multiple learning formats (video, text, interactive)',
    ],
    differentiators: [
      'Adaptive learning algorithms',
      'Peer learning features',
      'Live instruction options',
      'Real-world project integration',
    ],
  },
  'entertainment': {
    commonPatterns: [
      'Hero content with autoplay preview (Netflix, Spotify, YouTube)',
      'Personalized content recommendations',
      'Continue watching/listening row',
      'Browse by category or genre',
      'Search with filters',
      'Watchlist or favorites',
      'Playback controls accessible at all times',
    ],
    mustHaves: [
      'Fast content loading',
      'Quality settings (resolution, bitrate)',
      'Chromecast/AirPlay support',
      'Parental controls',
    ],
    differentiators: [
      'Unique content curation',
      'Social sharing features',
      'Download for offline',
      'Multi-user profiles',
    ],
  },
  'travel': {
    commonPatterns: [
      'Search as primary interaction (Airbnb, Booking, Expedia)',
      'Map view integration',
      'Date picker with flexible options',
      'Price comparison and filters',
      'Photo galleries with high-quality images',
      'Reviews and ratings',
      'Saved trips or wish lists',
    ],
    mustHaves: [
      'Mobile-first design',
      'Location services integration',
      'Booking confirmation and itinerary',
      'Customer support access',
    ],
    differentiators: [
      'Virtual tours or 360° views',
      'Price alerts and tracking',
      'Multi-city trip planning',
      'Local recommendations',
    ],
  },
  'food-delivery': {
    commonPatterns: [
      'Location-based restaurant discovery (Uber Eats, DoorDash, Grubhub)',
      'Menu browsing with photos',
      'Customization options for items',
      'Real-time order tracking',
      'Saved addresses and payment methods',
      'Estimated delivery time',
      'Restaurant ratings and reviews',
    ],
    mustHaves: [
      'Clear dietary information and allergens',
      'Order history and reordering',
      'Contact driver/restaurant options',
      'Tip calculation',
    ],
    differentiators: [
      'Scheduling for later',
      'Group ordering features',
      'Loyalty rewards programs',
      'Sustainable packaging options',
    ],
  },
  'general': {
    commonPatterns: [
      'Clear navigation hierarchy',
      'Consistent design system',
      'Responsive mobile layout',
      'Loading states and feedback',
      'Error handling with clear messages',
      'Help/support access',
      'Account settings and preferences',
    ],
    mustHaves: [
      'Accessible design (WCAG AA minimum)',
      'Performance optimization',
      'Security best practices',
      'Privacy controls',
    ],
    differentiators: [
      'Unique value proposition',
      'Delightful micro-interactions',
      'Personalization options',
      'Community features',
    ],
  },
};

// =============================================================================
// COMPETITOR ANALYSIS GENERATION
// =============================================================================

/**
 * Infer app type from target description or type
 * This is a simple heuristic - in production, you'd use more sophisticated detection
 *
 * @param target - Target description
 * @param targetType - Type of roast target
 * @returns Inferred app type
 */
export function inferAppType(target: string, targetType: RoastTargetType): AppType {
  const targetLower = target.toLowerCase();

  // E-commerce keywords
  if (/(shop|cart|product|checkout|store|buy|purchase|payment)/i.test(targetLower)) {
    return 'e-commerce';
  }

  // SaaS keywords
  if (/(dashboard|settings|admin|workspace|project|team|subscription)/i.test(targetLower)) {
    return 'saas';
  }

  // Social keywords
  if (/(feed|post|profile|follow|comment|like|share|message)/i.test(targetLower)) {
    return 'social';
  }

  // Productivity keywords
  if (/(task|todo|note|calendar|reminder|organize)/i.test(targetLower)) {
    return 'productivity';
  }

  // Finance keywords
  if (/(bank|payment|transfer|balance|transaction|wallet|invest)/i.test(targetLower)) {
    return 'finance';
  }

  // Health keywords
  if (/(health|fitness|workout|medical|wellness|symptom)/i.test(targetLower)) {
    return 'health';
  }

  // Education keywords
  if (/(learn|course|lesson|quiz|study|education|tutorial)/i.test(targetLower)) {
    return 'education';
  }

  // Entertainment keywords
  if (/(watch|play|stream|video|music|movie|show|listen)/i.test(targetLower)) {
    return 'entertainment';
  }

  // Travel keywords
  if (/(hotel|flight|booking|trip|travel|destination|itinerary)/i.test(targetLower)) {
    return 'travel';
  }

  // Food delivery keywords
  if (/(food|restaurant|delivery|order|menu|cuisine)/i.test(targetLower)) {
    return 'food-delivery';
  }

  // Default to general
  return 'general';
}

/**
 * Generate competitor analysis structure for a given app type
 *
 * @param appType - Type of application
 * @param target - Target description for context
 * @returns Structured competitor analysis
 */
export function generateCompetitorAnalysis(
  appType: AppType,
  target: string
): CompetitorAnalysis {
  const patterns = COMPETITOR_PATTERNS[appType];

  return {
    category: appType,
    competitors: [], // Populated with specific competitor data when available
    commonPatterns: patterns.commonPatterns,
    industryStandards: patterns.mustHaves,
    differentiators: patterns.differentiators,
    recommendations: generateRecommendations(appType, patterns),
  };
}

/**
 * Generate recommendations based on patterns
 *
 * @param appType - Type of application
 * @param patterns - Pattern data for the app type
 * @returns Array of recommendation strings
 */
function generateRecommendations(
  appType: AppType,
  patterns: typeof COMPETITOR_PATTERNS[AppType]
): string[] {
  return [
    `Ensure all "${appType}" industry standards are met: ${patterns.mustHaves.slice(0, 2).join(', ')}`,
    `Consider implementing common patterns users expect from this category`,
    `Evaluate which differentiators would provide the most value for your target audience`,
    `Benchmark against top 3-5 competitors in the ${appType} space`,
  ];
}

// =============================================================================
// REPORT TEMPLATE GENERATION
// =============================================================================

/**
 * Generate competitor analysis section for markdown reports
 *
 * @param analysis - Competitor analysis data
 * @param target - Target description
 * @returns Markdown formatted section
 */
export function generateCompetitorSection(
  analysis: CompetitorAnalysis,
  target: string
): string {
  const categoryLabel = analysis.category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  let markdown = `## 🏆 Competitor Analysis\n\n`;
  markdown += `**Category:** ${categoryLabel}\n`;
  markdown += `**Target:** ${target}\n\n`;

  // Common Patterns
  markdown += `### Industry Standard Patterns\n\n`;
  markdown += `These patterns are common across leading ${analysis.category} applications:\n\n`;
  analysis.commonPatterns.forEach(pattern => {
    markdown += `- ${pattern}\n`;
  });
  markdown += `\n`;

  // Must-Haves
  markdown += `### Must-Have Features\n\n`;
  markdown += `Essential features expected by users in this category:\n\n`;
  analysis.industryStandards.forEach(standard => {
    markdown += `- ${standard}\n`;
  });
  markdown += `\n`;

  // Differentiators
  markdown += `### Potential Differentiators\n\n`;
  markdown += `Features that could set your app apart:\n\n`;
  analysis.differentiators.forEach(diff => {
    markdown += `- ${diff}\n`;
  });
  markdown += `\n`;

  // Recommendations
  markdown += `### Recommendations\n\n`;
  analysis.recommendations.forEach((rec, idx) => {
    markdown += `${idx + 1}. ${rec}\n`;
  });
  markdown += `\n`;

  // Competitive Audit Checklist
  markdown += `### Competitive Audit Checklist\n\n`;
  markdown += `Use this checklist to evaluate how your ${target} compares:\n\n`;
  markdown += `- [ ] Meets all industry standard patterns\n`;
  markdown += `- [ ] Implements all must-have features\n`;
  markdown += `- [ ] Has at least 2-3 unique differentiators\n`;
  markdown += `- [ ] Matches or exceeds competitor performance\n`;
  markdown += `- [ ] Provides better UX than top 3 competitors\n`;
  markdown += `\n`;

  return markdown;
}

/**
 * Generate competitor analysis for inclusion in roast reports
 *
 * @param target - Target description
 * @param targetType - Type of roast target
 * @returns Markdown formatted competitor analysis section
 */
export function createCompetitorAnalysisSection(
  target: string,
  targetType: RoastTargetType
): string {
  const appType = inferAppType(target, targetType);
  const analysis = generateCompetitorAnalysis(appType, target);
  return generateCompetitorSection(analysis, target);
}

// =============================================================================
// COMPETITOR DATA HELPERS
// =============================================================================

/**
 * Add specific competitor data to an analysis
 *
 * @param analysis - Existing competitor analysis
 * @param competitor - Competitor data to add
 * @returns Updated analysis
 */
export function addCompetitor(
  analysis: CompetitorAnalysis,
  competitor: CompetitorData
): CompetitorAnalysis {
  return {
    ...analysis,
    competitors: [...analysis.competitors, competitor],
  };
}

/**
 * Format competitor data for display in reports
 *
 * @param competitor - Competitor data
 * @returns Markdown formatted competitor info
 */
export function formatCompetitorData(competitor: CompetitorData): string {
  let markdown = `#### ${competitor.name}\n\n`;

  if (competitor.url) {
    markdown += `**Website:** [${competitor.url}](${competitor.url})\n\n`;
  }

  if (competitor.targetAudience) {
    markdown += `**Target Audience:** ${competitor.targetAudience}\n\n`;
  }

  markdown += `**Strengths:**\n`;
  competitor.strengths.forEach(strength => {
    markdown += `- ${strength}\n`;
  });
  markdown += `\n`;

  markdown += `**Weaknesses:**\n`;
  competitor.weaknesses.forEach(weakness => {
    markdown += `- ${weakness}\n`;
  });
  markdown += `\n`;

  markdown += `**Key Features:**\n`;
  competitor.keyFeatures.forEach(feature => {
    markdown += `- ${feature}\n`;
  });
  markdown += `\n`;

  return markdown;
}
