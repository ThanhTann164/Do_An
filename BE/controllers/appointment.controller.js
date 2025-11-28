const AppointmentService = require("../Services/appointment.service");

exports.createAppointment = async (req, res) => {
  try {
    const { sellerId, myDates, sellerDates } = req.body;
    const buyerId = req.user?.userId || req.user?.userid;

    if (!buyerId) {
      return res.status(401).json({ 
        success: false, 
        message: "Vui lòng đăng nhập" 
      });
    }

    if (!myDates || myDates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Vui lòng chọn ít nhất một ngày" 
      });
    }

    const appointmentData = {
      BuyerID: buyerId,
      SellerID: sellerId || null,
      BuyerDates: myDates,
      SellerDates: sellerDates || [],
      Status: 'Pending'
    };

    const appointment = await AppointmentService.createAppointment(appointmentData);

    res.status(201).json({ 
      success: true, 
      message: "Đặt lịch hẹn thành công",
      data: appointment 
    });
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ 
      success: false, 
      message: "Có lỗi xảy ra khi đặt lịch" 
    });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.userid;
    const userRole = req.user?.role || req.user?.Role;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Vui lòng đăng nhập" 
      });
    }

    let appointments;
    if (userRole === 'Seller') {
      appointments = await AppointmentService.getAppointmentsBySeller(userId);
    } else {
      appointments = await AppointmentService.getAppointmentsByBuyer(userId);
    }

    res.json({ 
      success: true, 
      data: appointments 
    });
  } catch (err) {
    console.error('Error getting appointments:', err);
    res.status(500).json({ 
      success: false, 
      message: "Có lỗi xảy ra" 
    });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await AppointmentService.getAppointmentById(id);

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy lịch hẹn" 
      });
    }

    res.json({ 
      success: true, 
      data: appointment 
    });
  } catch (err) {
    console.error('Error getting appointment:', err);
    res.status(500).json({ 
      success: false, 
      message: "Có lỗi xảy ra" 
    });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, sellerDates } = req.body;

    if (!['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Trạng thái không hợp lệ" 
      });
    }

    // Nếu có sellerDates (seller xác nhận), cập nhật cả SellerDates
    if (sellerDates && Array.isArray(sellerDates)) {
      await AppointmentService.updateAppointmentWithSellerDates(id, status, sellerDates);
    } else {
      await AppointmentService.updateAppointmentStatus(id, status);
    }

    res.json({ 
      success: true, 
      message: "Cập nhật trạng thái thành công" 
    });
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ 
      success: false, 
      message: "Có lỗi xảy ra" 
    });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await AppointmentService.deleteAppointment(id);

    res.json({ 
      success: true, 
      message: "Xóa lịch hẹn thành công" 
    });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ 
      success: false, 
      message: "Có lỗi xảy ra" 
    });
  }
};

exports.getSellerConfirmedSchedule = async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    // Lấy các lịch hẹn đã được Seller confirm (Status = 'Confirmed')
    const appointments = await AppointmentService.getSellerConfirmedSchedule(sellerId);

    res.json({ 
      success: true, 
      data: appointments 
    });
  } catch (err) {
    console.error('Error getting seller confirmed schedule:', err);
    res.status(500).json({ 
      success: false, 
      message: "Có lỗi xảy ra" 
    });
  }
};

