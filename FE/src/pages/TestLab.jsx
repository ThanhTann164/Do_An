import { useState } from 'react';
import aiService from '../services/aiService';
import { 
  Sparkles, 
  BarChart3, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Zap,
  Crown,
  Gift
} from 'lucide-react';

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
  const [loading, setLoading] = useState({
    marketAnalysis: false,
    generateDescription: false
  });
  const [errors, setErrors] = useState({
    marketAnalysis: null,
    generateDescription: null
  });

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
      district: 'Quận Ba Đình',
      area: '120',
      price: '8000000000',
      bedrooms: '3',
      bathrooms: '2'
    },
    {
      name: 'Căn hộ studio giá siêu rẻ',
      propertyType: 'Căn hộ',
      city: 'Thành phố Hồ Chí Minh',
      district: 'Quận 7',
      area: '30',
      price: '1200000000',
      bedrooms: '1',
      bathrooms: '1'
    },
    {
      name: 'Penthouse siêu sang',
      propertyType: 'Penthouse',
      city: 'Thành phố Hồ Chí Minh',
      district: 'Quận 1',
      area: '500',
      price: '50000000000',
      bedrooms: '6',
      bathrooms: '5'
    }
  ];

  const fillTestData = () => {
    const randomScenario = testScenarios[Math.floor(Math.random() * testScenarios.length)];
    setFormData(randomScenario);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAnalyzeMarket = async () => {
    if (!formData.propertyType || !formData.city || !formData.area) {
      setErrors(prev => ({
        ...prev,
        marketAnalysis: 'Vui lòng điền đầy đủ: Loại nhà, Tỉnh/Thành phố, Diện tích'
      }));
      return;
    }

    setLoading(prev => ({ ...prev, marketAnalysis: true }));
    setErrors(prev => ({ ...prev, marketAnalysis: null }));
    setMarketAnalysisResult(null);

    try {
      const location = [formData.district, formData.city]
        .filter(Boolean)
        .join(', ');

      const result = await aiService.analyzeMarketNew({
        location: location || formData.city,
        price: formData.price ? parseInt(formData.price) : null,
        area: formData.area ? parseFloat(formData.area) : null,
        propertyType: formData.propertyType
      });

      setMarketAnalysisResult(result);
    } catch (error) {
      console.error('Market analysis error:', error);
      setErrors(prev => ({
        ...prev,
        marketAnalysis: error.response?.data?.message || error.message || 'Có lỗi xảy ra'
      }));
    } finally {
      setLoading(prev => ({ ...prev, marketAnalysis: false }));
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.propertyType || !formData.city || !formData.area) {
      setErrors(prev => ({
        ...prev,
        generateDescription: 'Vui lòng điền đầy đủ: Loại nhà, Tỉnh/Thành phố, Diện tích'
      }));
      return;
    }

    setLoading(prev => ({ ...prev, generateDescription: true }));
    setErrors(prev => ({ ...prev, generateDescription: null }));
    setDescriptionResult(null);

    try {
      const location = [formData.district, formData.city]
        .filter(Boolean)
        .join(', ');

      const result = await aiService.generateDescription({
        propertyType: formData.propertyType,
        location: location || formData.city,
        features: ['đầy đủ tiện ích'],
        area: formData.area ? parseFloat(formData.area) : null,
        price: formData.price ? parseInt(formData.price) : null
      });

      setDescriptionResult(result);
    } catch (error) {
      console.error('Generate description error:', error);
      setErrors(prev => ({
        ...prev,
        generateDescription: error.response?.data?.message || error.message || 'Có lỗi xảy ra'
      }));
    } finally {
      setLoading(prev => ({ ...prev, generateDescription: false }));
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ VND`;
    }
    return `${(price / 1000000).toFixed(0)} triệu VND`;
  };

  const canUsePremiumFeatures = virtualPackage === 'PREMIUM';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Zap className="w-10 h-10 text-yellow-500" />
            AI Test Lab
          </h1>
          <p className="text-gray-600 text-lg">
            Test các tính năng AI mà không cần đăng nhập hoặc chỉnh sửa database
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Gift className="w-6 h-6 text-purple-600" />
              Controls
            </h2>

            {/* Virtual Package Switcher */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                🎭 Virtual Package Switcher
              </label>
              <div className="flex gap-4">
                {['FREE', 'PRO', 'PREMIUM'].map((pkg) => (
                  <label
                    key={pkg}
                    className={`flex-1 p-3 rounded-lg cursor-pointer transition-all ${
                      virtualPackage === pkg
                        ? pkg === 'PREMIUM'
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg'
                          : pkg === 'PRO'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                          : 'bg-gray-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="virtualPackage"
                      value={pkg}
                      checked={virtualPackage === pkg}
                      onChange={(e) => setVirtualPackage(e.target.value)}
                      className="hidden"
                    />
                    <div className="text-center">
                      {pkg === 'PREMIUM' && <Crown className="w-5 h-5 mx-auto mb-1" />}
                      {pkg === 'PRO' && <Zap className="w-5 h-5 mx-auto mb-1" />}
                      {pkg === 'FREE' && <Gift className="w-5 h-5 mx-auto mb-1" />}
                      <div className="font-bold">{pkg}</div>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Simulate package permissions để test UI
              </p>
            </div>

            {/* Form Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại bất động sản *
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn loại...</option>
                  <option value="Căn hộ">Căn hộ</option>
                  <option value="Nhà phố">Nhà phố</option>
                  <option value="Biệt thự">Biệt thự</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Shophouse">Shophouse</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tỉnh/Thành phố *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="VD: Thành phố Hồ Chí Minh"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quận/Huyện
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="VD: Quận 1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diện tích (m²) *
                  </label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="120"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="5000000000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    placeholder="3"
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
                    placeholder="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Fill Test Data Button */}
              <button
                onClick={fillTestData}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
              >
                ⚡ Fill Test Data
              </button>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              AI Results
            </h2>

            {/* AI Buttons */}
            <div className="space-y-4 mb-6">
              {/* Market Analysis Button */}
              <button
                onClick={handleAnalyzeMarket}
                disabled={loading.marketAnalysis || !canUsePremiumFeatures}
                className={`w-full px-6 py-4 rounded-lg font-semibold text-white transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                  canUsePremiumFeatures
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    : 'bg-gray-400 cursor-not-allowed opacity-50'
                }`}
              >
                {loading.marketAnalysis ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5" />
                    🤖 Analyze Market {!canUsePremiumFeatures && '(PREMIUM only)'}
                  </>
                )}
              </button>

              {/* Generate Description Button */}
              <button
                onClick={handleGenerateDescription}
                disabled={loading.generateDescription || !canUsePremiumFeatures}
                className={`w-full px-6 py-4 rounded-lg font-semibold text-white transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                  canUsePremiumFeatures
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700'
                    : 'bg-gray-400 cursor-not-allowed opacity-50'
                }`}
              >
                {loading.generateDescription ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang tạo mô tả...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    ✨ Generate Description {!canUsePremiumFeatures && '(PREMIUM only)'}
                  </>
                )}
              </button>
            </div>

            {/* Error Messages */}
            {errors.marketAnalysis && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">Market Analysis Error</p>
                  <p className="text-sm text-red-600">{errors.marketAnalysis}</p>
                </div>
              </div>
            )}

            {errors.generateDescription && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">Generate Description Error</p>
                  <p className="text-sm text-red-600">{errors.generateDescription}</p>
                </div>
              </div>
            )}

            {/* Market Analysis Results */}
            {marketAnalysisResult && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-blue-900">Market Analysis Result</h3>
                </div>

                {/* Formatted Result */}
                {marketAnalysisResult.success && marketAnalysisResult.data && (
                  <div className="mb-4 space-y-3">
                    <div>
                      <span className="font-semibold text-gray-700">Đánh giá giá: </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        marketAnalysisResult.data.valuation === 'Rẻ' 
                          ? 'bg-green-100 text-green-800'
                          : marketAnalysisResult.data.valuation === 'Đắt'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {marketAnalysisResult.data.valuation}
                      </span>
                    </div>

                    {marketAnalysisResult.data.pros && marketAnalysisResult.data.pros.length > 0 && (
                      <div>
                        <p className="font-semibold text-green-700 mb-1">✅ Ưu điểm:</p>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {marketAnalysisResult.data.pros.map((pro, idx) => (
                            <li key={idx}>{pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {marketAnalysisResult.data.cons && marketAnalysisResult.data.cons.length > 0 && (
                      <div>
                        <p className="font-semibold text-red-700 mb-1">⚠️ Nhược điểm:</p>
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
                  <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
                    📋 Raw JSON Response
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded text-xs overflow-auto max-h-64">
                    {JSON.stringify(marketAnalysisResult, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* Description Results */}
            {descriptionResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-green-900">Generated Description</h3>
                </div>

                {/* Formatted Result */}
                {descriptionResult.success && descriptionResult.description && (
                  <div className="mb-4">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {descriptionResult.description}
                    </p>
                  </div>
                )}

                {/* Raw JSON */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
                    📋 Raw JSON Response
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded text-xs overflow-auto max-h-64">
                    {JSON.stringify(descriptionResult, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* Empty State */}
            {!marketAnalysisResult && !descriptionResult && !errors.marketAnalysis && !errors.generateDescription && (
              <div className="text-center py-12 text-gray-400">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Chọn package và điền thông tin, sau đó click các nút AI để xem kết quả</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

