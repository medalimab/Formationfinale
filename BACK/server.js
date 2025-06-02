const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');
const config = require('./config/config');

connectDB();

const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['authorization', 'content-type', 'origin', 'accept']
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/formations', require('./routes/formation.routes'));
app.use('/api/panier', require('./routes/panier.routes'));
app.use('/api/blog', require('./routes/blog.routes'));
app.use('/api/contact', require('./routes/contact.routes'));
app.use('/api/temoignages', require('./routes/temoignage.routes'));
app.use('/api/services', require('./routes/service.routes'));
app.use('/api/devis', require('./routes/devis.routes'));
app.use('/api/rendezvous', require('./routes/rendezVous.routes'));
app.use('/api/debug', require('./routes/debug.routes'));

app.use(errorHandler);

const PORT = config.PORT || 5000;

app.listen(PORT, () => 
  console.log(`Serveur démarré sur le port ${PORT}`));