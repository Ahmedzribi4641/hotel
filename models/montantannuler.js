const mongoose=require('mongoose')

const montantannulerSchema=mongoose.Schema({
    montantreservationsannuler:{type: Number, required: true},
},)

module.exports = mongoose.model('Montantannuler', montantannulerSchema);