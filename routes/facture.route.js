const express= require("express")
const router= express.Router()
const Facture= require('../models/facture')




// ************************************************************************* get les Fcatures ******************************************
router.get('/',async(req,res)=>{
    try{  // lezem fil populate hethi ta3ml haka tetsama deep populate 5ater 3andek t7eb te5o id mn wost id donc lezem haka
        const facture= await Facture.find({},null,{sort:{'_id':-1}}).populate({path: "reservationId", populate: [{path: "clientId"},{ path: 'chambres.chambreId' },{ path: 'chambres.services.serviceId' }] 
        });
        res.status(200).json(facture)

    }catch(error){
        res.status(404).json({message: error.message})
    }
})



//***************************************************************************** Get un facture by id ****************************************
router.get('/:id',async(req,res)=>{
    try{
        const facture=await Facture.findById(req.params.id).populate("reservationId").populate('reservationId.clientId')
        res.status(200).json(facture)

    }catch(error){
        res.status(400).json({message:error.message});

    }
})




// **************************************************************************** Ajouter un facture *******************************************
router.post('/', async (req, res) => {
    const facture=new Facture(req.body)
    try{
        await facture.save()    
        res.status(200).json(facture);
    }catch(error){
        res.status(400).json({message:error.message});

    }
});




//***************************************************************************** Modifier un facture *********************************************
router.put('/:id', async (req, res)=> {
    try{
        const facture= await Facture.findByIdAndUpdate(
            req.params.id,
            {$set:req.body},
            {new:true}

        );
    res.status(200).json(facture)    
    }catch(error){
        res.status(400).json({message:error.message});
    }
});



// ******************************************************************************* Supprimer une facture ***************************************
router.delete('/:id', async (req, res)=> {
    try{
        await Facture.findByIdAndDelete(req.params.id); 
        res.json({ message: "facture deleted successfully." });

    }catch{
        res.status(400).json({message:error.message});
    }
});


//    get facture by reservation id

router.get('/byreservation/:id', async (req, res)=> {
    const  reservationId  = req.params.id;
  
    try {
      const facture = await Facture.find({ reservationId },null,{sort:{'_id':-1}}).populate("reservationId")
  
      res.status(200).json(facture);
      
    } catch (error) {
        res.status(400).json({message:error.message});
    }
  });


module.exports=router;