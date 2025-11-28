const NotificationService = require('./notificationService');
const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const initModels = require('../models/init-models');
const { iotdevices, iotcontrollogs, iotresponselogs, users } = initModels(sequelize);

class IoTNotificationService {
  /**
   * Xử lý thông báo từ dữ liệu cảm biến
   * @param {object} sensorData - Dữ liệu từ cảm biến
   */
  static async processSensorData(sensorData) {
    try {
      console.log('🔍 Processing sensor data for notifications:', sensorData);

      const {
        deviceId,
        sensorType,
        value,
        threshold,
        userId,
        location,
        timestamp = new Date()
      } = sensorData;

      // Lấy thông tin thiết bị
      const device = await iotdevices.findByPk(deviceId);
      if (!device) {
        console.warn(`⚠️ Device ${deviceId} not found`);
        return;
      }

      // Xác định loại cảnh báo dựa trên sensor type và giá trị
      const alertInfo = this.analyzeAlert(sensorType, value, threshold, device);
      
      if (alertInfo.shouldAlert) {
        // Tạo thông báo IoT
        await NotificationService.createIoTNotification(
          userId || device.UserID,
          device.DeviceName || `Thiết bị ${deviceId}`,
          sensorType,
          alertInfo.message,
          {
            deviceId,
            sensorType,
            value,
            threshold,
            location: location || device.Location,
            severity: alertInfo.severity,
            timestamp
          }
        );

        // Log sự kiện
        await this.logIoTEvent(deviceId, sensorType, alertInfo, sensorData);
      }

    } catch (error) {
      console.error('❌ Error processing sensor data:', error);
    }
  }

  /**
   * Phân tích và xác định loại cảnh báo
   * @param {string} sensorType - Loại cảm biến
   * @param {number} value - Giá trị hiện tại
   * @param {number} threshold - Ngưỡng cảnh báo
   * @param {object} device - Thông tin thiết bị
   */
  static analyzeAlert(sensorType, value, threshold, device) {
    const alerts = {
      temperature: {
        high: { threshold: 40, message: 'Nhiệt độ quá cao', severity: 'urgent' },
        low: { threshold: 0, message: 'Nhiệt độ quá thấp', severity: 'high' },
        normal: { message: 'Nhiệt độ bình thường', severity: 'low' }
      },
      humidity: {
        high: { threshold: 90, message: 'Độ ẩm quá cao', severity: 'high' },
        low: { threshold: 20, message: 'Độ ẩm quá thấp', severity: 'medium' },
        normal: { message: 'Độ ẩm bình thường', severity: 'low' }
      },
      gas: {
        detected: { threshold: 0.1, message: 'Phát hiện rò rỉ khí gas!', severity: 'urgent' },
        normal: { message: 'Không phát hiện khí gas', severity: 'low' }
      },
      smoke: {
        detected: { threshold: 0.5, message: 'Phát hiện khói!', severity: 'urgent' },
        normal: { message: 'Không phát hiện khói', severity: 'low' }
      },
      motion: {
        detected: { threshold: 1, message: 'Phát hiện chuyển động', severity: 'high' },
        normal: { message: 'Không có chuyển động', severity: 'low' }
      },
      door: {
        opened: { threshold: 1, message: 'Cửa đã được mở', severity: 'medium' },
        closed: { threshold: 0, message: 'Cửa đã được đóng', severity: 'low' }
      },
      light: {
        high: { threshold: 1000, message: 'Ánh sáng quá mạnh', severity: 'medium' },
        low: { threshold: 50, message: 'Ánh sáng yếu', severity: 'low' },
        normal: { message: 'Ánh sáng bình thường', severity: 'low' }
      },
      rain: {
        detected: { threshold: 0.1, message: 'Phát hiện mưa - Đóng giàn phơi tự động', severity: 'medium' },
        stopped: { threshold: 0, message: 'Mưa đã tạnh', severity: 'low' }
      }
    };

    const sensorAlerts = alerts[sensorType.toLowerCase()];
    if (!sensorAlerts) {
      return {
        shouldAlert: false,
        message: `Cảm biến ${sensorType} có giá trị: ${value}`,
        severity: 'low'
      };
    }

    // Xác định loại cảnh báo dựa trên giá trị
    let alertType = 'normal';
    let shouldAlert = false;

    switch (sensorType.toLowerCase()) {
      case 'temperature':
        if (value > sensorAlerts.high.threshold) {
          alertType = 'high';
          shouldAlert = true;
        } else if (value < sensorAlerts.low.threshold) {
          alertType = 'low';
          shouldAlert = true;
        }
        break;

      case 'humidity':
        if (value > sensorAlerts.high.threshold) {
          alertType = 'high';
          shouldAlert = true;
        } else if (value < sensorAlerts.low.threshold) {
          alertType = 'low';
          shouldAlert = true;
        }
        break;

      case 'gas':
      case 'smoke':
        if (value > sensorAlerts.detected.threshold) {
          alertType = 'detected';
          shouldAlert = true;
        }
        break;

      case 'motion':
        if (value >= sensorAlerts.detected.threshold) {
          alertType = 'detected';
          shouldAlert = true;
        }
        break;

      case 'door':
        if (value >= sensorAlerts.opened.threshold) {
          alertType = 'opened';
          shouldAlert = true;
        } else {
          alertType = 'closed';
          shouldAlert = true; // Thông báo cả khi đóng cửa
        }
        break;

      case 'light':
        if (value > sensorAlerts.high.threshold) {
          alertType = 'high';
          shouldAlert = true;
        } else if (value < sensorAlerts.low.threshold) {
          alertType = 'low';
          shouldAlert = true;
        }
        break;

      case 'rain':
        if (value > sensorAlerts.detected.threshold) {
          alertType = 'detected';
          shouldAlert = true;
        } else {
          alertType = 'stopped';
          shouldAlert = true;
        }
        break;
    }

    const alert = sensorAlerts[alertType] || sensorAlerts.normal;
    
    return {
      shouldAlert,
      message: `${alert.message} (${value}${this.getUnit(sensorType)})`,
      severity: alert.severity,
      alertType
    };
  }

