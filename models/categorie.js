const mongoose=require('mongoose')

const categorieSchema=mongoose.Schema({
    nom :{type:String,unique: true ,required:true},
    chambretitle:{type:String ,required:false}, // hetha el attribut maktebtouch fil diagramme de classe 5ater zeyd ena juste bech nesta3mlo fil affichage mte3 les chambre wala nejem n7oto 3adi 5ater ena fil formulaire base taw n7oto ka list fiha les combinaison lkol w howa ya5tar mnha
    description :{type:String,required:true},
    disponible: {type: Boolean, default: true},
    capacite: {type:Number,required:true},
    image:{type:String,required:true}
})


// juste 5ater ma3raftech nefsa5 el clé unique mte3 el chambretitle ama howa el attribut lkolo zeyed aslan 
categorieSchema.pre('save', async function (next) {
    if (!this.chambretitle) {
    try {const existingCategories = await mongoose.model('Categorie').find({ chambretitle: { $regex: /^chambre\d+$/ } }).select('chambretitle');
    const usedNumbers = existingCategories.map((category) => {const match = category.chambretitle.match(/\d+/);
    return match ? parseInt(match[0]) : null;}).filter((num) => num !== null);
    let num = 1;
    while (usedNumbers.includes(num)) {num++;}
    this.chambretitle = `chambre${num}`;
    } catch (error) {return next(error);}}
    next();
  });


module.exports = mongoose.model('Categorie', categorieSchema);