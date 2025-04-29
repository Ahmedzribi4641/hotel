const express= require("express")
const router= express.Router()
const Personne =require("../models/personne")
const Information = require('../models/information');
const jwt=require('jsonwebtoken')
const bcrypt = require('bcrypt')
const nodemailer=require('nodemailer')


// hetha el variable eli na3mlo bih el parametre mte3 el email eli bech yab3ath
var transporter =nodemailer.createTransport({
    service:'gmail',
    host:'smtp.gmail.com',
    port:587,
    secure:false,
    auth:{
    user:'zribi4641@gmail.com',
    pass:'uucv riaf lohq vdzb'
    },
    })

// **********************************************************************get all personne************************************
router.get('/',async(req,res)=>{
    try{
        const personne = await Personne.find({},null,{sort:{'_id':-1}})
        res.status(200).json(personne);

    }catch(error){
        res.status(404).json({message: error.message})
    }
});

// ***********************************************************************get seulement les client*********************************
router.get('/clients',async(req,res)=>{
    try{
        const personne = await Personne.find({clientDetails: { $exists: true }},null,{sort:{'_id':-1}})   // wala ta3mel wa9t el role egale client
        res.status(200).json(personne);

    }catch(error){
        res.status(404).json({message: error.message})
    }
});

// ***********************************************************************get seulement l'admin*********************************
router.get('/staf',async(req,res)=>{
    try{
        const staf = await Personne.find({ role: { $in: ['admin', 'superadmin'] } },null)   // ma8ir sort -1 5ater n7ebo ki yboucli el tableau dima yal9a el super admin howa lawl bech el carte mte3o tji hiya loula fil page
        res.status(200).json(staf);

    }catch(error){
        res.status(404).json({message: error.message})
    }
});

//*************************************************************************get staf admin et superadmin */


// *************************************************************************ajouter un personne********** w yjih email bech yactivi el compte******************************
router.post('/register', async (req, res) => {
    try{
        const newpersonne=new Personne(req.body)
        personneexist=await Personne.findOne({email:newpersonne.email}) // bech na3raf biha el email mawjoud mn 9bal wala ya3ni
        if(personneexist) return res.status(404).send({ success: false, message: "personne already exists" })  // hetha raho aafichage bech yodhhor format json wkhw ya3 success w message ama raho mohem el succes 5ater ba3d nest7a9oulo na3mlo 3lih des condition 7asb el succes ya3ni
        
        await newpersonne.save()


        if (newpersonne.email.includes("@gmail.com")) {  // bech mayab3ath email ken leli fihom @gmail.com ya3ni el clienet el s7a7 bil a7ra mouch eli yzid fihom el admin
        // ba3then el email dactivation  // kona nejmo ma8ir mana3mlo fonction haka 3adi ya3ni kima el version le9dima fil projet ecommerce zouz kifkif 3adi
        const sendVerificationEmail = async (email, nom) => {
            let hotelInfo;
        try {
           hotelInfo = await Information.findOne().sort({ _id: -1 }); // Get the latest document
        } catch (error) {
          console.error('Error fetching hotel information:', error);
        }
            const mailOptions = {
                from: `"Activer Votre Compte" <zribi4641@gmail.com>`,
                to: email,
                subject: "Vérifiez votre adresse e-mail pour activer votre compte",
                html: ` <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <div style="text-align: center; padding: 20px 0;">
                <h1 style="color: #1a73e8; margin: 0;">${hotelInfo.nom}</h1>
                <p style="color: #666; font-size: 16px;">Bienvenue dans notre communauté !</p>
              </div>
              <div style="padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                <h2 style="color: #333; font-size: 24px;">Bonjour ${nom},</h2>
                <p style="color: #333; font-size: 16px; line-height: 1.5;">
                  Merci de vous être inscrit chez ${hotelInfo.nom} ! Pour activer votre compte et commencer à réserver, veuillez vérifier votre adresse e-mail en cliquant sur le bouton ci-dessous :
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="http://${req.headers.host}/api/personnes/status/edit?email=${email}" style="display: inline-block; padding: 12px 24px; background-color: #1a73e8; color: #fff; text-decoration: none; font-size: 16px; border-radius: 5px; font-weight: bold;">
                    Activer mon compte
                  </a>
                </div>
              </div>
              <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0; margin-top: 20px;">
                <p style="color: #666; font-size: 14px; margin: 0;">
                  Besoin d'aide ? Contactez-nous à <a href="${hotelInfo.email}" style="color: #1a73e8; text-decoration: none;">${hotelInfo.email}</a>
                </p>
                <p style="color: #666; font-size: 14px; margin: 5px 0;">
                  ${hotelInfo.nom}, ${hotelInfo.adresse}
                </p>
              </div>
            </div>`,
            };
        
            try {
                await transporter.sendMail(mailOptions);
                console.log("E-mail de vérification envoyé !");
            } catch (error) {
                console.error("Erreur lors de l'envoi de l'e-mail:", error);
            }
        };

        // hetha el star howa eli bech ya3ml el ba3then
        await sendVerificationEmail(newpersonne.email, newpersonne.nom); // hetha ta5dim el fonction ya3ni w kona nejmo ne5dmouha kima fil formation wkhw ma8ir el star hetha ya3ni // les variable eli bech nab3athhom ya3ni lel fonction bech yet7ato fil email wel nom eli te5ouhom el fonction

       } else {
        console.log("E-mail non Gmail détecté, pas d'envoi.");
        }

       
    return res.status(201).send({ success: true, message: "Account created successfully", personne: newpersonne })

    }catch(error){
        res.status(404).send({ success: false, message: error })
    }
})


