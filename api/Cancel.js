export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Guna POST sahaja' });
    }

    const { paymentId } = req.body;

    if (!paymentId) {
        return res.status(400).json({ error: 'paymentId diperlukan' });
    }

    try {
        const response = await fetch(
            'https://api.minepi.com/v2/payments/' + paymentId + '/cancel',
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Key ' + process.env.PI_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        const data = await response.json();
        return res.status(200).json({ success: true, data: data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
