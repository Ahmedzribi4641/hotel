const mongoose = require('mongoose');

const informationSchema = new mongoose.Schema({
    nom: { type: String, required: true },  
    email: { type: String, required: true },  
    tel: { type: Number, required: true },
    adresse: { type: String, required: true },
    description: { type: String, required: true },
    facebook: { type: String, default: '' },
    instagrame: { type: String, default: '' },


},);

module.exports = mongoose.model('Information', informationSchema);