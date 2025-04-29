const mongoose=require('mongoose')
const Reservation=require('./reservation.js')

// el facture bech na3mlou biha el affichage fi chiret el admin lel les factures eli yet3amlo ba3d kol reservation ya3ni

const factureSchema = new mongoose.Schema({
    reservationId: {type: mongoose.Schema.Types.ObjectId, ref: Reservation ,required: true},
},
{
    timestamps: true, // ya3tini les dates dajout wel modification
}
);




module.exports = mongoose.model('Facture', factureSchema);