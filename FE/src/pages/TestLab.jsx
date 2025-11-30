import React, { useState } from 'react';
import aiService from '../services/aiService';
import { Loader2, Zap, Brain, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function TestLab() {
  // Virtual Package State
  const [virtualPackage, setVirtualPackage] = useState('PREMIUM');

  // Form Data
  const [formData, setFormData] = useState({
    propertyType: '',
    city: '',
    district: '',
    area: '',
    price: '',
    bedrooms: '',
    bathrooms: ''
  });

  // Results State
  const [marketAnalysisResult, setMarketAnalysisResult] = useState(null);
  const [descriptionResult, setDescriptionResult] = useState(null);
  const [loading, setLoading] = useState({ market: false, description: false });
  const [error, setError] = useState({ market: null, description: null });

  // Test Data Scenarios
  const testScenarios = [
    {
      name: 'Căn hộ giá rẻ Quận 1',
      propertyType: 'Căn hộ',
      city: 'Thành phố Hồ Chí Minh',
      district: 'Quận 1',
      area: '50',
      price: '2000000000',
      bedrooms: '1',
      bathrooms: '1'
    },
    {
      name: 'Biệt thự cao cấp Quận 2',
      propertyType: 'Biệt thự',
      city: 'Thành phố Hồ Chí Minh',
      district: 'Quận 2',
      area: '300',
      price: '15000000000',
      bedrooms: '5',
      bathrooms: '4'
    },
    {
      name: 'Nhà phố trung tâm Hà Nội',
      propertyType: 'Nhà phố',
      city: 'Hà Nội',
      district: 'Quận Hoàn Kiếm',
      area: '80',
      price: '8000000000',
      bedrooms: '3',
      bathrooms: '2'
    },
    {
      name: 'Căn hộ studio giá tốt',
      propertyType: 'Căn hộ',
      city: 'Thành phố Hồ Chí Minh',
      district: 'Quận 7',
      area: '30',
      price: '1200000000',
      bedrooms: '1',
      bathrooms: '1'
    },
    {
      name: 'Penthouse cao cấp',
      propertyType: 'Căn hộ',
      city: 'Thành phố Hồ Chí Minh',
      district: 'Quận 1',
      area: '200',
      price: '25000000000',
      bedrooms: '4',
      bathrooms: '3'
    }
  ];

  // Fill random test data
  const fillTestData = () => {
    const randomScenario = testScenarios[Math.floor(Math.random() * testScenarios.length)];
    setFormData(randomScenario);
    setMarketAnalysisResult(null);
    setDescriptionResult(null);
    setError({ market: null, description: null });
  };

  // Handle Analyze Market
  const handleAnalyzeMarket = async () => {
    if (!formData.propertyType || !formData.city || !formData.area) {
      setError({ ...error, market: 'Vui lòng điền đầy đủ: Loại nhà, Thành phố, Diện tích' });
      return;
    }

    setLoading({ ...loading, market: true });
    setError({ ...error, market: null });
    setMarketAnalysisResult(null);

    try {
      const location = formData.district 
        ? `${formData.district}, ${formData.city}`
        : formData.city;

      const result = await aiService.analyzeMarketNew({
        location: location,
        propertyType: formData.propertyType,
        area: parseFloat(formData.area) || null,
        price: formData.price ? parseInt(formData.price) : null
      });

      setMarketAnalysisResult(result);
    } catch (err) {
      console.error('Market analysis error:', err);
      setError({
        ...error,
        market: err.response?.data?.message || err.message || 'Có lỗi xảy ra khi phân tích thị trường'
      });
    } finally {
      setLoading({ ...loading, market: false });
    }
  };

  // Handle Generate Description
  const handleGenerateDescription = async () => {
    if (!formData.propertyType || !formData.city || !formData.area) {
      setError({ ...error, description: 'Vui lòng điền đầy đủ: Loại nhà, Thành phố, Diện tích' });
      return;
    }

    setLoading({ ...loading, description: true });
    setError({ ...error, description: null });
    setDescriptionResult(null);

    try {
      const location = formData.district 
        ? `${formData.district}, ${formData.city}`
        : formData.city;

      const result = await aiService.generateDescription({
        propertyType: formData.propertyType,
        location: location,
        area: parseFloat(formData.area) || null,
        price: formData.price ? parseInt(formData.price) : null,
        features: ['đầy đủ tiện ích']
      });

      setDescriptionResult(result);
    } catch (err) {
      console.error('Generate description error:', err);
      setError({
        ...error,
        description: err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo mô tả'
      });
    } finally {
      setLoading({ ...loading, description: false });
    }
  };

  // Check if feature is available based on virtual package
  const hasFeature = (feature) => {
    if (feature === 'market_analysis' || feature === 'generate_description') {
      return virtualPackage === 'PREMIUM';
    }
    return virtualPackage !== 'FREE';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 AI Test Lab
          </h1>
          <p className="text-gray-600">
            Test các tính năng AI mà không cần đăng nhập hoặc chỉnh sửa database
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Controls */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">⚙️ Controls</h2>

            {/* Virtual Package Switcher */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                📦 Virtual Package (Giả lập gói)
              </label>
              <div className="flex gap-4">
                {['FREE', 'PRO', 'PREMIUM'].map((pkg) => (
                  <label
                    key={pkg}
                    className={`flex items-center cursor-pointer ${
                      virtualPackage === pkg ? 'font-bold' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="virtualPackage"
                      value={pkg}
                      checked={virtualPackage === pkg}
                      onChange={(e) => setVirtualPackage(e.target.value)}
                      className="mr-2"
                    />
                    <span
                      className={
                        virtualPackage === pkg
                          ? pkg === 'PREMIUM'
                            ? 'text-yellow-600'
                            : pkg === 'PRO'
                            ? 'text-blue-600'
                            : 'text-gray-600'
                          : 'text-gray-500'
                      }
                    >
                      {pkg}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Chọn gói để xem các tính năng ẩn/hiện
              </p>
            </div>

            {/* Form Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại bất động sản *
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn loại --</option>
                  <option value="Căn hộ">Căn hộ</option>
                  <option value="Nhà phố">Nhà phố</option>
                  <option value="Biệt thự">Biệt thự</option>
                  <option value="Đất nền">Đất nền</option>
                  <option value="Shophouse">Shophouse</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tỉnh/Thành phố *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="VD: Thành phố Hồ Chí Minh"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quận/Huyện
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="VD: Quận 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diện tích (m²) *
                  </label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="VD: 80"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="VD: 5000000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số phòng ngủ
                  </label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    placeholder="VD: 2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số phòng tắm
                  </label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    placeholder="VD: 2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Fill Test Data Button */}
              <button
                onClick={fillTestData}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                ⚡ Fill Test Data
              </button>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Results</h2>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              {/* Analyze Market Button */}
              <button
                onClick={handleAnalyzeMarket}
                disabled={loading.market || !hasFeature('market_analysis')}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  !hasFeature('market_analysis')
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                }`}
              >
                {loading.market ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    🤖 Analyze Market
                  </>
                )}
              </button>

              {/* Generate Description Button */}
              <button
                onClick={handleGenerateDescription}
                disabled={loading.description || !hasFeature('generate_description')}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  !hasFeature('generate_description')
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                {loading.description ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tạo mô tả...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    ✨ Generate Description
                  </>
                )}
              </button>
            </div>

            {/* Feature Availability Notice */}
            {virtualPackage !== 'PREMIUM' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Các tính năng AI chỉ khả dụng cho gói <strong>PREMIUM</strong>. 
                  Chuyển sang PREMIUM để test.
                </p>
              </div>
            )}

            {/* Error Display */}
            {error.market && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-900 mb-1">Lỗi Market Analysis</h3>
                    <p className="text-sm text-red-700">{error.market}</p>
                  </div>
                </div>
              </div>
            )}

            {error.description && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-900 mb-1">Lỗi Generate Description</h3>
                    <p className="text-sm text-red-700">{error.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Market Analysis Result */}
            {marketAnalysisResult && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Market Analysis Result</h3>
                </div>

                {/* Formatted Result */}
                {marketAnalysisResult.success && marketAnalysisResult.data && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">Đánh giá giá: </span>
                      <span
                        className={`px-2 py-1 rounded text-sm font-semibold ${
                          marketAnalysisResult.data.valuation === 'Rẻ'
                            ? 'bg-green-100 text-green-800'
                            : marketAnalysisResult.data.valuation === 'Đắt'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {marketAnalysisResult.data.valuation}
                      </span>
                    </div>

                    {marketAnalysisResult.data.pros && marketAnalysisResult.data.pros.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-green-700 block mb-1">
                          ✅ Ưu điểm:
                        </span>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {marketAnalysisResult.data.pros.map((pro, idx) => (
                            <li key={idx}>{pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {marketAnalysisResult.data.cons && marketAnalysisResult.data.cons.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-red-700 block mb-1">
                          ⚠️ Nhược điểm:
                        </span>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {marketAnalysisResult.data.cons.map((con, idx) => (
                            <li key={idx}>{con}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Raw JSON */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    📄 Raw JSON Response
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs overflow-auto max-h-96">
                    {JSON.stringify(marketAnalysisResult, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* Description Result */}
            {descriptionResult && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Generated Description</h3>
                </div>

                {/* Formatted Result */}
                {descriptionResult.success && descriptionResult.description && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {descriptionResult.description}
                    </p>
                  </div>
                )}

                {/* Raw JSON */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    📄 Raw JSON Response
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs overflow-auto max-h-96">
                    {JSON.stringify(descriptionResult, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* Empty State */}
            {!marketAnalysisResult && !descriptionResult && !error.market && !error.description && (
              <div className="text-center py-12 text-gray-500">
                <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Chọn gói PREMIUM và điền thông tin để bắt đầu test</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

