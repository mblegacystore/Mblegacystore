export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const { uid } = req.body;

    const apiKey = process.env.PI_API_KEY;

    const headers = {
        'Authorization': 'Key ' + apiKey,
        'Content-Type': 'application/json'
    };

    try {
        const paymentRes = await fetch('https://api.minepi.com/v2/payments', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                amount: 0.0001,
                memo: 'Ujian App-to-User',
                metadata: { type: 'test' },
                uid: uid
            })
        });

        const paymentData = await paymentRes.json();

        // HANTAR SEMUA BUTIRAN BALIK KE BROWSER
        return res.status(200).json({
            ok: paymentRes.ok,
            status: paymentRes.status,
            data: paymentData
        });

    } catch (error) {
        return res.status(200).json({ 
            ok: false,
            error: error.message 
        });
    }
}
