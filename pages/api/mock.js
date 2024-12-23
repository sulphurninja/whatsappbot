// pages/api/generatePDF.js
import { generateOSINTPDF } from "@/lib/generateOSINTPDF"; // Adjust the import path


export const mockTruecallerDetails = {
    data: [
        {
            name: 'John Doe',
            image: '', // Optional: Set image URL if required
            internetAddresses: [{ id: 'john@example.com' }],
            phones: [{ carrier: 'CarrierName', type: 'Mobile' }],
            addresses: [{ address: '1234 Main St' }]
        }
    ]
};

export const mockEyeconDetails = {
    otherNames: [
        { name: 'Jane Doe' },
        { name: 'Johnny Depp' }
    ]
};

export const mockMobNo = '1234567890';
export const mockUserPhoneNumber = '9876543210';



export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // Generate PDF buffer
            const pdfBuffer = await generateOSINTPDF(
                mockEyeconDetails,
                mockTruecallerDetails,
                mockMobNo,
                null, // No actual UPI details
                mockUserPhoneNumber
            );

            // Convert the PDF buffer to a Base64 string
            const pdfBase64 = pdfBuffer.toString('base64');

            // Send the base64 string as a response
            res.status(200).json({ pdfBase64 });
        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).json({ error: 'Failed to generate PDF' });
        }
    } else {
        // Handle non-GET requests
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
