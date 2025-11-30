# Tài Liệu Chi Tiết: Market Analysis - Phân Tích Thị Trường

## 📋 1. TỔNG QUAN

### 1.1. Mô Tả Tổng Quan
**Market Analysis** là công cụ AI phân tích thị trường bất động sản, giúp Seller hiểu rõ xu hướng giá cả, nhu cầu thị trường, và đưa ra quyết định định giá bán hợp lý. Tính năng này chỉ dành cho gói **PREMIUM**.

### 1.2. Mục Đích
- Phân tích xu hướng giá bất động sản theo khu vực
- So sánh giá với các căn tương tự trên thị trường
- Dự đoán xu hướng giá trong 3-6 tháng tới
- Đưa ra khuyến nghị về thời điểm bán và mức giá phù hợp
- Cung cấp insights về nhu cầu thị trường

---

## 🔄 2. LUỒNG HOẠT ĐỘNG

### 2.1. Luồng Tổng Quan
```
1. Seller chọn bất động sản cần phân tích
2. Hệ thống thu thập dữ liệu:
   - Thông tin bất động sản (diện tích, vị trí, loại nhà, giá)
   - Dữ liệu thị trường từ database (các căn tương tự)
   - Dữ liệu lịch sử giá (nếu có)
3. Gửi dữ liệu đến AI Service
4. AI phân tích và trả về kết quả
5. Hiển thị kết quả với biểu đồ, số liệu, và khuyến nghị
```

### 2.2. Chi Tiết Từng Bước

#### Bước 1: Input từ Seller
- **Vị trí (Location)**: Quận/Huyện, Địa chỉ cụ thể
- **Loại nhà (House Type)**: Nhà phố, Căn hộ, Villa, Biệt thự
- **Diện tích (Area)**: m²
- **Giá hiện tại (Current Price)**: VND (nếu đã có)
- **Số phòng ngủ (Bedrooms)**: Optional
- **Số phòng tắm (Bathrooms)**: Optional

#### Bước 2: Thu thập dữ liệu từ Database
Hệ thống sẽ query:
```sql
-- Tìm các căn tương tự trong cùng khu vực
SELECT * FROM houses 
WHERE Location LIKE '%{location}%'
  AND HouseType = '{house_type}'
  AND Area BETWEEN {area * 0.8} AND {area * 1.2}
  AND Status = 'available'
  AND CreatedAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
ORDER BY CreatedAt DESC
LIMIT 50

-- Tính giá trung bình theo khu vực
SELECT 
  AVG(Price) as avg_price,
  MIN(Price) as min_price,
  MAX(Price) as max_price,
  COUNT(*) as total_listings
FROM houses
WHERE Location LIKE '%{location}%'
  AND HouseType = '{house_type}'
  AND Status = 'available'
```

#### Bước 3: Gửi đến AI Service
**Prompt Template:**
```
Bạn là chuyên gia phân tích thị trường bất động sản. Hãy phân tích thông tin sau:

THÔNG TIN BẤT ĐỘNG SẢN:
- Vị trí: {location}
- Loại nhà: {house_type}
- Diện tích: {area} m²
- Giá hiện tại: {current_price} VND (nếu có)
- Số phòng ngủ: {bedrooms}
- Số phòng tắm: {bathrooms}

DỮ LIỆU THỊ TRƯỜNG:
- Số lượng căn tương tự: {total_listings}
- Giá trung bình: {avg_price} VND
- Giá thấp nhất: {min_price} VND
- Giá cao nhất: {max_price} VND
- Danh sách 10 căn gần nhất: {similar_properties}

YÊU CẦU PHÂN TÍCH:
1. Phân tích xu hướng giá hiện tại (tăng/giảm/ổn định)
2. So sánh giá với thị trường (cao hơn/thấp hơn/trung bình)
3. Dự đoán xu hướng 3-6 tháng tới
4. Đưa ra khuyến nghị về mức giá phù hợp
5. Đánh giá thời điểm bán (tốt/trung bình/không tốt)
6. Phân tích nhu cầu thị trường

Trả về kết quả dưới dạng JSON với cấu trúc:
{
  "market_trend": "tăng/giảm/ổn định",
  "trend_percentage": số phần trăm,
  "price_comparison": "cao hơn/thấp hơn/trung bình",
  "price_difference_percentage": số phần trăm,
  "average_market_price": số tiền VND,
  "recommended_price": số tiền VND,
  "price_range": {
    "min": số tiền VND,
    "max": số tiền VND
  },
  "trend_forecast": {
    "3_months": "tăng/giảm/ổn định",
    "6_months": "tăng/giảm/ổn định",
    "confidence": 0.0-1.0
  },
  "selling_recommendation": "tốt/trung bình/không tốt",
  "market_demand": "cao/trung bình/thấp",
  "insights": [
    "insight 1",
    "insight 2",
    ...
  ],
  "similar_properties_count": số lượng,
  "analysis_date": "YYYY-MM-DD"
}
```

