export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    try {
        const apiKey = process.env.PI_API_KEY_TESTNET;
        const uid = req.body?.uid;

        if (!apiKey) {
            return res.status(500).json({ error: 'Kunci API Testnet tiada di server.' });
        }

        if (!uid) {
            return res.status(400).json({ error: 'UID pengguna tiada dalam permintaan.' });
        }

        // Panggil Pi API
        const response = await fetch('https://api.minepi.com/v2/payments', {
            method: 'POST',
            headers: {
                'Authorization': 'Key ' + apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: 0.0001,
                memo: 'App-to-User Test',
                metadata: { type: 'test' },
                uid: uid,
                direction: 'app_to_user'
            })
        });

        const data = await response.json();

        // Hantar SEMUA butiran kembali ke pelayar
        return res.status(200).json({
            success: response.ok,
            httpStatus: response.status,
            data: data
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Ralat sistem: ' + error.message
        });
    }
}
