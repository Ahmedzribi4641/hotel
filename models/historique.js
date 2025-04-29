const mongoose=require('mongoose')
const Reservation=require('./reservation.js')
const Personne=require('./personne.js')



const historiqueSchema = new mongoose.Schema({
    clientId: {type: mongoose.Schema.Types.ObjectId, ref: Personne ,required: true},
    reservations:[{
        reservationId: {type: mongoose.Schema.Types.ObjectId, ref: Reservation ,required: true},
    }],
},
{
    timestamps: true, 
}
);




module.exports = mongoose.model('Historique', historiqueSchema);