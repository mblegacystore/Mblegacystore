export default async function handler(req, res) {
    const { paymentId, network } = req.body;
    // Mengambil API_KEY_TESTNET secara automatik dari Vercel
    const PI_API_KEY = network === 'mainnet' 
        ? process.env.PI_API_KEY_MAINNET 
        : process.env.PI_API_KEY_TESTNET; 

    try {
        const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
            method: 'POST',
            headers: { 'Authorization': `Key ${PI_API_KEY}`, 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        res.status(200).json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
}
