export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST only.' });
    }

    let paymentId = null;
    
    // Cuba dapatkan dari body JSON
    try {
        if (req.body) {
            paymentId = req.body.paymentId || req.body.payment_id || null;
        }
    } catch(e) {}
    
    // Cuba dapatkan dari query parameter
    if (!paymentId && req.query) {
        paymentId = req.query.paymentId || req.query.payment_id || null;
    }
    
    // Cuba parse body mentah
    if (!paymentId && typeof req.body === 'string') {
        try {
            const parsed = JSON.parse(req.body);
            paymentId = parsed.paymentId || parsed.payment_id || null;
        } catch(e) {}
    }

    if (!paymentId) {
        return res.status(400).json({ 
            error: 'Payment ID is required.',
            receivedBody: req.body,
            receivedQuery: req.query
        });
    }

    const headers = {
        'Authorization': 'Key ' + (process.env.PI_API_KEY || ''),
        'Content-Type': 'application/json'
    };

    try {
        console.log('[CANCEL] Membatalkan:', paymentId);
        
        const cancelRes = await fetch(
            `https://api.minepi.com/v2/payments/${paymentId}/cancel`,
            { method: 'POST', headers: headers }
        );

        const cancelData = await cancelRes.json();

        if (!cancelRes.ok) {
            return res.status(cancelRes.status).json({ 
                error: 'Gagal membatalkan.', 
                detail: cancelData,
                paymentId: paymentId
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Payment cancelled successfully.',
            paymentId: paymentId,
            data: cancelData 
        });

    } catch (error) {
        return res.status(500).json({ 
            error: 'Internal server error.', 
            detail: error.message,
            paymentId: paymentId
        });
    }
}
