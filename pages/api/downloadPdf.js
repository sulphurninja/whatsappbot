// pages/api/osint/pdf.js

import { NextApiRequest, NextApiResponse } from 'next';
import { handleOSINT } from '../../handlers/OSINTHandler';

export default async (req, res) => {
    if (req.method === 'GET') {
        const { mobNo } = req.query;

        try {
            // Generate the PDF for the given mobNo
            const pdfBuffer = await handleOSINT(mobNo);

            // Set response headers for PDF download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="osint-report.pdf"`);

            // Send the PDF as a response
            res.status(200).send(pdfBuffer);
        } catch (error) {
            console.error('Error generating or serving PDF:', error);
            res.status(500).json({ error: 'Failed to generate or serve PDF' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
};
