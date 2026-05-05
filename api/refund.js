export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const { uid } = req.body;
    
    if (!uid) {
        return res.status(400).json({ error: 'UID pengguna diperlukan.' });
    }

    const headers = {
        'Authorization': 'Key ' + process.env.PI_API_KEY,
        'Content-Type': 'application/json'
    };

    try {
        // Hantar bayaran kepada pengguna
        const paymentRes = await fetch('https://api.minepi.com/v2/payments', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                amount: 0.0001,
                memo: 'Ujian App-to-User MB Legacy Store',
                metadata: { type: 'app_to_user_test' },
                uid: uid
            })
        });

        const paymentData = await paymentRes.json();

        console.log('PI API RESPONSE:', JSON.stringify(paymentData));

        if (!paymentRes.ok) {
            return res.status(500).json({ 
                error: 'Gagal menghantar bayaran.', 
                detail: paymentData 
            });
        }

        // Approve pembayaran
        const paymentId = paymentData.identifier;
        await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
            method: 'POST',
            headers: headers
        });

        return res.status(200).json({ 
            success: true, 
            paymentId: paymentId
        });

    } catch (error) {
        console.error('REFUND ERROR:', error);
        return res.status(500).json({ error: error.message });
    }
}
