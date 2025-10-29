require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const { hashPassword } = require('./utils/hash');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/team_projects_db';

async function seed(){
  await connectDB(MONGO_URI);
  const count = await User.countDocuments();
  if (count === 0){
    const hashed = await hashPassword('password');
    await User.create({ username: 'admin', email: 'admin@example.com', password: hashed, role: 'Admin' });
  } else {
  }
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
