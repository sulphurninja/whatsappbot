import axios from 'axios';

export const sendWhatsAppMessage = async (phoneNumber, message) => {
    const response = await axios.post('https://api.interakt.ai/v1/public/message', {
        phoneNumber: phoneNumber,
        textMessage: {
            text: message
        }
    }, {
        headers: {
            "Authorization": `Basic ${process.env.INTERAKT_API_KEY}`,
            "Content-Type": "application/json"
        }
    });
    return response.data;
};
