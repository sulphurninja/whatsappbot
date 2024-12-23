import axios from 'axios';

export const fetchWhatsAppDetails = async (mobile) => {
    const options = {
        method: 'POST',
        url: 'https://whatsapp-account-checker.p.rapidapi.com/digital/v1/whatsapp_checker',
        headers: {
            'x-rapidapi-key': '45b05e4d08mshac7d6214846049ep179e8ajsn602ed9322f24',
            'x-rapidapi-host': 'whatsapp-account-checker.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            mobile: mobile,
            consent: 'Y',
            consent_text: 'I hereby declare my consent agreement for fetching my information via AITAN Labs API'
        }
    };

    try {
        const response = await axios.request(options);

        if (response.status !== 200) {
            throw new Error('Failed to fetch WhatsApp details');
        }

        return response.data; // Return the WhatsApp account details
    } catch (error) {
        console.error('Error fetching WhatsApp details:', error);
        throw new Error('Failed to fetch WhatsApp details');
    }
};
