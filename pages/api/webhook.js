import { NextApiRequest, NextApiResponse } from 'next';

// Function to send WhatsApp message via Interakt API
const sendWhatsAppMessage = async (phoneNumber, templateName, messageBody) => {
    const payload = {
        countryCode: '+91', // Replace with actual country code
        phoneNumber: phoneNumber,
        type: 'Template',
        template: {
            name: templateName, // Use the provided template name
            languageCode: 'en',
            bodyValues: [messageBody], // Pass the message body as a variable
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

export default async (req, res) => {
    if (req.method === 'POST') {
        const { data } = req.body;

        // Extract message content
        const messageContent = data.message.message;

        // Respond to test webhook
        if (!messageContent) {
            return res.status(200).json({ status: 'success', message: 'Webhook test successful' });
        }

        // Extract relevant details
        const phoneNumber = data.customer.phone_number;
        const templateName = messageContent.startsWith('VD') ? 'vehicle_details_template_fk' : 'names';

        try {
            // Send the appropriate template message
            await sendWhatsAppMessage(phoneNumber, templateName, messageContent);

            return res.status(200).json({ status: 'success' });
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to send WhatsApp message' });
        }
    }

    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
};
