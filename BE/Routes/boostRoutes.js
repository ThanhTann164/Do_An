const express = require('express');
const router = express.Router();
const BoostController = require('../controllers/boost.controller');
const { authMiddleware } = require('../Middlewares/authMiddleware');

// Boost routes (package checking is done inside controller)
router.post('/houses/:id/boost', 
  authMiddleware, 
  BoostController.boostHouse
);

router.get('/my-boosts', 
  authMiddleware,
  BoostController.getMyBoosts
);

module.exports = router;
