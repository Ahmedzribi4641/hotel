const express= require("express")
const router= express.Router()
const Reservation =require("../models/reservation")
const Information = require('../models/information');
const nodemailer=require('nodemailer')


// teba3 el email eli bech nab3thouh fil rservation 
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



// Helper function to normalize dates (set time to 00:00:00.000Z)
const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };


  // Helper function to round to two decimal places
const roundToTwo = (num) => {
    return Number((Math.round(num * 100) / 100).toFixed(2));
};




// ********************************************************************** get all reservations ************************************
router.get('/',async(req,res)=>{
    try{
        const reservation = await Reservation.find({},null,{sort:{'_id':-1}}).populate("clientId").populate("chambres.chambreId").populate("chambres.services.serviceId")
        res.status(200).json(reservation);

    }catch(error){
        res.status(404).json({message: error.message})
    }
});







// ************************************************************************* ajouter une reservation ****************************************
router.post('/', async (req, res) => {
    let hotelInfo;
    const reservation=new Reservation(req.body)

    try{
            // Check for date conflicts
    for (const chambre of reservation.chambres) {
        const { chambreId, dateArrive, dateSortie } = chambre;
        if (!chambreId || !dateArrive || !dateSortie) {
          return res.status(400).json({ message: "Données manquantes : chambreId, dateArrive ou dateSortie requis" });
        }
  
        const startDate = normalizeDate(dateArrive);
        const endDate = normalizeDate(dateSortie);

  
        const existingReservations = await Reservation.find({
          "chambres.chambreId": chambreId,
        });
  
        for (const existingReservation of existingReservations) {
          for (const existingChambre of existingReservation.chambres) {
            if (existingChambre.chambreId.toString() === chambreId.toString()) {
              const existingStart = normalizeDate(existingChambre.dateArrive);
              const existingEnd = normalizeDate(existingChambre.dateSortie);
  
              if (startDate < existingEnd && endDate > existingStart) {
                return res.status(400).json({
                //   message: `Désolé, cette chambre a été réservée il y a quelques secondes, du  ${existingStart.toLocaleDateString("fr-FR")} au ${existingEnd.toLocaleDateString("fr-FR")} Veuillez choisir une autre date pour effectuer votre réservation.`,
             message: `Désolé, une des chambres que vous avez sélectionnées a été réservée il y a quelques secondes. La date choisie n’est donc plus disponible. Veuillez actualiser la page des chambres et effectuer une nouvelle réservation.`,
    
            });
              }
            }
          }
        }
      }
        await reservation.save()
        hotelInfo = await Information.findOne().sort({ _id: -1 }); 
         // ba3then el email dactivation  // kona nejmo ma8ir mana3mlo fonction haka 3adi ya3ni kima el version le9dima fil projet ecommerce zouz kifkif 3adi
         const sendReservationEmail = async (nom, email, reference, reservationDetails) => {
            const roomsHtml = reservationDetails.chambres.map((chambre, index) => `
                <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #e0e0e0;">
                    <h3 style="font-size: 18px; color: #1a3c5e; margin: 0 0 10px 0;">Chambre ${index + 1} (${chambre.chambreId.categorieId.nom})</h3>
                    <p style="margin: 5px 0; color: #333;"><strong>Numéro de la chambre :</strong> ${chambre.chambreId.numero || 'N/A'}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Date d'arrivée :</strong> ${new Date(chambre.dateArrive).toLocaleDateString('fr-FR')} après 12h00</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Date de départ :</strong> ${new Date(chambre.dateSortie).toLocaleDateString('fr-FR')} avant 12h00</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Nombre de nuits :</strong> ${chambre.nombreNuits || 'N/A'}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Nombre d'adultes :</strong> ${chambre.nombreAdulte}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Nombre d'enfants :</strong> ${chambre.nombreEnfant}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Nombre de bébés :</strong> ${chambre.litbebe || 0}</p>
                    ${chambre.services && chambre.services.length > 0 ? `
                        <p style="margin: 5px 0; color: #333;"><strong>Services :</strong></p>
                        <ul style="margin: 5px 0 10px 20px; padding: 0; color: #333;">
                            ${chambre.services.map(service => `
                                <li style="margin-bottom: 5px;">${service.serviceId.nom} => Quantité : ${service.quantite}, Montant : ${roundToTwo(service.montantService)} DT</li>
                            `).join('')}
                        </ul>
                    ` : '<p style="margin: 5px 0; color: #333;"><strong>Services :</strong> Aucun</p>'}
                    <p style="margin: 5px 0; color: #333;"><strong>Coût de la chambre (TTC) :</strong> ${roundToTwo(chambre.montantChambre) } DT</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Coût des services (TTC) :</strong> ${roundToTwo(chambre.montantServicesparchambre) || 0} DT</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Total de la chambre (TTC) :</strong> ${roundToTwo(chambre.totalchambre) } DT</p>
                </div>
            `).join('');

            const mailOptions = {
                from: `${hotelInfo.nom}<${hotelInfo.email}>`,
                to: email,
                subject: `Confirmation de Réservation - ${hotelInfo.nom}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 20px auto; border: 2px solid #d4af37; border-radius: 10px; padding: 25px; background-color: #ffffff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                        <div style="text-align: center; background-color: #1a3c5e; padding: 15px; border-radius: 8px 8px 0 0; border-bottom: 3px solid #d4af37;">
                            <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: bold;">Bon de Réservation</h1>
                            <p style="margin: 5px 0; font-size: 16px; color: #d4af37;">${hotelInfo.nom}</p>
                        </div>
                        <div style="margin-top: 25px;">
                            <h2 style="font-size: 20px; color: #1a3c5e; border-bottom: 2px solid #d4af37; padding-bottom: 8px; margin-bottom: 15px;">Détails de la Réservation</h2>
                            <p style="margin: 8px 0; color: #333;"><strong>ID de réservation :</strong> ${reference}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Nom du client :</strong> ${nom}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Nombre total de chambres :</strong> ${reservationDetails.nombreTotalChambres}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Nombre total d'adultes :</strong> ${reservationDetails.nombreTotalAdulte || 0}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Nombre total d'enfants :</strong> ${reservationDetails.nombreTotalEnfant || 0}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Nombre total de bébés :</strong> ${reservationDetails.nombreTotalbebe || 0}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Coût total des services (HT) :</strong> ${roundToTwo(reservationDetails.montantTotalServices * 0.93) || 0} DT</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Coût total des chambres (HT) :</strong> ${roundToTwo(reservationDetails.montantTotalChambre * 0.93) || 0} DT</p>
                            <p style="margin: 8px 0; color: #333;"><strong>TVA (<strong>7%</strong>) :</strong> ${roundToTwo(parseFloat(reservationDetails.montantTotalReservation || 0) - (((reservationDetails.montantTotalServices || 0) * 0.93) + ((reservationDetails.montantTotalChambre || 0) * 0.93)))} DT</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Montant total de la réservation (TTC) :</strong> ${roundToTwo(reservationDetails.montantTotalReservation)} DT <span style="color: #d32f2f;">(Non remboursable)</span></p>
                            <p style="margin: 8px 0; color: #333;"><strong>Mode de paiement :</strong> ${reservationDetails.modePaiement}</p>
                        </div>
                        <div style="margin-top: 25px;">
                            <h2 style="font-size: 20px; color: #1a3c5e; border-bottom: 2px solid #d4af37; padding-bottom: 8px; margin-bottom: 15px;">Détails des Chambres</h2>
                            ${roomsHtml}
                        </div>
                        <div style="margin-top: 25px;">
                            <h2 style="font-size: 20px; color: #1a3c5e; border-bottom: 2px solid #d4af37; padding-bottom: 8px; margin-bottom: 15px;">Informations sur l'Hôtel</h2>
                            <p style="margin: 8px 0; color: #333;"><strong>Hôtel :</strong> ${hotelInfo.nom}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Adresse :</strong> ${hotelInfo.adresse}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Téléphone :</strong> +216 ${hotelInfo.tel}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Site web :</strong> <a href=${process.env.CLIENT_URL} style="color: #1a3c5e; text-decoration: none;">${process.env.CLIENT_URL}</a></p>
                            <p style="margin: 8px 0; color: #333;"><strong>Email :</strong> <a href=${hotelInfo.email} style="color: #1a3c5e; text-decoration: none;">${hotelInfo.email}</a></p>
                        </div>
                        <div style="margin-top: 25px; font-size: 13px; color: #555; background-color: #f0f4f8; padding: 15px; border-radius: 8px;">
                            <p style="margin: 0 0 10px 0; color: #1a3c5e;">  <strong>Note au client :</strong> Ce bon de réservation doit être présenté à votre arrivée pour accéder à l'hôtel.</p>
                            <p style="margin: 0 0 10px 0; color: #1a3c5e;"><strong>Attention au client :</strong></p>
                            <ul style="margin: 0; padding: 0 0 0 20px;">
                                <li style="margin-bottom: 5px;">Le client doit s'assurer des détails de réservation corrects lors de l'enregistrement.</li>
                                <li style="margin-bottom: 5px;">Le client doit présenter la carte d'identité pour vérification.</li>
                                <li style="margin-bottom: 5px;">Le client n'ayant pas payé en ligne doit compléter le paiement à son arrivée avant d'accéder à la chambre.</li>
                            </ul>
                        </div>
                    </div>
                `
            };
        
            try {
                await transporter.sendMail(mailOptions);
                console.log("E-mail de reservation effectué est envoyé !");
            } catch (error) {
                console.error("Erreur lors de l'envoi de l'e-mail:", error);
            }
        };


        // el star hetha mte3 el populate bech yjib el personne keml 5ater clientId fih ken el id donc mouch bech yefhem .nom donc el populate lezma bech yjib el objet mte3 el id heka keml
        await reservation.populate('clientId')
        await reservation.populate({
        path: 'chambres.chambreId',
        populate: { path: 'categorieId', model: 'Categorie' }
        });
        await reservation.populate({
            path: 'chambres.services.serviceId',
            model: 'Service'
        });
        // hetha el star howa eli bech ya3ml el ba3then
        if (!reservation.clientId.email.includes("@exemple.com")) {
        await sendReservationEmail(reservation.clientId.nom,reservation.clientId.email,reservation.reference, {chambres: reservation.chambres,nombreTotalChambres: reservation.nombreTotalChambres,nombreTotalAdulte: reservation.nombreTotalAdulte,nombreTotalEnfant: reservation.nombreTotalEnfant,nombreTotalbebe: reservation.nombreTotalbebe,montantTotalServices: reservation.montantTotalServices,montantTotalChambre: reservation.montantTotalChambre,montantTotalReservation: reservation.montantTotalReservation,modePaiement: reservation.modePaiement}); // hetha ta5dim el fonction ya3ni w kona nejmo ne5dmouha kima fil formation wkhw ma8ir el star hetha ya3ni // les variable eli bech nab3athhom ya3ni lel fonction bech yet7ato fil email wel nom eli te5ouhom el fonction
    } else {
        console.log("E-mail non Gmail détecté, pas d'envoi.");
        }
        res.status(200).json(reservation);
    }catch(error){
        res.status(400).json({message:error.message});

    }
});