#### Bước 4: Xử lý kết quả AI
- Parse JSON response từ AI
- Validate dữ liệu
- Tính toán thêm metrics nếu cần
- Cache kết quả (nếu cùng location + house_type trong 24h)

#### Bước 5: Hiển thị kết quả
- Biểu đồ xu hướng giá
- Số liệu so sánh
- Khuyến nghị dạng text
- Danh sách căn tương tự

---

## 📊 3. DỮ LIỆU ĐẦU VÀO & ĐẦU RA

### 3.1. Dữ Liệu Đầu Vào (Input)

#### Request Body:
```json
{
  "location": "Quận 1, TP.HCM",
  "house_type": "Căn hộ",
  "area": 80,
  "current_price": 3500000000,
  "bedrooms": 2,
  "bathrooms": 2,
  "analysis_type": "basic" | "trend" | "comparative"
}
```

#### Query Parameters:
- `analysis_type`: `basic` | `trend` | `comparative` (mặc định: `basic`)
- `time_range`: `3` | `6` (tháng, chỉ dùng với `trend`)

### 3.2. Dữ Liệu Đầu Ra (Output)

#### Response JSON:
```json
{
  "success": true,
  "message": "Phân tích thị trường thành công",
  "data": {
    "analysis_id": "analysis_123456",
    "analysis_type": "basic",
    "analysis_date": "2024-01-15T10:30:00Z",
    
    // Xu hướng thị trường
    "market_trend": {
      "direction": "tăng",
      "percentage": 5.2,
      "description": "Giá bất động sản tăng 5.2% so với tháng trước",
      "trend_strength": "mạnh" // mạnh/trung bình/yếu
    },
    
    // So sánh giá
    "price_comparison": {
      "status": "cao hơn",
      "difference_percentage": 8.5,
      "current_price": 3500000000,
      "market_average": 3225000000,
      "market_min": 2800000000,
      "market_max": 4200000000,
      "recommendation": "Nên giảm giá khoảng 5-8% để cạnh tranh tốt hơn"
    },
    
    // Dự đoán xu hướng (nếu analysis_type = "trend")
    "trend_forecast": {
      "3_months": {
        "direction": "tăng",
        "percentage": 3.5,
        "confidence": 0.75
      },
      "6_months": {
        "direction": "tăng",
        "percentage": 7.2,
        "confidence": 0.68
      }
    },
    
    // So sánh với căn tương tự (nếu analysis_type = "comparative")
    "comparative_analysis": {
      "similar_properties_count": 15,
      "price_rank": 8, // Vị trí trong top 15
      "similar_properties": [
        {
          "house_id": 123,
          "price": 3200000000,
          "area": 75,
          "location": "Quận 1, TP.HCM",
          "difference_percentage": -8.6
        }
      ]
    },
    
    // Khuyến nghị
    "recommendations": {
      "selling_timing": "tốt",
      "selling_timing_reason": "Thị trường đang tăng, nhu cầu cao",
      "price_recommendation": {
        "recommended_price": 3300000000,
        "price_range": {
          "min": 3100000000,
          "max": 3500000000
        },
        "reason": "Giá này sẽ cạnh tranh tốt hơn trong khi vẫn đảm bảo lợi nhuận"
      },
      "action_items": [
        "Nên giảm giá 5-8% để tăng tính cạnh tranh",
        "Thời điểm hiện tại tốt để bán",
        "Có thể chờ thêm 1-2 tháng nếu không cần bán gấp"
      ]
    },
    
    // Phân tích nhu cầu
    "market_demand": {
      "level": "cao",
      "description": "Nhu cầu mua cao, số lượng người xem tăng 15%",
      "demand_factors": [
        "Vị trí trung tâm",
        "Giá phù hợp với thị trường",
        "Nhiều tiện ích xung quanh"
      ]
    },
    
    // Insights từ AI
    "insights": [
      "Giá của bạn cao hơn trung bình thị trường 8.5%, nên điều chỉnh để tăng tính cạnh tranh",
      "Thị trường đang có xu hướng tăng, đây là thời điểm tốt để bán",
      "Có 15 căn tương tự đang bán, cần có điểm khác biệt để nổi bật",
      "Nhu cầu mua cao trong khu vực này, khả năng bán nhanh tốt"
    ],
    
    // Dữ liệu thống kê
    "statistics": {
      "total_listings": 15,
      "average_days_on_market": 45,
      "average_price_per_sqm": 40000000,
      "price_trend_last_3_months": [
        {"month": "10/2023", "price": 3100000000},
        {"month": "11/2023", "price": 3200000000},
        {"month": "12/2023", "price": 3225000000}
      ]
    },
    
    // Metadata
    "metadata": {
      "data_quality": "tốt",
      "sample_size": 15,
      "analysis_confidence": 0.82,
      "cache_key": "market_analysis_quan1_canho_80"
    }
  }
}
```

