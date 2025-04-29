const express= require("express")
const router= express.Router()
const Montantannuler= require('../models/montantannuler')




// ************************************************************************* get le montant ******************************************
router.get('/',async(req,res)=>{
    try{
        const montant= await Montantannuler.find({},null,{sort:{'_id':-1}})
        res.status(200).json(montant)

    }catch(error){
        res.status(404).json({message: error.message})
    }
})


// **************************************************************************** Ajouter un un montant *******************************************
router.post('/', async (req, res) => {
    const montant=new Montantannuler(req.body)
    try{
        await montant.save()
        
        res.status(200).json(montant);
    }catch(error){
        res.status(400).json({message:error.message});

    }
});


//***************************************************************************** Modifier un service *********************************************
router.put('/:id', async (req, res)=> {
    try{
        const montant= await Montantannuler.findByIdAndUpdate(
            req.params.id,
            {$set:req.body},
            {new:true}

        );
        // await service.validate();       hethi juste itha t7eb tforci el verification des donneés recuperer ml req.body  ama zeyda 5ater fil front bech n7oto mayejem ken yab3ath des donner s7a7

    res.status(200).json(montant)    
    }catch(error){
        res.status(400).json({message:error.message});
    }
});



module.exports=router;