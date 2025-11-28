import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

export default function BookAppointment() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedSeller, setSelectedSeller] = useState('');
  const [selectedHouse, setSelectedHouse] = useState('');
  const [sellers, setSellers] = useState([]);
  const [houses, setHouses] = useState([]);
  const [mySelectedDates, setMySelectedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [currentSelectingDate, setCurrentSelectingDate] = useState(null);
  const [tempTime, setTempTime] = useState('09:00');
  const [myAppointments, setMyAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Fetch user role và danh sách tương ứng
  useEffect(() => {
    fetchUserRole();
    fetchMyAppointments();
  }, []);

  // Fetch sellers và houses
  useEffect(() => {
    if (userRole) {
      fetchSellers();
      fetchHouses();
    }
  }, [userRole]);



  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user', {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        const userData = data.data || data.user;
        setUserRole(userData?.role || userData?.Role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchSellers = async () => {
    try {
      const response = await fetch('/api/users/sellers', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSellers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
    }
  };

  const fetchHouses = async () => {
    try {
      const response = await fetch('/api/houses', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setHouses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching houses:', error);
    }
  };



  const fetchMyAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings/my-schedule', {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetched bookings:', data.data);
        setMyAppointments(data.data || []);
      } else {
        console.error('❌ Failed to fetch bookings:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching my appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleCancelBooking = async (viewingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy cuộc hẹn này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${viewingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include'
      });

      if (response.ok) {
        alert('Hủy cuộc hẹn thành công!');
        fetchMyAppointments();
      } else {
        const error = await response.json();
        alert(error.message || 'Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Có lỗi xảy ra khi hủy cuộc hẹn!');
    }
  };

  // Generate years (current year ± 2 years)
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
  
  // Months in Vietnamese
  const months = [
    { value: 0, label: 'Tháng 1' },
    { value: 1, label: 'Tháng 2' },
    { value: 2, label: 'Tháng 3' },
    { value: 3, label: 'Tháng 4' },
    { value: 4, label: 'Tháng 5' },
    { value: 5, label: 'Tháng 6' },
    { value: 6, label: 'Tháng 7' },
    { value: 7, label: 'Tháng 8' },
    { value: 8, label: 'Tháng 9' },
    { value: 9, label: 'Tháng 10' },
    { value: 10, label: 'Tháng 11' },
    { value: 11, label: 'Tháng 12' }
  ];

  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, ...)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Convert Sunday-first (0-6) to Monday-first (0-6)
  const convertToMondayFirst = (dayOfWeek) => {
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  };

  // Generate calendar days
  const generateCalendar = (year, month) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const firstDayMondayFirst = convertToMondayFirst(firstDay);
    const days = [];

    for (let i = 0; i < firstDayMondayFirst; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const handleDateClick = (day, isMyCalendar) => {
    if (!day) return;
    
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (isMyCalendar) {
      // Kiểm tra xem ngày này đã được chọn chưa
      const existingIndex = mySelectedDates.findIndex(d => d.date === dateStr);
      
      if (existingIndex >= 0) {
        // Bỏ chọn
        setMySelectedDates(prev => prev.filter((_, i) => i !== existingIndex));
      } else {
        // Chọn ngày mới - hiện modal nhập giờ
        setCurrentSelectingDate(dateStr);
        setTempTime('09:00');
        setShowTimeModal(true);
      }
    }
  };

  const handleTimeConfirm = () => {
    if (currentSelectingDate && tempTime) {
      const newDate = { date: currentSelectingDate, time: tempTime };
      setMySelectedDates(prev => [...prev, newDate]);
      setShowTimeModal(false);
      setCurrentSelectingDate(null);
      setTempTime('09:00');
    }
  };

  const handleRemoveDateTime = (index) => {
    setMySelectedDates(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    console.log('🔵 [handleConfirm] Called!');
    console.log('📋 Selected dates:', mySelectedDates);
    console.log('🏠 Selected house:', selectedHouse);
    console.log('👤 Selected seller:', selectedSeller);
    console.log('🎭 User role:', userRole);

    if (mySelectedDates.length === 0) {
      alert('Vui lòng chọn ít nhất một ngày!');
      return;
    }

    if (userRole === 'Buyer') {
      if (!selectedHouse) {
        alert('Vui lòng chọn nhà!');
        return;
      }
      if (!selectedSeller) {
        alert('Vui lòng chọn người bán!');
        return;
      }
    }

    console.log('✅ [handleConfirm] Validation passed, calling API...');
    setLoading(true);
    try {
      if (userRole === 'Buyer') {
        // Buyer đặt lịch xem nhà - gửi từng booking riêng lẻ
        const token = localStorage.getItem('token');
        console.log('🔑 Token:', token ? 'Found' : 'Not found');
        console.log('📊 mySelectedDates length:', mySelectedDates.length);
        console.log('📊 mySelectedDates:', JSON.stringify(mySelectedDates));
        
        for (const dateTime of mySelectedDates) {
          console.log('🔄 Processing dateTime:', dateTime);
          const viewingDateTime = `${dateTime.date} ${dateTime.time}:00`;
          console.log('📤 [handleConfirm] Sending booking request:', {
            HouseID: selectedHouse,
            SellerID: selectedSeller,
            ViewingDate: viewingDateTime
          });
          
          const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            credentials: 'include',
            body: JSON.stringify({
              HouseID: selectedHouse,
              SellerID: selectedSeller,
              ViewingDate: viewingDateTime
            })
          });

          console.log('📥 [handleConfirm] Response status:', response.status);

          if (!response.ok) {
            const error = await response.json();
            console.error('❌ [handleConfirm] Error:', error);
            alert(`Lỗi khi đặt lịch ${dateTime.date} ${dateTime.time}: ${error.message}`);
            break;
          } else {
            const result = await response.json();
            console.log('✅ [handleConfirm] Success:', result);
          }
        }

        alert('Đặt lịch xem nhà thành công!');
        setMySelectedDates([]);
        setSelectedHouse('');
        fetchMyAppointments();
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Có lỗi xảy ra khi đặt lịch!');
    } finally {
      setLoading(false);
    }
  };

  const renderCalendar = (isMyCalendar) => {
    const year = selectedYear;
    const month = selectedMonth;
    const days = generateCalendar(year, month);
    const selectedDates = isMyCalendar ? mySelectedDates.map(d => d.date) : [];
    
    const weekDays = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
    const monthName = months[month].label.toUpperCase();

    return (
      <div className="calendar-container bg-light p-4 rounded">
        <h4 className="text-center mb-3">{monthName}</h4>
        <div className="calendar-grid">
          {weekDays.map(day => (
            <div key={day} className="calendar-weekday text-center fw-bold small">
              {day}
            </div>
          ))}
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="calendar-day empty"></div>;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = selectedDates.includes(dateStr);
            const today = new Date();
            const isToday = 
              day === today.getDate() && 
              month === today.getMonth() && 
              year === today.getFullYear();

            return (
              <div
                key={day}
                className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => handleDateClick(day, isMyCalendar)}
                style={{ cursor: 'pointer' }}
              >
                {day}
              </div>
            );
          })}
        </div>
        
        {/* Display selected dates with time */}
        {isMyCalendar && mySelectedDates.length > 0 && (
          <div className="mt-3">
            <small className="text-muted fw-bold">Ngày & giờ đã chọn:</small>
            <div className="mt-2">
              {mySelectedDates.map((item, index) => (
                <div key={index} className="d-flex align-items-center justify-content-between mb-2 p-2 bg-white rounded border">
                  <div>
                    <span className="badge bg-primary me-2">
                      {new Date(item.date).getDate()}/{new Date(item.date).getMonth() + 1}
                    </span>
                    <span className="fw-bold text-dark">
                      <i className="fas fa-clock me-1"></i>
                      {item.time}
                    </span>
                  </div>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleRemoveDateTime(index)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <style>{`
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
        }
        
        .calendar-weekday {
          padding: 8px;
          background: #f8f9fa;
          border-radius: 4px;
        }
        
        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          background: white;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .calendar-day.empty {
          border: none;
          background: transparent;
        }
        
        .calendar-day:not(.empty):hover {
          background: #e9ecef;
          transform: scale(1.05);
        }
        
        .calendar-day.selected {
          background: #0d6efd;
          color: white;
          border-color: #0d6efd;
        }
        
        .calendar-day.today {
          border: 2px solid #198754;
          font-weight: bold;
        }
        
        .calendar-container {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .schedule-section {
          background: white;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }

        .waiting-seller-container {
          text-align: center;
          padding: 60px 20px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 12px;
          border: 2px dashed #6c757d;
        }

        .waiting-seller-icon {
          font-size: 64px;
          color: #6c757d;
          margin-bottom: 20px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <div className="hero page-inner overlay" style={{ backgroundImage: "url('/images/hero_bg_1.jpg')" }}>
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-lg-9 text-center mt-5">
              <h1 className="heading" data-aos="fade-up">
                Book an Appointment
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">


          <div className="row g-4">
            {userRole === 'Buyer' ? (
              <>
                {/* Schedule me (Buyer) */}
                <div className="col-md-6">
                  <div className="schedule-section">
                    <h4 className="mb-3">Schedule me:</h4>
                    
                    <div className="row mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-bold">Chọn năm</label>
                        <select 
                          className="form-select"
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        >
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold">Chọn tháng</label>
                        <select 
                          className="form-select"
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        >
                          {months.map(month => (
                            <option key={month.value} value={month.value}>
                              {month.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {renderCalendar(true)}
                  </div>
                </div>

                {/* Seller's schedule */}
                <div className="col-md-6">
                  <div className="schedule-section">
                    <h4 className="mb-3">Chọn thông tin:</h4>
                    
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Chọn nhà</label>
                      <select 
                        className="form-select"
                        value={selectedHouse}
                        onChange={(e) => setSelectedHouse(e.target.value)}
                      >
                        <option value="">-- Chọn nhà --</option>
                        {houses.map(house => (
                          <option key={house.HouseID} value={house.HouseID}>
                            {house.Title} - {house.Price?.toLocaleString('vi-VN')} VNĐ
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold">Chọn người bán</label>
                      <select 
                        className="form-select"
                        value={selectedSeller}
                        onChange={(e) => setSelectedSeller(e.target.value)}
                      >
                        <option value="">-- Chọn người bán --</option>
                        {sellers.map(seller => (
                          <option key={seller.UserID} value={seller.UserID}>
                            {seller.FullName} ({seller.Email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      Chọn nhà và người bán, sau đó chọn ngày giờ bên trái để đặt lịch xem nhà
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Confirm Button */}
          {userRole && (
            <div className="row mt-4">
              <div className="col-12 text-center">
                <button 
                  className="btn btn-primary btn-lg px-5"
                  onClick={handleConfirm}
                  disabled={loading || mySelectedDates.length === 0}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle me-2"></i>
                      {userRole === 'Buyer' ? 'Xác nhận đặt lịch' : 'Xác nhận lịch hẹn'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* My Appointments List */}
          <div className="row mt-5">
            <div className="col-12">
              <div className="schedule-section">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="mb-0">
                    <i className="fas fa-calendar-alt me-2 text-primary"></i>
                    Danh sách cuộc hẹn của tôi
                  </h3>
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={fetchMyAppointments}
                    disabled={loadingAppointments}
                  >
                    <i className="fas fa-sync-alt me-2"></i>
                    Làm mới
                  </button>
                </div>

                {loadingAppointments ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="text-muted mt-3">Đang tải danh sách cuộc hẹn...</p>
                  </div>
                ) : myAppointments.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted mb-2">Chưa có cuộc hẹn nào</h5>
                    <p className="text-muted small">Hãy đặt lịch hẹn với người bán để xem nhà</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Ngày & Giờ</th>
                          <th>Nhà</th>
                          <th>{userRole === 'Buyer' ? 'Người bán' : 'Người mua'}</th>
                          <th>Liên hệ</th>
                          <th>Trạng thái</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myAppointments.map((booking) => {
                          const getStatusBadge = (status) => {
                            const badges = {
                              'PENDING': { bg: 'warning', text: 'Chờ xác nhận', icon: 'hourglass-half' },
                              'CONFIRMED': { bg: 'success', text: 'Đã xác nhận', icon: 'check-circle' },
                              'CANCELLED': { bg: 'danger', text: 'Đã hủy', icon: 'times-circle' }
                            };
                            return badges[status] || badges['PENDING'];
                          };

                          const statusInfo = getStatusBadge(booking.Status);
                          const viewingDate = new Date(booking.ViewingDate);

                          return (
                            <tr key={booking.ViewingID}>
                              <td>
                                <div className="fw-bold">
                                  <i className="fas fa-calendar me-2 text-primary"></i>
                                  {viewingDate.toLocaleDateString('vi-VN')}
                                </div>
                                <small className="text-muted">
                                  <i className="fas fa-clock me-1"></i>
                                  {viewingDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </small>
                              </td>
                              <td>
                                <div className="fw-bold">{booking.HouseName}</div>
                              </td>
                              <td>
                                <div className="fw-bold">{booking.PartnerName}</div>
                              </td>
                              <td>
                                <small className="d-block">{booking.PartnerEmail}</small>
                                <small className="text-muted">{booking.PartnerPhone}</small>
                              </td>
                              <td>
                                <span className={`badge bg-${statusInfo.bg}`}>
                                  <i className={`fas fa-${statusInfo.icon} me-1`}></i>
                                  {statusInfo.text}
                                </span>
                              </td>
                              <td>
                                {booking.Status === 'PENDING' && (
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleCancelBooking(booking.ViewingID)}
                                  >
                                    <i className="fas fa-times me-1"></i>
                                    Hủy
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Time Picker */}
      {showTimeModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-clock me-2"></i>
                  Chọn giờ hẹn
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowTimeModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Ngày: {currentSelectingDate && new Date(currentSelectingDate).toLocaleDateString('vi-VN')}
                  </label>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Chọn giờ:</label>
                  <input 
                    type="time"
                    className="form-control form-control-lg"
                    value={tempTime}
                    onChange={(e) => setTempTime(e.target.value)}
                  />
                  <small className="text-muted">
                    Chọn giờ bạn muốn đặt lịch hẹn
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowTimeModal(false)}
                >
                  Hủy
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleTimeConfirm}
                >
                  <i className="fas fa-check me-2"></i>
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </Layout>
  );
}
