export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST only.' });
    }

    const { paymentId } = req.body;

    if (!paymentId) {
        return res.status(400).json({ error: 'Payment ID is required.' });
    }

    const headers = {
        'Authorization': 'Key ' + process.env.PI_API_KEY,
        'Content-Type': 'application/json'
    };

    try {
        // Step 1: Approve the payment
        console.log('[FINALIZE] Approving payment:', paymentId);
        const approveRes = await fetch(
            `https://api.minepi.com/v2/payments/${paymentId}/approve`,
            { method: 'POST', headers: headers }
        );
        const approveData = await approveRes.json();

        if (!approveRes.ok) {
            console.error('[FINALIZE] Approval failed:', approveData);
            return res.status(500).json({ error: 'Failed to approve payment.', detail: approveData });
        }

        console.log('[FINALIZE] Approved successfully.');

        // Step 2: Wait for the blockchain to process the transaction
        console.log('[FINALIZE] Waiting 5 seconds for blockchain confirmation...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Step 3: Complete and finalize the payment
        console.log('[FINALIZE] Completing payment:', paymentId);
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
            console.error('[FINALIZE] Completion failed:', completeData);
            return res.status(500).json({ error: 'Failed to complete payment.', detail: completeData });
        }

        // Success!
        console.log('[FINALIZE] Payment fully finalized:', paymentId);
        return res.status(200).json({
            success: true,
            message: 'Payment approved and completed successfully.',
            approved: approveData,
            completed: completeData
        });

    } catch (error) {
        console.error('[FINALIZE] Server error:', error);
        return res.status(500).json({ error: 'Internal server error.', detail: error.message });
    }
}
