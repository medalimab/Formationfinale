require('dotenv').config();

module.exports = {
  DB_URL: process.env.DB_URL,
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d'
};