const express = require('express');
const router = express.Router();
const Stripe = require('stripe')('sk_test_51R1oQVHK3HkL6OFz7ULXDUVDVH0KBfhOum5CXbfb3KYxmTrRKa5iwqPKtskNTdhKhgo1PssHPbgb8n9dfwrGjVGD00HUdPe749');

router.post('/', async (req, res) => {
  try {
    // Validate cart and clientId
    if (!req.body.cart || !Array.isArray(req.body.cart) || req.body.cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty or invalid' });
    }
    if (!req.body.clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
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