import { createContext, useCallback, useEffect, useState } from "react";
import { getMyPackage } from "../services/packageService";
import { useAuth } from "../contexts/AuthContext";

export const PackageContext = createContext();

export const PackageProvider = ({ children }) => {
  const [packageInfo, setPackageInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchPackage = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[PACKAGE] Fetching /api/packages/my-package (PackageContext)');
      const data = await getMyPackage();
      setPackageInfo(data || null);
    } catch (err) {
      console.error("Package fetch failed:", err);
      setPackageInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setPackageInfo(null);
      return;
    }

    if ((user.role || '').toLowerCase() !== 'seller') {
      console.log('[PACKAGE] Skip fetch, role =', user.role || 'unknown');
      setPackageInfo(null);
      return;
    }

    fetchPackage();
  }, [user, fetchPackage]);

  useEffect(() => {
    const handleRefresh = () => fetchPackage();
    window.addEventListener("package:refresh", handleRefresh);
    return () => window.removeEventListener("package:refresh", handleRefresh);
  }, [fetchPackage]);

  return (
    <PackageContext.Provider value={{ packageInfo, detail: packageInfo?.raw || null, loading, refreshPackage: fetchPackage }}>
      {children}
    </PackageContext.Provider>
  );
};
