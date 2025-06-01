const express= require("express")
const router= express.Router()
const Chambre =require("../models/chambre")



//**************************************************************get les chambre************************************************** 
router.get('/',async(req,res)=>{
    try{
        const chambres=await Chambre.find({},null,{sort:{'_id':-1}}).populate("categorieId")
        res.status(200).json(chambres)

    }catch(error){
        res.status(400).json({message:error.message})
    }
})

//*************************************************************get les chambres disponible****************************************** // lezemmha 9bal el route mte3 el get by id 9alek makenchi mate5demch
router.get('/disponible',async(req,res)=>{
    try{
        const chambres=await Chambre.find({disponible:"true"},null,{sort:{'_id':-1}}).populate("categorieId")
        res.status(200).json(chambres)

    }catch(error){
        res.status(400).json({message:error.message})
    }
})



// ************************************************************** get une chambre byid********************************************
router.get('/:id',async(req,res)=>{
    try{
        const chambre=await Chambre.findById(req.params.id).populate("categorieId");
        res.status(200).json(chambre)

    }catch(error){
        res.status(400).json({message:error.message});
    }
})



//*****************************************************************ajouter une chambre ***********************************************
// router.post('/',async(req,res)=>{
//     const newchambre= new Chambre(req.body)
//     try{
//         await newchambre.save()
//         res.status(200).json(newchambre)

//     }catch(error){
//         res.status(400).json({message:error.message})
//     }
// })

router.post('/', async (req, res) => {
  try {
    const newchambre = new Chambre(req.body);

    // Check for existing room with the same numero
    const existingChambre = await Chambre.findOne({ numero: newchambre.numero });
    if (existingChambre) {
      return res.status(400).json({ success: false, message: 'Une chambre avec ce numéro existe déjà !' });
    }

    await newchambre.save();
    res.status(200).json(newchambre);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});



// *****************************************************************modifier une chambre **********************************************
// router.put('/:id',async(req,res)=>{
//     try{
//         const chambre = await Chambre.findById(req.params.id);
        
//         Object.assign(chambre, req.body);                // behi hethi object.assign esta3melneha  5ater manejmouch na3mlo haka direct  (chambre=req.body)   donc el methode heki hiya eli tbadlelna objet b objet    wa7na fil put walina ne5dmo haka bil finbyid mouch bil findbyidandupdate bech ba3d nejmo na3mlo el .save bech el middleware ya9raha 5ater el findbyidandupdate mafihech . save donc ywali wa9tha el middle ware maye5demch heka 3leh lezem ne5dmo haka fil put mouch kima fil put mte3 el categorie mithel 5ater ma3andnech middle ware ya3ni 3adi 7ata ki mane5demch bil .save 
//         await chambre.save()
//         res.status(200).json(chambre)

//     }catch(error){
//         res.status(400).json({message:error.message})
//     }
// })

router.put('/:id', async (req, res) => {
  try {
    const roomId = req.params.id;
    const updates = req.body;

    // Check for existing room with the same numero, excluding the current room
    const existingChambre = await Chambre.findOne({
      numero: updates.numero,
      _id: { $ne: roomId },
    });
    if (existingChambre) {
      return res.status(400).json({ success: false, message: 'Une chambre avec ce numéro existe déjà !' });
    }

    const chambre = await Chambre.findById(roomId);
    if (!chambre) {
      return res.status(404).json({ success: false, message: 'Chambre non trouvée.' });
    }

    Object.assign(chambre, updates);
    await chambre.save();
    res.status(200).json(chambre);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});



// *****************************************************************delete une chambre *************************************************
router.delete('/:id',async(req,res)=>{
    try{
        await Chambre.findByIdAndDelete(req.params.id);
        res.json({ message: "chambre deleted successfully." });

    }catch(error){
        res.status(400).json({message:error.message})
    }
})



// ********************************************************************** get les chambres dun categorie by id de la categorie*****************
router.get('/bycategorie/:catid',async(req,res)=>{
    try{
        const chambres=await Chambre.find({categorieId:req.params.catid}).populate("categorieId")
        res.status(200).json(chambres)

    }catch(error){
        res.status(400).json({message:error.message})
    }
})




module.exports=router;