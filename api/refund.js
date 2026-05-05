export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Kaedah tidak dibenarkan.' });
    }

    const apiKey = process.env.PI_API_KEY_TESTNET;
    const { uid } = req.body;
    
    // Semak 1: Adakah UID wujud?
    if (!uid) {
        return res.status(400).json({ 
            success: false, 
            error: 'UID pengguna TIDAK dihantar dari aplikasi.' 
        });
    }

    // Semak 2: Adakah API Key Testnet wujud?
    if (!apiKey) {
        return res.status(500).json({ 
            success: false, 
            error: 'API Key Testnet TIADA di server.' 
        });
    }

    const headers = {
        'Authorization': 'Key ' + apiKey,
        'Content-Type': 'application/json'
    };

    const body = JSON.stringify({
        amount: 1.0, // Cuba dengan 1 Test-Pi
        memo: 'App-to-User Ujian - MB Legacy Store',
        metadata: { type: 'app_to_user_test' },
        uid: uid,
        direction: 'app_to_user'
    });

    try {
        const response = await fetch('https://api.minepi.com/v2/payments', {
            method: 'POST',
            headers: headers,
            body: body
        });
        const data = await response.json();
        
        // Hantar SEMUA butiran balik ke pelayar
        return res.status(200).json({
            success: response.ok,
            httpStatus: response.status,
            paymentId: data?.identifier || null,
            transaction: data?.transaction || null,
            errorMessage: data?.error || null,
            fullResponse: data
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: 'Ralat semasa menghubungi Pi API.', 
            detail: error.message 
        });
    }
}
