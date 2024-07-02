import { NextApiRequest, NextApiResponse } from 'next';

// Function to send WhatsApp message via Interakt API
const sendWhatsAppMessage = async (phoneNumber, vehicleData) => {
    const payload = {
        countryCode: '+91', // Replace with actual country code
        phoneNumber: phoneNumber,
        type: 'Template',
        template: {
            name: 'names', // Replace with your template name
            languageCode: 'en',
            bodyValues: "WOW", // Add more variables if required by your template
        },
    };

    try {
        const response = await fetch('https://api.interakt.ai/v1/public/message/', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${process.env.INTERAKT_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const responseData = await response.json();
            throw new Error(`Interakt API error: ${responseData.message}`);
        }

        console.log('WhatsApp message sent successfully:', payload);
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw new Error('Failed to send WhatsApp message');
    }
};

export default async (req = NextApiRequest, res = NextApiResponse) => {
    if (req.method === 'POST') {
        const { message } = req.body;

        // Respond to test webhook
        if (!message) {
            return res.status(200).json({ status: 'success', message: 'Webhook test successful' });
        }

        if (message && message.body && message.body.startsWith('names ')) {
            const vehicleDetails = message.body.substring(3).trim();

            try {
                // Send the template message directly
                await sendWhatsAppMessage(message.from, vehicleDetails);

                return res.status(200).json({ status: 'success' });
            } catch (error) {
                console.error('Error sending vehicle details template:', error);
                return res.status(500).json({ status: 'error', message: 'Failed to send vehicle details template' });
            }
        }
    }

    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
};
