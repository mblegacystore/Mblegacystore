export default async function handler(req, res) {
    const apiKey = process.env.PI_API_KEY_TESTNET;
    
    const response = await fetch('https://api.minepi.com/v2/payments', {
        method: 'POST',
        headers: {
            'Authorization': 'Key ' + apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: 0.0001,
            memo: 'Test',
            metadata: {},
            uid: req.body.uid  // Guna UID sebenar anda
        })
    });
    
    const data = await response.json();
    
    return res.status(200).json(data);
}
