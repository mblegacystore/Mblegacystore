export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST only.' });
    }

    const { paymentId } = req.body;

    if (!paymentId) {
        return res.status(400).json({ error: 'Payment ID is required.' });
    }

    const headers = {
        'Authorization': 'Key ' + process.env.PI_API_KEY,
        'Content-Type': 'application/json'
    };

    try {
        // "Override Protocol" - Hantar POST /cancel ke Pi Platform API
        console.log('[CANCEL] Membatalkan pembayaran:', paymentId);
        
        const cancelRes = await fetch(
            `https://api.minepi.com/v2/payments/${paymentId}/cancel`,
            { method: 'POST', headers: headers }
        );

        const cancelData = await cancelRes.json();

        if (!cancelRes.ok) {
            console.error('[CANCEL] Gagal:', cancelData);
            return res.status(500).json({ error: 'Gagal membatalkan pembayaran.', detail: cancelData });
        }

        // Berjaya!
        console.log('[CANCEL] Berjaya dibatalkan:', paymentId);
        return res.status(200).json({ success: true, message: 'Payment cancelled successfully.', data: cancelData });

    } catch (error) {
        console.error('[CANCEL] Ralat:', error);
        return res.status(500).json({ error: 'Internal server error.', detail: error.message });
    }
}
