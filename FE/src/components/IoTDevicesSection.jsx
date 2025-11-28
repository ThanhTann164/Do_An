import React from 'react';
import { 
  Lightbulb, 
  Lock, 
  Camera, 
  Thermometer, 
  Fan, 
  Snowflake, 
  Shield, 
  Smartphone,
  Home
} from 'lucide-react';

const IoTDevicesSection = ({ iotDevices = [], loading = false }) => {
  console.log('🔍 [IoTDevicesSection] Received iotDevices:', iotDevices);
  console.log('🔍 [IoTDevicesSection] iotDevices type:', typeof iotDevices);
  console.log('🔍 [IoTDevicesSection] iotDevices length:', iotDevices?.length);
  console.log('🔍 [IoTDevicesSection] loading:', loading);

  // Simple return first to test
  return (
    <div style={{ border: '3px solid blue', padding: '20px', margin: '20px 0', backgroundColor: 'lightblue' }}>
      <h2 style={{ color: 'blue', fontSize: '24px' }}>🔧 IoT DEVICES SECTION TEST</h2>
      <p><strong>IoT Devices Length:</strong> {iotDevices?.length || 0}</p>
      <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
      <p><strong>Is Array:</strong> {Array.isArray(iotDevices) ? 'Yes' : 'No'}</p>
      
      {iotDevices && iotDevices.length > 0 ? (
        <div style={{ backgroundColor: 'white', padding: '10px', marginTop: '10px' }}>
          <h3>🎯 DEVICES FOUND:</h3>
          {iotDevices.map((device, index) => (
            <div key={index} style={{ border: '1px solid green', padding: '10px', margin: '5px 0' }}>
              <p><strong>Name:</strong> {device.DeviceName || 'N/A'}</p>
              <p><strong>Type:</strong> {device.DeviceType || 'N/A'}</p>
              <p><strong>Status:</strong> {device.Status || 'N/A'}</p>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ backgroundColor: 'yellow', padding: '10px', marginTop: '10px' }}>
          <p>❌ NO DEVICES FOUND</p>
        </div>
      )}
    </div>
  );
};

export default IoTDevicesSection;
