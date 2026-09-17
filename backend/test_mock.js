const { register } = require('./controllers/authController');
const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const req = {
    body: {
      fullName: 'Test Mock',
      email: `mock${Date.now()}@test.com`,
      password: 'password123',
      registrationType: 'User'
    },
    ip: '127.0.0.1'
  };

  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      console.log('Status:', this.statusCode, 'Data:', data);
    }
  };

  await register(req, res);
  process.exit(0);
}

run().catch(console.error);
