export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();

    // ⚠️ HARDCODED STUCK PAYMENT ID
    const STUCK_PAYMENT_ID = "QRDDdZ88DzobkZVYfMM16OU9CTzy";
    
    let paymentId = STUCK_PAYMENT_ID;

    const headers = {
        'Authorization': 'Key ' + (process.env.PI_API_KEY || ''),
        'Content-Type': 'application/json'
    };

    try {
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
