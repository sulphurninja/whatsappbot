// pages/api/sendMessage.js
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    const { userId, fullPhoneNumber, callbackData, message } = req.body;

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Basic OXdhT01vdnBya2VLUlNpMURiT3Q2ZU9nTU5lcV80clR6Z0NwV0lCcnNrazo=`);
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        userId: "+918600256200",
        fullPhoneNumber: "+919850750188",
        callbackData,
        type: "Text",
        data: {
            message: "Hii!!!! This is to test the interakt whatsapp bot api "
        }
    });

    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    try {
        const response = await fetch("https://api.interakt.ai/v1/public/message/", requestOptions);
        const result = await response.text();
        res.status(200).json({ result });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
}