  /**
   * Lấy đơn vị đo cho từng loại cảm biến
   */
  static getUnit(sensorType) {
    const units = {
      temperature: '°C',
      humidity: '%',
      gas: 'ppm',
      smoke: 'ppm',
      motion: '',
      door: '',
      light: 'lux',
      rain: 'mm'
    };
    
    return units[sensorType.toLowerCase()] || '';
  }

  /**
   * Log sự kiện IoT
   */
  static async logIoTEvent(deviceId, sensorType, alertInfo, sensorData) {
    try {
      await iotresponselogs.create({
        DeviceID: deviceId,
        ResponseData: JSON.stringify({
          sensorType,
          value: sensorData.value,
          threshold: sensorData.threshold,
          alertType: alertInfo.alertType,
          severity: alertInfo.severity,
          message: alertInfo.message,
          timestamp: sensorData.timestamp
        }),
        ResponseTime: new Date(),
        Status: alertInfo.severity === 'urgent' ? 'ALERT' : 'SUCCESS'
      });
    } catch (error) {
      console.error('Error logging IoT event:', error);
    }
  }

  /**
   * Xử lý thông báo thiết bị bật/tắt
   * @param {number} deviceId - ID thiết bị
   * @param {string} action - Hành động (on/off)
   * @param {number} userId - ID người dùng
   */
  static async processDeviceAction(deviceId, action, userId) {
    try {
      const device = await iotdevices.findByPk(deviceId);
      if (!device) return;

      const actionMessages = {
        on: 'đã được bật',
        off: 'đã được tắt',
        toggle: 'đã được chuyển đổi trạng thái'
      };

      const message = `Thiết bị "${device.DeviceName}" ${actionMessages[action] || 'đã thay đổi trạng thái'}`;

      await NotificationService.createNotification(
        userId || device.UserID,
        '🔌 Điều khiển thiết bị',
        message,
        'device',
        {
          priority: 'low',
          meta: {
            deviceId,
            deviceName: device.DeviceName,
            action,
            timestamp: new Date().toISOString()
          },
          actionUrl: `/devices/${deviceId}`
        }
      );

      // Log control action
      await iotcontrollogs.create({
        DeviceID: deviceId,
        UserID: userId || device.UserID,
        Command: action.toUpperCase(),
        CommandTime: new Date(),
        Status: 'SUCCESS'
      });

    } catch (error) {
      console.error('❌ Error processing device action:', error);
    }
  }

  /**
   * Tạo thông báo bảo mật từ camera/motion sensor
   * @param {object} securityData - Dữ liệu bảo mật
   */
  static async processSecurityAlert(securityData) {
    try {
      const {
        deviceId,
        eventType, // motion_detected, door_opened, camera_motion, unauthorized_access
        location,
        userId,
        severity = 'high',
        imageUrl = null,
        timestamp = new Date()
      } = securityData;

      const device = await iotdevices.findByPk(deviceId);
      const deviceName = device ? device.DeviceName : `Thiết bị ${deviceId}`;

      await NotificationService.createSecurityNotification(
        userId || (device ? device.UserID : null),
        eventType,
        {
          deviceId,
          deviceName,
          location: location || (device ? device.Location : 'Không xác định'),
          imageUrl,
          timestamp,
          severity
        }
      );

    } catch (error) {
      console.error('❌ Error processing security alert:', error);
    }
  }