---

## 🎨 4. UI/UX HIỂN THỊ

### 4.1. Vị Trí Hiển Thị
1. **Seller Dashboard** (`/seller/dashboard`)
   - Tab "Market Analysis" hoặc section riêng
   - Có thể chọn bất động sản để phân tích

2. **Property Detail Page** (`/property/:id`)
   - Button "Phân tích thị trường" (chỉ Seller owner)
   - Modal hoặc sidebar hiển thị kết quả

3. **Create/Edit Post Page** (`/post/create`, `/post/edit/:id`)
   - Section "Market Analysis" tự động phân tích khi nhập thông tin
   - Hiển thị gợi ý giá dựa trên phân tích

### 4.2. Component Structure

#### Main Component: `MarketAnalysis.jsx`
```jsx
<MarketAnalysis>
  <MarketAnalysisHeader />
  <MarketAnalysisFilters />
  <MarketAnalysisResults>
    <TrendChart />
    <PriceComparison />
    <Recommendations />
    <SimilarProperties />
    <Insights />
  </MarketAnalysisResults>
</MarketAnalysis>
```

### 4.3. Visual Elements

#### 1. Biểu Đồ Xu Hướng (Trend Chart)
- **Line Chart**: Giá trung bình theo tháng (3-6 tháng)
- **Bar Chart**: So sánh giá hiện tại vs trung bình thị trường
- **Area Chart**: Dự đoán xu hướng 3-6 tháng tới

#### 2. Số Liệu So Sánh (Price Comparison)
- **Card hiển thị**:
  - Giá hiện tại: 3.5 tỷ VND
  - Giá trung bình thị trường: 3.225 tỷ VND
  - Chênh lệch: +8.5% (màu đỏ nếu cao hơn, xanh nếu thấp hơn)
  - Giá đề xuất: 3.3 tỷ VND

#### 3. Khuyến Nghị (Recommendations)
- **Badge/Tag**: "Thời điểm tốt" / "Thời điểm trung bình" / "Không nên bán"
- **List items**: Các action items với icon
- **Price recommendation card**: Giá đề xuất với lý do

#### 4. Danh Sách Căn Tương Tự (Similar Properties)
- **Table hoặc Card list**:
  - Hình ảnh
  - Giá
  - Diện tích
  - Vị trí
  - Chênh lệch % so với căn của bạn

#### 5. Insights
- **Bullet points** với icon
- **Highlight** các insight quan trọng

### 4.4. Loading States
- Skeleton loading khi đang phân tích
- Progress bar với % hoàn thành
- Message: "Đang phân tích thị trường..."

### 4.5. Error Handling
- Hiển thị lỗi nếu không đủ dữ liệu
- Gợi ý: "Không có đủ dữ liệu để phân tích, vui lòng thử lại sau"
- Retry button

---

## 🔌 5. API SPECIFICATIONS

### 5.1. Endpoint
```
POST /api/ai/analyze-market
```

### 5.2. Authentication
- Required: Yes
- Role: Seller (PREMIUM package only)
- Header: `Authorization: Bearer {token}`

### 5.3. Request

