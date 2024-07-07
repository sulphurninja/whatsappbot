// pages/api/osint.js

import { handleOSINT } from '../../../handlers/OSINTHandler';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { mobNo } = req.body;

    if (!mobNo) {
        return res.status(400).json({ message: 'Mobile number is required' });
    }

    try {
        const pdfBuffer = await handleOSINT(mobNo);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=osint_report.pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating OSINT PDF:', error);
        res.status(500).json({ message: 'Failed to generate OSINT PDF' });
    }
}
