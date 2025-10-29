const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const COOKIE_NAME = process.env.COOKIE_NAME || 'token';

function signToken(payload, expiresIn = '7d'){
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function verifyToken(token){
  try{
    return jwt.verify(token, JWT_SECRET);
  }catch(err){
    return null;
  }
}

module.exports = { signToken, verifyToken, COOKIE_NAME };
