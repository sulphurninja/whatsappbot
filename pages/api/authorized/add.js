// pages/api/authorized/add.js

import mongoose from 'mongoose';
import AuthorizedNumber from '../../../models/AuthorizedNumber';

const uri = process.env.MONGODB_URI; // Add your MongoDB URI in .env.local

const addAuthorizedNumber = async (req, res) => {
    if (req.method === 'POST') {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ status: 'error', message: 'Phone number is required' });
        }

        try {
            await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

            const newNumber = new AuthorizedNumber({ phoneNumber });
            await newNumber.save();

            return res.status(200).json({ status: 'success', message: 'Phone number added' });
        } catch (error) {
            console.error('Error adding phone number:', error);
            return res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    }

    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
};

export default addAuthorizedNumber;
