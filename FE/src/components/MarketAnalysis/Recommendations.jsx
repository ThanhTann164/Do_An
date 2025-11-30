import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Target } from 'lucide-react';

const Recommendations = ({ data, formatPrice }) => {
  if (!data) return null;

  const getTimingIcon = () => {
    if (data.selling_timing === 'tốt') return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (data.selling_timing === 'không tốt') return <XCircle className="w-5 h-5 text-red-600" />;
    return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  };

  const getTimingColor = () => {
    if (data.selling_timing === 'tốt') return 'bg-green-50 border-green-200';
    if (data.selling_timing === 'không tốt') return 'bg-red-50 border-red-200';
    return 'bg-yellow-50 border-yellow-200';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-purple-600" />
        Khuyến nghị
      </h3>

      <div className="space-y-4">
        {/* Selling Timing */}
        <div className={`p-4 rounded-lg border ${getTimingColor()}`}>
          <div className="flex items-start gap-3">
            {getTimingIcon()}
            <div className="flex-1">
              <p className="font-semibold text-gray-800 mb-1">
                Thời điểm bán: <span className="capitalize">{data.selling_timing}</span>
              </p>
              <p className="text-sm text-gray-600">{data.selling_timing_reason}</p>
            </div>
          </div>
        </div>

        {/* Price Recommendation */}
        {data.price_recommendation && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-semibold text-gray-800 mb-3">Giá đề xuất</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Giá đề xuất:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatPrice(data.price_recommendation.recommended_price)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Khoảng giá phù hợp:</span>
                <span className="text-gray-700">
                  {formatPrice(data.price_recommendation.price_range.min)} - {formatPrice(data.price_recommendation.price_range.max)}
                </span>
              </div>
              {data.price_recommendation.reason && (
                <p className="text-sm text-gray-600 mt-2 italic">
                  {data.price_recommendation.reason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Items */}
        {data.action_items && data.action_items.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-800 mb-3">Hành động đề xuất</p>
            <ul className="space-y-2">
              {data.action_items.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;

