export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    // GANTIKAN dengan UID pengguna ujian sebenar, atau dapatkan dari body
    const { uid } = req.body;
    
    if (!uid) {
        return res.status(400).json({ error: 'UID pengguna diperlukan.' });
    }

    // JUMLAH KECIL UNTUK UJIAN
    const amount = 0.0001;
    const memo = "Ujian App-to-User MB Legacy Store";

    const headers = {
        'Authorization': 'Key ' + process.env.PI_API_KEY, // API KEY PEMBANGUN
        'Content-Type': 'application/json'
    };

    try {
        console.log('[REFUND] Menghantar', amount, 'Pi kepada', uid);

        const paymentRes = await fetch('https://api.minepi.com/v2/payments', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                amount: amount,
                memo: memo,
                metadata: { type: "app_to_user_test" },
                uid: uid // INI MENGHANTAR KE UID PENGGUNA
            })
        });

        const paymentData = await paymentRes.json();

        if (!paymentRes.ok) {
            console.error('[REFUND] Gagal cipta pembayaran:', paymentData);
            return res.status(500).json({ error: 'Gagal menghantar bayaran.', detail: paymentData });
        }

        const paymentId = paymentData.identifier;

        // LULUSKAN (APPROVE) SEGERA
        await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
            method: 'POST',
            headers: headers
        });

        // DAPATKAN TXID SELEPAS PENGGUNA TANDATANGANI DI WALLET MEREKA
        // (Ini mungkin mengambil masa. Untuk ujian, kita hanya akan sahkan dahulu.)
        
        return res.status(200).json({ 
            success: true, 
            paymentId: paymentId,
            message: 'Bayaran dihantar. Pengguna perlu tandatangani di wallet mereka.' 
        });

    } catch (error) {
        console.error('[REFUND] Ralat:', error);
        return res.status(500).json({ error: 'Ralat pelayan dalaman.' });
    }
}
