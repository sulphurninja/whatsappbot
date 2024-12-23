import fs from 'fs';
import { generateOSINTPDF } from './lib/generateOSINTPDF';

const testPDF = async () => {
    try {
        // Mock data for testing
        const eyeconDetails = {
            otherNames: [{ name: 'John Doe' }, { name: 'Johnny' }]
        };

        const truecallerDetails = {
            data: [
                {
                    name: 'John Smith',
                    image: 'https://example.com/truecaller_image.jpg', // Replace with a valid image URL
                    internetAddresses: [{ id: 'john.smith@example.com' }],
                    phones: [{ carrier: 'Airtel', type: 'Mobile' }],
                    addresses: [{ address: '123 Street, City, Country' }]
                }
            ]
        };

        const mobNo = '+1234567890';
        const upiDetails = {}; // Mock UPI details if needed
        const userPhoneNumber = '+0987654321';

        // Generate the PDF buffer
        const pdfBuffer = await generateOSINTPDF(eyeconDetails, truecallerDetails, mobNo, upiDetails, userPhoneNumber);

        // Save the PDF to the filesystem
        const filePath = 'testOSINTReport.pdf';
        fs.writeFileSync(filePath, pdfBuffer);
        console.log(`PDF saved to ${filePath}`);
    } catch (error) {
        console.error('Error testing PDF generation:', error);
    }
};

// Run the test
testPDF();
