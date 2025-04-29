const express= require("express")
const router= express.Router()
const Message= require('../models/messageclient')

// get les Message
router.get('/',async(req,res)=>{
    try{
        const mesg= await Message.find({},null,{sort:{'_id':-1}})
        res.status(200).json(mesg)

    }catch(error){
        res.status(404).json({message: error.message})
    }
})

// post les information bech nesta3melha ken awel mara ml back khaw ya3ni mouch bech nest7a9ha w nejem 7ata manesta3mlhech mn hna nwali n3amarhom manuelle ml bara
router.post('/', async (req, res) => {
    const mesg=new Message(req.body)
    try{
        await mesg.save()
        res.status(200).json(mesg);
    }catch(error){
        res.status(400).json({message:error.message});

    }
});

// put les information
router.put('/:id', async (req, res)=> {
    try{
        const mesg= await Message.findByIdAndUpdate(
            req.params.id,
            {$set:req.body},
            {new:true}

        );

    res.status(200).json(mesg)    
    }catch(error){
        res.status(400).json({message:error.message});
    }
});

router.delete('/:id', async (req, res)=> {
    try{
        await Message.findByIdAndDelete(req.params.id); 
        res.json({ message: "messageclient deleted successfully." });

    }catch{
        res.status(400).json({message:error.message});
    }
});




module.exports=router;