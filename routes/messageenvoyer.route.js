const express= require("express")
const router= express.Router()
const nodemailer=require('nodemailer')
const Message= require('../models/messageenvoyer')
const Information = require('../models/information');




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
        const mesage=new Message(req.body)
        await mesage.save()

        const sendEmail = async (email, nom, message) => {
            let hotelInfo;
        try {
           hotelInfo = await Information.findOne().sort({ _id: -1 }); // Get the latest document
        } catch (error) {
          console.error('Error fetching hotel information:', error);
        }
            const mailOptions = {
                from: ` ${hotelInfo.nom}<zribi4641@gmail.com>`,
                to: email,
                subject: "Repondre a votre message",
                html: `${message}`,
            };
        
            try {
                await transporter.sendMail(mailOptions);
                console.log("E-mail de repondre envoyé !");
            } catch (error) {
                console.error("Erreur lors de l'envoi de l'e-mail:", error);
            }
        };

        // hetha el star howa eli bech ya3ml el ba3then
        await sendEmail(mesage.email, mesage.nom, mesage.message); // hetha ta5dim el fonction ya3ni w kona nejmo ne5dmouha kima fil formation wkhw ma8ir el star hetha ya3ni // les variable eli bech nab3athhom ya3ni lel fonction bech yet7ato fil email wel nom eli te5ouhom el fonction


    }catch(error){
        res.status(404).send({ success: false, message: error })
    }
})

module.exports = router;