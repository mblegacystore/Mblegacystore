const StellarSdk = require('stellar-sdk');

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    try {
        const secretKey = process.env.APP_WALLET_SECRET;
        const destinationAddress = 'GBVN7...45V67'; // GANTI DENGAN ADDRESS PENUH
        
        if (!secretKey) {
            return res.status(200).json({ success: false, error: 'Secret Key tiada di server' });
        }

        const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
        const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
        
        const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
        
        const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET
        })
        .addOperation(StellarSdk.Operation.payment({
            destination: destinationAddress,
            asset: StellarSdk.Asset.native(),
            amount: '1'
        }))
        .setTimeout(30)
        .build();
        
        transaction.sign(sourceKeypair);
        
        const result = await server.submitTransaction(transaction);
        
        return res.status(200).json({
            success: true,
            hash: result.hash,
            message: '1 Pi Testnet dihantar!'
        });

    } catch (error) {
        return res.status(200).json({
            success: false,
            error: error.message || 'Ralat Stellar',
            detail: JSON.stringify(error)
        });
    }
}
