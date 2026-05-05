export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const { paymentId } = req.body;
    const headers = {
        'Authorization': 'Key ' + process.env.PI_API_KEY,
        'Content-Type': 'application/json'
    };

    try {
        // --- LANGKAH 1: APPROVE (Sangat Penting!) ---
        // Ini memberitahu Pi Network bahawa MB Legacy Store setuju dengan bayaran ini.
        console.log('[FINALIZE] Melakukan Approval:', paymentId);
        const approveRes = await fetch(
            `https://api.minepi.com/v2/payments/${paymentId}/approve`,
            { method: 'POST', headers: headers }
        );
        
        if (!approveRes.ok) {
            const errData = await approveRes.json();
            console.error('[FINALIZE] Gagal Approve:', errData);
            return res.status(500).json({ error: 'Gagal Approve bayaran.', detail: errData });
        }

        // --- LANGKAH 2: TUNGGU TXID ---
        // Kita perlu GET maklumat bayaran untuk dapatkan txid selepas pengguna sign di wallet.
        // Kadangkala perlu tunggu sekejap supaya blockchain update.
        let txid = null;
        let attempts = 0;
        
        while (!txid && attempts < 5) {
            await new Promise(r => setTimeout(r, 2000)); // Tunggu 2 saat setiap cubaan
            const getRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, { headers });
            const paymentData = await getRes.json();
            txid = paymentData?.transaction?.txid;
            attempts++;
            console.log(`[FINALIZE] Cubaan dapatkan txid (${attempts}):`, txid || 'Belum ada');
        }

        if (!txid) {
            return res.status(500).json({ error: 'Bayaran luput (txid tidak ditemui).' });
        }

        // --- LANGKAH 3: COMPLETE ---
        console.log('[FINALIZE] Menyelesaikan pembayaran (Complete):', txid);
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
            return res.status(500).json({ error: 'Gagal Complete.', detail: completeData });
        }

        return res.status(200).json({ success: true, txid: txid });

    } catch (error) {
        console.error('[FINALIZE] Ralat:', error);
        return res.status(500).json({ error: 'Ralat dalaman server.' });
    }
}
