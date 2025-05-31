const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    await mongoose.connect(config.DB_URL);
    console.log('✅ Connecté à MongoDB');
  } catch (err) {
    console.error('❌ Échec de connexion à MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;