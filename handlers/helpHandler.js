// handlers/helpHandler.js
import { sendWhatsAppMessage } from '../lib/sendWhatsappMessage';

export const handleHelp = async (userPhoneNumber) => {
    try {
        const templateName = 'help';
        await sendWhatsAppMessage(userPhoneNumber, templateName, ' ');
    } catch (error) {
        console.error('Error sending help message:', error);
        throw new Error('Failed to send help message');
    }
};
