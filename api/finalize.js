export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const { paymentId, txid } = req.body;
    const headers = {
        'Authorization': 'Key ' + process.env.PI_API_KEY,
        'Content-Type': 'application/json'
    };

    console.log('[FINALIZE] Payment ID:', paymentId, '| TXID:', txid || 'N/A');

    try {
        // --- JIKA TXID SUDAH ADA, CONTINUE KE COMPLETE ---
        if (txid) {
            console.log('[FINALIZE] Melengkapkan pembayaran dengan TXID:', txid);
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
                console.error('[FINALIZE] Gagal Complete:', completeData);
                return res.status(500).json({ error: 'Gagal Complete.', detail: completeData });
            }
            
            return res.status(200).json({ success: true, txid: txid });
        }

        // --- JIKA TIADA TXID, CUBA APPROVE DULU ---
        console.log('[FINALIZE] Melakukan Approval:', paymentId);
        const approveRes = await fetch(
            `https://api.minepi.com/v2/payments/${paymentId}/approve`,
            { method: 'POST', headers: headers }
        );
        
        if (!approveRes.ok) {
            const errData = await approveRes.json();
            console.error('[FINALIZE] Gagal Approve:', errData);
            
            // --- JIKA APPROVE GAGAL, CUBA BATALKAN TRANSAKSI INI ---
            console.log('[FINALIZE] Mencuba membatalkan transaksi yang gagal...');
            const cancelRes = await fetch(
                `https://api.minepi.com/v2/payments/${paymentId}/cancel`,
                { method: 'POST', headers: headers }
            );
            const cancelData = await cancelRes.json();
            console.log('[FINALIZE] Hasil Batal:', cancelData);
            
            return res.status(200).json({ 
                success: true, 
                cancelled: true,
                message: 'Transaksi gagal dan telah dibatalkan secara automatik.',
                detail: cancelData 
            });
        }

        // --- TUNGGU TXID ---
        let newTxid = null;
        let attempts = 0;
        
        while (!newTxid && attempts < 5) {
            await new Promise(r => setTimeout(r, 2000));
            const getRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, { headers });
            const paymentData = await getRes.json();
            newTxid = paymentData?.transaction?.txid;
            attempts++;
            console.log(`[FINALIZE] Cubaan dapatkan txid (${attempts}):`, newTxid || 'Belum ada');
        }

        if (!newTxid) {
            // TIADA TXID SELEPAS 5 CUBAAN — BATALKAN
            console.log('[FINALIZE] Tiada TXID selepas 5 cubaan. Membatalkan...');
            const cancelRes = await fetch(
                `https://api.minepi.com/v2/payments/${paymentId}/cancel`,
                { method: 'POST', headers: headers }
            );
            
            return res.status(200).json({ 
                success: true, 
                cancelled: true,
                message: 'Transaksi luput dan telah dibatalkan.' 
            });
        }

        // --- COMPLETE ---
        console.log('[FINALIZE] Menyelesaikan pembayaran:', newTxid);
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
            return res.status(500).json({ error: 'Gagal Complete.', detail: completeData });
        }

        return res.status(200).json({ success: true, txid: newTxid });

    } catch (error) {
        console.error('[FINALIZE] Ralat:', error);
        return res.status(500).json({ error: 'Ralat dalaman server.' });
    }
}
