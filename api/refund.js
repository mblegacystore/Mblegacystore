export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    try {
        const apiKey = process.env.PI_API_KEY_TESTNET;
        const { uid } = req.body;

        if (!apiKey) {
            return res.status(500).json({ error: 'API Key missing' });
        }

        if (!uid) {
            return res.status(400).json({ error: 'UID missing' });
        }

        const response = await fetch('https://api.minepi.com/v2/payments', {
            method: 'POST',
            headers: {
                'Authorization': 'Key ' + apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: 0.0001,
                memo: 'Test App-to-User',
                metadata: {},
                uid: uid,
                direction: 'app_to_user'
            })
        });

        const data = await response.json();

        return res.status(200).json({
            success: response.ok,
            status: response.status,
            paymentId: data?.identifier || null,
            errorMessage: data?.error || null,
            data: data
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Unknown error'
        });
    }
}
