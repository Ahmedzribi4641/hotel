const mongoose=require('mongoose')

const categorieSchema=mongoose.Schema({
    nom :{type:String,unique: true ,required:true},
    chambretitle:{type:String,unique: true ,required:true}, // hetha el attribut maktebtouch fil diagramme de classe 5ater zeyd ena juste bech nesta3mlo fil affichage mte3 les chambre wala nejem n7oto 3adi 5ater ena fil formulaire base taw n7oto ka list fiha les combinaison lkol w howa ya5tar mnha
    description :{type:String,required:true},
    disponible: {type: Boolean, default: true},
    capacite: {type:Number,required:true},
    image:{type:String,required:true}
})

module.exports = mongoose.model('Categorie', categorieSchema);