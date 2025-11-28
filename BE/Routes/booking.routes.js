const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { authMiddleware } = require('../Middlewares/authMiddleware');

// Create a new booking
router.post('/', authMiddleware(), bookingController.createBooking);

// Get my schedule (buyer or seller)
router.get('/my-schedule', authMiddleware(), bookingController.getSchedule);

// Get seller's booked time slots (for availability check)
router.get('/seller/:sellerId/booked-slots', bookingController.getSellerBookedSlots);

// Update booking status
router.put('/:id/status', authMiddleware(), bookingController.updateBookingStatus);

// Cancel booking
router.put('/:id/cancel', authMiddleware(), bookingController.cancelBooking);

module.exports = router;
