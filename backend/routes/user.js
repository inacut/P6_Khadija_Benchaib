//import
const express = require('express');
const router = express.Router();
//import de express-rate-limit qui permet de limiter les demandes d'inscription d'ume même adresse ip (5 par heures)
const rateLimit = require('express-rate-limit');

//import du controller
const userCtrl = require('../controllers/user');

//import du middleware controleEmail
const controleEmail = require('../middleware/controleEmail');

//import du middleware password
const password = require('../middleware/password');

const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limite a 5 inscription par heure 
  message:
    'Too many accounts created from this IP, please try again after an hour',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
//Creation d'un nouvel utilisateur , limite la création de compte a 5 par heure et par IP, controle et chiffre l'email , controle et hash le password
router.post(
  '/signup',
  createAccountLimiter,
  controleEmail,
  password,
  userCtrl.signup
);
//Vérification des infos de l'utilisateur pour la connection
router.post('/login', userCtrl.login);

module.exports = router;