// *************************************************************************login un personne****************************************

// bech yet3ada b 3 verification el email mawjoud wala ya3ni 3amel register 9bal // wel password nhashiwah w narawah y9abel eli sajel bih wala // wel compte active wala 5ater lezmo yactivih ki ysajel bech na3raf elli howa ensen bel7a9 => bech fil lo5r nesna3lo token
router.post('/login', async (req, res) => {
    try {
    let { email, password } = req.body
    
    if (!email || !password) {  // hethi betbi3a nejem ena7iha 5ater cbon fil front 7atithom required ya3ni matsir el login ken mayebdew houma m3amrin ama oka 7othom bech chyn mayod5ol ba33tho w ken chkoun jbedli 3liha n9olo bdit bil back fil code heka 3leh 7atithom bech ntestiw bihom fil thunder ya3ni
    return res.status(404).send({ success: false, message: "All fields are required" }) // hethi tejem tna7iha 5ater deja bech na3mlo el verification mte3 les champ vide fil front ya32ni mosta7il yeteb3ath vide
    }
    
    let personne = await Personne.findOne({ email})
    
    if (!personne) { // ya3ni itha masajelch 9bal
    
    return res.status(404).send({ success: false, message: "Account doesn't exists" })
    
    } else { // ma3neha itha el email msajel 9bal ya3ni cbon mawjoud bech net3ada nara el password eli da5lo howa bidou eli msajel bih el email hetah wala 
    
    let isCorrectPassword = await bcrypt.compare(password, personne.password) // hethi el methode thachi el parametre lawl eli howa el password eli ketbo taw el client fil login w ta3ml zeda el comparaison w7adha w traja3l true wala false ya3ni
    if (isCorrectPassword) { // ma3neha itha true cbon el password zeda s7i7
    
    delete personne._doc.password // hethi 7keya teb3a el securité wala chno (9al tejmo tna7iwha ama 7otha mat9ala9ch)

    if (!personne.isActive) return res.status(404).send({ success:false, message: "Your account is inactive" })
    
    const token = jwt.sign ({ personneid:personne._id,nom:personne.nom, role: personne.role, prenom:personne.prenom, email:personne.email }, process.env.SECRET, {expiresIn: "1h", }) // el methode hethi tesna3li el token (yetkawen mn des attribut / secret teb3a el securite / w date eli youfa fiha)
    
    return res.status(200).send({ success: true, personne, token })
    
    } else {
     return res.status(404).send({ success: false, message:"Please verify your password" }) // ya3ni el passe word 8alet hethi lel password ya3ni
    }}
    
    } catch (err) {
    return res.status(404).send({ success: false, message: err.message})
    }

    });


