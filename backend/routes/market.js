import axios from 'axios';
import express from 'express';

const router = express.Router();

// Route to fetch prices of symbols
router.get('/price', async (req, res) => {
    try {
        const apiKey = process.env.TWELVE_DATA_API_KEY; // Your TwelveData API key

        const symbols = ["AAPL", "TSLA", "MSFT", "BTC/USD", "XAU/USD"]; // List of symbols

        // Create requests for each symbol
        const requests = symbols.map((symbol) =>
            axios.get("https://api.twelvedata.com/price", {
                params: {
                    symbol,
                    apikey: apiKey,
                },
            })
        );

        // ----- HIGHLIGHT: Dollar/EGP exchange rate request -----
        const usdToEgpReq = axios.get("https://api.twelvedata.com/price", {
            params: {
                symbol: "USD/EGP", // USD to Egyptian Pound
                apikey: apiKey,
            },
        });

        // Wait for all requests (symbols + USD/EGP)
        const responses = await Promise.all([...requests, usdToEgpReq]);

        // Get USD to EGP rate from last response
        const usdToEgp = Number(responses[responses.length - 1].data.price); // Convert to number

        // Map symbols to prices and convert to EGP
        const result = symbols.map((symbol, index) => {
            const priceUsd = Number(responses[index].data.price); // Price in USD

            return {
                symbol,
                price_usd: priceUsd, // Original price in USD
                price_egp: priceUsd * usdToEgp, // Converted price in EGP
            };
        });

        // Include the exchange rate in the response
        res.json({
            exchange_rate: usdToEgp, // USD to EGP
            data: result,            // Prices of all symbols
        });

    } catch (error) {
        console.error('Error fetching price:', error);
        res.status(500).json({ error: 'Failed to fetch price' });
    }
});

export default router;