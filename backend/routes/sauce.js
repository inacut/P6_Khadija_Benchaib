const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const sauceCtrl = require('../controllers/sauce');
const multer = require('../middleware/multer-config');

//Routes pour créer une sauce
router.post('/', auth, multer, sauceCtrl.createSauce);
//Route qui recupère tous les sauces
router.get('/', auth, sauceCtrl.getAllSauces);
//Route qui recupère une sauce avec son ID
router.get('/:id', auth, sauceCtrl.getOneSauce);
//Route qui permet de modifier une sauce
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
//Route qui permet de supprimer une sauce
router.delete('/:id', auth, sauceCtrl.deleteSauce);
//route pour les likes dislikes des sauces
router.post('/:id/like', auth, sauceCtrl.likeSauce);

module.exports = router;
