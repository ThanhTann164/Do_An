const express = require("express");
const router = express.Router();
const multer = require("multer");
const houseController = require("../controllers/house.controller");
const { authMiddleware } = require("../middlewares/authMiddleware");

// Multer config
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG and PNG files are allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// 🔓 Public
router.get("/search", houseController.searchHouse);
router.get("/", houseController.getAllHouses);
router.get("/my", authMiddleware(), houseController.getMyHouses);

// 🔒 Chỉ Seller hoặc Admin CRUD
router.post("/", authMiddleware(["Seller"]), upload.array("images"), houseController.createHouse);
router.put("/:id", authMiddleware(["Seller","Admin"]), upload.array("images"), houseController.updateHouse);
router.delete("/:id", authMiddleware(["Seller","Admin"]), houseController.deleteHouse);
router.put("/images/:id/cover", authMiddleware(["Seller","Admin"]), houseController.setAsCover);
router.delete("/images/:id", authMiddleware(["Seller","Admin"]), houseController.deleteImage);
router.get("/:id", houseController.getHouseById);
module.exports = router;
