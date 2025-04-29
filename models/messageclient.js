const mongoose = require('mongoose');

const messageclientSchema = new mongoose.Schema({
    nom: { type: String, required: true },  
    email: { type: String, required: true },  
    message: { type: String, required: true },
    lire: { type: Boolean, default: false },
    repondre: { type: Boolean, default: false },
},
{
    timestamps: true, 
},);

module.exports = mongoose.model('Messageclient', messageclientSchema);