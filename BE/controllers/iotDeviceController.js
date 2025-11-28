const initModels = require('../models/init-models');
const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const { DataTypes } = require('sequelize');

// Initialize models
const models = initModels(sequelize);
const { iotdevices, houses } = models;

// Lấy danh sách tất cả thiết bị IoT
exports.getAllDevices = async (req, res) => {
    try {
        const { houseId } = req.query;
        
        const whereClause = houseId ? { HouseID: houseId } : {};
        
        const devices = await iotdevices.findAll({
            where: whereClause,
            include: [
                {
                    model: houses,
                    as: 'House', 
                    attributes: ['Title', 'Address']
                }
            ],
            order: [['DeviceID', 'ASC']]
        });

        res.json({
            success: true,
            data: devices,
            count: devices.length
        });
    } catch (error) {
        console.error('Error fetching IoT devices:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách thiết bị IoT',
            error: error.message
        });
    }
};

// Lấy thiết bị theo ID
exports.getDeviceById = async (req, res) => {
    try {
        const { id } = req.params;
        const device = await iotdevices.findByPk(id, {
            include: [
                {
                    model: houses,
                    as: 'House',
                    attributes: ['Title', 'Address']
                }
            ]
        });

        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thiết bị'
            });
        }

        res.json({
            success: true,
            data: device
        });
    } catch (error) {
        console.error('Error fetching device by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin thiết bị',
            error: error.message
        });
    }
};

// Tạo thiết bị mới
exports.createDevice = async (req, res) => {
    try {
        const { HouseID, DeviceName, DeviceType, Status = 'Active' } = req.body;

        // Validate required fields
        if (!HouseID || !DeviceName) {
            return res.status(400).json({
                success: false,
                message: 'HouseID và DeviceName là bắt buộc'
            });
        }

        // Kiểm tra xem House có tồn tại không
        const house = await houses.findByPk(HouseID);
        if (!house) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy căn nhà'
            });
        }

        const newDevice = await iotdevices.create({
            HouseID,
            DeviceName,
            DeviceType,
            Status
        });

        // Lấy device với thông tin house
        const deviceWithHouse = await iotdevices.findByPk(newDevice.DeviceID, {
            include: [
                {
                    model: houses,
                    as: 'House',
                    attributes: ['Title', 'Address']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Tạo thiết bị thành công',
            data: deviceWithHouse
        });
    } catch (error) {
        console.error('Error creating device:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo thiết bị',
            error: error.message
        });
    }
};

// Cập nhật thiết bị
exports.updateDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const { HouseID, DeviceName, DeviceType, Status } = req.body;

        const device = await iotdevices.findByPk(id);
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thiết bị'
            });
        }

        // Nếu có HouseID mới, kiểm tra xem house có tồn tại không
        if (HouseID && HouseID !== device.HouseID) {
            const house = await houses.findByPk(HouseID);
            if (!house) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy căn nhà'
                });
            }
        }

        await device.update({
            HouseID: HouseID || device.HouseID,
            DeviceName: DeviceName || device.DeviceName,
            DeviceType: DeviceType || device.DeviceType,
            Status: Status || device.Status
        });

        // Lấy device với thông tin house
        const updatedDevice = await iotdevices.findByPk(id, {
            include: [
                {
                    model: houses,
                    as: 'House',
                    attributes: ['Title', 'Address']
                }
            ]
        });

        res.json({
            success: true,
            message: 'Cập nhật thiết bị thành công',
            data: updatedDevice
        });
    } catch (error) {
        console.error('Error updating device:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật thiết bị',
            error: error.message
        });
    }
};

// Xóa thiết bị
exports.deleteDevice = async (req, res) => {
    try {
        const { id } = req.params;

        const device = await iotdevices.findByPk(id);
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thiết bị'
            });
        }

        await device.destroy();

        res.json({
            success: true,
            message: 'Xóa thiết bị thành công'
        });
    } catch (error) {
        console.error('Error deleting device:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa thiết bị',
            error: error.message
        });
    }
};

// Cập nhật trạng thái thiết bị
exports.updateDeviceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { Status } = req.body;

        if (!Status || !['Active', 'Inactive'].includes(Status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái phải là Active hoặc Inactive'
            });
        }

        const device = await iotdevices.findByPk(id);
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thiết bị'
            });
        }

        await device.update({ Status });

        res.json({
            success: true,
            message: 'Cập nhật trạng thái thiết bị thành công',
            data: { DeviceID: id, Status }
        });
    } catch (error) {
        console.error('Error updating device status:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật trạng thái thiết bị',
            error: error.message
        });
    }
};
