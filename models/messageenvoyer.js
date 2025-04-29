const mongoose = require('mongoose');

const messageenvoyerSchema = new mongoose.Schema(
  {
    nom: {type: String,required: false,},
    email: {type: String,required: true,},
    message: {type: String,required: true,},
    createdAt: {type: Date,default: Date.now,expires: 1800, },  // youfa ya3ni yetna7a ba3d nos se3a 
  },
  {
    timestamps: false, 
  }
);

module.exports = mongoose.model('Messageenvoyer', messageenvoyerSchema);
