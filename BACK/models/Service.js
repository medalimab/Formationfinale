const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, required: true },
  categorie: { type: String, required: true },
  image: { type: String },
  prix: { type: Number },
  caracteristiques: [String],
  disponible: { type: Boolean, default: true },
  dateCreation: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Service', ServiceSchema);
