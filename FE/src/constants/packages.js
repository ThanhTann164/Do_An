export const PACKAGE_RULES = {
  FREE: {
    boost_per_day: 0,
    max_posts_per_day: 1,
    max_posts_per_month: 3,
    max_images_per_post: 3,
    ai_tools: [],
    highlight: false,
    priority: 0,
    verified_badge: false,
    video_upload: false,
    premium_analytics: false,
    auto_refresh: false,
    banner_enabled: false,
    color: 'gray',
    icon: 'Home',
    badge: '🆓'
  },
  PRO: {
    boost_per_day: 1,
    max_posts_per_day: 5,
    max_posts_per_month: 20,
    max_images_per_post: 10,
    ai_tools: ["title_optimization", "description_generation"],
    highlight: true,
    priority: 1,
    verified_badge: true,
    video_upload: true,
    premium_analytics: false,
    auto_refresh: false,
    banner_enabled: false,
    color: 'blue',
    icon: 'Zap',
    badge: '⚡'
  },
  PREMIUM: {
    boost_per_day: 3,
    max_posts_per_day: 20,
    max_posts_per_month: -1, // unlimited
    max_images_per_post: 20,
    ai_tools: ["title_optimization", "description_generation", "panorama_ai", "market_analysis", "price_suggestion"],
    highlight: true,
    priority: 2,
    verified_badge: true,
    video_upload: true,
    premium_analytics: true,
    auto_refresh: true,
    banner_enabled: true,
    color: 'yellow',
    icon: 'Crown',
    badge: '👑'
  }
};

export const getPackageRules = (packageName) => {
  return PACKAGE_RULES[packageName] || PACKAGE_RULES.FREE;
};

export const hasFeature = (packageName, feature) => {
  const rules = getPackageRules(packageName);
  return rules[feature] || false;
};

export const hasAITool = (packageName, toolName) => {
  const rules = getPackageRules(packageName);
  return rules.ai_tools.includes(toolName);
};

export const getPackageColor = (packageName) => {
  const rules = getPackageRules(packageName);
  return rules.color;
};

export const getPackageBadge = (packageName) => {
  const rules = getPackageRules(packageName);
  return rules.badge;
};

export const getPackageDisplayName = (packageName) => {
  const names = {
    FREE: 'Gói Miễn Phí',
    PRO: 'Gói PRO',
    PREMIUM: 'Gói PREMIUM'
  };
  return names[packageName] || names.FREE;
};



