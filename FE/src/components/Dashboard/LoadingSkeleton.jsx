import React from 'react';

const LoadingSkeleton = ({ type = 'dashboard' }) => {
  if (type === 'dashboard') {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="w-48 h-8 bg-gray-200 rounded"></div>
            <div className="w-32 h-6 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded mb-2"></div>
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="animate-pulse">
              <div className="w-32 h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* List Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="animate-pulse">
              <div className="w-32 h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="w-48 h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="w-32 h-3 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="w-20 h-8 bg-gray-200 rounded mb-2"></div>
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="w-32 h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="w-48 h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="w-32 h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="animate-pulse">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-24 h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          
          {/* Table Rows */}
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="px-6 py-4 border-b border-gray-100">
              <div className="flex space-x-4">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="w-24 h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default skeleton
  return (
    <div className="animate-pulse">
      <div className="w-full h-32 bg-gray-200 rounded"></div>
    </div>
  );
};

export default LoadingSkeleton;
