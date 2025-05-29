const mongoose = require('mongoose');
const Personne = require('./personne.js');
const Chambre = require('./chambre.js');
const Service=require('./service.js');

const crypto = require("crypto"); // hetha el crypto bech nesta3mlo bech ngeneri bih el random reference w mayest7a9ech installation mawjoud fil node juste timportih wkhw

// Helper function to round to two decimal places
const roundToTwo = (num) => {
    return Number((Math.round(num * 100) / 100).toFixed(2));
};

const reservationSchema=mongoose.Schema({
    reference:{ type: String, required: false },
    clientId:{type: mongoose.Schema.Types.ObjectId, ref: Personne ,required: true},
    chambres:[{
        chambreId:{type: mongoose.Schema.Types.ObjectId, ref: Chambre ,required: true},
        dateArrive: { type: Date, required: true },
        dateSortie: { type: Date, required: true },
        nombreNuits: { type: Number,required:false},
        nombreAdulte: { type: Number, required: true },
        nombreEnfant:  { type: Number, required: true },
        litbebe:  { type: Number, default: 0 },
        services: [{
              serviceId: { type: mongoose.Schema.Types.ObjectId, ref: Service, required: true },
              quantite: { type: Number, required: true },
              montantService: { type: Number } // hethi ma3neha el total mte3 el service heka
            }],
        // services: {
        //     type: [{
        //       serviceId: { type: mongoose.Schema.Types.ObjectId, ref: Service, required: true },
        //       quantite: { type: Number, required: true },
        //       montantService: { type: Number }
        //     }],
        //     default: [] // car le client peut de nest pas reserver auccune service   (ama 7ata ma8ir fazet hal default wel type wel lkol temchi mrigla 7ata ken matab3athch services ya3ni donc zeyda tejem t9oul nejem n7otha kima el chambres direct wkhw)
        // },
        montantChambre: { type: Number, required: false },
        montantServicesparchambre: { type: Number, required: false },
        totalchambre:  { type: Number, required: false }
    }],
    nombreTotalChambres:{type:Number,required:false},
    nombreTotalServices:{type:Number,required:false},
    montantTotalServices: { type: Number,required:false},
    montantTotalChambre: { type: Number,required:false},
    montantTotalReservation: { type: Number,required:false},
    modePaiement: { type: String, required: true, enum: ["en ligne", "à l'hôtel"]},
    nombreTotalAdulte: { type: Number,required:false},
    nombreTotalEnfant: { type: Number,required:false},
    nombreTotalbebe: { type: Number,required:false}
},
{
    timestamps: true, // ya3tini les dates dajout wel modification
}
)



