const mongoose = require('mongoose');

const messageabonnerenvoyerSchema = new mongoose.Schema(
  {
    message: {type: String,required: false,},
    image: {type: String,required: false,},
    createdAt: {type: Date,default: Date.now,expires: 1800, },  // youfa ya3ni yetna7a ba3d nos se3a 
  },
  {
    timestamps: false, 
  }
);

module.exports = mongoose.model('Messageabonnerenvoyer', messageabonnerenvoyerSchema);
