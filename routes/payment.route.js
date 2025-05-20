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
    // Validate cart and clientId
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

      const existingReservations = await Reservation.find({
        'chambres.chambreId': chambreId,
      });

      for (const existingReservation of existingReservations) {
        for (const existingChambre of existingReservation.chambres) {
          if (existingChambre.chambreId.toString() === chambreId.toString()) {
            const existingStart = existingChambre.dateArrive;
            const existingEnd = existingChambre.dateSortie;

            if (startDate < existingEnd && endDate > existingStart) {
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
      line_items: req.body.cart.map(item => {
        if (!item.nomcat || !item.prix || isNaN(item.prix)) {
          throw new Error(`Invalid cart item: ${JSON.stringify(item)}`);
        }
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.nomcat || 'Chambre',
            },
            unit_amount: Math.round(item.prix * 100 * 0.32),
          },
          quantity: item.nombreNuits || 1,
        };
      }),
      success_url: `${process.env.CLIENT_URL}success?clientId=${req.body.clientId}&paymentMethod=${encodeURIComponent(req.body.paymentMethod)}`,
      cancel_url: `${process.env.CLIENT_URL}cancel`,
      metadata: {
        clientId: req.body.clientId,
        paymentMethod: req.body.paymentMethod,
      },
    });

    res.json({ sessionId: session.id });
  } catch (e) {
    console.error('Stripe error:', e.message, e.stack);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;