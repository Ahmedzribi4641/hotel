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
        await reservation.save()
        hotelInfo = await Information.findOne().sort({ _id: -1 }); 
         // ba3then el email dactivation  // kona nejmo ma8ir mana3mlo fonction haka 3adi ya3ni kima el version le9dima fil projet ecommerce zouz kifkif 3adi
         const sendReservationEmail = async (nom, email, reference, reservationDetails) => {
            const roomsHtml = reservationDetails.chambres.map((chambre, index) => `
                <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #e0e0e0;">
                    <h3 style="font-size: 18px; color: #1a3c5e; margin: 0 0 10px 0;">Chambre ${index + 1}</h3>
                    <p style="margin: 5px 0; color: #333;"><strong>Date d'arrivée :</strong> ${new Date(chambre.dateArrive).toLocaleDateString('fr-FR')} après 12h00</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Date de départ :</strong> ${new Date(chambre.dateSortie).toLocaleDateString('fr-FR')} avant 12h00</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Nombre de nuits :</strong> ${chambre.nombreNuits || 'N/A'}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Nombre d'adultes :</strong> ${chambre.nombreAdulte}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Nombre d'enfants :</strong> ${chambre.nombreEnfant}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Lit bébé :</strong> ${chambre.litbebe || 0}</p>
                    ${chambre.services && chambre.services.length > 0 ? `
                        <p style="margin: 5px 0; color: #333;"><strong>Services :</strong></p>
                        <ul style="margin: 5px 0 10px 20px; padding: 0; color: #555;">
                            ${chambre.services.map(service => `
                                <li style="margin-bottom: 5px;">${service.serviceId.nom} => Quantité : ${service.quantite}, Montant : ${service.montantService} DT</li>
                            `).join('')}
                        </ul>
                    ` : '<p style="margin: 5px 0; color: #333;"><strong>Services :</strong> Aucun</p>'}
                    <p style="margin: 5px 0; color: #333;"><strong>Coût de la chambre :</strong> ${chambre.montantChambre } DT</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Coût des services :</strong> ${chambre.montantServicesparchambre || 0} DT</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Total de la chambre :</strong> ${chambre.totalchambre } DT</p>
                </div>
            `).join('');

            const mailOptions = {
                from: `"Votre Réservation"`,
                to: email,
                subject: `Confirmation de Réservation - ${hotelInfo.nom}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 20px auto; border: 2px solid #d4af37; border-radius: 10px; padding: 25px; background-color: #ffffff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                        <div style="text-align: center; background-color: #1a3c5e; padding: 15px; border-radius: 8px 8px 0 0; border-bottom: 3px solid #d4af37;">
                            <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: bold;">Bon de Réservation d'Hôtel</h1>
                            <p style="margin: 5px 0; font-size: 16px; color: #d4af37;">${hotelInfo.nom}</p>
                        </div>
                        <div style="margin-top: 25px;">
                            <h2 style="font-size: 20px; color: #1a3c5e; border-bottom: 2px solid #d4af37; padding-bottom: 8px; margin-bottom: 15px;">Détails de la Réservation</h2>
                            <p style="margin: 8px 0; color: #333;"><strong>ID de réservation :</strong> ${reference}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Nom du client :</strong> ${nom}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Nombre total de chambres :</strong> ${reservationDetails.nombreTotalChambres}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Nombre total d'adultes :</strong> ${reservationDetails.nombreTotalAdulte || 0}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Nombre total d'enfants :</strong> ${reservationDetails.nombreTotalEnfant || 0}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Coût total des services :</strong> ${reservationDetails.montantTotalServices || 0} DT</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Coût total des chambres :</strong> ${reservationDetails.montantTotalChambre || 0} DT</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Montant total de la réservation :</strong> ${reservationDetails.montantTotalReservation} DT <span style="color: #d32f2f;">(Non remboursable)</span></p>
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
            path: 'chambres.services.serviceId',
            model: 'Service'
        });
        // hetha el star howa eli bech ya3ml el ba3then
        if (reservation.clientId.email.includes("@gmail.com")) {
        await sendReservationEmail(reservation.clientId.nom,reservation.clientId.email,reservation.reference, {chambres: reservation.chambres,nombreTotalChambres: reservation.nombreTotalChambres,nombreTotalAdulte: reservation.nombreTotalAdulte,nombreTotalEnfant: reservation.nombreTotalEnfant,montantTotalServices: reservation.montantTotalServices,montantTotalChambre: reservation.montantTotalChambre,montantTotalReservation: reservation.montantTotalReservation,modePaiement: reservation.modePaiement}); // hetha ta5dim el fonction ya3ni w kona nejmo ne5dmouha kima fil formation wkhw ma8ir el star hetha ya3ni // les variable eli bech nab3athhom ya3ni lel fonction bech yet7ato fil email wel nom eli te5ouhom el fonction
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
                    <h3 style="font-size: 18px; color: #1a3c5e; margin: 0 0 10px 0;">Chambre ${index + 1}</h3>
                    <p style="margin: 5px 0; color: #333;"><strong>Date d'arrivée :</strong> ${new Date(chambre.dateArrive).toLocaleDateString('fr-FR')} après 12h00</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Date de départ :</strong> ${new Date(chambre.dateSortie).toLocaleDateString('fr-FR')} avant 12h00</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Nombre de nuits :</strong> ${chambre.nombreNuits || 'N/A'}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Nombre d'adultes :</strong> ${chambre.nombreAdulte}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Nombre d'enfants :</strong> ${chambre.nombreEnfant}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Lit bébé :</strong> ${chambre.litbebe || 0}</p>
                    ${chambre.services && chambre.services.length > 0 ? `
                        <p style="margin: 5px 0; color: #333;"><strong>Services :</strong></p>
                        <ul style="margin: 5px 0 10px 20px; padding: 0; color: #555;">
                            ${chambre.services.map(service => `
                                <li style="margin-bottom: 5px;">${service.serviceId.nom } => Quantité : ${service.quantite}, Montant : ${service.montantService} DT</li>
                            `).join('')}
                        </ul>
                    ` : '<p style="margin: 5px 0; color: #333;"><strong>Services :</strong> Aucun</p>'}
                    <p style="margin: 5px 0; color: #333;"><strong>Coût de la chambre :</strong> ${chambre.montantChambre } DT</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Coût des services :</strong> ${chambre.montantServicesparchambre || 0} DT</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Total de la chambre :</strong> ${chambre.totalchambre } DT</p>
                </div>
            `).join('');

            const mailOptions = {
                from: `"Votre Réservation"`,
                to: email,
                subject: `Modifier Réservation - ${hotelInfo.nom}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 20px auto; border: 2px solid #d4af37; border-radius: 10px; padding: 25px; background-color: #ffffff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                        <div style="text-align: center; background-color: #1a3c5e; padding: 15px; border-radius: 8px 8px 0 0; border-bottom: 3px solid #d4af37;">
                            <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: bold;">Bon de Réservation d'Hôtel (Modifier)</h1>
                            <p style="margin: 5px 0; font-size: 16px; color: #d4af37;">${hotelInfo.nom}</p>
                        </div>
                        <div style="margin-top: 25px;">
                            <h2 style="font-size: 20px; color: #1a3c5e; border-bottom: 2px solid #d4af37; padding-bottom: 8px; margin-bottom: 15px;">Détails de la Réservation</h2>
                            <p style="margin: 8px 0; color: #333;"><strong>ID de réservation :</strong> ${reference}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Nom du client :</strong> ${nom}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Nombre total de chambres :</strong> ${reservationDetails.nombreTotalChambres}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Nombre total d'adultes :</strong> ${reservationDetails.nombreTotalAdulte || 0}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Nombre total d'enfants :</strong> ${reservationDetails.nombreTotalEnfant || 0}</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Coût total des services :</strong> ${reservationDetails.montantTotalServices || 0} DT</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Coût total des chambres :</strong> ${reservationDetails.montantTotalChambre || 0} DT</p>
                            <p style="margin: 8px 0; color: #333;"><strong>Montant total de la réservation :</strong> ${reservationDetails.montantTotalReservation} DT <span style="color: #d32f2f;">(Non remboursable)</span></p>
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
            path: 'chambres.services.serviceId',
            model: 'Service'
        });
        // hetha el star howa eli bech ya3ml el ba3then
        if (reservation.clientId?.email?.includes('@gmail.com')) {
        await sendReservationEmail(reservation.clientId.nom,reservation.clientId.email,reservation.reference, {chambres: reservation.chambres,nombreTotalChambres: reservation.nombreTotalChambres,nombreTotalAdulte: reservation.nombreTotalAdulte,nombreTotalEnfant: reservation.nombreTotalEnfant,montantTotalServices: reservation.montantTotalServices,montantTotalChambre: reservation.montantTotalChambre,montantTotalReservation: reservation.montantTotalReservation,modePaiement: reservation.modePaiement}); // hetha ta5dim el fonction ya3ni w kona nejmo ne5dmouha kima fil formation wkhw ma8ir el star hetha ya3ni // les variable eli bech nab3athhom ya3ni lel fonction bech yet7ato fil email wel nom eli te5ouhom el fonction
    } else {
        console.log("E-mail non Gmail détecté, pas d'envoi.");
        }
        res.status(200).json(reservation);
    }catch(error){
        res.status(400).json({message:error.message});

    }
});

// router.put('/:id', async (req, res) => {
//     let hotelInfo;

//     try {
//         // Log incoming request body
//         console.log('req.body:', JSON.stringify(req.body, null, 2));

//         // Fetch the existing reservation
//         const reservation = await Reservation.findById(req.params.id);
//         if (!reservation) {
//             return res.status(404).json({ message: 'Reservation not found' });
//         }

//         // Fetch hotel info
//         hotelInfo = await Information.findOne().sort({ _id: -1 });
//         if (!hotelInfo) {
//             return res.status(500).json({ message: 'Hotel information not found' });
//         }

//         // Log reservation before update
//         console.log('Reservation before update:', JSON.stringify(reservation.toObject(), null, 2));

//         // Update reservation with req.body
//         Object.assign(reservation, req.body);

//         // Log reservation after Object.assign
//         console.log('Reservation after Object.assign:', JSON.stringify(reservation.toObject(), null, 2));

//         // Save to trigger middleware
//         await reservation.save();

//         // Log reservation after save
//         console.log('Reservation after save:', JSON.stringify(reservation.toObject(), null, 2));

//         // Populate clientId and services
//         await reservation.populate('clientId');
//         await reservation.populate({
//             path: 'chambres.services.serviceId',
//             model: 'Service'
//         });

//         // Log populated services
//         console.log('Populated services:', JSON.stringify(reservation.chambres.map(ch => ch.services), null, 2));

//         // Email sending function
//         const sendReservationEmail = async (nom, email, reference, reservationDetails) => {
//             try {
//                 // Log reservationDetails
//                 console.log('reservationDetails:', JSON.stringify(reservationDetails, null, 2));

//                 const roomsHtml = reservationDetails.chambres.map((chambre, index) => {
//                     console.log(`Processing chambre ${index + 1}:`, JSON.stringify(chambre, null, 2));
//                     return `
//                         <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #e0e0e0;">
//                             <h3 style="font-size: 18px; color: #1a3c5e; margin: 0 0 10px 0;">Chambre ${index + 1}</h3>
//                             <p style="margin: 5px 0; color: #333;"><strong>Date d'arrivée :</strong> ${
//                                 chambre.dateArrive
//                                     ? new Date(chambre.dateArrive).toLocaleDateString('fr-FR')
//                                     : 'N/A'
//                             } après 12h00</p>
//                             <p style="margin: 5px 0; color: #333;"><strong>Date de départ :</strong> ${
//                                 chambre.dateSortie
//                                     ? new Date(chambre.dateSortie).toLocaleDateString('fr-FR')
//                                     : 'N/A'
//                             } avant 12h00</p>
//                             <p style="margin: 5px 0; color: #333;"><strong>Nombre de nuits :</strong> ${
//                                 chambre.nombreNuits || 'N/A'
//                             }</p>
//                             <p style="margin: 5px 0; color: #333;"><strong>Nombre d'adultes :</strong> ${
//                                 chambre.nombreAdulte || 0
//                             }</p>
//                             <p style="margin: 5px 0; color: #333;"><strong>Nombre d'enfants :</strong> ${
//                                 chambre.nombreEnfant || 0
//                             }</p>
//                             <p style="margin: 5px 0; color: #333;"><strong>Lit bébé :</strong> ${
//                                 chambre.litbebe || 0
//                             }</p>
//                             ${
//                                 chambre.services && chambre.services.length > 0
//                                     ? `
//                                         <p style="margin: 5px 0; color: #333;"><strong>Services :</strong></p>
//                                         <ul style="margin: 5px 0 10px 20px; padding: 0; color: #555;">
//                                             ${chambre.services
//                                                 .map((service) => {
//                                                     console.log(
//                                                         `Processing service:`,
//                                                         JSON.stringify(service, null, 2)
//                                                     );
//                                                     return `
//                                                         <li style="margin-bottom: 5px;">${
//                                                             service.serviceId?.nom ||
//                                                             service.nom ||
//                                                             'Unknown Service'
//                                                         } => Quantité : ${
//                                                             service.quantite || 1
//                                                         }, Montant : ${
//                                                             service.montantService || 0
//                                                         } DT</li>
//                                                     `;
//                                                 })
//                                                 .join('')}
//                                         </ul>
//                                     `
//                                     : '<p style="margin: 5px 0; color: #333;"><strong>Services :</strong> Aucun</p>'
//                             }
//                             <p style="margin: 5px 0; color: #333;"><strong>Coût de la chambre :</strong> ${
//                                 chambre.montantChambre || chambre.totalchambre || 0
//                             } DT</p>
//                             <p style="margin: 5px 0; color: #333;"><strong>Coût des services :</strong> ${
//                                 chambre.montantServicesparchambre || 0
//                             } DT</p>
//                             <p style="margin: 5px 0; color: #333;"><strong>Total de la chambre :</strong> ${
//                                 chambre.totalchambre || 0
//                             } DT</p>
//                         </div>
//                     `;
//                 }).join('');

//                 const mailOptions = {
//                     from: `"Votre Réservation" <zribi4641@gmail.com>`,
//                     to: email,
//                     subject: `Modifier Réservation - ${hotelInfo.nom}`, // Fixed subject
//                     html: `
//                         <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 20px auto; border: 2px solid #d4af37; border-radius: 10px; padding: 25px; background-color: #ffffff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
//                             <div style="text-align: center; background-color: #1a3c5e; padding: 15px; border-radius: 8px 8px 0 0; border-bottom: 3px solid #d4af37;">
//                                 <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: bold;">Bon de Réservation d'Hôtel</h1>
//                                 <p style="margin: 5px 0; font-size: 16px; color: #d4af37;">${
//                                     hotelInfo.nom || 'N/A'
//                                 }</p>
//                             </div>
//                             <div style="margin-top: 25px;">
//                                 <h2 style="font-size: 20px; color: #1a3c5e; border-bottom: 2px solid #d4af37; padding-bottom: 8px; margin-bottom: 15px;">Détails de la Réservation</h2>
//                                 <p style="margin: 8px 0; color: #333;"><strong>ID de réservation :</strong> ${
//                                     reference || 'N/A'
//                                 }</p>
//                                 <p style="margin: 8px 0; color: #333;"><strong>Nom du client :</strong> ${
//                                     nom || 'N/A'
//                                 }</p>
//                                 <p style="margin: 8px 0; color: #333;"><strong>Nombre total de chambres :</strong> ${
//                                     reservationDetails.nombreTotalChambres || 0
//                                 }</p>
//                                 <p style="margin: 8px 0; color: #333;"><strong>Nombre total d'adultes :</strong> ${
//                                     reservationDetails.nombreTotalAdulte || 0
//                                 }</p>
//                                 <p style="margin: 8px 0; color: #333;"><strong>Nombre total d'enfants :</strong> ${
//                                     reservationDetails.nombreTotalEnfant || 0
//                                 }</p>
//                                 <p style="margin: 8px 0; color: #333;"><strong>Coût total des services :</strong> ${
//                                     reservationDetails.montantTotalServices || 0
//                                 } DT</p>
//                                 <p style="margin: 8px 0; color: #333;"><strong>Coût total des chambres :</strong> ${
//                                     reservationDetails.montantTotalChambre || 0
//                                 } DT</p>
//                                 <p style="margin: 8px 0; color: #333;"><strong>Montant total de la réservation :</strong> ${
//                                     reservationDetails.montantTotalReservation || 0
//                                 } DT <span style="color: #d32f2f;">(Non remboursable)</span></p>
//                                 <p style="margin: 8px 0; color: #333;"><strong>Mode de paiement :</strong> ${
//                                     reservationDetails.modePaiement || 'N/A'
//                                 }</p>
//                             </div>
//                             <div style="margin-top: 25px;">
//                                 <h2 style="font-size: 20px; color: #1a3c5e; border-bottom: 2px solid #d4af37; padding-bottom: 8px; margin-bottom: 15px;">Détails des Chambres</h2>
//                                 ${roomsHtml}
//                             </div>
//                             <div style="margin-top: 25px;">
//                                 <h2 style="font-size: 20px; color: #1a3c5e; border-bottom: 2px solid #d4af37; padding-bottom: 8px; margin-bottom: 15px;">Informations sur l'Hôtel</h2>
//                                 <p style="margin: 8px 0; color: #333;"><strong>Hôtel :</strong> ${
//                                     hotelInfo.nom || 'N/A'
//                                 }</p>
//                                 <p style="margin: 8px 0; color: #333;"><strong>Adresse :</strong> ${
//                                     hotelInfo.adresse || 'N/A'
//                                 }</p>
//                                 <p style="margin: 8px 0; color: #333;"><strong>Téléphone :</strong> +216 ${
//                                     hotelInfo.tel || 'N/A'
//                                 }</p>
//                                 <p style="margin: 8px 0; color: #333;"><strong>Site web :</strong> <a href="${
//                                     process.env.CLIENT_URL || '#'
//                                 }" style="color: #1a3c5e; text-decoration: none;">${
//                                     process.env.CLIENT_URL || 'N/A'
//                                 }</a></p>
//                                 <p style="margin: 8px 0; color: #333;"><strong>Email :</strong> <a href="mailto:${
//                                     hotelInfo.email || ''
//                                 }" style="color: #1a3c5e; text-decoration: none;">${
//                                     hotelInfo.email || 'N/A'
//                                 }</a></p>
//                             </div>
//                             <div style="margin-top: 25px; font-size: 13px; color: #555; background-color: #f0f4f8; padding: 15px; border-radius: 8px;">
//                                 <p style="margin: 0 0 10px 0; color: #1a3c5e;"><strong>Note au client :</strong> Ce bon de réservation doit être présenté à votre arrivée pour accéder à l'hôtel.</p>
//                                 <p style="margin: 0 0 10px 0; color: #1a3c5e;"><strong>Attention au client :</strong></p>
//                                 <ul style="margin: 0; padding: 0 0 0 20px;">
//                                     <li style="margin-bottom: 5px;">Le client doit s'assurer des détails de réservation corrects lors de l'enregistrement.</li>
//                                     <li style="margin-bottom: 5px;">Le client doit présenter la carte d'identité pour vérification.</li>
//                                     <li style="margin-bottom: 5px;">Le client n'ayant pas payé en ligne doit compléter le paiement à son arrivée avant d'accéder à la chambre.</li>
//                                 </ul>
//                             </div>
//                         </div>
//                     `
//                 };

//                 await transporter.sendMail(mailOptions);
//                 console.log('E-mail de modification de réservation envoyé !');
//             } catch (error) {
//                 console.error('Erreur lors de l\'envoi de l\'e-mail:', error.message, error.stack);
//                 throw error; // Rethrow to catch in outer try-catch
//             }
//         };

//         // Send email if Gmail
//         if (reservation.clientId?.email?.includes('@gmail.com')) {
//             await sendReservationEmail(
//                 reservation.clientId.nom || 'N/A',
//                 reservation.clientId.email,
//                 reservation.reference || 'N/A',
//                 {
//                     chambres: reservation.chambres || [],
//                     nombreTotalChambres: reservation.nombreTotalChambres || 0,
//                     nombreTotalAdulte: reservation.nombreTotalAdulte || 0,
//                     nombreTotalEnfant: reservation.nombreTotalEnfant || 0,
//                     montantTotalServices: reservation.montantTotalServices || 0,
//                     montantTotalChambre: reservation.montantTotalChambre || 0,
//                     montantTotalReservation: reservation.montantTotalReservation || 0,
//                     modePaiement: reservation.modePaiement || 'N/A'
//                 }
//             );
//         } else {
//             console.log('E-mail non Gmail détecté ou email manquant, pas d\'envoi.');
//         }

//         // Populate for response
//         const populatedReservation = await Reservation.findById(req.params.id)
//             .populate('clientId')
//             .populate('chambres.chambreId')
//             .populate('chambres.services.serviceId');
//         console.log('Response reservation:', JSON.stringify(populatedReservation.toObject(), null, 2));

//         res.status(200).json(populatedReservation);
//     } catch (error) {
//         console.error('Error updating reservation:', error.message, error.stack);
//         res.status(400).json({ message: error.message });
//     }
// });


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
                from: `"Votre Réservation" <zribi4641@gmail.com>`,
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
        if (reservation.clientId.email.includes("@gmail.com")) {
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