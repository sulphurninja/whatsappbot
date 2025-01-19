// handlers/osintHandler.js

import { verifyUPI } from '@/lib/verifyUPI';
import { fetchEyeconDetails } from '../lib/fetchEyeconDetails';
import { fetchTruecallerDetails } from '../lib/fetchTruecallerDetails';
import { generateOSINTPDF } from '../lib/generateOSINTPDF';
import AWS from 'aws-sdk';
import { fetchDataBreach } from '@/lib/fetchBreachDetails';
import { sendDocumentMessage } from '@/lib/sendWhatsappDocumentMessage';

// Initialize AWS SDK
const s3 = new AWS.S3({
    accessKeyId: `${process.env.ACCESS_KEY}`,
    secretAccessKey: `${process.env.SECRET_KEY}`,
    region: 'ap-south-1'
});


export const handleOSINT = async (userPhoneNumber, mobNo) => {
    try {
        const eyeconDetails = await fetchEyeconDetails(mobNo);
        console.log(eyeconDetails, 'eyecon details');

        // Fetch details from Truecaller API
        const truecallerDetails = await fetchTruecallerDetails(mobNo);
        console.log(truecallerDetails, 'truecaller');


        const upiDetails = await verifyUPI(mobNo);
        console.log(upiDetails, 'upi details');

        // Check if an email exists in Truecaller details
        const email = truecallerDetails.data[0]?.internetAddresses?.[0]?.id || null;

        // Fetch breach details if email exists
        let breachDetails = null;
        // if (email) {
        //     breachDetails = await fetchDataBreach(email);
        //     console.log(breachDetails, 'breach details');
        // }

        // Generate PDF with OSINT data
        const pdfBuffer = await generateOSINTPDF(eyeconDetails, truecallerDetails, mobNo, upiDetails, userPhoneNumber, breachDetails);

        // Upload PDF to S3
        const uploadParams = {
            Bucket: 'whatsappbotgaruda',
            Key: `osint-reports/report-${mobNo}.pdf`, // Specify the path and name of the file in S3
            Body: pdfBuffer,
            ContentType: 'application/pdf'
        };

        const uploadResult = await s3.upload(uploadParams).promise();
        const mediaUrl = uploadResult.Location;
        console.log('File uploaded to S3:', mediaUrl);

        // Send the document message via WhatsApp
        await sendDocumentMessage(userPhoneNumber, 'Here is your OSINT report.', mediaUrl);

        console.log('OSINT report sent successfully');
    } catch (error) {
        console.error('Error handling OSINT:', error);
        throw new Error('Failed to handle OSINT request');
    }
};
