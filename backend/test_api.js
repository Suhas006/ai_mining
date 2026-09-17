const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUser() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      fullName: 'Test User',
      email: `user${Date.now()}@test.com`,
      password: 'password123',
      registrationType: 'User'
    });
    console.log('User OK:', res.data);
  } catch (err) {
    console.error('User Error:', err.response?.data || err.message);
  }
}

async function testEmployee() {
  try {
    const form = new FormData();
    form.append('fullName', 'Test Employee');
    form.append('email', `emp${Date.now()}@test.com`);
    form.append('password', 'password123');
    form.append('registrationType', 'Employee');
    form.append('education', 'BTech');
    
    // Create a dummy file
    fs.writeFileSync('dummy.jpg', 'dummy image content');
    form.append('photo', fs.createReadStream('dummy.jpg'));

    const res = await axios.post('http://localhost:5000/api/auth/register', form, {
      headers: form.getHeaders()
    });
    console.log('Employee OK:', res.data);
  } catch (err) {
    console.error('Employee Error:', err.response?.data || err.message);
  }
}

testUser().then(testEmployee);
