export default async function handler(req, res) {
    const apiKey = process.env.PI_API_KEY_TESTNET;
    
    if (!apiKey) {
        return res.status(200).json({ error: 'API Key Testnet TIADA di server.' });
    }

    return res.status(200).json({ 
        success: true, 
        message: 'API Key Testnet DITEMUI.',
        key_prefix: apiKey.substring(0, 15) + '...'
    });
}
