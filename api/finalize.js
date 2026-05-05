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
        // JIKA TXID SUDAH ADA → COMPLETE
        if (txid) {
            console.log('[FINALIZE] Complete:', paymentId);
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
                console.error('[FINALIZE] Complete gagal:', completeData);
                return res.status(500).json({ error: 'Gagal Complete.', detail: completeData });
            }
            
            return res.status(200).json({ success: true, txid: txid });
        }

        // TIADA TXID → APPROVE
        console.log('[FINALIZE] Approve:', paymentId);
        const approveRes = await fetch(
            `https://api.minepi.com/v2/payments/${paymentId}/approve`,
            { method: 'POST', headers: headers }
        );
        
        if (!approveRes.ok) {
            const errData = await approveRes.json();
            console.error('[FINALIZE] Approve gagal:', errData);
            
            // Cuba cancel
            console.log('[FINALIZE] Cancel:', paymentId);
            const cancelRes = await fetch(
                `https://api.minepi.com/v2/payments/${paymentId}/cancel`,
                { method: 'POST', headers: headers }
            );
            const cancelData = await cancelRes.json();
            console.log('[FINALIZE] Cancel result:', cancelData);
            
            return res.status(200).json({ 
                success: true, 
                cancelled: true,
                message: 'Transaksi dibatalkan automatik.',
                detail: cancelData 
            });
        }

        // Tunggu TXID
        let newTxid = null;
        for (let i = 0; i < 10; i++) {
            await new Promise(r => setTimeout(r, 3000));
            const getRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, { headers });
            const paymentData = await getRes.json();
            newTxid = paymentData?.transaction?.txid;
            console.log(`[FINALIZE] Cubaan ${i+1}:`, newTxid || 'Belum ada');
            if (newTxid) break;
        }

        if (!newTxid) {
            console.log('[FINALIZE] Tiada TXID, cancel:', paymentId);
            await fetch(
                `https://api.minepi.com/v2/payments/${paymentId}/cancel`,
                { method: 'POST', headers: headers }
            );
            return res.status(200).json({ 
                success: true, 
                cancelled: true,
                message: 'Transaksi luput - dibatalkan.' 
            });
        }

        // Complete
        console.log('[FINALIZE] Complete dengan TXID:', newTxid);
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
