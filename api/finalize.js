export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();

    const STUCK_ID = "QRDDdZ88DzobkZVYfMM16OU9CTzy";
    
    const headers = {
        'Authorization': 'Key ' + (process.env.PI_API_KEY || ''),
        'Content-Type': 'application/json'
    };

    try {
        // AUTO-CANCEL STUCK PAYMENT - terus, tanpa syarat
        console.log('[FINALIZE] Cancelling stuck payment:', STUCK_ID);
        
        const cancelRes = await fetch(
            `https://api.minepi.com/v2/payments/${STUCK_ID}/cancel`,
            { method: 'POST', headers: headers }
        );
        const cancelData = await cancelRes.json();

        return res.status(200).json({ 
            success: true, 
            message: 'Stuck payment cancelled. Ready for new transactions.',
            paymentId: STUCK_ID,
            data: cancelData 
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
