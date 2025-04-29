const express= require("express")
const router= express.Router()
const Categorie =require("../models/categorie")

// ******************************************************************************get categories*****************************************
router.get('/',async(req,res)=>{
    try{
        const categories = await Categorie.find({},null,{sort:{'_id':-1}})
        res.status(200).json(categories);

    }catch(error){
        res.status(404).json({message: error.message})
    }
});




// ******************************************************************************get une categorie by id************************************** 
router.get('/:id',async(req,res)=>{
    try{
        const categorie=await Categorie.findById(req.params.id)
        res.status(200).json(categorie)

    }catch(error){
        res.status(400).json({message:error.message});
    }
})




// ********************************************************************ajouter une categorie*************************************************
router.post('/', async (req, res) => {
    const newcategorie=new Categorie(req.body)
    try{
        await newcategorie.save()
        res.status(200).json(newcategorie);
    }catch(error){
        res.status(400).json({message:error.message});

    }
});





// *******************************************************************modifier une categorie*************************************************
router.put('/:id', async (req, res)=> {
    try{
        const categorie= await Categorie.findByIdAndUpdate(
            req.params.id,
            {$set:req.body},
            {new:true}

        );
        // await categorie.validate();       hethi juste itha t7eb tforci el verification des donneés recuperer ml req.body  ama zeyda 5ater fil front bech n7oto mayejem ken yab3ath des donner s7a7

    res.status(200).json(categorie)    
    }catch(error){
        res.status(400).json({message:error.message});
    }
});


// ****************************************************************Supprimer une catégorie*************************************************
router.delete('/:id', async (req, res)=> {
    try{
        await Categorie.findByIdAndDelete(req.params.id); 
        res.json({ message: "categorie deleted successfully." });

    }catch{
        res.status(400).json({message:error.message});
    }
});



module.exports=router;