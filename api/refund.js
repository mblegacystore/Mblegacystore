export default async function handler(req, res) {
    // Ujian: Cuba hantar App-to-User tanpa uid dari body
    const apiKey = process.env.PI_API_KEY_TESTNET;
    
    const headers = {
        'Authorization': 'Key ' + apiKey,
        'Content-Type': 'application/json'
    };

    const body = JSON.stringify({
        amount: 0.0001,
        memo: 'App-to-User Ujian',
        metadata: { type: 'app_to_user_test' },
        uid: 'GB6PP...XZWT4' // GANTI DENGAN UID ANDA SENDIRI!
    });

    try {
        const response = await fetch('https://api.minepi.com/v2/payments', {
            method: 'POST',
            headers: headers,
            body: body
        });
        const data = await response.json();
        
        return res.status(200).json({
            success: response.ok,
            status: response.status,
            data: data
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
