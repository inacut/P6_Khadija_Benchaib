const mongoose = require('mongoose');

// plugin mongooose pour garantir l'unicité de l'adresse
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

//securité supp pour ne pas avoir 2 fois la même adresse email
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);