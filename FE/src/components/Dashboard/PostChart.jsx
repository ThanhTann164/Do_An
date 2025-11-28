import React from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';

const PostChart = ({ data = [], loading = false }) => {
  const maxValue = Math.max(...data.map(item => Math.max(item.views || 0, item.posts || 0)));

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="w-32 h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Thống kê hoạt động
        </h3>
        <div className="flex items-center text-sm text-gray-600">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span>7 ngày qua</span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Chưa có dữ liệu thống kê</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Chart Legend */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Lượt xem</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Tin đăng</span>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="h-48 flex items-end justify-between space-x-2">
            {data.map((item, index) => {
              const viewsHeight = maxValue > 0 ? (item.views || 0) / maxValue * 100 : 0;
              const postsHeight = maxValue > 0 ? (item.posts || 0) / maxValue * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex items-end justify-center space-x-1 mb-2">
                    <div 
                      className="bg-blue-500 rounded-t min-h-[4px] flex-1"
                      style={{ height: `${viewsHeight}%` }}
                      title={`Lượt xem: ${item.views || 0}`}
                    ></div>
                    <div 
                      className="bg-green-500 rounded-t min-h-[4px] flex-1"
                      style={{ height: `${postsHeight}%` }}
                      title={`Tin đăng: ${item.posts || 0}`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 text-center">
                    {item.name || item.date}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {data.reduce((sum, item) => sum + (item.views || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Tổng lượt xem</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {data.reduce((sum, item) => sum + (item.posts || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Tổng tin đăng</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostChart;
