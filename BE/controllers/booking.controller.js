const { QueryTypes } = require('sequelize');
const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

// Create a new booking
exports.createBooking = async (req, res) => {
  console.log('🔵 [createBooking] Called!');
  console.log('📦 Request body:', req.body);
  console.log('👤 User:', req.user);
  
  try {
    const { HouseID, SellerID, ViewingDate } = req.body;
    const BuyerID = req.user?.userId || req.user?.userid;
    
    console.log('📋 Extracted data:', { HouseID, SellerID, ViewingDate, BuyerID });

    if (!BuyerID) {
      console.log('❌ No BuyerID found');
      return res.status(401).json({ 
        success: false, 
        message: 'Vui lòng đăng nhập' 
      });
    }

    if (!HouseID || !SellerID || !ViewingDate) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin bắt buộc' 
      });
    }
    
    console.log('✅ Validation passed, checking conflicts...');

    // Conflict check: Check if seller already has a booking at this time
    console.log('🔍 Checking for conflicts...');
    const conflictCheck = await sequelize.query(
      `SELECT ViewingID FROM houseviewings 
       WHERE SellerID = :sellerId 
       AND ViewingDate = :viewingDate 
       AND Status IN ('PENDING', 'CONFIRMED')
       LIMIT 1`,
      {
        replacements: { sellerId: SellerID, viewingDate: ViewingDate },
        type: QueryTypes.SELECT
      }
    );
    
    console.log('🔍 Conflict check result:', conflictCheck);

    if (conflictCheck.length > 0) {
      console.log('❌ Conflict found!');
      return res.status(409).json({ 
        success: false, 
        message: 'Khung giờ này đã được đặt. Vui lòng chọn thời gian khác.' 
      });
    }

    // Insert booking
    console.log('💾 Inserting booking into database...');
    const [result] = await sequelize.query(
      `INSERT INTO houseviewings (HouseID, BuyerID, SellerID, ViewingDate, Status) 
       VALUES (:houseId, :buyerId, :sellerId, :viewingDate, 'PENDING')`,
      {
        replacements: {
          houseId: HouseID,
          buyerId: BuyerID,
          sellerId: SellerID,
          viewingDate: ViewingDate
        }
      }
    );
    
    console.log('✅ Booking created successfully! Result:', result);

    res.status(201).json({ 
      success: true, 
      message: 'Đặt lịch xem nhà thành công',
      data: { ViewingID: result }
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Có lỗi xảy ra khi đặt lịch',
      error: err.message 
    });
  }
};

// Get schedule based on user role
exports.getSchedule = async (req, res) => {
  console.log('🔍 [getSchedule] Called!');
  try {
    const userId = req.user?.userId || req.user?.userid;
    const userRole = req.user?.role || req.user?.Role;
    console.log('👤 [getSchedule] User:', { userId, userRole });

    if (!userId) {
      console.log('❌ [getSchedule] No userId found');
      return res.status(401).json({ 
        success: false, 
        message: 'Vui lòng đăng nhập' 
      });
    }

    let bookings = [];

    if (userRole === 'Seller') {
      // Get bookings where current user is the seller
      bookings = await sequelize.query(
        `SELECT 
          hv.ViewingID,
          hv.HouseID,
          hv.ViewingDate,
          hv.Status,
          h.Title as HouseName,
          u.FullName as PartnerName,
          u.Email as PartnerEmail,
          u.PhoneNumber as PartnerPhone
         FROM houseviewings hv
         INNER JOIN houses h ON hv.HouseID = h.HouseID
         INNER JOIN users u ON hv.BuyerID = u.UserID
         WHERE hv.SellerID = :userId
         ORDER BY hv.ViewingDate DESC`,
        {
          replacements: { userId },
          type: QueryTypes.SELECT
        }
      );
    } else {
      // Get bookings where current user is the buyer
      bookings = await sequelize.query(
        `SELECT 
          hv.ViewingID,
          hv.HouseID,
          hv.ViewingDate,
          hv.Status,
          h.Title as HouseName,
          u.FullName as PartnerName,
          u.Email as PartnerEmail,
          u.PhoneNumber as PartnerPhone
         FROM houseviewings hv
         INNER JOIN houses h ON hv.HouseID = h.HouseID
         INNER JOIN users u ON hv.SellerID = u.UserID
         WHERE hv.BuyerID = :userId
         ORDER BY hv.ViewingDate DESC`,
        {
          replacements: { userId },
          type: QueryTypes.SELECT
        }
      );
    }

    console.log('✅ [getSchedule] Found bookings:', bookings.length);
    res.json({ 
      success: true, 
      data: bookings 
    });
  } catch (err) {
    console.error('❌ [getSchedule] Error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Có lỗi xảy ra',
      error: err.message 
    });
  }
};

// Get seller's booked time slots (for availability check)
exports.getSellerBookedSlots = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { month, year } = req.query;

    if (!sellerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin seller' 
      });
    }

    let query = `
      SELECT ViewingDate 
      FROM houseviewings 
      WHERE SellerID = :sellerId 
      AND Status IN ('PENDING', 'CONFIRMED')
    `;

    const replacements = { sellerId };

    // Filter by month/year if provided
    if (month && year) {
      query += ` AND MONTH(ViewingDate) = :month AND YEAR(ViewingDate) = :year`;
      replacements.month = month;
      replacements.year = year;
    }

    query += ` ORDER BY ViewingDate ASC`;

    const bookedSlots = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });

    res.json({ 
      success: true, 
      data: bookedSlots.map(slot => slot.ViewingDate)
    });
  } catch (err) {
    console.error('Error getting booked slots:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Có lỗi xảy ra',
      error: err.message 
    });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Trạng thái không hợp lệ' 
      });
    }

    await sequelize.query(
      `UPDATE houseviewings SET Status = :status WHERE ViewingID = :id`,
      {
        replacements: { status, id }
      }
    );

    res.json({ 
      success: true, 
      message: 'Cập nhật trạng thái thành công' 
    });
  } catch (err) {
    console.error('Error updating booking status:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Có lỗi xảy ra',
      error: err.message 
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || req.user?.userid;

    // Verify ownership before cancelling
    const booking = await sequelize.query(
      `SELECT BuyerID, SellerID FROM houseviewings WHERE ViewingID = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (booking.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy lịch hẹn' 
      });
    }

    const { BuyerID, SellerID } = booking[0];
    if (BuyerID !== userId && SellerID !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn không có quyền hủy lịch hẹn này' 
      });
    }

    await sequelize.query(
      `UPDATE houseviewings SET Status = 'CANCELLED' WHERE ViewingID = :id`,
      {
        replacements: { id }
      }
    );

    res.json({ 
      success: true, 
      message: 'Hủy lịch hẹn thành công' 
    });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Có lỗi xảy ra',
      error: err.message 
    });
  }
};
