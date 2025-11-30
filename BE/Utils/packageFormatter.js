function formatPackagePayload(details) {
  if (!details) {
    return null;
  }

  const rules = details.rules || {};
  const maxPostsPerDay = rules.max_posts_per_day ?? 0;
  const boostPerDay = rules.boost_per_day ?? 0;
  const postsToday = details.posts_today || 0;
  const boostUsedToday = details.boost_used_today || 0;

  return {
    userPackage: {
      name: details.name,
      display_name: details.display_name,
      is_free: details.is_free,
      expires_at: details.expires_at
    },
    rules,
    limits: {
      posts: {
        daily: maxPostsPerDay,
        daily_used: postsToday,
        daily_remaining: maxPostsPerDay > 0 ? Math.max(0, maxPostsPerDay - postsToday) : -1
      },
      boost: {
        per_day: boostPerDay,
        used_today: boostUsedToday,
        remaining_today: boostPerDay > 0 ? Math.max(0, boostPerDay - boostUsedToday) : -1
      }
    },
    features: {
      ai_tools: rules.ai_tools || [],
      highlight: rules.highlight || false,
      priority: rules.priority || 0,
      video_panorama: rules.video_panorama || false,
      banner_ads: rules.banner_ads || false
    }
  };
}

module.exports = {
  formatPackagePayload
};



