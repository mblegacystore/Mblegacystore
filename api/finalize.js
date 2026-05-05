export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const STUCK_ID = "QRDDdZ88DzobkZVYfMM16OU9CTzy";
    const { paymentId } = req.body || {};
    
    const headers = {
        'Authorization': 'Key ' + (process.env.PI_API_KEY || ''),
        'Content-Type': 'application/json'
    };

    try {
        // AUTO-CANCEL STUCK PAYMENT
        if (paymentId === STUCK_ID) {
            const cancelRes = await fetch(
                `https://api.minepi.com/v2/payments/${STUCK_ID}/cancel`,
                { method: 'POST', headers: headers }
            );
            const cancelData = await cancelRes.json();
            return res.status(200).json({ 
                success: true, 
                message: 'Stuck payment cancelled.',
                data: cancelData 
            });
        }

        // APPROVE
        const appRes = await fetch(
            `https://api.minepi.com/v2/payments/${paymentId}/approve`,
            { method: 'POST', headers: headers }
        );
        if (!appRes.ok) {
            const errData = await appRes.json();
            return res.status(500).json({ error: 'Approve failed', detail: errData });
        }

        // GET TXID
        let txid = null;
        for (let i = 0; i < 5 && !txid; i++) {
            await new Promise(r => setTimeout(r, 2000));
            const getRes = await fetch(
                `https://api.minepi.com/v2/payments/${paymentId}`,
                { headers: headers }
            );
            const data = await getRes.json();
            txid = data?.transaction?.txid;
        }

        if (!txid) {
            return res.status(500).json({ error: 'txid not found' });
        }

        // COMPLETE
        const compRes = await fetch(
            `https://api.minepi.com/v2/payments/${paymentId}/complete`,
            { method: 'POST', headers: headers, body: JSON.stringify({ txid }) }
        );
        const compData = await compRes.json();

        return res.status(200).json({ success: true, txid, data: compData });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
