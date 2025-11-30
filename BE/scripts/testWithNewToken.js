const fetch = require('node-fetch');

const NEW_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE4LCJyb2xlIjoiQWRtaW4iLCJlbWFpbCI6ImFkbWluQHNtYXJ0aG9tZS5jb20iLCJmdWxsTmFtZSI6IlN5c3RlbSBBZG1pbiIsInN0YXR1cyI6IkFjdGl2ZSIsImlhdCI6MTc2NDI1NDgxOCwiZXhwIjoxNzY0MzQxMjE4fQ.oTpm4SK8SIxBzD9YF6n_LB0bG2W5hFgA7ZGhEPLF4CQ';

async function testAPIs() {
  console.log('🧪 Testing APIs with new token...\n');
  
  try {
    // Test 1: Verify token
    console.log('1️⃣ Testing token verification...');
    const userResponse = await fetch('http://localhost:3001/api/user', {
      headers: {
        'Authorization': `Bearer ${NEW_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ Token valid:', userData.fullName, userData.role);
    } else {
      console.log('❌ Token invalid:', userResponse.status);
      return;
    }
    
    // Test 2: Get users list
    console.log('\n2️⃣ Testing users API...');
    const usersResponse = await fetch('http://localhost:3001/api/notifications/users', {
      headers: {
        'Authorization': `Bearer ${NEW_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log(`✅ Users API works: ${usersData.data.length} users found`);
      console.log('First 3 users:', usersData.data.slice(0, 3).map(u => `${u.name} (ID: ${u.id})`));
    } else {
      console.log('❌ Users API failed:', usersResponse.status);
    }
    
    // Test 3: Broadcast notification
    console.log('\n3️⃣ Testing broadcast notification...');
    const broadcastResponse = await fetch('http://localhost:3001/api/notifications/broadcast', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NEW_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: '🧪 Test Broadcast từ Script',
        message: `Test broadcast notification - ${new Date().toLocaleString('vi-VN')}`,
        type: 'system',
        sendTo: 'all'
      })
    });
    
    if (broadcastResponse.ok) {
      const broadcastData = await broadcastResponse.json();
      console.log('✅ Broadcast success:', broadcastData.message);
      console.log('Sent to:', broadcastData.sentCount, 'users');
    } else {
      const errorData = await broadcastResponse.json();
      console.log('❌ Broadcast failed:', broadcastResponse.status, errorData.message);
    }
    
    // Test 4: Specific user notification
    console.log('\n4️⃣ Testing specific user notification...');
    const specificResponse = await fetch('http://localhost:3001/api/notifications/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NEW_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 317, // Ada Kuhn from our test data
        title: '🎯 Test Specific từ Script',
        message: `Test specific user notification - ${new Date().toLocaleString('vi-VN')}`,
        type: 'custom'
      })
    });
    
    if (specificResponse.ok) {
      const specificData = await specificResponse.json();
      console.log('✅ Specific notification success:', specificData.message);
    } else {
      const errorData = await specificResponse.json();
      console.log('❌ Specific notification failed:', specificResponse.status, errorData.message);
    }
    
    console.log('\n🎉 All API tests completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Update token in browser:');
    console.log(`   localStorage.setItem("token", "${NEW_TOKEN}")`);
    console.log('2. Refresh admin page');
    console.log('3. Try sending notifications');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAPIs();



