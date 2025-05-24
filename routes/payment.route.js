const express = require('express');
const router = express.Router();
const Stripe = require('stripe')('sk_test_51R1oQVHK3HkL6OFz7ULXDUVDVH0KBfhOum5CXbfb3KYxmTrRKa5iwqPKtskNTdhKhgo1PssHPbgb8n9dfwrGjVGD00HUdPe749');
const Reservation = require('../models/reservation');


const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};


router.post('/', async (req, res) => {
  try {
    if (!req.body.cart || !Array.isArray(req.body.cart) || req.body.cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty or invalid' });
    }
    if (!req.body.clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }
    
    for (const item of req.body.cart) {
      const { chambreId, dateArrive, dateSortie } = item;
      if (!chambreId || !dateArrive || !dateSortie) {
        return res.status(400).json({ error: 'Invalid cart item: missing chambreId, dateArrive, or dateSortie' });
      }

      const startDate = normalizeDate(dateArrive);
      const endDate = normalizeDate(dateSortie);

      const addjourStartDate = new Date(startDate);
      addjourStartDate.setDate(startDate.getDate() + 1);
      const diminuejourEndDate = new Date(endDate);
      diminuejourEndDate.setDate(endDate.getDate() - 1);

      const existingReservations = await Reservation.find({
        'chambres.chambreId': chambreId,
      });

      for (const existingReservation of existingReservations) {
        for (const existingChambre of existingReservation.chambres) {
          if (existingChambre.chambreId.toString() === chambreId.toString()) {
            const existingStart = normalizeDate(existingChambre.dateArrive);
            const existingEnd = normalizeDate(existingChambre.dateSortie);
            if (addjourStartDate < existingEnd && diminuejourEndDate > existingStart) {
              return res.status(400).json({
                message: 'Désolé, une des chambres que vous avez sélectionnées a été réservée il y a quelques secondes. La date choisie n’est donc plus disponible. Veuillez actualiser la page des chambres et effectuer une nouvelle réservation.',
              });
            } 
          }
        }
      }
    }

    const session = await Stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: req.body.cart.flatMap(item => {

        const { nomcat, prix, nombreNuits, nombreAdulte, nombreEnfant = 0, litbebe = 0, services = [], room } = item;

        let prixAdulte = prix;
        let prixEnfant = prix * 0.5;
        
        if (room.promotion > 0 && room.montantReduction) {
        prixAdulte -= room.montantReduction;
        prixEnfant = prixAdulte * 0.5; 
        }

        if (room.nbrnuitpromotion > 0 && nombreNuits >= room.nbrnuitpromotion && room.montantReductionNuit > 0) {
        prixAdulte -= room.montantReductionNuit;
        prixEnfant -= room.montantReductionNuit / 2;
        }

        const adultTotal = prixAdulte * nombreAdulte * nombreNuits;
        const enfantTotal = prixEnfant * nombreEnfant * nombreNuits;
        const totalRoomPrice = adultTotal + enfantTotal;

        const roomLineItem = {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${nomcat} - ${nombreNuits} nuit${nombreNuits > 1 ? 's' : ''} (${nombreAdulte} adulte${nombreAdulte > 1 ? 's' : ''}${nombreEnfant > 0 ? `, ${nombreEnfant} enfant${nombreEnfant > 1 ? 's' : ''}` : ''}${litbebe > 0 ? `, ${litbebe} bébé${litbebe > 1 ? 's' : ''}` : ''})`,
            },
            unit_amount: Math.round(totalRoomPrice * 100 * 0.32), 
          },
          quantity: 1,
        };

        const serviceLineItems = services.map(service => {
          if (!service.nom || !service.prix || !service.quantite) {
            throw new Error(`Invalid service: ${JSON.stringify(service)}`);
          }
          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Service : ${service.nom}`,
              },
              unit_amount: Math.round(service.prix * 100 * 0.32), 
            },
            quantity: service.quantite,
          };
        });

        return [roomLineItem, ...serviceLineItems];
      }),
      success_url: `${process.env.CLIENT_URL}success?clientId=${req.body.clientId}`,
      cancel_url: `${process.env.CLIENT_URL}cancel`,
      metadata: {
        clientId: req.body.clientId,
      },
    });

    res.json({ sessionId: session.id });
  } catch (e) {
    console.error('Stripe error:', e.message, e.stack);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;