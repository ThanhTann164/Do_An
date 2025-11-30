const PACKAGE_RULES = {
  FREE: {
    boost_per_day: 0,
    max_posts_per_day: 1,
    ai_tools: [],
    highlight: false,
    priority: 0,
    video_panorama: false,
    banner_ads: false
  },
  PRO: {
    boost_per_day: 1,
    max_posts_per_day: 5,
    ai_tools: ["title_optimization", "description_generation"],
    highlight: true,
    priority: 1,
    video_panorama: true,
    banner_ads: false
  },
  PREMIUM: {
    boost_per_day: 3,
    max_posts_per_day: 20,
    ai_tools: ["title_optimization", "description_generation", "panorama_ai", "market_analysis", "price_suggestion"],
    highlight: true,
    priority: 2,
    video_panorama: true,
    banner_ads: true
  }
};

// Helper functions
const getPackageRules = (packageName) => {
  return PACKAGE_RULES[packageName] || PACKAGE_RULES.FREE;
};

const hasFeature = (packageName, feature) => {
  const rules = getPackageRules(packageName);
  return rules[feature] || false;
};

const hasAITool = (packageName, toolName) => {
  const rules = getPackageRules(packageName);
  return rules.ai_tools.includes(toolName);
};

const getPostLimits = (packageName) => {
  const rules = getPackageRules(packageName);
  return {
    daily: rules.max_posts_per_day,
    monthly: rules.max_posts_per_month,
    images: rules.max_images_per_post
  };
};

const getBoostLimits = (packageName) => {
  const rules = getPackageRules(packageName);
  return {
    per_day: rules.boost_per_day,
    unlimited: rules.boost_per_day === -1
  };
};

module.exports = {
  PACKAGE_RULES,
  getPackageRules,
  hasFeature,
  hasAITool,
  getPostLimits,
  getBoostLimits
};