reservationSchema.pre('save', async function(next) {
    
    //teba3 el reference automatique w bech ygenerer dima we7d unique du base hexadecimal ma3neha 7rouf w ar9am w 4 octet ma3neha 8 caracteret 
    
    if (!this.reference) { // ya3ni itha el reference fera8 cad awel ajout ya3ni man7ebha te5dem ken fil post fil put la
        let uniqueRef;
        let existingReservation;
        
        // Générer une référence unique
        do {  
            uniqueRef = "RES-" + crypto.randomBytes(4).toString("hex").toUpperCase();  // bech n7oto fih res wala nejem man7otech betbi3a kima n7eb w ba3dha el 7aja eli bech tgeneriha random 
            existingReservation = await this.constructor.findOne({ reference: uniqueRef }); // hna zedna kelmet constructor 5ater el methode findone ta7ki m3a table direct normalement ya3ni haka mithe (name.findone) ama madem ma3andich esm el table nwali haka bil this.constructor
        } while (existingReservation); // hethi normalement bil ! mouch haka 5ater ena n7eb n9olo mato5roj ml boucle ken wa9t el exist egale null ya3ni mafamech kifo el ref heka

        this.reference = uniqueRef;  // 3tineh heka el reference eli sna3neh
    }




    let nombresChambres = 0; // bech nzidouh 1 fi kol chambre fil boucle bech ba3d n7oto fil nombretotalchambres
    let nombresServices = 0;
    let totalServices = 0;
    let totalChambres= 0; //fiha el somme mte3 les chambre ma8ir services ya3ni
    let nbrenfant= 0;
    let nbradult= 0;
    let nbrbebe= 0;

  // declarina ken el 3 hethom 5ater lo5rin eli fil les tableau tbadelhom el foreach fi kol objet mawjoudin heka 3leh donc kol wa7da wel valeur mte3ha fil table
  await this.populate('chambres.chambreId');
  await this.populate('chambres.services.serviceId');

  this.chambres.forEach(chambre => {

        // Calculer le nombre de nuits uniquement si les dates sont modifiées cad pour le cas dajout et modifier 
        if (!chambre.nombreNuits || this.isModified(`chambres.${chambre._id}.dateArrive`) || this.isModified(`chambres.${chambre._id}.dateSortie`)) {
            const arrivee = new Date(chambre.dateArrive);
            const sortie = new Date(chambre.dateSortie);
            const differenceTemps = sortie - arrivee;  // retour en mille de seconde 
            chambre.nombreNuits = Math.ceil(differenceTemps / (1000 * 60 * 60 * 24)); // pour faire larrendie ver le haut de la nombre des nuits a reserver
        }




        
         // Calculer le montant des services uniquement si les services sont modifiés
         let montantserviceparchambre = 0; // bech te7seb el total des services pour chaque chambre w fi kol chambre yarja3 lel 0
        chambre.services.forEach(service => {
        if (!service.montantService || this.isModified(`services.${service._id}.quantite`)) {
            service.montantService = roundToTwo(service.quantite*service.serviceId.prix);
        }
        nombresServices += 1;  // n7otha normalement quantité 5ir fibeli 
        montantserviceparchambre+=service.montantService // prix les service pour une chambre
    });


    // Calculer totalChambre uniquement si la chambre ou les services sont modifiés
    let prixParNuit = chambre.chambreId.prix; // bech na3ml 3lih el calcule lel s8ar wel kbar ya3ni w fazet itha reserva akthar mn 3adad mte3 lyeli zeda el prix yti7 b pourcentage mo3ayna 7asb el admin chbech y7ot
    if (!chambre.totalChambre || this.isModified(`chambres.${chambre._id}`)) { // hna fil condition loula itha total chambre fera8 wala itha montant chambre fera8 kifkif // ma3neha itha tbadlet ay 7aja fil objet 5ater ay 7aja tejem t2atthar 3al prix
        //  promotion directe
        if (chambre.chambreId.promotion > 0) {
            prixParNuit -= chambre.chambreId.montantReduction;
        }

        //  promotion 3al nombre de nuits
        if (chambre.nombreNuits >= chambre.chambreId.nbrnuitpromotion && chambre.chambreId.promotionnuit > 0) {
            prixParNuit -= chambre.chambreId.montantReductionNuit;
        }
        const prixAdult=prixParNuit;
        const prixEnfant=prixParNuit*0.5;
        chambre.montantChambre=roundToTwo(chambre.nombreNuits*((prixAdult*chambre.nombreAdulte)+(prixEnfant*chambre.nombreEnfant))); // hetha montant chambre ma3neha ken el prix mte el lyeli ma8ir services

    }

    chambre.montantServicesparchambre=roundToTwo(montantserviceparchambre);
    chambre.totalchambre=roundToTwo(montantserviceparchambre+chambre.montantChambre); // hethi te7sebli lel chambre el wa7da el montant mte3 el lyeli wel services mte3 chambre wa7da
    nombresChambres += 1;
    totalChambres += chambre.montantChambre; // hethi yet7at fiha el total mte3 soum el lyeli ma8ir des services lel les chambres lkol
    totalServices += montantserviceparchambre; // w hetha montant les service lel reservation kemla
    nbrenfant+=chambre.nombreEnfant;
    nbradult+=chambre.nombreAdulte;
    nbrbebe+=chambre.litbebe;
});


    // Mise à jour des champs globaux uniquement si la réservation est modifiée
    if (!this.nombreTotalChambres || this.isModified('chambres') || this.isModified('services')) {
        this.nombreTotalChambres = nombresChambres;
        this.nombreTotalServices = nombresServices;
        this.montantTotalChambre = roundToTwo(totalChambres);
        this.montantTotalServices = roundToTwo(totalServices);
        this.montantTotalReservation = roundToTwo(totalChambres + totalServices);
        this.nombreTotalAdulte=nbradult;
        this.nombreTotalEnfant=nbrenfant;
        this.nombreTotalbebe=nbrbebe;

    }

    next();
});


module.exports = mongoose.model('Reservation', reservationSchema);