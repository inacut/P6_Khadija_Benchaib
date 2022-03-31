const jwt = require('jsonwebtoken');
const Sauce = require('../models/Sauce');

//on inclut le module FyleSystem qui permet de travailler avec les fichiers
const fs = require('fs');

//création d'une sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);

  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  console.log(req.body.sauce);
  // Sauvegarde de la sauce dans la base de données
  sauce
    .save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
    .catch((error) => res.status(400).json({ error }));
};
//trouver une sauce par son id
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

//modification d'une sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (req.file == null) {
      Sauce.updateOne(
        { _id: req.params.id },
        { ...sauceObject, _id: req.params.id }
      )
        .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
        .catch((error) => res.status(400).json({ error }));
    } else {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
          .catch((error) => res.status(400).json({ error }));
      });
    }
  });
};

//Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
  const userId = decodedToken.userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      //si userId est le meme que celui qui a créé la sauce
      if (sauce.userId === userId) {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce supprimé !' }))
            .catch((error) => res.status(400).json({ error }));
        });
      } else {
        //si userId different
        res.status(403).json({ message: 'Requête non autorisée !' });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

//récuperer toutes les sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

//////////////////////////////////////////////
// Likes dislikes d'une sauce
//////////////////////////////////////////////

exports.likeSauce = (req, res, next) => {
  const userId = req.body.userId;
  const like = req.body.like;

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      //Like = 1
      if (like === 1 && !sauce.usersLiked.includes(userId)) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { likes: 1 },
            $push: { usersLiked: userId },
            _id: req.params.id,
          }
        )
          .then(() => res.status(200).json({ message: "J'aime cette sauce !" }))
          .catch((error) => res.status(400).json({ error }));
        //Like = -1
      } else if (req.body.like === -1 && !sauce.usersLiked.includes(userId)) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { dislikes: 1 },
            $push: { usersDisliked: userId },
            _id: req.params.id,
          }
        )
          .then(() =>
            res.status(200).json({ message: "Je n'aime pas cette sauce !" })
          )
          .catch((error) => res.status(400).json({ error }));

        //Like = 0 et userId est inclus dans le tableau usersLiked
      } else if (req.body.like === 0 && sauce.usersLiked.includes(userId)) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { likes: -1 },
            $pull: { usersLiked: userId },
            _id: req.params.id,
          }
        )
          .then(() => res.status(200).json({ message: 'Like supprimé !' }))
          .catch((error) => res.status(400).json({ error }));

        //Like = 0 et userId est inclus dans le tableau usersDisliked
      } else if (req.body.like === 0 && sauce.usersDisliked.includes(userId)) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { dislikes: -1 },
            $pull: { usersDisliked: userId },
            _id: req.params.id,
          }
        )
          .then(() => res.status(200).json({ message: 'Dislike supprimé!' }))
          .catch((error) => res.status(400).json({ error }));
      } else {
        return res.status(400).json({ error });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
