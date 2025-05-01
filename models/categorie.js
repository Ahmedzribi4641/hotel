const mongoose=require('mongoose')

const categorieSchema=mongoose.Schema({
    nom :{type:String,unique: true ,required:true},
    chambretitle:{type:String ,required:false}, // hetha el attribut maktebtouch fil diagramme de classe 5ater zeyd ena juste bech nesta3mlo fil affichage mte3 les chambre wala nejem n7oto 3adi 5ater ena fil formulaire base taw n7oto ka list fiha les combinaison lkol w howa ya5tar mnha
    description :{type:String,required:true},
    disponible: {type: Boolean, default: true},
    capacite: {type:Number,required:true},
    image:{type:String,required:true}
})



categorieSchema.pre('save', async function (next) {
    if (!this.chambretitle) {
      try {
        // Trouver toutes les catégories existantes avec un chambretitle suivant le format chambreX
        const existingCategories = await mongoose
          .model('Categorie')
          .find({ chambretitle: { $regex: /^chambre\d+$/ } })
          .select('chambretitle');
  
        // Extraire les nombres des chambretitle existants (par exemple, chambre1 -> 1, chambre2 -> 2)
        const usedNumbers = existingCategories
          .map((category) => {
            const match = category.chambretitle.match(/\d+/);
            return match ? parseInt(match[0]) : null;
          })
          .filter((num) => num !== null);
  
        // Trouver le premier numéro non utilisé (commençant par 1)
        let num = 1;
        while (usedNumbers.includes(num)) {
          num++;
        }
  
        // Définir chambretitle comme chambreX (par exemple, chambre1, chambre2, etc.)
        this.chambretitle = `chambre${num}`;
      } catch (error) {
        return next(error);
      }
    }
    next();
  });


module.exports = mongoose.model('Categorie', categorieSchema);