#### Headers:
```
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

#### Body:
```json
{
  "location": "Quận 1, TP.HCM",
  "house_type": "Căn hộ",
  "area": 80,
  "current_price": 3500000000,
  "bedrooms": 2,
  "bathrooms": 2,
  "analysis_type": "basic"
}
```

#### Query Parameters (Optional):
- `analysis_type`: `basic` | `trend` | `comparative` (default: `basic`)
- `time_range`: `3` | `6` (months, only for `trend` type)

### 5.4. Response

#### Success (200):
```json
{
  "success": true,
  "message": "Phân tích thị trường thành công",
  "data": { /* Xem phần 3.2 */ }
}
```

#### Error (400 - Bad Request):
```json
{
  "success": false,
  "message": "Thiếu thông tin bắt buộc: location, house_type, area"
}
```

#### Error (403 - Forbidden):
```json
{
  "success": false,
  "message": "Gói của bạn không hỗ trợ tính năng này. Vui lòng nâng cấp lên PREMIUM",
  "data": {
    "required_package": "PREMIUM",
    "current_package": "PRO"
  }
}
```

#### Error (500 - Server Error):
```json
{
  "success": false,
  "message": "Lỗi khi phân tích thị trường. Vui lòng thử lại sau"
}
```

---

## 🎯 6. BA PHIÊN BẢN TÍNH NĂNG

### 6.1. Basic Market Analysis (Cơ Bản)
**Mô tả**: Phân tích giá trung bình theo khu vực, so sánh với giá hiện tại

**Input tối thiểu**:
- location
- house_type
- area
- current_price (optional)

**Output**:
- Giá trung bình thị trường
- So sánh giá (cao hơn/thấp hơn/trung bình)
- Khuyến nghị giá cơ bản
- Số lượng căn tương tự

**Use case**: Seller muốn biết giá của mình có hợp lý không

---

### 6.2. Trend Analysis (Phân Tích Xu Hướng)
**Mô tả**: Dự đoán xu hướng giá trong 3-6 tháng tới

**Input**:
- Tất cả input của Basic
- time_range: 3 hoặc 6 tháng

**Output**:
- Tất cả output của Basic
- Dự đoán xu hướng 3-6 tháng
- Biểu đồ xu hướng giá
- Confidence score
- Khuyến nghị thời điểm bán

**Use case**: Seller muốn biết có nên bán ngay hay chờ thêm

---

### 6.3. Comparative Analysis (So Sánh Chi Tiết)
**Mô tả**: So sánh chi tiết với các căn tương tự trên thị trường

**Input**:
- Tất cả input của Basic
- analysis_type: "comparative"

**Output**:
- Tất cả output của Basic
- Danh sách top 10-15 căn tương tự
- So sánh từng căn (giá, diện tích, vị trí)
- Xếp hạng giá của căn bạn trong top
- Điểm mạnh/yếu so với đối thủ

**Use case**: Seller muốn hiểu rõ vị trí của mình trong thị trường

---

## 🤖 7. AI PROMPT & PARAMETERS

### 7.1. AI Service Integration
Hệ thống có thể tích hợp với:
- OpenAI GPT-4
- Google Gemini
- Claude AI
- Hoặc custom AI service

### 7.2. Prompt Template (Chi Tiết)

```
Bạn là chuyên gia phân tích thị trường bất động sản tại Việt Nam với 10+ năm kinh nghiệm.

NHIỆM VỤ: Phân tích thị trường bất động sản và đưa ra khuyến nghị cho seller.

THÔNG TIN BẤT ĐỘNG SẢN:
- Vị trí: {location}
- Loại nhà: {house_type}
- Diện tích: {area} m²
- Giá hiện tại: {current_price} VND ({current_price_formatted})
- Số phòng ngủ: {bedrooms}
- Số phòng tắm: {bathrooms}

DỮ LIỆU THỊ TRƯỜNG (từ database):
- Tổng số căn tương tự: {total_listings}
- Giá trung bình: {avg_price} VND ({avg_price_formatted})
- Giá thấp nhất: {min_price} VND ({min_price_formatted})
- Giá cao nhất: {max_price} VND ({max_price_formatted})
- Giá trung bình/m²: {avg_price_per_sqm} VND/m²
- Số căn đã bán trong 3 tháng: {sold_count_3m}
- Thời gian bán trung bình: {avg_days_on_market} ngày

DANH SÁCH CĂN TƯƠNG TỰ (top 10):
{similar_properties_list}

YÊU CẦU PHÂN TÍCH ({analysis_type}):

1. PHÂN TÍCH XU HƯỚNG:
   - Xu hướng giá hiện tại (tăng/giảm/ổn định) và % thay đổi
   - So sánh với 3 tháng trước
   - Đánh giá độ mạnh của xu hướng

2. SO SÁNH GIÁ:
   - So sánh giá hiện tại với giá trung bình thị trường
   - Tính % chênh lệch
   - Đánh giá tính cạnh tranh của giá

3. DỰ ĐOÁN XU HƯỚNG (nếu analysis_type = "trend"):
   - Dự đoán xu hướng 3 tháng tới
   - Dự đoán xu hướng 6 tháng tới
   - Confidence score (0-1)
   - Lý do dự đoán

4. SO SÁNH CHI TIẾT (nếu analysis_type = "comparative"):
   - Xếp hạng giá của căn này trong top {total_listings} căn
   - So sánh với từng căn tương tự
   - Điểm mạnh/yếu so với đối thủ

