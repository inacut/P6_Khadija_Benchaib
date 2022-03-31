//import du framework de node.js = express
const express = require('express');

//module qui nettoie les nettoie les données fournies par l'utilisateur pour empêcher l'injection d'opérateur MongoDB.
const mongoSanitize = require('express-mongo-sanitize');

//plugin pour l'upload des images
const path = require('path');

//package express rate limit pour limiter les demandes répétées aux API
const rateLimit = require('express-rate-limit');

//importation des differentes routes : route de connection à la BDD de mongoDB route sauce et route user
const mongoose = require('./db/db');
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

//analyse le corps des requetes
const app = express();

//helmet configure de manière appropriée des en-têtes HTTP et aide a protéger l'application contre certaines vulnérabilités
const helmet = require('helmet');
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

//CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});

//configuration de express rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite a 100 les requetes de chaque IP pendant 15 minutes
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

//renvoie le corp de la requetes en format json
app.use(express.json());

//permet de parser les requêtes envoyées par l'utilisateur
app.use(express.urlencoded({ extended: true }));

// Pour supprimer des données à l'aide des valeurs par défaut
app.use(mongoSanitize());

//gestion des images
app.use('/images', express.static(path.join(__dirname, 'images')));

//Routes
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

//module export
module.exports = app;

//affichage des requetes dans la console
mongoose.set('debug', true);
