import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    try {
        // Mock data for testing
        const eyeconDetails = {
            otherNames: [{ name: 'John Doe' }, { name: 'JD' }]
        };

        const truecallerDetails = {
            data: [
                {
                    name: 'Johnathan Doe',
                    image: null, // Replace with a valid image URL for testing
                    internetAddresses: [{ id: 'john.doe@example.com' }],
                    phones: [{ carrier: 'AT&T', type: 'Mobile' }],
                    addresses: [{ address: '123 Main St, Springfield' }]
                }
            ]
        };

        const mobNo = '1234567890';
        const userPhoneNumber = '9876543210';
        const upiDetails = [
            { vpaAddress: 'john.doe@upi', name_at_bank: 'John Doe' },
            { vpaAddress: 'j.doe@paytm', name_at_bank: 'John D.' }
        ];

        // Read logo from public folder
        const logoPath = path.join(process.cwd(), 'public', 'logo.png');
        const logoData = fs.existsSync(logoPath)
            ? fs.readFileSync(logoPath).toString('base64')
            : null;

        // Initialize PDF
        const doc = new jsPDF();

        // Add Logo
        if (logoData) {
            const imgWidth = 50;
            const imgProps = doc.getImageProperties(`data:image/png;base64,${logoData}`);
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
            const xOffset = (doc.internal.pageSize.getWidth() - imgWidth) / 2;
            doc.addImage(`data:image/png;base64,${logoData}`, 'PNG', xOffset, 10, imgWidth, imgHeight, '', 'FAST');
        }

        // Add Header
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Garuda Intelligence', doc.internal.pageSize.getWidth() / 2, 60, { align: 'center' });

        // Add Subject Information
        doc.setFontSize(14);
        doc.text('Subject Information', 20, 80);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Phone Number: ${mobNo}`, 20, 90);
        doc.text(`Date of Report: ${new Date().toLocaleDateString()}`, 20, 100);
        doc.text(`Report Generated by: ${userPhoneNumber}`, 20, 110);

        // Add Names Section
        let yPosition = 120;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Names:', 20, yPosition);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`1. ${truecallerDetails.data[0]?.name || 'N/A'}`, 30, yPosition + 10);
        eyeconDetails.otherNames.forEach((nameObj, index) => {
            yPosition += 10;
            doc.text(`${index + 2}. ${nameObj.name}`, 30, yPosition + 10);
        });

        // Add UPI Section
        yPosition += 20;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Verified UPI Addresses:', 20, yPosition);

        doc.setFontSize(12);
        upiDetails.forEach((upi, index) => {
            yPosition += 10;
            doc.text(`${index + 1}. UPI Handle: ${upi.vpaAddress}`, 30, yPosition);
            doc.text(`   Name at Bank: ${upi.name_at_bank}`, 30, yPosition + 10);
        });

        // Add Legal Disclaimer
        doc.addPage();
        const disclaimer = `
Legal Disclaimer for OSINT Report

The information in this Open Source Intelligence (OSINT) report is derived from publicly available data and online sources as of the creation date. The accuracy, completeness, and reliability of this information may vary and cannot be guaranteed. This report is for informational purposes only.
        `;
        const disclaimerLines = doc.splitTextToSize(disclaimer, 180);
        doc.text(disclaimerLines, 10, 20);

        // Generate PDF buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=mock-osint-report.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating mock PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
}
