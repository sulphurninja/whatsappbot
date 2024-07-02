import { NextApiRequest, NextApiResponse } from 'next';


const sendWhatsAppMessage = async (phoneNumber, vehicleData) => {
    const payload = {
        countryCode: '+91', // Replace with actual country code
        phoneNumber: "7276051102",
        type: 'Template',
        template: {
            name: 'vehicle_details_template', // Replace with your template name
            languageCode: 'en',
            bodyValues: [vehicleData], // Add more variables if required by your template
        },
    };

    await fetch('https://api.interakt.ai/v1/public/message/', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${process.env.INTERAKT_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
};

export default async (req = NextApiRequest, res = NextApiResponse) => {
    if (req.method === 'POST') {
        const { message } = req.body;

        // Respond to test webhook
        if (!message) {
            return res.status(200).json({ status: 'success', message: 'Webhook test successful' });
        }

        if (message && message.body && message.body.startsWith('VD ')) {
            const vehicleDetails = message.body.substring(3).trim();

            try {
                // Call your internal vehicle details API
                const response = await fetch(`https://garudawhatsappbot.vercel.app/api/rto?details=${encodeURIComponent(vehicleDetails)}`);
                const data = await response.json();

                // Send the response back to the user via Interakt API
                await sendWhatsAppMessage(message.from, data);

                return res.status(200).json({ status: 'success' });
            } catch (error) {
                console.error('Error fetching vehicle details:', error);
                return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
            }
        }
    }

    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
};
