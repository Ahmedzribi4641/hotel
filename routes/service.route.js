const express= require("express")
const router= express.Router()
const Service= require('../models/service')




// ************************************************************************* get les services ******************************************
router.get('/',async(req,res)=>{
    try{
        const service= await Service.find({},null,{sort:{'_id':-1}})
        res.status(200).json(service)

    }catch(error){
        res.status(404).json({message: error.message})
    }
})



//***************************************************************************** Get un service by id ****************************************
router.get('/:id',async(req,res)=>{
    try{
        const service=await Service.findById(req.params.id)
        res.status(200).json(service)

    }catch(error){
        res.status(400).json({message:error.message});

    }
})

//***************************************************************************** Get by nom service hethom 5thit bihom les service mte3 el restauration ***********************************/
router.post('/chercheparnom/serv', async (req, res) => {
    try {
        const service = await Service.findOne({ nom: req.body.nom });
        res.status(200).json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//******************************************************************************* get tout les services sauf les type de  service de restauration non ************************************** */


router.get('/sans/services/restauration', async (req, res) => {
    try {
        const services = await Service.find(
            { nom: { $nin: ['All inclusive', 'petit-dejeuner', 'Pension compléte', 'Demi-pension'] } }, // nin ma3neha not in
            null,{ sort: { '_id': -1 } }
        );
        res.status(200).json(services);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

//****************************************************************************** get sans le service restauration et leur type hetha lel booking modal cad el pricipale services*********************/

router.get('/sans/restaurationetleurtypes', async (req, res) => { 
    try {
        const services = await Service.find(
            { nom: { $nin: ['Restauration','All inclusive', 'petit-dejeuner', 'Pension compléte', 'Demi-pension'] } }, // nin ma3neha not in
            null,{ sort: { '_id': -1 } }
        );
        res.status(200).json(services);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

//******************************************************************************** get les 4 types de restauration **************************/

router.get('/saufe/lestypesderestauration', async (req, res) => { 
    try {
        const services = await Service.find(
            { nom: { $in: ['All inclusive', 'petit-dejeuner', 'Pension compléte', 'Demi-pension'] } }, // nin ma3neha not in
            null,{ sort: { '_id': -1 } }
        );
        res.status(200).json(services);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

//*********************************************************************************** get seulement le service restauration       bech ne5dem bih el test mte3 el diponibilité mte3 el service restauration*/

router.get('/seulement/restauration', async (req, res) => { 
    try {
        const services = await Service.find( { nom:"Restauration" }, null,{ sort: { '_id': -1 } });
        res.status(200).json(services);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

//************************************************************************************ get les services sans le service restauration *************/

router.get('/sans/leservice/restauration', async (req, res) => {
    try {
        const services = await Service.find({ nom: { $ne: 'Restauration' } },null,{ sort: { '_id': -1 } });
        res.status(200).json(services);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// **************************************************************************** Ajouter un service *******************************************
router.post('/', async (req, res) => {
    const service=new Service(req.body)
    try{
            // Check for existing service with the same name
    const existingService = await Service.findOne({ nom: service.nom });
    if (existingService) {
      return res.status(400).json({ success: false, message: 'Un service avec ce nom existe déjà !' });
    }
        await service.save()

     // await personne.validate();       hethi juste itha t7eb tforci el verification des donneés recuperer ml req.body  ama zeyda 5ater fil front bech n7oto mayejem ken yab3ath des donner s7a7 w deja 7ata ma8irha hna ki tesna3 y9ollek eli les attribut
        
        res.status(200).json(service);
    }catch(error){
        res.status(400).json({message:error.message});

    }
});




//***************************************************************************** Modifier un service *********************************************
// router.put('/:id', async (req, res)=> {
//     try{

//         // Check for existing service with the same name, excluding the current service
//     const existingService = await Service.findOne({
//       name: updates.name,
//       _id: { $ne: serviceId },
//     });
//     if (existingService) {
//       return res.status(400).json({ success: false, message: 'Un service avec ce nom existe déjà !' });
//     }

//         const service= await Service.findByIdAndUpdate(
//             req.params.id,
//             {$set:req.body},
//             {new:true}

//         );
//         // await service.validate();       hethi juste itha t7eb tforci el verification des donneés recuperer ml req.body  ama zeyda 5ater fil front bech n7oto mayejem ken yab3ath des donner s7a7

//     res.status(200).json(service)    
//     }catch(error){
//         res.status(400).json({message:error.message});
//     }
// });

router.put('/:id', async (req, res) => {
  try {
    const serviceId = req.params.id;
    const updates = req.body;

    // Check for existing service with the same name, excluding the current service
    const existingService = await Service.findOne({
      nom: updates.nom,
      _id: { $ne: serviceId },
    });
    if (existingService) {
      return res.status(400).json({ success: false, message: 'Un service avec ce nom existe déjà !' });
    }

    const service = await Service.findByIdAndUpdate(
      serviceId,
      { $set: updates },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service non trouvé.' });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});



// ******************************************************************************* Supprimer une catégorie ***************************************
router.delete('/:id', async (req, res)=> {
    try{
        await Service.findByIdAndDelete(req.params.id); 
        res.json({ message: "service deleted successfully." });

    }catch{
        res.status(400).json({message:error.message});
    }
});



module.exports=router;