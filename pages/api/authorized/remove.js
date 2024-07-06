// pages/api/authorized/remove.js

import mongoose from 'mongoose';
import AuthorizedNumber from '../../../models/AuthorizedNumber';

const uri = process.env.MONGODB_URI; // Add your MongoDB URI in .env.local

const removeAuthorizedNumber = async (req, res) => {
    if (req.method === 'POST') {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ status: 'error', message: 'Phone number is required' });
        }

        try {
            await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

            await AuthorizedNumber.deleteOne({ phoneNumber });

            return res.status(200).json({ status: 'success', message: 'Phone number removed' });
        } catch (error) {
            console.error('Error removing phone number:', error);
            return res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    }

    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
};

export default removeAuthorizedNumber;
