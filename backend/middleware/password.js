//importation du password validator
const passwordValidator = require('password-validator');

const passwordSchema = new passwordValidator();

passwordSchema
  .is()
  .min(8) // Longueur minimale 8
  .is()
  .max(20) // Longueur maximale 20
  .has()
  .uppercase() // Doit contenir au moins 1 majuscules
  .has()
  .lowercase() // Doit contenir au moins 1 minuscules
  .has()
  .digits() // Doit avoir au moins 1 chiffres
  .has()
  .not()
  .spaces(); // Ne doit pas avoir d'espaces

module.exports = (req, res, next) => {
  if (passwordSchema.validate(req.body.password)) {
    next();
  } else {
    return res.status(401).json({
      message: `Votre mot de passe n'est pas assez sécurisé: 8 caractères min, 20 max, 1 maj, 1 min, 1 chiffre minimum et pas d'espace svp. `,
    });
  }
};
