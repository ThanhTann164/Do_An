import api from "./api";

export const getMyPackage = async () => {
  const res = await api.get("/packages/my-package");
  return res.data;
};

const unwrap = (promise) =>
  promise
    .then((res) => res.data)
    .catch((error) => {
      console.error("Package service error:", error?.response?.data || error);
      throw error;
    });

export const packageService = {
  getAllPackages: () => unwrap(api.get("/packages")),
  getMyPackage: () => getMyPackage(),
  purchasePackage: (packageId, paymentMethod = "manual", transactionId = null) =>
    unwrap(
      api.post("/packages/purchase", {
        package_id: packageId,
        payment_method: paymentMethod,
        transaction_id: transactionId,
      })
    ),
  getPackageHistory: () => unwrap(api.get("/packages/history")),
};

packageService.checkFeatureAccess = (userPackage, feature) => {
  if (!userPackage || userPackage.is_free) {
    return false;
  }

  const packageName = userPackage.package_name;
  const aiTools = userPackage.ai_tools || [];
  const boostPerDay = userPackage.boost_per_day || 0;

  switch (feature) {
    case "ai_title_optimization":
      return aiTools.includes("title_optimization");
    case "ai_description_generation":
      return aiTools.includes("description_generation");
    case "ai_market_analysis":
      return aiTools.includes("market_analysis");
    case "ai_price_suggestion":
      return aiTools.includes("price_suggestion");
    case "boost":
      return boostPerDay > 0 || boostPerDay === -1;
    case "unlimited_boost":
      return boostPerDay === -1;
    case "premium_analytics":
      return packageName === "PREMIUM";
    case "verified_badge":
      return packageName === "PRO" || packageName === "PREMIUM";
    case "priority_listing":
      return packageName === "PREMIUM";
    case "video_upload":
      return packageName === "PRO" || packageName === "PREMIUM";
    case "unlimited_posts":
      return packageName === "PREMIUM";
    default:
      return false;
  }
};

packageService.getPostLimits = (userPackage) => {
  if (!userPackage || userPackage.is_free) {
    return {
      maxPosts: 3,
      maxImages: 3,
      unlimited: false,
    };
  }

  const packageName = userPackage.package_name;

  switch (packageName) {
    case "PRO":
      return {
        maxPosts: 20,
        maxImages: 10,
        unlimited: false,
      };
    case "PREMIUM":
      return {
        maxPosts: -1,
        maxImages: 20,
        unlimited: true,
      };
    default:
      return {
        maxPosts: 3,
        maxImages: 3,
        unlimited: false,
      };
  }
};

packageService.getBoostLimits = (userPackage) => {
  if (!userPackage || userPackage.is_free) {
    return {
      boostPerDay: 0,
      boostUsedToday: 0,
      remainingBoosts: 0,
      unlimited: false,
    };
  }

  const boostPerDay = userPackage.boost_per_day || 0;
  const boostUsedToday = userPackage.boost_used_today || 0;

  return {
    boostPerDay,
    boostUsedToday,
    remainingBoosts:
      boostPerDay === -1 ? -1 : Math.max(0, boostPerDay - boostUsedToday),
    unlimited: boostPerDay === -1,
  };
};

packageService.formatPackageInfo = (userPackage) => {
  if (!userPackage) {
    return {
      name: "FREE",
      displayName: "Gói Miễn Phí",
      color: "gray",
      icon: "Home",
      features: ["Đăng tối đa 3 bài viết", "Tối đa 3 hình ảnh mỗi bài"],
      isExpired: false,
      daysLeft: null,
    };
  }

  const packageName = userPackage.package_name;
  const isExpired =
    userPackage.end_at && new Date(userPackage.end_at) < new Date();
  const daysLeft = userPackage.end_at
    ? Math.max(
        0,
        Math.ceil(
          (new Date(userPackage.end_at) - new Date()) / (1000 * 60 * 60 * 24)
        )
      )
    : null;

  const packageInfo = {
    FREE: {
      name: "FREE",
      displayName: "Gói Miễn Phí",
      color: "gray",
      icon: "Home",
    },
    PRO: {
      name: "PRO",
      displayName: "Gói PRO",
      color: "purple",
      icon: "Zap",
    },
    PREMIUM: {
      name: "PREMIUM",
      displayName: "Gói PREMIUM",
      color: "yellow",
      icon: "Crown",
    },
  };

  return {
    ...(packageInfo[packageName] || packageInfo.FREE),
    features: userPackage.features || [],
    isExpired,
    daysLeft,
    expiryDate: userPackage.end_at,
  };
};