5. KHUYẾN NGHỊ:
   - Mức giá đề xuất (VND)
   - Khoảng giá phù hợp (min-max)
   - Thời điểm bán (tốt/trung bình/không tốt)
   - Lý do khuyến nghị
   - Action items cụ thể

6. PHÂN TÍCH NHU CẦU:
   - Mức độ nhu cầu (cao/trung bình/thấp)
   - Các yếu tố ảnh hưởng
   - Dự đoán khả năng bán nhanh

7. INSIGHTS:
   - 3-5 insights quan trọng nhất
   - Gợi ý cải thiện
   - Cảnh báo (nếu có)

ĐỊNH DẠNG OUTPUT:
Trả về JSON hợp lệ với cấu trúc như trong phần 3.2.

LƯU Ý:
- Sử dụng tiếng Việt cho tất cả text
- Giá tiền format: "X tỷ Y triệu VND" hoặc "X triệu VND"
- % format: 2 chữ số thập phân
- Confidence: 0.0-1.0
- Phân tích phải thực tế, dựa trên dữ liệu
- Không đưa ra khuyến nghị quá lạc quan hoặc bi quan
```

### 7.3. Parameters Truyền Vào AI

```javascript
const aiParams = {
  model: "gpt-4" | "gemini-pro" | "claude-3",
  temperature: 0.3, // Thấp để có kết quả nhất quán
  max_tokens: 2000,
  system_prompt: "Bạn là chuyên gia phân tích thị trường bất động sản...",
  user_prompt: promptTemplate, // Từ phần 7.2
  response_format: "json_object", // Nếu AI hỗ trợ
  cache: true, // Cache kết quả nếu cùng input
  timeout: 30000 // 30 giây
};
```

---

## 💾 8. CACHING & PERFORMANCE

### 8.1. Caching Strategy
- **Cache key**: `market_analysis_{location}_{house_type}_{area}`
- **TTL**: 24 giờ (dữ liệu thị trường thay đổi không quá nhanh)
- **Storage**: Redis hoặc Memory cache
- **Invalidation**: Khi có căn mới được thêm vào cùng khu vực

### 8.2. Performance Optimization
- Query database với index trên `Location`, `HouseType`, `Area`
- Limit số lượng căn tương tự query (max 50)
- Async processing nếu phân tích phức tạp
- Show cached result ngay, update background nếu cần

---

## ✅ 9. VALIDATION & ERROR HANDLING

### 9.1. Input Validation
- `location`: Required, string, min 5 chars
- `house_type`: Required, enum: ["Nhà phố", "Căn hộ", "Villa", "Biệt thự"]
- `area`: Required, number, min 20, max 1000
- `current_price`: Optional, number, min 100000000 (100 triệu)
- `bedrooms`: Optional, number, min 1, max 10
- `bathrooms`: Optional, number, min 1, max 10

### 9.2. Error Cases
1. **Không đủ dữ liệu thị trường**: < 5 căn tương tự
   - Response: "Không có đủ dữ liệu để phân tích. Vui lòng thử lại sau."
   
2. **AI Service timeout**: > 30 giây
   - Response: "Phân tích mất quá nhiều thời gian. Vui lòng thử lại."
   - Fallback: Trả về phân tích cơ bản từ database

3. **AI Service error**: Lỗi từ AI
   - Response: "Lỗi khi phân tích. Vui lòng thử lại sau."
   - Log error để debug

---

## 📝 10. TESTING

### 10.1. Test Cases
1. **Basic Analysis với đủ dữ liệu**
2. **Trend Analysis với dữ liệu 6 tháng**
3. **Comparative Analysis với 15+ căn tương tự**
4. **Không đủ dữ liệu (< 5 căn)**
5. **Location không có trong database**
6. **AI service timeout**
7. **Package không đủ quyền (không phải PREMIUM)**

---

## 🚀 11. ROADMAP & FUTURE ENHANCEMENTS

### 11.1. Phase 1 (Hiện tại)
- ✅ Basic Market Analysis
- ✅ Price Comparison
- ✅ Basic Recommendations

### 11.2. Phase 2 (Tương lai)
- 🔄 Trend Analysis với ML model
- 🔄 Comparative Analysis chi tiết
- 🔄 Real-time market updates
- 🔄 Email/SMS notifications khi giá thay đổi

### 11.3. Phase 3 (Nâng cao)
- 🔄 Predictive analytics với AI
- 🔄 Integration với external data sources
- 🔄 Market reports PDF export
- 🔄 Historical data visualization

---

*Tài liệu này được cập nhật lần cuối: 2024-01-15*

