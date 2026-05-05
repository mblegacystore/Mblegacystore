export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Handle OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    try {
        const apiKey = process.env.PI_API_KEY_TESTNET;
        const uid = req.body?.uid;

        if (!apiKey) {
            return res.status(200).json({ 
                success: false, 
                error: 'API Key tiada' 
            });
        }

        if (!uid) {
            return res.status(200).json({ 
                success: false, 
                error: 'UID tiada' 
            });
        }

        // Hantar payment App-to-User
        const response = await fetch('https://api.minepi.com/v2/payments', {
            method: 'POST',
            headers: {
                'Authorization': 'Key ' + apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: 0.0001,
                memo: 'MB Legacy Test',
                metadata: { type: 'app_to_user' },
                uid: uid,
                direction: 'app_to_user'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(200).json({
                success: false,
                error: data.message || 'Pi API error',
                data: data
            });
        }

        return res.status(200).json({
            success: true,
            paymentId: data.paymentId || data.identifier
        });

    } catch (error) {
        return res.status(200).json({
            success: false,
            error: error.message
        });
    }
}
