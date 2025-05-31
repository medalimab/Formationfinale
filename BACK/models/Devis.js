const mongoose = require('mongoose');

const DevisSchema = new mongoose.Schema({
  client: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  service: { type: String, required: true },
  description: { type: String, required: true },
  montantEstime: { type: Number },
  delaiEstime: { type: String },
  statut: { 
    type: String, 
    enum: ['en_attente', 'traite', 'accepte', 'refuse'], 
    default: 'en_attente' 
  },
  fichiers: [String], // URLs des fichiers joints
  dateDemande: { type: Date, default: Date.now },
  dateTraitement: { type: Date }
});

module.exports = mongoose.model('Devis', DevisSchema);
