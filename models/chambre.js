const mongoose=require('mongoose')
const Categorie=require('./categorie.js')

const chambreSchema=mongoose.Schema({
      numero: {type: Number,unique: true,required: true},
      description:{type:String,required:false},
      prix: {type: Number, required: true},
      disponible: {type: Boolean, default: true},
      vue: {type: String,enum: ["aucune", "sur la rue", "sur la campagne","sur la piscine","sur mer"],required:true },
      image:{type:String,required:true},
      lits:[{
        typeLit:{type:String,enum:["simple", "double"],required: true},
        quantite:{type:Number, required: true, min: 1}
      }],
      nombreTotalLits:{type:Number,required: false, min: 1}, // yete7seb wa7do bil middleware eli louta


      promotion: { type: Number, default: 0 }, // réduction directe (en %)
      montantReduction: { type: Number, default: 0 }, // montant calculé pour promotion
      promotionnuit: { type: Number, default: 0 }, // réduction % pour longue durée
      nbrnuitpromotion: { type: Number, default: 0 }, // seuil en nuits
      montantReductionNuit: { type: Number, default: 0 }, // montant calculé pour promotionnuit


      categorieId: {type: mongoose.Schema.Types.ObjectId, ref: Categorie ,required: true}
    });

    

    // pour faire le calcule du lattribut nombreTotalLits automatiquement
    chambreSchema.pre('save', function (next) {
      this.nombreTotalLits = this.lits.reduce((total, lit) => total + lit.quantite, 0);
      
      


     // teba3 el promotion w mrigel jawwo a7la jaw zeda 


    if (this.isModified('prix') || this.isModified('promotion') || this.isModified('promotionnuit') || this.isModified('nbrnuitpromotion')) {
        
        // Réduction directe
    if (this.promotion > 0) {
      this.montantReduction = this.prix * (this.promotion / 100);
    } else {
      this.montantReduction = 0;
    }

    // Réduction pour longue durée
    if (this.promotionnuit > 0 && this.nbrnuitpromotion > 0) {
      this.montantReductionNuit = this.prix * (this.promotionnuit / 100);
    } else {
      this.montantReductionNuit = 0;
    }
  }

  next();
    });
    
    module.exports = mongoose.model('Chambre', chambreSchema);