const express= require("express")
const router= express.Router()
const Historique= require('../models/historique')




// ************************************************************************* get les historique ******************************************
router.get('/',async(req,res)=>{
    try{  // lezem fil populate hethi ta3ml haka tetsama deep populate 5ater 3andek t7eb te5o id mn wost id donc lezem haka
        const historique= await Historique.find({},null,{sort:{'_id':-1}}).populate("clientId").populate({path: 'reservations.reservationId',populate: [{path: 'chambres.chambreId',populate: {path: 'categorieId' }},{path: 'chambres.services.serviceId'}]})
        res.status(200).json(historique)

    }catch(error){
        res.status(404).json({message: error.message})
    }
})



//***************************************************************************** Get un historique by id ****************************************
router.get('/:id',async(req,res)=>{
    try{
        const historique =await Historique.findById(req.params.id).populate("clientId").populate('reservations.reservationId')
        res.status(200).json(historique)

    }catch(error){
        res.status(400).json({message:error.message});

    }
})




// **************************************************************************** Ajouter un Historique *******************************************
router.post('/', async (req, res) => {
    const historique=new Historique(req.body)
    try{
        await historique.save()    
        res.status(200).json(historique);
    }catch(error){
        res.status(400).json({message:error.message});

    }
});




//***************************************************************************** Modifier un Historique *********************************************
router.put('/:id', async (req, res)=> {
    try{
        const historique= await Historique.findByIdAndUpdate(
            req.params.id,
            {$set:req.body},
            {new:true}

        );
    res.status(200).json(historique)    
    }catch(error){
        res.status(400).json({message:error.message});
    }
});



// ******************************************************************************* Supprimer une Historique ***************************************
router.delete('/:id', async (req, res)=> {
    try{
        await Historique.findByIdAndDelete(req.params.id); 
        res.json({ message: "historique deleted successfully." });

    }catch{
        res.status(400).json({message:error.message});
    }
});


//    get historique by clientid

router.get('/byclient/:id', async (req, res)=> {
    const  clientId  = req.params.id;
  
    try {
      const historique = await Historique.find({ clientId },null,{sort:{'_id':-1}}).populate("clientId").populate({path: 'reservations.reservationId',populate: [{path: 'chambres.chambreId',populate: {path: 'categorieId' }},{path: 'chambres.services.serviceId'}]})
  
      res.status(200).json(historique);
      
    } catch (error) {
        res.status(400).json({message:error.message});
    }
  });





module.exports=router;