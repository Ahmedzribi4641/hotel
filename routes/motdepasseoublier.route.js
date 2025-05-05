const express= require("express")
const router= express.Router()
const nodemailer=require('nodemailer')
const Motdepasseoublier= require('../models/motdepasseoublier')
const Information = require('../models/information');
const Personne = require('../models/personne');






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
    try {
        const mdpoublier = new Motdepasseoublier(req.body);
        await mdpoublier.save();
    
        const sendEmail = async (emailcl) => {
            let hotelInfo;
            let personne;
            try {
                hotelInfo = await Information.findOne().sort({ _id: -1 });
                personne = await Personne.findOne({ email: emailcl });
                console.log('Copie du mot de passe:', personne.copiepassword);
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
            }
    
            const mailOptions = {
                from: `${hotelInfo.nom} <zribi4641@gmail.com>`,
                to: emailcl, 
                subject: 'Votre mot de passe',
                html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
                        <h2 style="color: #333333; font-size: 24px; margin-bottom: 20px;">${hotelInfo.nom}</h2>
                        <div style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: inline-block;">
                            <p style="color: #333333; font-size: 16px; margin: 0;">
                                Votre mot de passe est : 
                                <span style="color: #6b46c1; font-weight: bold;">${personne.copiepassword}</span>
                            </p>
                            <div style="text-align: center; margin: 30px 0;">
                       <a href="${process.env.CLIENT_URL}/login" style="display: inline-block; padding: 12px 24px; background-color:rgb(6, 245, 38); color: #fff; text-decoration: none; font-size: 16px; border-radius: 5px; font-weight: bold;">
                         Se Connecter
                       </a>
                       </div>
                        </div>
                        <p style="color: #666666; font-size: 14px; margin-top: 20px;">
                            Tu peux te connecter avec votre mot de passe.
                        </p>
                    </div>`,
            };

            try {
            await transporter.sendMail(mailOptions);
            console.log('E-mail de réinitialisation envoyé !');
            } catch (error) {
                    console.error('Erreur lors de l’envoi de l’email:', error);
            }
        };

        // Vérifier si la personne existe avant d'appeler sendEmail
        const personne = await Personne.findOne({ email: mdpoublier.email });
        if (!personne) {
            return res.status(404).send({ success: false, message: 'Aucune personne trouvée avec cet email' }); // bech itha mouch mawjoud mayab3ath el email
        }

        await sendEmail(mdpoublier.email);

        res.status(200).send({ success: true, message: 'E-mail envoyé avec succès', mdpoublier });
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});
    

module.exports = router;