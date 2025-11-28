import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ icon: Icon, title, value, trend = null, color = 'blue', onClick }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    teal: 'from-[#00A884] to-[#00b894]'
  };

  const bgColorClasses = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
    red: 'bg-red-50',
    teal: 'bg-teal-50'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    teal: 'text-[#00A884]'
  };

  return (
    <div 
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${bgColorClasses[color]} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColorClasses[color]}`} />
        </div>
        {trend && (
          <div className={`flex items-center text-sm font-medium ${
            trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.startsWith('+') ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {trend}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
};

export default StatsCard;
