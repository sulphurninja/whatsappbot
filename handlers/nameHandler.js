// handlers/nameHandler.js
import { fetchEyeconDetails } from '../lib/fetchEyeconDetails';
import { sendWhatsAppMessage } from '../lib/sendWhatsappMessage';

export const handleName = async (userPhoneNumber, messageContent) => {
    try {
        const enteredPhoneNumber = messageContent.substring(4).trim(); // Assuming format is 'name <number>'
        const eyeconDetails = await fetchEyeconDetails(enteredPhoneNumber);

        const otherNamesList = eyeconDetails.otherNames.map(item => item.name);
        while (otherNamesList.length < 3) {
            otherNamesList.push(' ');
        }

        const bodyValues = [
            eyeconDetails.fullName,
            ...otherNamesList.slice(0, 3)
        ];

        const templateName = 'names';
        await sendWhatsAppMessage(userPhoneNumber, templateName, '', bodyValues);
    } catch (error) {
        console.error('Error fetching or sending details:', error);
        throw new Error('Failed to fetch or send details');
    }
};