// *************************************************************************edit isActive********************************************
router.get('/status/edit/',async(req,res)=>{
    try{
        email=req.query.email
        const personne=await Personne.findOne({email}) // ki ta3tih el email haka howa ya3raf mouch lezem tekteblo email:email  howa ya3raf ye5o el contenue wa7do w ylawej 3lih w tejem tekteblo zeda 3adi ken t7eb
        personne.isActive=true
        await personne.save() // hethi bech t3awed tetsajel ya3ni el active tetbadel w kima 9olna el .save itha el objet mawjoud melawl twali juste tbadel fih ya3ni matzidekch we7d e5r wala najem 7ata fi 3oudh hetha na3ml findbyidandupdate kifkif      // hethi makenetch bil await ena zedtha hna
        const frontendUrl = process.env.CLIENT_URL;
        res.redirect(`${frontendUrl}activation`);
        // res.status(200).send({ success: true, personne })
    }catch(error){
        res.status(404).send({ success: false, message: error })
    }
})


// ************************************************************************get personne by id*************************************** 
router.get('/:id',async(req,res)=>{
    try{
        const personne=await Personne.findById(req.params.id)
        res.status(200).json(personne)

    }catch(error){
        res.status(400).json({message:error.message});
    }
})

// *************************************************************************modifier une personne******************************************

router.put('/:id',async(req,res)=>{
    try{
        const personne = await Personne.findById(req.params.id);
        
        Object.assign(personne, req.body);                // behi hethi object.assign esta3melneha  5ater manejmouch na3mlo haka direct  (chambre=req.body)   donc el methode heki hiya eli tbadlelna objet b objet    wa7na fil put walina ne5dmo haka bil finbyid mouch bil findbyidandupdate bech ba3d nejmo na3mlo el .save bech el middleware ya9raha 5ater el findbyidandupdate mafihech . save donc ywali wa9tha el middle ware maye5demch heka 3leh lezem ne5dmo haka fil put mouch kima fil put mte3 el categorie mithel 5ater ma3andnech middle ware ya3ni 3adi 7ata ki mane5demch bil .save 
        await personne.save()
        res.status(200).json(personne)

    }catch(error){
        res.status(400).json({message:error.message})
    }
})



// *******************************  hethi temchi mrigla ama ena badeltha kima lo5rin 5ater lo5ra fehemha akthar ********************************************modifier une personne**************************************
// router.put('/:id', async (req, res)=> {
//     try {
//         const personne = await Personne.findById(req.params.id);
//         // hethi bech itha mithel 3tito ken deatilclient khaw ybadlo mrigl
//         if (req.body.clientDetails) {
//             Object.assign(personne.clientDetails, req.body.clientDetails);
//             delete req.body.clientDetails; // Pour éviter qu'il écrase l'objet complet     //  mohem 5ater ma8irou howa ywali ki mithel fil req.body ki mat3awedch tab3athlo el clientdetail yefsa5 el objet clientdetail keml ywali donc el star hetha lezem bech matsirech mochkla  // ya3ni hethi el delet bech yefsa5 el 9dim bech matsirech 7aja fou9 7aja ya3ni ywali maye9belhech donc t9oul 3lina fsa5nehom w bech n3awdo n7otouhom w homa deja 3andna ya3ni matfas5ouch jomla ba3d ki bech na3mlo ...personne ma3neha bech n3awdo nraj3ouhom houma weli fil body el jdid ya3ni el fazet eli n7ebhom yetbadlo
//         }
//         // Mise à jour des champs avec req.body
//         Object.assign(personne, req.body);  // hethi methode bech te5o eli fil req.body w ta3mel el misajour m3a el document 7asb fil req.body chmawjoud ya3ni

//         // Forcer la sauvegarde pour déclencher le `pre('save')`   ya3ni bech n5admo el save hna 5ater 3andha 3ale9a bil middleware ken na3ml kil lo5rin bil findbyidandupdate twali mafamech save donc el middleware mate5demch twali
//         await personne.save();

//         res.status(200).json(personne);   
//     }catch(error){
//         res.status(400).json({message:error.message});
//     }
// });


// ***************************************************************************Supprimer une personne**********************************
router.delete('/:id', async (req, res)=> {
    try{
        await Personne.findByIdAndDelete(req.params.id); 
        res.json({ message: "personne deleted successfully." });

    }catch{
        res.status(400).json({message:error.message});
    }
});



module.exports=router;