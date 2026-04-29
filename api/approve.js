export default async function handler(req, res) {
    // 1. Hanya benarkan POST request
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Guna POST sahaja' });
    }

    const { paymentId } = req.body;

    if (!paymentId) {
        return res.status(400).json({ error: 'paymentId diperlukan' });
    }

    const headers = {
        'Authorization': 'Key ' + process.env.PI_API_KEY,
        'Content-Type': 'application/json'
    };

    try {
        // Langkah 1: LULUSKAN pembayaran (Approve)
        console.log('Meluluskan pembayaran:', paymentId);
        const approveRes = await fetch(
            `https://api.minepi.com/v2/payments/${paymentId}/approve`,
            { method: 'POST', headers: headers }
        );
        const approveData = await approveRes.json();

        if (!approveRes.ok) {
            console.error('Gagal approve:', approveData);
            return res.status(500).json({ error: 'Gagal approve', detail: approveData });
        }

        // Langkah 2: TUNGGU sebentar untuk transaksi diproses
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Langkah 3: SAHKAN & MUKTAMADKAN pembayaran (Complete)
        console.log('Melengkapkan pembayaran:', paymentId);
        const completeRes = await fetch(
            `https://api.minepi.com/v2/payments/${paymentId}/complete`,
            {
                method: 'POST',
                headers: headers,
                // txid dibiarkan kosong untuk memberitahu Pi Network
                body: JSON.stringify({ txid: null }) 
            }
        );
        const completeData = await completeRes.json();

        if (!completeRes.ok) {
            console.error('Gagal complete:', completeData);
            return res.status(500).json({ error: 'Gagal complete', detail: completeData });
        }

        // Berjaya!
        console.log('Pembayaran selesai sepenuhnya:', paymentId);
        return res.status(200).json({ success: true, approved: approveData, completed: completeData });

    } catch (error) {
        console.error('Ralat server:', error);
        return res.status(500).json({ error: error.message });
    }
}