  /**
   * Tạo thông báo tự động cho các sự kiện Smart Home
   * @param {object} smartHomeEvent - Sự kiện Smart Home
   */
  static async processSmartHomeEvent(smartHomeEvent) {
    try {
      const {
        eventType, // auto_curtain_close, auto_drying_rack_close, auto_light_on, etc.
        deviceId,
        userId,
        triggerReason, // rain_detected, high_light, motion_detected, etc.
        timestamp = new Date()
      } = smartHomeEvent;

      const device = await iotdevices.findByPk(deviceId);
      const deviceName = device ? device.DeviceName : `Thiết bị ${deviceId}`;

      const eventMessages = {
        auto_curtain_close: {
          title: '🏠 Rèm tự động',
          message: `Rèm đã được đóng tự động do ${this.getTriggerMessage(triggerReason)}`,
          priority: 'medium'
        },
        auto_drying_rack_close: {
          title: '🏠 Giàn phơi tự động',
          message: `Giàn phơi đã được thu vào do ${this.getTriggerMessage(triggerReason)}`,
          priority: 'medium'
        },
        auto_light_on: {
          title: '💡 Đèn tự động',
          message: `Đèn đã được bật tự động do ${this.getTriggerMessage(triggerReason)}`,
          priority: 'low'
        },
        auto_light_off: {
          title: '💡 Đèn tự động',
          message: `Đèn đã được tắt tự động do ${this.getTriggerMessage(triggerReason)}`,
          priority: 'low'
        },
        auto_ac_on: {
          title: '❄️ Điều hòa tự động',
          message: `Điều hòa đã được bật do ${this.getTriggerMessage(triggerReason)}`,
          priority: 'medium'
        },
        auto_fan_on: {
          title: '🌀 Quạt tự động',
          message: `Quạt đã được bật do ${this.getTriggerMessage(triggerReason)}`,
          priority: 'low'
        }
      };

      const eventInfo = eventMessages[eventType] || {
        title: '🏠 Sự kiện Smart Home',
        message: `Thiết bị "${deviceName}" đã thực hiện hành động tự động`,
        priority: 'medium'
      };

      await NotificationService.createNotification(
        userId || (device ? device.UserID : null),
        eventInfo.title,
        eventInfo.message,
        'system',
        {
          priority: eventInfo.priority,
          meta: {
            eventType,
            deviceId,
            deviceName,
            triggerReason,
            timestamp
          },
          actionUrl: `/devices/${deviceId}`
        }
      );

    } catch (error) {
      console.error('❌ Error processing smart home event:', error);
    }
  }

  /**
   * Lấy thông điệp trigger
   */
  static getTriggerMessage(triggerReason) {
    const messages = {
      rain_detected: 'phát hiện mưa',
      high_light: 'ánh sáng quá mạnh',
      motion_detected: 'phát hiện chuyển động',
      high_temperature: 'nhiệt độ cao',
      low_light: 'ánh sáng yếu',
      schedule: 'lịch trình đã đặt',
      manual: 'điều khiển thủ công'
    };

    return messages[triggerReason] || triggerReason;
  }

  /**
   * Tạo thông báo định kỳ cho hệ thống
   */
  static async createSystemNotifications() {
    try {
      // Lấy tất cả users có thiết bị IoT
      const usersWithDevices = await users.findAll({
        include: [{
          model: iotdevices,
          as: 'IoTDevices',
          required: true
        }]
      });

      for (const user of usersWithDevices) {
        // Thông báo bảo trì định kỳ
        if (Math.random() < 0.1) { // 10% chance
          await NotificationService.createNotification(
            user.UserID,
            '🔧 Bảo trì hệ thống',
            'Hệ thống Smart Home sẽ được bảo trì vào 2:00 AM ngày mai. Các thiết bị có thể tạm thời mất kết nối.',
            'system',
            {
              priority: 'medium',
              meta: {
                maintenanceType: 'scheduled',
                scheduledTime: '2:00 AM',
                duration: '30 minutes'
              }
            }
          );
        }

        // Thông báo cập nhật firmware
        if (Math.random() < 0.05) { // 5% chance
          await NotificationService.createNotification(
            user.UserID,
            '📱 Cập nhật firmware',
            'Có bản cập nhật firmware mới cho thiết bị IoT. Hãy cập nhật để có trải nghiệm tốt nhất.',
            'system',
            {
              priority: 'low',
              meta: {
                updateType: 'firmware',
                version: '2.1.0',
                features: ['Cải thiện bảo mật', 'Tối ưu hiệu suất']
              },
              actionUrl: '/devices/update'
            }
          );
        }
      }

    } catch (error) {
      console.error('❌ Error creating system notifications:', error);
    }
  }
}

module.exports = IoTNotificationService;
