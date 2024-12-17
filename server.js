const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Stripe = require('stripe');

// Load environment variables
dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_51OMb4oIONk3QNZzYrlz7h4m31vJoFxWMSzNgZi2hzpFtKHFI6n9eJC5HSgRAu0Rda0C361nojCy53r8JpDUJF4Bu003L9JRtDk';
const stripe = Stripe(STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Allow CORS for specific subdomains
const allowedOrigins = [
    'https://new.biaw.com',
    'https://pay.biaw.com'
];

const corsOptions = {
    origin: function (origin, callback) {
            console.log('Origin:', origin); // Log the incoming origin
        if (allowedOrigins.includes(origin) || !origin) {
            // Allow requests with no 'origin' (e.g., Postman or server-to-server)
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(express.json());
//app.get('/create-checkout-session', (req, res) => { res.status(200).send('Test: Hello World!'); });





// Endpoint to create a checkout session
app.post('/create-checkout-session', async (req, res) => {
    try {
    res.json({ message: 'Endpoint is working!' });
        const { seats, clientReferenceId, priceId } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: seats,
                },
            ],
            mode: 'payment',
            client_reference_id: clientReferenceId,
            success_url: 'https://new.biaw.com/thank-you',
            cancel_url: 'https://new.biaw.com/payment-declined',
            allow_promotion_codes: true, // Enable promo codes
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
