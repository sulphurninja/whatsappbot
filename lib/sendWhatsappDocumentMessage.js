
export const sendDocumentMessage = async (phoneNumber, message, mediaUrl, callbackData = 'some_callback_data') => {
    const payload = {
        countryCode: '+91',
        phoneNumber: phoneNumber,
        type: 'Document',
        callbackData: callbackData,
        data: {
            message: message,
            mediaUrl: mediaUrl,
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
        console.log('Document message sent successfully:', payload);
    } catch (error) {
        console.error('Error sending document message:', error);
        throw new Error('Failed to send document message');
    }
};
