export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    try {
        const apiKey = process.env.PI_API_KEY; // GUNA NAMA SAMA MACAM FAIL LAIN
        const uid = req.body?.uid;

        if (!apiKey) {
            console.error('[REFUND] API Key tiada');
            return res.status(500).json({ success: false, error: 'Kunci API tiada di server.' });
        }

        if (!uid) {
            console.error('[REFUND] UID tiada');
            return res.status(400).json({ success: false, error: 'UID pengguna tiada.' });
        }

        console.log('[REFUND] Hantar pembayaran ke:', uid);

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
        console.log('[REFUND] Response:', response.status, JSON.stringify(data));

        if (!response.ok) {
            console.error('[REFUND] Gagal:', data);
            return res.status(200).json({ 
                success: false, 
                error: data.message || data.error || 'Gagal hantar Pi',
                detail: data
            });
        }

        // Berjaya
        return res.status(200).json({
            success: true,
            paymentId: data.paymentId || data.identifier,
            data: data
        });

    } catch (error) {
        console.error('[REFUND] Ralat sistem:', error);
        return res.status(500).json({
            success: false,
            error: 'Ralat sistem: ' + error.message
        });
    }
}
