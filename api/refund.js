export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const { uid } = req.body;
    
    if (!uid) {
        return res.status(400).json({ error: 'UID pengguna diperlukan.' });
    }

    const headers = {
        'Authorization': 'Key ' + process.env.PI_API_KEY,
        'Content-Type': 'application/json'
    };

    try {
        const paymentRes = await fetch('https://api.minepi.com/v2/payments', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                amount: 0.0001,
                memo: 'Ujian App-to-User MB Legacy Store',
                metadata: { type: 'app_to_user_test' },
                uid: uid
            })
        });

        const paymentData = await paymentRes.json();

        // HANTAR BALIK MESEJ PENUH DARI PI API
        return res.status(paymentRes.ok ? 200 : 500).json({
            success: paymentRes.ok,
            paymentId: paymentData?.identifier || null,
            pi_response: paymentData  // INI PENTING - Papar semua mesej dari Pi
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
