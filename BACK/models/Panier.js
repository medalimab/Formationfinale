const mongoose = require('mongoose');

const PanierSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  formations: [{
    formation: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Formation' 
    },
    dateAjout: { type: Date, default: Date.now }
  }],
  total: { type: Number, default: 0 }
});

module.exports = mongoose.model('Panier', PanierSchema);