export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const { paymentId } = req.body;
    const headers = {
        'Authorization': 'Key ' + process.env.PI_API_KEY_TESTNET,
        'Content-Type': 'application/json'
    };

    try {
        // Kalau ada paymentId specific
        if (paymentId) {
            const cancelRes = await fetch(
                `https://api.minepi.com/v2/payments/${paymentId}/cancel`,
                { method: 'POST', headers: headers }
            );
            const cancelData = await cancelRes.json();
            
            return res.status(200).json({ 
                success: cancelRes.ok, 
                message: cancelRes.ok ? 'Cancelled' : cancelData.message 
            });
        }

        // Kalau takde paymentId → cancel SEMUA pending
        const listRes = await fetch(
            'https://api.minepi.com/v2/payments?status=pending',
            { headers: headers }
        );
        const listData = await listRes.json();
        
        if (!listRes.ok) {
            return res.status(200).json({ success: false, error: listData.message || 'Gagal dapat senarai' });
        }

        const pendingPayments = listData.payments || [];
        
        if (pendingPayments.length === 0) {
            return res.status(200).json({ success: true, message: 'Tiada pending payment' });
        }

        // Cancel semua
        for (const payment of pendingPayments) {
            await fetch(
                `https://api.minepi.com/v2/payments/${payment.identifier}/cancel`,
                { method: 'POST', headers: headers }
            );
        }

        return res.status(200).json({ 
            success: true, 
            message: pendingPayments.length + ' pending dibatalkan' 
        });

    } catch (error) {
        return res.status(200).json({ success: false, error: error.message });
    }
}
