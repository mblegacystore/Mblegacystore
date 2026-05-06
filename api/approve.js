export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const { paymentId } = req.body;
    
    if (!paymentId) {
        return res.status(400).json({ error: 'Payment ID required.' });
    }

    const headers = {
        'Authorization': 'Key ' + process.env.PI_API_KEY_TESTNET,
        'Content-Type': 'application/json'
    };

    try {
        // Approve
        const approveRes = await fetch(
            `https://api.minepi.com/v2/payments/${paymentId}/approve`,
            { method: 'POST', headers: headers }
        );
        const approveData = await approveRes.json();

        if (!approveRes.ok) {
            return res.status(200).json({ success: false, error: approveData.message || 'Approve failed' });
        }

        // Tunggu
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Complete
        const completeRes = await fetch(
            `https://api.minepi.com/v2/payments/${paymentId}/complete`,
            { 
                method: 'POST', 
                headers: headers,
                body: JSON.stringify({ txid: null })
            }
        );
        const completeData = await completeRes.json();

        if (!completeRes.ok) {
            return res.status(200).json({ success: false, error: completeData.message || 'Complete failed' });
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        return res.status(200).json({ success: false, error: error.message });
    }
}
