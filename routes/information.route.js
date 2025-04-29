const express= require("express")
const router= express.Router()
const Information= require('../models/information')

// get les information
router.get('/',async(req,res)=>{
    try{
        const info= await Information.find({},null,{sort:{'_id':-1}})
        res.status(200).json(info)

    }catch(error){
        res.status(404).json({message: error.message})
    }
})

// post les information bech nesta3melha ken awel mara ml back khaw ya3ni mouch bech nest7a9ha w nejem 7ata manesta3mlhech mn hna nwali n3amarhom manuelle ml bara
router.post('/', async (req, res) => {
    const info=new Information(req.body)
    try{
        await info.save()
        res.status(200).json(info);
    }catch(error){
        res.status(400).json({message:error.message});

    }
});

// put les information
router.put('/:id', async (req, res)=> {
    try{
        const info= await Information.findByIdAndUpdate(
            req.params.id,
            {$set:req.body},
            {new:true}

        );

    res.status(200).json(info)    
    }catch(error){
        res.status(400).json({message:error.message});
    }
});




module.exports=router;