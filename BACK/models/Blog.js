const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  contenu: { type: String, required: true },
  image: { type: String },
  auteur: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  categories: [String],
  tags: [String],
  datePublication: { type: Date, default: Date.now },
  commentaires: [
    {
      texte: { type: String, required: true },
      utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      date: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Blog', BlogSchema);
