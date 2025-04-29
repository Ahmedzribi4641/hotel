const express= require("express")
const router= express.Router()
const nodemailer=require('nodemailer')
const Message= require('../models/messageabonnerenvoyer')
const Information = require('../models/information');
const Abonner = require('../models/abonner');





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


router.post('/', async (req, res) => {
    try{
        const messageDoc=new Message(req.body)
        await messageDoc.save()
        console.log("Saved message document:", messageDoc);
        const sendEmail = async (email, messageContent, imageUrl) => {
            let hotelInfo;
        try {
           hotelInfo = await Information.findOne().sort({ _id: -1 }); // Get the latest document
        } catch (error) {
          console.error('Error fetching hotel information:', error);
        }
 
            const mailOptions = {
                from: ` ${hotelInfo.nom}<zribi4641@gmail.com>`,
                to: email,
                subject: "Des offres spéciale",
                html: `<div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
         <div style="background-color: #1a73e8; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Offres Spéciales</h1>
        </div>

        <div style="padding: 30px;">

        <div style="text-align: center; margin-bottom: 20px;">
            <img src="${imageUrl}" alt="Offer Image" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 0 auto;" />
          </div>
          
          <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            ${messageContent}
          </p>
          
          <div style="text-align: center;">
            <a href=${process.env.CLIENT_URL} style="display: inline-block; background-color: #1a73e8; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 5px; margin-top: 20px;">
              Découvrir les Offres
            </a>
          </div>
        </div>
        
        <div style="background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 14px; color: #666666;">
          <p style="margin: 0;">
            ${hotelInfo.nom} | <a href=${process.env.CLIENT_URL} style="color: #1a73e8; text-decoration: none;">Visitez notre site</a>
          </p>
          <p style="margin: 10px 0 0;">
            Vous recevez cet email car vous êtes abonné à nos offres. 
          </p>
        </div>
      </div>
    </div>`,            
        };
        
            try {
                await transporter.sendMail(mailOptions);
                console.log("E-mail de repondre envoyé !");
            } catch (error) {
                console.error("Erreur lors de l'envoi de l'e-mail:", error);
            }
        };
        const abonners = await Abonner.find({}, null, { sort: { _id: -1 } });
        for (const abonner of abonners) {                           // ma3neha bech tab3ath el message lel les abonner lkol heka 3leh nmapi w nab3ath ya3ni
            await sendEmail(abonner.email, messageDoc.message, messageDoc.image);
          }
          res.status(200).send({success: true,message: "Emails sent successfully",});  

    }catch(error){
        res.status(404).send({ success: false, message: error })
    }
})

module.exports = router;