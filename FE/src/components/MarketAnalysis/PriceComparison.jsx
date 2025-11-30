import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const PriceComparison = ({ data, formatPrice }) => {
  if (!data) return null;

  const getStatusIcon = () => {
    if (data.status === 'cao hơn') return <TrendingUp className="w-5 h-5 text-red-600" />;
    if (data.status === 'thấp hơn') return <TrendingDown className="w-5 h-5 text-green-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const getStatusColor = () => {
    if (data.status === 'cao hơn') return 'text-red-600';
    if (data.status === 'thấp hơn') return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-blue-600" />
        So sánh giá
      </h3>
      
      <div className="space-y-4">
        {data.current_price && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-gray-700 font-medium">Giá hiện tại của bạn:</span>
            <span className="text-lg font-bold text-blue-600">{formatPrice(data.current_price)}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Giá trung bình thị trường</p>
            <p className="text-xl font-bold text-gray-800">{formatPrice(data.market_average)}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Giá thấp nhất</p>
            <p className="text-xl font-bold text-gray-800">{formatPrice(data.market_min)}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Giá cao nhất</p>
            <p className="text-xl font-bold text-gray-800">{formatPrice(data.market_max)}</p>
          </div>
        </div>

        <div className={`p-4 rounded-lg flex items-center justify-between ${
          data.status === 'cao hơn' ? 'bg-red-50' :
          data.status === 'thấp hơn' ? 'bg-green-50' :
          'bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="font-semibold text-gray-800">
                Giá của bạn {data.status} thị trường
              </p>
              <p className={`text-sm font-bold ${getStatusColor()}`}>
                {data.difference_percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {data.recommendation && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>💡 Khuyến nghị:</strong> {data.recommendation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceComparison;

