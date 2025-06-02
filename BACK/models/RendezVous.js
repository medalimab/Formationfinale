const mongoose = require('mongoose');

const RendezVousSchema = new mongoose.Schema({
  client: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  date: { type: Date, required: true },
  heure: { type: String, required: true },
  duree: { type: Number, required: true }, // en minutes
  notes: { type: String },
  statut: { 
    type: String, 
    enum: ['en_attente', 'confirme', 'annule', 'complete'], 
    default: 'en_attente' 
  },
  dateDemande: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RendezVous', RendezVousSchema);
