// handlers/osintHandler.js

import { verifyUPI } from '@/lib/verifyUPI';
import { fetchEyeconDetails } from '../lib/fetchEyeconDetails';
import { fetchTruecallerDetails } from '../lib/fetchTruecallerDetails';
import { generateOSINTPDF } from '../lib/generateOSINTPDF';
import { sendDocumentMessage } from '../lib/sendWhatsappDocumentMessage';
import fs from 'fs';
import path from 'path';

export const handleOSINT = async (userPhoneNumber, mobNo) => {
    try {

        const eyeconDetails = await fetchEyeconDetails(mobNo);
        console.log(eyeconDetails, 'eyecon details');

        // Fetch details from Truecaller API
        const truecallerDetails = await fetchTruecallerDetails(mobNo);
        console.log(truecallerDetails, 'truecaller');

        // Fetch UPI details
        // const upiDetails = await verifyUPI(mobNo);
        // console.log(upiDetails, 'upi details');

        // Generate PDF with OSINT data
        const pdfBuffer = await generateOSINTPDF(eyeconDetails, truecallerDetails, mobNo);

        // Save the PDF to a public directory
        // const pdfPath = path.join(process.cwd(), 'public', `${mobNo}_OSINT_Report.pdf`);
        // fs.writeFileSync(pdfPath, pdfBuffer);

        // Generate the URL for the PDF
        // const mediaUrl = `https://www.dropbox.com/scl/fi/ceuq6q6rwrh41nszos8jt/osint-report-10.pdf? const pdfBuffer = await generateOSINTPDF(eyeconDetails, truecallerDetails, mobNo, upiDetails);

        // Call the API route to upload PDF to Dropbox and get media URL
        const filename = `${mobNo}_OSINT_Report.pdf`;
        const response = await axios.post('/api/upload', {
            pdfBuffer: pdfBuffer.toString('base64'),
            filename
        });

        const mediaUrl = response.data.mediaUrl;

        // Send the document message via WhatsApp
        await sendDocumentMessage(userPhoneNumber, 'Here is your OSINT report.', mediaUrl);

        console.log('OSINT report sent successfully');
    } catch (error) {
        console.error('Error handling OSINT:', error);
        throw new Error('Failed to handle OSINT request');
    }
};
