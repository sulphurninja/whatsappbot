// pages/api/webhook.js

import { NextApiRequest, NextApiResponse } from 'next';
import { handleVehicleDetails } from '../../handlers/vehicleDetailsHandler';
import { handleName } from '../../handlers/nameHandler';
import { handleHelp } from '../../handlers/helpHandler';
import { handleOSINT } from '../../handlers/OSINTHandler'; // Import OSINT handler
import connectDB from '@/lib/db';
import AuthorizedNumber from '@/models/AuthorizedNumber';

connectDB();

export default async (req, res) => {
    if (req.method === 'POST') {
        const { data } = req.body;
        const messageContent = data.message.message.toLowerCase();
        const userPhoneNumber = data.customer.phone_number;
        const authorizedNumbers = await AuthorizedNumber.find().exec();
        const authorizedPhoneNumbers = authorizedNumbers.map(num => num.phoneNumber);

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
                case 'osint':
                case 'OSINT':
                case 'Osint':
                    const mobNo = messageContent.substring(6).trim(); // Extract mobile number
                    await handleOSINT(userPhoneNumber, mobNo); // Call OSINT handler with mobile number
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
