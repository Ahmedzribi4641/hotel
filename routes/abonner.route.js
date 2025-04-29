const express= require("express")
const router= express.Router()
const Abonner= require('../models/abonner')

// get les abonners
router.get('/',async(req,res)=>{
    try{
        const abonners= await Abonner.find({},null,{sort:{'_id':-1}})
        res.status(200).json(abonners)

    }catch(error){
        res.status(404).json({message: error.message})
    }
})

// post les information bech nesta3melha ken awel mara ml back khaw ya3ni mouch bech nest7a9ha w nejem 7ata manesta3mlhech mn hna nwali n3amarhom manuelle ml bara
router.post('/', async (req, res) => {
    const abonner=new Abonner(req.body)
    emailexist=await Abonner.findOne({email:abonner.email}) // bech na3raf biha el email mawjoud mn 9bal wala ya3ni
    if(emailexist) return res.status(404).send({ success: false, message: "personne already exists" })
    try{
        await abonner.save()
        res.status(200).json(abonner);
    }catch(error){
        res.status(400).json({message:error.message});

    }
});






module.exports=router;