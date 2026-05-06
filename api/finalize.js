export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const { paymentId, txid } = req.body;
    
    if (!paymentId) {
        return res.status(400).json({ error: 'Payment ID required.' });
    }

    const headers = {
        'Authorization': 'Key ' + process.env.PI_API_KEY_TESTNET,
        'Content-Type': 'application/json'
    };

    try {
        // Kalau ada TXID → Complete
        if (txid) {
            const completeRes = await fetch(
                `https://api.minepi.com/v2/payments/${paymentId}/complete`,
                { 
                    method: 'POST', 
                    headers: headers,
                    body: JSON.stringify({ txid: txid })
                }
            );
            const completeData = await completeRes.json();
            
            if (!completeRes.ok) {
                return res.status(200).json({ success: false, error: 'Complete failed', detail: completeData });
            }
            
            return res.status(200).json({ success: true, txid: txid });
        }

        // Tiada TXID → Approve dulu
        const approveRes = await fetch(
            `https://api.minepi.com/v2/payments/${paymentId}/approve`,
            { method: 'POST', headers: headers }
        );
        
        if (!approveRes.ok) {
            const errData = await approveRes.json();
            // Cuba cancel kalau approve gagal
            await fetch(
                `https://api.minepi.com/v2/payments/${paymentId}/cancel`,
                { method: 'POST', headers: headers }
            );
            return res.status(200).json({ success: false, cancelled: true, error: errData.message || 'Approve failed' });
        }

        // Tunggu TXID
        let newTxid = null;
        for (let i = 0; i < 10; i++) {
            await new Promise(r => setTimeout(r, 3000));
            const getRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, { headers });
            const paymentData = await getRes.json();
            newTxid = paymentData?.transaction?.txid;
            if (newTxid) break;
        }

        if (!newTxid) {
            await fetch(
                `https://api.minepi.com/v2/payments/${paymentId}/cancel`,
                { method: 'POST', headers: headers }
            );
            return res.status(200).json({ success: false, cancelled: true, error: 'No TXID, cancelled' });
        }

        // Complete
        const completeRes = await fetch(
            `https://api.minepi.com/v2/payments/${paymentId}/complete`,
            { 
                method: 'POST', 
                headers: headers,
                body: JSON.stringify({ txid: newTxid })
            }
        );
        const completeData = await completeRes.json();

        if (!completeRes.ok) {
            return res.status(200).json({ success: false, error: 'Complete failed', detail: completeData });
        }

        return res.status(200).json({ success: true, txid: newTxid });

    } catch (error) {
        return res.status(200).json({ success: false, error: error.message });
    }
}
