// pages/api/webhook.js

import { NextApiRequest, NextApiResponse } from 'next';
import { handleVehicleDetails } from '../../handlers/vehicleDetailsHandler';
import { handleName } from '../../handlers/nameHandler';
import { handleHelp } from '../../handlers/helpHandler';

const authorizedPhoneNumbers = ['9850750188', '7499247072', '9130867715'];

export default async (req, res) => {
    if (req.method === 'POST') {
        const { data } = req.body;
        const messageContent = data.message.message.toLowerCase();
        const userPhoneNumber = data.customer.phone_number;

        if (!authorizedPhoneNumbers.includes(userPhoneNumber)) {
            return res.status(403).json({ status: 'error', message: 'Unauthorized access' });
        }

        const command = messageContent.split(' ')[0]; // Extract the command keyword

        try {
            switch (command) {
                case 'vd':
                    await handleVehicleDetails(userPhoneNumber, messageContent);
                    break;
                case 'name':
                    await handleName(userPhoneNumber, messageContent);
                    break;
                case 'help':
                case 'Help':
                case 'HELP':
                    await handleHelp(userPhoneNumber);
                    break;
                default:
                    return res.status(200).json({ status: 'success', message: 'No template sent' });
            }

            return res.status(200).json({ status: 'success' });
        } catch (error) {
            console.error('Error processing message:', error);
            return res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    }

    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
};
