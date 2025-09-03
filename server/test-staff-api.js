const axios = require('axios');

async function testStaffApi() {
  try {
    console.log('Testing /api/staff endpoint...');
    const response = await axios.get('http://localhost:5000/api/staff');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    console.error('Error testing /api/staff:', error.response ? {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data
    } : error.message);
  }
}

testStaffApi();
