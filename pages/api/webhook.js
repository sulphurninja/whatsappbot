// pages/api/webhook.js

import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import AuthorizedNumber from '@/models/AuthorizedNumber';

connectDB();

export default async (req, res) => {
    if (req.method === 'POST') {
        // For testing purposes, simply return a 200 OK response
        return res.status(200).json({ status: 'success', message: 'Received webhook notification' });
    }

    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
};
