export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    try {
        const apiKey = process.env.PI_API_KEY_TESTNET;
        const uid = req.body?.uid;

        if (!apiKey) {
            return res.status(500).json({ success: false, error: 'Kunci API Testnet tiada di server.' });
        }

        if (!uid) {
            return res.status(400).json({ success: false, error: 'UID pengguna tiada dalam permintaan.' });
        }

        console.log('[REFUND] Hantar ke UID:', uid);
        console.log('[REFUND] API Key exists:', apiKey ? 'YES' : 'NO');

        const response = await fetch('https://api.minepi.com/v2/payments', {
            method: 'POST',
            headers: {
                'Authorization': 'Key ' + apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: 0.0001,
                memo: 'MB Legacy - App to User Test',
                metadata: { type: 'app_to_user_test' },
                uid: uid,
                direction: 'app_to_user'
            })
        });

        const data = await response.json();
        console.log('[REFUND] Status:', response.status);
        console.log('[REFUND] Response:', JSON.stringify(data));

        if (!response.ok) {
            // Return error dengan detail
            return res.status(200).json({
                success: false,
                error: data.message || data.error || 'Pi API returned status ' + response.status,
                detail: data
            });
        }

        // Berjaya
        return res.status(200).json({
            success: true,
            paymentId: data.paymentId || data.identifier || 'unknown',
            message: 'Pembayaran App-to-User berjaya dihantar'
        });

    } catch (error) {
        console.error('[REFUND] Ralat sistem:', error);
        return res.status(500).json({
            success: false,
            error: 'Ralat sistem: ' + error.message
        });
    }
}
