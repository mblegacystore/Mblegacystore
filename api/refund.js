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

        console.log('[REFUND] UID:', uid);

        // Dapatkan info user dulu untuk dapatkan wallet address
        const userRes = await fetch(`https://api.minepi.com/v2/users/${uid}`, {
            headers: {
                'Authorization': 'Key ' + apiKey,
                'Content-Type': 'application/json'
            }
        });
        
        const userData = await userRes.json();
        console.log('[REFUND] User data:', JSON.stringify(userData));

        if (!userRes.ok) {
            return res.status(200).json({
                success: false,
                error: 'Gagal dapatkan data user: ' + (userData.message || 'Unknown'),
                detail: userData
            });
        }

        const walletAddress = userData?.wallet_address || userData?.address || null;
        
        if (!walletAddress) {
            return res.status(200).json({
                success: false,
                error: 'Alamat wallet tiada. User belum buat wallet?',
                userData: userData
            });
        }

        console.log('[REFUND] Wallet address:', walletAddress);

        // Hantar pembayaran guna address
        const response = await fetch('https://api.minepi.com/v2/payments', {
            method: 'POST',
            headers: {
                'Authorization': 'Key ' + apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: 0.0001,
                memo: 'MB Legacy - App to User Test',
                metadata: { type: 'app_to_user_test' },
                address: walletAddress,  // Guna address
                direction: 'app_to_user'
            })
        });

        const data = await response.json();
        console.log('[REFUND] Payment response:', JSON.stringify(data));

        if (!response.ok) {
            return res.status(200).json({
                success: false,
                error: data.message || data.error || 'Pi API error',
                detail: data
            });
        }

        return res.status(200).json({
            success: true,
            paymentId: data.paymentId || data.identifier,
            address: walletAddress,
            detail: data
        });

    } catch (error) {
        console.error('[REFUND] Ralat:', error);
        return res.status(500).json({
            success: false,
            error: 'Ralat sistem: ' + error.message
        });
    }
}
