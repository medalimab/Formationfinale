const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true },
  telephone: { type: String },
  sujet: { type: String, required: true },
  message: { type: String, required: true },
  dateEnvoi: { type: Date, default: Date.now },
  traite: { type: Boolean, default: false }
});

module.exports = mongoose.model('Contact', ContactSchema);
