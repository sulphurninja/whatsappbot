// pages/api/authorized/fetch.js

import mongoose from 'mongoose';
import AuthorizedNumber from '../../../models/AuthorizedNumber';

const uri = process.env.MONGODB_URI; // Add your MongoDB URI in .env.local

const fetchAuthorizedNumbers = async (req, res) => {
    if (req.method === 'GET') {
        try {
            await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            const authorizedNumbers = await AuthorizedNumber.find().exec();

            return res.status(200).json({ status: 'success', data: authorizedNumbers });
        } catch (error) {
            console.error('Error fetching authorized numbers:', error);
            return res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    }

    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
};

export default fetchAuthorizedNumbers;
