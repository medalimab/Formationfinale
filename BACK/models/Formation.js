const mongoose = require('mongoose');

const FormationSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, required: true },
  prix: { type: Number, required: true },
  duree: { type: String, required: true },
  categorie: { type: String, required: true },
  formateur: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  image: { type: String },
  dateCreation: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Formation', FormationSchema);