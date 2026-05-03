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
        // Langkah 1: Dapatkan maklumat pembayaran
        console.log('[FINALIZE] Mendapatkan maklumat pembayaran:', paymentId);
        
        const getRes = await fetch(
            `https://api.minepi.com/v2/payments/${paymentId}`,
            { method: 'GET', headers: headers }
        );

        const paymentData = await getRes.json();

        if (!getRes.ok) {
            console.error('[FINALIZE] Gagal dapatkan maklumat:', paymentData);
            return res.status(500).json({ 
                error: 'Gagal mendapatkan maklumat pembayaran.', 
                detail: paymentData 
            });
        }

        // Dapatkan txid dari respons
        const txid = paymentData?.transaction?.txid;
        
        if (!txid) {
            return res.status(500).json({ 
                error: 'txid tidak ditemui dalam pembayaran.',
                paymentData: paymentData
            });
        }

        console.log('[FINALIZE] txid ditemui:', txid);

        // Langkah 2: Tunggu 3 saat
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Langkah 3: Complete dengan txid yang betul
        console.log('[FINALIZE] Menyelesaikan pembayaran dengan txid:', txid);
        
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
            console.error('[FINALIZE] Gagal complete:', completeData);
            return res.status(500).json({ error: 'Gagal menyelesaikan pembayaran.', detail: completeData });
        }

        console.log('[FINALIZE] Pembayaran selesai sepenuhnya:', paymentId);
        return res.status(200).json({ 
            success: true, 
            message: 'Payment completed successfully.',
            txid: txid,
            completed: completeData 
        });

    } catch (error) {
        console.error('[FINALIZE] Ralat:', error);
        return res.status(500).json({ error: 'Internal server error.', detail: error.message });
    }
}
