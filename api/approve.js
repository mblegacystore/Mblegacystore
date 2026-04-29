export default async function handler(req, res) {
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
        // Langkah 1: Approve pembayaran
        const approveRes = await fetch(
            'https://api.minepi.com/v2/payments/' + paymentId + '/approve',
            { method: 'POST', headers: headers }
        );

        const approveData = await approveRes.json();

        if (!approveRes.ok) {
            return res.status(500).json({ error: 'Gagal approve', detail: approveData });
        }

        // Langkah 2: Complete pembayaran
        const completeRes = await fetch(
            'https://api.minepi.com/v2/payments/' + paymentId + '/complete',
            {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ txid: paymentId })
            }
        );

        const completeData = await completeRes.json();

        if (!completeRes.ok) {
            return res.status(500).json({ error: 'Gagal complete', detail: completeData });
        }

        return res.status(200).json({ success: true, approved: approveData, completed: completeData });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
