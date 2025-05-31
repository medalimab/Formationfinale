const mongoose = require('mongoose');

const TemoignageSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  poste: { type: String },
  entreprise: { type: String },
  commentaire: { type: String, required: true },
  note: { 
    type: Number, 
    min: 1, 
    max: 5, 
    required: true 
  },
  image: { type: String },
  dateCreation: { type: Date, default: Date.now },
  approuve: { type: Boolean, default: false }
});

module.exports = mongoose.model('Temoignage', TemoignageSchema);
