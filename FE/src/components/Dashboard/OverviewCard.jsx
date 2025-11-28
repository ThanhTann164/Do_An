import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const OverviewCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  icon: Icon,
  color = 'blue',
  loading = false 
}) => {
  const getColorClasses = () => {
    const colors = {
      blue: {
        bg: 'bg-blue-100',
        icon: 'text-blue-600',
        text: 'text-blue-600'
      },
      green: {
        bg: 'bg-green-100',
        icon: 'text-green-600',
        text: 'text-green-600'
      },
      yellow: {
        bg: 'bg-yellow-100',
        icon: 'text-yellow-600',
        text: 'text-yellow-600'
      },
      purple: {
        bg: 'bg-purple-100',
        icon: 'text-purple-600',
        text: 'text-purple-600'
      },
      red: {
        bg: 'bg-red-100',
        icon: 'text-red-600',
        text: 'text-red-600'
      }
    };
    return colors[color] || colors.blue;
  };

  const colorClasses = getColorClasses();

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M';
      } else if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K';
      }
      return val.toLocaleString();
    }
    return val;
  };

  if (loading) {
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

  return (
    <div className="bg-white rounded-soft-lg shadow-soft p-6 border border-gray-100 hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <div className={`p-3 rounded-soft ${colorClasses.bg} shadow-soft`}>
          {Icon && <Icon className={`w-6 h-6 ${colorClasses.icon}`} />}
        </div>
        
        {change !== undefined && (
          <div className={`flex items-center text-sm font-medium px-2 py-1 rounded-full ${
            changeType === 'positive' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {changeType === 'positive' ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      <div className="mb-3">
        <h3 className="text-3xl font-bold text-navy-900">
          {formatValue(value)}
        </h3>
      </div>
      
      <p className="text-sm font-medium text-gray-600 mb-1">
        {title}
      </p>
      
      {change !== undefined && (
        <p className="text-xs text-gray-500">
          {changeType === 'positive' ? 'Tăng' : 'Giảm'} {Math.abs(change)}% so với tháng trước
        </p>
      )}
    </div>
  );
};

export default OverviewCard;
