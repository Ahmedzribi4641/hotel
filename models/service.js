const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    nom: { type: String, required: true },  
    description: { type: String, required: true },  
    prix: { type: Number, required: true },
    disponible: {type: Boolean, default: true},
    image: { type: String, required: true }
},);

module.exports = mongoose.model('Service', serviceSchema);