export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
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
        const walletAddress = 'GB6PP22HTZBG5J4ECUFN7EURKPWFXMFZZWGJU3ZTNMGVXVF3WXZWT4';
        
        if (!apiKey) {
            return res.status(200).json({ success: false, error: 'API Key Testnet tiada' });
        }

        console.log('[REFUND] Hantar ke wallet:', walletAddress);

        const response = await fetch('https://api.minepi.com/v2/payments', {
            method: 'POST',
            headers: {
                'Authorization': 'Key ' + apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: 1,
                memo: 'MB Legacy - App to User Test',
                metadata: { type: 'app_to_user' },
                address: walletAddress,
                direction: 'app_to_user'
            })
        });

        const data = await response.json();
        console.log('[REFUND] Response:', response.status, JSON.stringify(data));

        if (!response.ok) {
            return res.status(200).json({
                success: false,
                error: data.error || data.message || 'Pi API error',
                fullResponse: JSON.stringify(data),
                statusCode: response.status
            });
        }

        return res.status(200).json({
            success: true,
            paymentId: data.paymentId || data.identifier
        });

    } catch (error) {
        return res.status(200).json({ success: false, error: error.message });
    }
}
