const mongoose=require('mongoose')

const categorieSchema=mongoose.Schema({
    nom :{type:String,unique: true ,required:true},
    chambretitle:{type:String ,required:false, default:"chambre"}, 
    description :{type:String,required:true},
    disponible: {type: Boolean, default: true},
    capacite: {type:Number,required:true},
    image:{type:String,required:true}
})



module.exports = mongoose.model('Categorie', categorieSchema);