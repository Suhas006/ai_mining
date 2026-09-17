const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { register } = require('./controllers/authController');
require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const app = express();
  app.use(express.json({ limit: '50mb' }));
  const upload = multer({ storage: multer.memoryStorage() });

  app.post('/api/auth/register', upload.single('photo'), register);

  const server = app.listen(5005, async () => {
    console.log('Test server running on 5005');

    try {
      console.log('Testing User (JSON)...');
      const resUser = await axios.post('http://localhost:5005/api/auth/register', {
        fullName: 'Test User',
        email: `user${Date.now()}@test.com`,
        password: 'password123',
        registrationType: 'User'
      });
      console.log('User OK:', resUser.data.msg);
    } catch (err) {
      console.error('User Error:', err.response?.data || err.message);
    }

    try {
      console.log('Testing Employee (FormData)...');
      const form = new FormData();
      form.append('fullName', 'Test Employee');
      form.append('email', `emp${Date.now()}@test.com`);
      form.append('password', 'password123');
      form.append('registrationType', 'Employee');
      form.append('education', 'BTech');
      
      fs.writeFileSync('dummy.jpg', 'dummy');
      form.append('photo', fs.createReadStream('dummy.jpg'));

      const resEmp = await axios.post('http://localhost:5005/api/auth/register', form, {
        headers: form.getHeaders()
      });
      console.log('Employee OK:', resEmp.data.msg);
    } catch (err) {
      console.error('Employee Error:', err.response?.data || err.message);
    }

    server.close();
    process.exit(0);
  });
}

run().catch(console.error);
