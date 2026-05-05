export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const apiKey = process.env.PI_API_KEY_TESTNET;
    
    if (!apiKey) {
        return res.status(500).json({ error: 'API Key Testnet TIADA.' });
    }

    const { uid } = req.body;

    try {
        const response = await fetch('https://api.minepi.com/v2/payments', {
            method: 'POST',
            headers: {
                'Authorization': 'Key ' + apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: 0.0001,
                memo: 'App-to-User Ujian',
                metadata: { type: 'app_to_user_test' },
                uid: uid,
                direction: 'app_to_user'
            })
        });

        const data = await response.json();

        return res.status(200).json({
            success: response.ok,
            paymentId: data?.identifier || null,
            data: data
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