// ************************************************************************ get reservation by id *************************************** 
router.get('/:id',async(req,res)=>{
    try{
        const reservation=await Reservation.findById(req.params.id).populate("clientId").populate("chambres.chambreId").populate("chambres.services.serviceId")
        res.status(200).json(reservation)

    }catch(error){
        res.status(400).json({message:error.message});
    }
})


// *************************************************************************** modifier une reservation by id **************************************
router.put('/:id',async(req,res)=>{
    let hotelInfo;

    try{
        const reservation = await Reservation.findById(req.params.id);
        hotelInfo = await Information.findOne().sort({ _id: -1 }); 

                // Check for date conflicts before updating
        const updatedChambres = req.body.chambres || reservation.chambres;
        for (const chambre of updatedChambres) {
            const { chambreId, dateArrive, dateSortie } = chambre;
            if (!chambreId || !dateArrive || !dateSortie) {
                return res.status(400).json({ message: "Données manquantes : chambreId, dateArrive ou dateSortie requis" });
            }

            const startDate = normalizeDate(dateArrive);
            const endDate = normalizeDate(dateSortie);

            const existingReservations = await Reservation.find({
                _id: { $ne: req.params.id }, // Exclude the current reservation
                "chambres.chambreId": chambreId,
            });

            for (const existingReservation of existingReservations) {
                for (const existingChambre of existingReservation.chambres) {
                    if (existingChambre.chambreId.toString() === chambreId.toString()) {
                        const existingStart = normalizeDate(existingChambre.dateArrive);
                        const existingEnd = normalizeDate(existingChambre.dateSortie);

                        if (startDate < existingEnd && endDate > existingStart) {
                            return res.status(400).json({
                                message: `Désolé, cette modification des dates n'est pas acceptée car la chambre a été réservée il y a quelques secondes. Veuillez choisir d'autres dates et réessayer.`,
                            });
                        }
                    }
                }
            }
        }

        Object.assign(reservation, req.body)
        await reservation.save()  // betbi3a el save hethi lezma bech el middleware yejem ye5dem 9bal el methode put
        // await reservation.populate('clientId');
        // await reservation.populate({
        //     path: 'chambres.services.serviceId',
        //     model: 'Service'
        // })
        // el email eli yeteb3ath ki tsir modification lel reservation  nafso el email mte3 el ajout 7oto ya3ni el (Voucher) juste esmo yetbedel el email ya3ni el (subject)
        const sendReservationEmail = async (nom, email, reference, reservationDetails) => {
            const roomsHtml = reservationDetails.chambres.map((chambre, index) => `
                <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #e0e0e0;">
                    <h3 style="font-size: 18px; color: #1a3c5e; margin: 0 0 10px 0;">Chambre ${index + 1} (${chambre.chambreId.categorieId.nom})</h3>
                    <p style="margin: 5px 0; color: #333;"><strong>Numéro de la chambre :</strong> ${chambre.chambreId.numero || 'N/A'}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Date d'arrivée :</strong> ${new Date(chambre.dateArrive).toLocaleDateString('fr-FR')} après 12h00</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Date de départ :</strong> ${new Date(chambre.dateSortie).toLocaleDateString('fr-FR')} avant 12h00</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Nombre de nuits :</strong> ${chambre.nombreNuits || 'N/A'}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Nombre d'adultes :</strong> ${chambre.nombreAdulte}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Nombre d'enfants :</strong> ${chambre.nombreEnfant}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Nombre de bébés :</strong> ${chambre.litbebe || 0}</p>
                    ${chambre.services && chambre.services.length > 0 ? `
                        <p style="margin: 5px 0; color: #333;"><strong>Services :</strong></p>
                        <ul style="margin: 5px 0 10px 20px; padding: 0; color: #555;">
                            ${chambre.services.map(service => `
                                <li style="margin-bottom: 5px;">${service.serviceId.nom } => Quantité : ${service.quantite}, Montant : ${roundToTwo(service.montantService)} DT</li>
                            `).join('')}
                        </ul>
                    ` : '<p style="margin: 5px 0; color: #333;"><strong>Services :</strong> Aucun</p>'}
                    <p style="margin: 5px 0; color: #333;"><strong>Coût de la chambre (TTC) :</strong> ${roundToTwo(chambre.montantChambre) } DT</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Coût des services (TTC) :</strong> ${roundToTwo(chambre.montantServicesparchambre) || 0} DT</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Total de la chambre (TTC) :</strong> ${roundToTwo(chambre.totalchambre) } DT</p>
                </div>
            `).join('');

            const mailOptions = {
                from: `${hotelInfo.nom}<${hotelInfo.email}>`,
                to: email,
                subject: `Modification de Réservation - ${hotelInfo.nom}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 20px auto; border: 2px solid #d4af37; border-radius: 10px; padding: 25px; background-color: #ffffff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                        <div style="text-align: center; background-color: #1a3c5e; padding: 15px; border-radius: 8px 8px 0 0; border-bottom: 3px solid #d4af37;">
                            <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: bold;">Bon de modification de Réservation</h1>
                            <p style="margin: 5px 0; font-size: 16px; color: #d4af37;">${hotelInfo.nom}</p>
                        </div>
                        <div style="margin-top: 25px;">
                            <h2 style="font-size: 20px; color: #1a3c5e; border-bottom: 2px solid #d4af37; padding-bottom: 8px; margin-bottom: 15px;">Détails de la Réservation</h2>
                            <p style="margin: 8px 0; color: #333;"><strong>ID de réservation :</strong> ${reference}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Nom du client :</strong> ${nom}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Nombre total de chambres :</strong> ${reservationDetails.nombreTotalChambres}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Nombre total d'adultes :</strong> ${reservationDetails.nombreTotalAdulte || 0}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Nombre total d'enfants :</strong> ${reservationDetails.nombreTotalEnfant || 0}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Nombre total de bébés :</strong> ${reservationDetails.nombreTotalbebe || 0}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Coût total des services (HT) :</strong> ${roundToTwo(reservationDetails.montantTotalServices * 0.93) || 0} DT</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Coût total des chambres (HT) :</strong> ${roundToTwo(reservationDetails.montantTotalChambre * 0.93) || 0} DT</p>
                            <p style="margin: 8px 0; color: #333;"><strong>TVA (<strong>7%</strong>) :</strong> ${roundToTwo(parseFloat(reservationDetails.montantTotalReservation || 0) - (((reservationDetails.montantTotalServices || 0) * 0.93) + ((reservationDetails.montantTotalChambre || 0) * 0.93)))} DT</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Montant total de la réservation (TTC) :</strong> ${roundToTwo(reservationDetails.montantTotalReservation)} DT <span style="color: #d32f2f;">(Non remboursable)</span></p>
                            <p style="margin: 8px 0; color: #333;"><strong>Mode de paiement :</strong> ${reservationDetails.modePaiement}</p>
                        </div>
                        <div style="margin-top: 25px;">
                            <h2 style="font-size: 20px; color: #1a3c5e; border-bottom: 2px solid #d4af37; padding-bottom: 8px; margin-bottom: 15px;">Détails des Chambres</h2>
                            ${roomsHtml}
                        </div>
                        <div style="margin-top: 25px;">
                            <h2 style="font-size: 20px; color: #1a3c5e; border-bottom: 2px solid #d4af37; padding-bottom: 8px; margin-bottom: 15px;">Informations sur l'Hôtel</h2>
                            <p style="margin: 8px 0; color: #333;"><strong>Hôtel :</strong> ${hotelInfo.nom}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Adresse :</strong> ${hotelInfo.adresse}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Téléphone :</strong> +216 ${hotelInfo.tel}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Site web :</strong> <a href=${process.env.CLIENT_URL} style="color: #1a3c5e; text-decoration: none;">${process.env.CLIENT_URL}</a></p>
                            <p style="margin: 8px 0; color: #333;"><strong>Email :</strong> <a href=${hotelInfo.email} style="color: #1a3c5e; text-decoration: none;">${hotelInfo.email}</a></p>
                        </div>
                        <div style="margin-top: 25px; font-size: 13px; color: #555; background-color: #f0f4f8; padding: 15px; border-radius: 8px;">
                            <p style="margin: 0 0 10px 0; color: #1a3c5e;">  <strong>Note au client :</strong> Ce bon de modification de réservation doit être présenté à votre arrivée pour accéder à l'hôtel. Il est également requis de présenter le bon correspondant à la réservation initiale, avant modification, pour le traitement comptable du montant à régler.</p>
                            <p style="margin: 0 0 10px 0; color: #1a3c5e;"><strong>Attention au client :</strong></p>
                            <ul style="margin: 0; padding: 0 0 0 20px;">
                                <li style="margin-bottom: 5px;">Le client doit s'assurer des détails de réservation corrects lors de l'enregistrement.</li>
                                <li style="margin-bottom: 5px;">Le client doit présenter la carte d'identité pour vérification.</li>
                                <li style="margin-bottom: 5px;">Le client n'ayant pas payé en ligne doit compléter le paiement à son arrivée avant d'accéder à la chambre.</li>
                            </ul>
                        </div>
                    </div>
                `
            };
        
            try {
                await transporter.sendMail(mailOptions);
                console.log("E-mail de reservation effectué est envoyé !");
            } catch (error) {
                console.error("Erreur lors de l'envoi de l'e-mail:", error);
            }
        };


        // el star hetha mte3 el populate bech yjib el personne keml 5ater clientId fih ken el id donc mouch bech yefhem .nom donc el populate lezma bech yjib el objet mte3 el id heka keml
        await reservation.populate('clientId')
        await reservation.populate({
        path: 'chambres.chambreId',
        populate: { path: 'categorieId', model: 'Categorie' }
        });
        await reservation.populate({
            path: 'chambres.services.serviceId',
            model: 'Service'
        });
        // hetha el star howa eli bech ya3ml el ba3then
        if (!reservation.clientId?.email?.includes('@exemple.com')) {
        await sendReservationEmail(reservation.clientId.nom,reservation.clientId.email,reservation.reference, {chambres: reservation.chambres,nombreTotalChambres: reservation.nombreTotalChambres,nombreTotalAdulte: reservation.nombreTotalAdulte,nombreTotalEnfant: reservation.nombreTotalEnfant,nombreTotalbebe: reservation.nombreTotalbebe,montantTotalServices: reservation.montantTotalServices,montantTotalChambre: reservation.montantTotalChambre,montantTotalReservation: reservation.montantTotalReservation,modePaiement: reservation.modePaiement}); // hetha ta5dim el fonction ya3ni w kona nejmo ne5dmouha kima fil formation wkhw ma8ir el star hetha ya3ni // les variable eli bech nab3athhom ya3ni lel fonction bech yet7ato fil email wel nom eli te5ouhom el fonction
    } else {
        console.log("E-mail non Gmail détecté, pas d'envoi.");
        }
        res.status(200).json(reservation);
    }catch(error){
        res.status(400).json({message:error.message});

    }
});


