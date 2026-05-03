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
        // Langkah 1: Approve pembayaran
        console.log('[FINALIZE] Meluluskan pembayaran:', paymentId);
        
        const approveRes = await fetch(
            `https://api.minepi.com/v2/payments/${paymentId}/approve`,
            { method: 'POST', headers: headers }
        );

        const approveData = await approveRes.json();

        if (!approveRes.ok) {
            console.error('[FINALIZE] Gagal approve:', approveData);
            return res.status(500).json({ error: 'Gagal meluluskan pembayaran.', detail: approveData });
        }

        console.log('[FINALIZE] Berjaya diluluskan.');

        // Langkah 2: Tunggu 3 saat
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Langkah 3: Force Complete dengan txid
        console.log('[FINALIZE] Menyelesaikan pembayaran:', paymentId);
        
        const completeRes = await fetch(
            `https://api.minepi.com/v2/payments/${paymentId}/complete`,
            { 
                method: 'POST', 
                headers: headers,
                body: JSON.stringify({ txid: null })
            }
        );

        const completeData = await completeRes.json();

        if (!completeRes.ok) {
            console.error('[FINALIZE] Gagal complete:', completeData);
            return res.status(500).json({ error: 'Gagal menyelesaikan pembayaran.', detail: completeData });
        }

        console.log('[FINALIZE] Pembayaran selesai sepenuhnya:', paymentId);
        return res.status(200).json({ 
            success: true, 
            message: 'Payment approved and completed successfully.',
            approved: approveData,
            completed: completeData 
        });

    } catch (error) {
        console.error('[FINALIZE] Ralat:', error);
        return res.status(500).json({ error: 'Internal server error.', detail: error.message });
    }
}
