import React, { useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PackageContext } from '../context/PackageContext';

const PackageDebug = () => {
  const { user, userPackage, isFreePlan, isProPlan, isPremiumPlan, loading } = useAuth();
  const { packageInfo, loading: pkgLoading } = useContext(PackageContext);
  const isSeller = (user?.role || '').toLowerCase() === 'seller';

  if (!isSeller) {
    return null;
  }

  if (loading || pkgLoading) {
    return (
      <div className="fixed top-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-4 shadow-lg z-50">
        <h3 className="font-bold text-blue-800">🔄 Loading Package Info...</h3>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <h3 className="font-bold text-gray-800 mb-2">📦 Package Debug Info</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>User:</strong> {user?.email || 'Not logged in'}
        </div>
        
        <div>
          <strong>Package:</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
            isPremiumPlan() ? 'bg-yellow-100 text-yellow-800' :
            isProPlan() ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {isPremiumPlan() ? '👑 PREMIUM' : isProPlan() ? '⚡ PRO' : '🆓 FREE'}
          </span>
          <div className="text-xs text-gray-500 mt-1">
            Summary: {packageInfo?.packageName || 'null'} | Free: {packageInfo?.isFree ? 'true' : 'false'}
          </div>
        </div>

        {userPackage && (
          <>
            <div>
              <strong>Boost/day:</strong> {userPackage.rules?.boost_per_day || 0}
            </div>
            <div>
              <strong>Posts/day:</strong> {userPackage.rules?.max_posts_per_day || 1}
            </div>
            <div>
              <strong>AI Tools:</strong> {userPackage.rules?.ai_tools?.length || 0}
            </div>
            <div>
              <strong>Expires:</strong> {userPackage.userPackage?.expires_at ? 
                new Date(userPackage.userPackage.expires_at).toLocaleDateString() : 'Never'}
            </div>
          </>
        )}

        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Raw package data: {JSON.stringify(packageInfo?.raw || null)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDebug;
