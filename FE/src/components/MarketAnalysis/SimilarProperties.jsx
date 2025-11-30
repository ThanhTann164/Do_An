import React from 'react';
import { Home, MapPin, TrendingUp, TrendingDown } from 'lucide-react';

const SimilarProperties = ({ data, formatPrice }) => {
  if (!data || !data.similar_properties || data.similar_properties.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Home className="w-5 h-5 text-indigo-600" />
        So sánh với căn tương tự
      </h3>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Vị trí của bạn:</strong> Top {data.price_rank} trong {data.similar_properties_count} căn tương tự
        </p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {data.similar_properties.map((property, index) => (
          <div 
            key={property.house_id || index}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{property.location}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-700">
                    <strong>Giá:</strong> {formatPrice(property.price)}
                  </span>
                  <span className="text-gray-700">
                    <strong>Diện tích:</strong> {property.area} m²
                  </span>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                property.difference_percentage > 0 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {property.difference_percentage > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {Math.abs(property.difference_percentage).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarProperties;

