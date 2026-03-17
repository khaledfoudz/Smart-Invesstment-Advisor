import axios from 'axios';
import express from 'express';

const router = express.Router();

router.get('/price', async (req, res) => {
    try {
        const apiKey = process.env.TWELVE_DATA_API_KEY;

        const symbols = ["AAPL", "TSLA", "MSFT", "BTC/USD", "XAU/USD"];

        const requests = symbols.map((symbol) =>
        axios.get("https://api.twelvedata.com/price", {
            params: {
            symbol,
            apikey: apiKey,
            },
        })
        );

        const responses = await Promise.all(requests);

        const result = symbols.map((symbol, index) => ({
        symbol,
        price: responses[index].data.price,
        }));

        res.json(result);
        
    } catch (error) {
        console.error('Error fetching price:', error);
        res.status(500).json({ error: 'Failed to fetch price' });
    }
});

export default router;