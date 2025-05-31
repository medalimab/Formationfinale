const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');
const config = require('./config/config');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/formations', require('./routes/formation.routes'));
app.use('/api/panier', require('./routes/panier.routes'));

app.use(errorHandler);

const PORT = config.PORT || 5000;

app.listen(PORT, () => 
  console.log(`Serveur démarré sur le port ${PORT}`));