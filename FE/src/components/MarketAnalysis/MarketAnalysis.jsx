import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  MapPin, 
  Home, 
  BarChart3,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { toast } from 'react-toastify';
import TrendChart from './TrendChart';
import PriceComparison from './PriceComparison';
import Recommendations from './Recommendations';
import SimilarProperties from './SimilarProperties';
import Insights from './Insights';

const MarketAnalysis = ({ 
  initialData = null, 
  onAnalysisComplete = null,
  propertyData = null 
}) => {
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(initialData);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    location: propertyData?.location || '',
    house_type: propertyData?.house_type || 'Căn hộ',
    area: propertyData?.area || '',
    current_price: propertyData?.price || '',
    bedrooms: propertyData?.bedrooms || '',
    bathrooms: propertyData?.bathrooms || '',
    analysis_type: 'basic'
  });

  useEffect(() => {
    if (initialData) {
      setAnalysisData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'area' || name === 'current_price' || name === 'bedrooms' || name === 'bathrooms'
        ? value ? parseFloat(value) : ''
        : value
    }));
  };

  const handleAnalyze = async () => {
    // Validation
    if (!formData.location || !formData.house_type || !formData.area) {
      toast.error('Vui lòng điền đầy đủ: Vị trí, Loại nhà, Diện tích');
      return;
    }

    if (formData.area < 20 || formData.area > 1000) {
      toast.error('Diện tích phải từ 20 đến 1000 m²');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await aiService.analyzeMarket(formData);
      
      if (response.success) {
        setAnalysisData(response.data);
        toast.success('Phân tích thị trường thành công!');
        if (onAnalysisComplete) {
          onAnalysisComplete(response.data);
        }
      } else {
        setError(response.message || 'Có lỗi xảy ra khi phân tích');
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Lỗi khi phân tích thị trường';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return '0 VND';
    if (price >= 1000000000) {
      const billions = Math.floor(price / 1000000000);
      const millions = Math.floor((price % 1000000000) / 1000000);
      if (millions > 0) {
        return `${billions}.${Math.floor(millions / 100)} tỷ VND`;
      }
      return `${billions} tỷ VND`;
    }
    return `${Math.floor(price / 1000000)} triệu VND`;
  };

  return (
    <div className="market-analysis-container bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Phân Tích Thị Trường
        </h2>
        <p className="text-gray-600">
          Phân tích xu hướng giá và đưa ra khuyến nghị định giá phù hợp
        </p>
      </div>

      {/* Form Input */}
      {!analysisData && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Thông tin bất động sản</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vị trí <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="VD: Quận 1, TP.HCM"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại nhà <span className="text-red-500">*</span>
              </label>
              <select
                name="house_type"
                value={formData.house_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Căn hộ">Căn hộ</option>
                <option value="Nhà phố">Nhà phố</option>
                <option value="Villa">Villa</option>
                <option value="Biệt thự">Biệt thự</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diện tích (m²) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                placeholder="VD: 80"
                min="20"
                max="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá hiện tại (VND)
              </label>
              <input
                type="number"
                name="current_price"
                value={formData.current_price}
                onChange={handleInputChange}
                placeholder="VD: 3500000000"
                min="100000000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số phòng ngủ
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                placeholder="VD: 2"
                min="1"
                max="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số phòng tắm
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                placeholder="VD: 2"
                min="1"
                max="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại phân tích
              </label>
              <select
                name="analysis_type"
                value={formData.analysis_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="basic">Cơ bản - So sánh giá</option>
                <option value="trend">Xu hướng - Dự đoán 3-6 tháng</option>
                <option value="comparative">So sánh chi tiết - Top căn tương tự</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-6 w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang phân tích...
              </>
            ) : (
              <>
                <BarChart3 className="w-5 h-5" />
                Phân tích thị trường
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800">Lỗi</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisData && (
        <div className="space-y-6">
          {/* Market Trend */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Xu hướng thị trường
              </h3>
              <span className="text-sm text-gray-600">
                {new Date(analysisData.analysis_date).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {analysisData.market_trend.direction === 'tăng' ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : analysisData.market_trend.direction === 'giảm' ? (
                <TrendingDown className="w-8 h-8 text-red-600" />
              ) : (
                <BarChart3 className="w-8 h-8 text-gray-600" />
              )}
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {analysisData.market_trend.direction.toUpperCase()} {analysisData.market_trend.percentage.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">{analysisData.market_trend.description}</p>
              </div>
            </div>
          </div>

          {/* Price Comparison */}
          <PriceComparison data={analysisData.price_comparison} formatPrice={formatPrice} />

          {/* Trend Chart */}
          {analysisData.statistics?.price_trend_last_3_months && (
            <TrendChart data={analysisData.statistics.price_trend_last_3_months} />
          )}

          {/* Trend Forecast */}
          {analysisData.trend_forecast && (
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Dự đoán xu hướng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">3 tháng tới</p>
                  <p className="text-xl font-bold text-gray-800">
                    {analysisData.trend_forecast['3_months'].direction.toUpperCase()} {Math.abs(analysisData.trend_forecast['3_months'].percentage).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Độ tin cậy: {(analysisData.trend_forecast['3_months'].confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">6 tháng tới</p>
                  <p className="text-xl font-bold text-gray-800">
                    {analysisData.trend_forecast['6_months'].direction.toUpperCase()} {Math.abs(analysisData.trend_forecast['6_months'].percentage).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Độ tin cậy: {(analysisData.trend_forecast['6_months'].confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <Recommendations data={analysisData.recommendations} formatPrice={formatPrice} />

          {/* Comparative Analysis */}
          {analysisData.comparative_analysis && (
            <SimilarProperties data={analysisData.comparative_analysis} formatPrice={formatPrice} />
          )}

          {/* Market Demand */}
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-green-600" />
              Nhu cầu thị trường
            </h3>
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg font-semibold ${
                analysisData.market_demand.level === 'cao' ? 'bg-green-500 text-white' :
                analysisData.market_demand.level === 'trung bình' ? 'bg-yellow-500 text-white' :
                'bg-red-500 text-white'
              }`}>
                {analysisData.market_demand.level.toUpperCase()}
              </div>
              <p className="text-gray-700">{analysisData.market_demand.description}</p>
            </div>
          </div>

          {/* Insights */}
          <Insights insights={analysisData.insights} />

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p>Độ tin cậy phân tích: {(analysisData.metadata.analysis_confidence * 100).toFixed(0)}%</p>
            <p>Chất lượng dữ liệu: {analysisData.metadata.data_quality}</p>
            <p>Số mẫu phân tích: {analysisData.metadata.sample_size} căn</p>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              setAnalysisData(null);
              setError(null);
            }}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Phân tích lại
          </button>
        </div>
      )}
    </div>
  );
};

export default MarketAnalysis;