// *************************************************************************** supprimer une reservation by id **********************************
router.delete('/:id', async (req, res)=> {
    let hotelInfo;
    try{
        hotelInfo = await Information.findOne().sort({ _id: -1 }); 
        const reservation= await Reservation.findById(req.params.id) // hetha teba3 el ba3then mte3 el email bech ne5o el ma3loumet mte3 el reservation 9bal matetfsa5 bech nejem nab3ath email lel sayed eli 3amel el reservation
        await Reservation.findByIdAndDelete(req.params.id); 

        // ba3then el email
        const sendReservationEmail = async (nom, email, reference) => {
            const mailOptions = {
                from: `${hotelInfo.nom}<${hotelInfo.email}>`,
                to: email,
                subject: `Annulation de Réservation - ${hotelInfo.nom}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                        <div style="text-align: center; background-color: #1a3c5e; padding: 15px; border-radius: 8px 8px 0 0; border-bottom: 3px solid #d4af37;">
                            <h1 style="margin: 0; font-size: 24px; color: #ffffff; font-weight: bold;">Annulation de Réservation</h1>
                            <p style="margin: 5px 0; font-size: 14px; color: #d4af37;">${hotelInfo.nom}</p>
                        </div>
                        <div style="margin: 20px 0; padding: 20px; background-color: #ffebee; border: 2px solid #d32f2f; border-radius: 8px; text-align: center;">
                            <h2 style="font-size: 20px; color: #d32f2f; margin: 0 0 10px 0;">${hotelInfo.nom}</h2>
                            <p style="margin: 8px 0; color: #333; font-size: 16px;"><strong>Nom du client :</strong> ${nom}</p>
                            <p style="margin: 8px 0; color: #333; font-size: 16px;"><strong>ID de réservation :</strong> ${reference}</p>
                            <p style="margin: 15px 0 0 0; color: #d32f2f; font-size: 16px; font-weight: bold;">Votre réservation a été annulée avec succès.</p>
                        </div>
                        <div style="text-align: center; margin-top: 20px; font-size: 13px; color: #555;">
                            <p style="margin: 0;">Pour toute question, veuillez nous contacter :</p>
                            <p style="margin: 5px 0;"><strong>Téléphone :</strong> +216 ${hotelInfo.tel} | <strong>Email :</strong> <a href=${hotelInfo.email} style="color: #1a3c5e; text-decoration: none;">${hotelInfo.email}</a></p>
                        </div>
                    </div>
                `
            };
        
            try {
                await transporter.sendMail(mailOptions);
                console.log("E-mail d'annulation du Reservation est envoyer !");
            } catch (error) {
                console.error("Erreur lors de l'envoi de l'e-mail:", error);
            }
        };


        // el star hetha mte3 el populate bech yjib el personne keml 5ater clientId fih ken el id donc mouch bech yefhem .nom donc el populate lezma bech yjib el objet mte3 el id heka keml
        await reservation.populate('clientId')
        // hetha el star howa eli bech ya3ml el ba3then
        if (!reservation.clientId.email.includes("@exemple.com")) {
        await sendReservationEmail(reservation.clientId.nom,reservation.clientId.email,reservation.reference); // hetha ta5dim el fonction ya3ni w kona nejmo ne5dmouha kima fil formation wkhw ma8ir el star hetha ya3ni // les variable eli bech nab3athhom ya3ni lel fonction bech yet7ato fil email wel nom eli te5ouhom el fonction
        } else {
        console.log("E-mail non Gmail détecté, pas d'envoi.");
        }
        res.json({ message: "reservation deleted successfully." });
    }catch{
        res.status(400).json({message:error.message});
    }
});

module.exports=router;