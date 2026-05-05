export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    try {
        const apiKey = process.env.PI_API_KEY_TESTNET;
        const uid = req.body?.uid;

        if (!apiKey) {
            return res.status(500).json({ success: false, error: 'Kunci API Testnet tiada.' });
        }

        if (!uid) {
            return res.status(400).json({ success: false, error: 'UID pengguna tiada.' });
        }

        console.log('[REFUND DEBUG] UID:', uid);

        // Dapatkan info user dulu untuk dapatkan wallet address
        const userRes = await fetch(`https://api.minepi.com/v2/users/${uid}`, {
            headers: {
                'Authorization': 'Key ' + apiKey,
                'Content-Type': 'application/json'
            }
        });
        
        const userData = await userRes.json();
        console.log('[REFUND DEBUG] Raw User Data:', JSON.stringify(userData));

        // HANTAR BALIK SEMUA DATA PENGGUNA KE FRONTEND UNTUK DEBUGGING
        return res.status(200).json({
            success: false,
            error: 'DEBUG MODE: Check frontend for user data.',
            userData: userData // Ini akan menghantar objek penuh ke frontend
        });

    } catch (error) {
        console.error('[REFUND] Ralat:', error);
        return res.status(500).json({
            success: false,
            error: 'Ralat sistem: ' + error.message
        });
    }
}
