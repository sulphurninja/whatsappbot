import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { verifyUPI } from './verifyUPI';

const fetchImageAsBase64 = async (imageUrl) => {
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary').toString('base64');
    } catch (error) {
        console.error('Error fetching image:', error);
        return null;
    }
};

const addStyledContainerWithMessage = (doc, x, y, width, height, borderRadius, borderColor, heading, content, iconPath, fontSize = 12, lineHeight = 10) => {
    doc.setFillColor(5, 7, 30);
    doc.roundedRect(x, y, width, height, borderRadius, borderRadius, 'F');
    doc.setDrawColor(...borderColor);
    doc.roundedRect(x, y, width, height, borderRadius, borderRadius);

    if (heading) {
        if (iconPath) {
            const iconData = fs.readFileSync(iconPath).toString('base64');
            doc.addImage(`data:image/png;base64,${iconData}`, 'PNG', x + 10, y + 5, 8, 8);
        }
        doc.setFontSize(fontSize + 2);
        doc.setFont('helvetica', 'bold');
        doc.text(heading, x + 20, y + 10.5);
    }

    const finalContent = content.length > 0 ? content : ['This record was not found for the subject'];
    // Set smaller font size for content under 'CONFIDENTIAL'
    doc.setFontSize(fontSize - 2); // Decreased font size for the content
    doc.setFont('helvetica', 'normal');
    // Wrap text within container width
    const maxTextWidth = width - 20; // 10px padding on both sides
    let yOffset = y + 20;

    finalContent.forEach((line, index) => {
        const lines = doc.splitTextToSize(line, maxTextWidth);
        lines.forEach((wrappedLine, wrappedIndex) => {
            // If the content is under 'CONFIDENTIAL', apply smaller line height
            const isConfidential = heading === 'CONFIDENTIAL: For Authorized Law Enforcement Only';
            const adjustedLineHeight = isConfidential ? 7 : lineHeight; // Smaller line height for 'CONFIDENTIAL' content
            doc.text(wrappedLine, x + 10, yOffset + (index + wrappedIndex) * adjustedLineHeight);
        });
    });
};

// Add WhatsApp Account and Facebook Account sections
const addAccountSection = (doc, x, y, width, height, heading, iconPath, content) => {
    addStyledContainerWithMessage(
        doc,
        x,
        y,
        width,
        height,
        5,
        [8, 167, 158],
        heading,
        content,
        iconPath,
        12, // Font size for the content
        10 // Line height
    );
};

// Add Other Platform Usage grid
const addPlatformUsageSection = (doc, x, y, width, height, heading, content) => {
    doc.setFillColor(5, 7, 30);
    doc.roundedRect(x, y, width, height, 5, 5, 'F');
    doc.setDrawColor(8, 167, 158);
    doc.roundedRect(x, y, width, height, 5, 5);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(heading, x + 10, y + 10);

    const maxTextWidth = (width - 20) / 2; // 2 columns, each with half width
    let yOffset = y + 25;

    // Loop through the content to create grid layout (2 columns)
    content.forEach((item, index) => {
        const columnX = x + (index % 2) * (maxTextWidth + 10);
        const columnY = yOffset + Math.floor(index / 2) * 20;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        doc.text(item.name, columnX + 10, columnY);
        doc.addImage(item.icon, 'PNG', columnX + maxTextWidth - 10, columnY - 5, 15, 15);
    });
};


export const generateOSINTPDF = async (eyeconDetails, truecallerDetails, mobNo, upiDetails, userPhoneNumber, breachDetails) => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const setBackgroundColor = () => {
            doc.setFillColor(5, 7, 30);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
        };
        setBackgroundColor();

        doc.setTextColor(255, 255, 255);

        const logoPath = path.join(process.cwd(), 'public', 'logo.png');
        const logoData = fs.readFileSync(logoPath).toString('base64');
        const imgProps = doc.getImageProperties(`data:image/png;base64,${logoData}`);
        const imgWidth = 50;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        doc.addImage(`data:image/png;base64,${logoData}`, 'PNG', (pageWidth - imgWidth) / 2, 10, imgWidth, imgHeight, '', 'FAST');

        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Garuda Intelligence Report', pageWidth / 2, imgHeight + 15, { align: 'center' });

        let yOffset = imgHeight + 30;

        const confidentialHeight = 50;
        addStyledContainerWithMessage(
            doc,
            10,
            yOffset,
            pageWidth - 20,
            confidentialHeight,
            5,
            [8, 167, 158],
            'CONFIDENTIAL: For Authorized Law Enforcement Only',
            [
                `This Garuda Intelligence report details the subject’s digital footprint, sourced from public information and corporate verification tools. It is strictly prohibited to share or distribute this report through public channels such as WhatsApp, Telegram, or social media. Handle all data discreetly, in compliance with relevant laws, and ensure proper consent before any use of this information.`
            ],
            path.join(process.cwd(), 'public', 'icons', 'disclaimer-icon.png'),
            11, // Font size (optional, adjust as needed)
            7 // Default line height for other sections
        );
        yOffset += confidentialHeight + 10;

        const currentDate = new Date().toLocaleDateString();
        addStyledContainerWithMessage(
            doc,
            10,
            yOffset,
            pageWidth - 20,
            confidentialHeight,
            5,
            [8, 167, 158],
            'Subject Information',
            [
                `Phone Number: ${mobNo}`,
                `Date of Report: ${currentDate}`,
                `Report Generated by: ${userPhoneNumber}`,
            ],
            path.join(process.cwd(), 'public', 'icons', 'user-icon.png'),

        );
        yOffset += confidentialHeight + 10;

        const namesContent = [
            `1. ${truecallerDetails.data[0]?.name || 'N/A'}`,
            ...eyeconDetails.otherNames.map((nameObj, index) => `${index + 2}. ${nameObj.name}`),
        ];
        const namesHeight = Math.max(40, 20 + namesContent.length * 10);
        addStyledContainerWithMessage(
            doc,
            10,
            yOffset,
            pageWidth - 20,
            namesHeight,
            5,
            [8, 167, 158],
            'Associated Names',
            namesContent,
            path.join(process.cwd(), 'public', 'icons', 'names-icon.png')
        );
        yOffset += namesHeight + 10;

        if (truecallerDetails.data[0]?.internetAddresses?.length > 0) {
            const emailContent = truecallerDetails.data[0].internetAddresses.map(email => `${email.id}`);
            const emailHeight = Math.max(40, emailContent.length * 10);
            addStyledContainerWithMessage(
                doc,
                10,
                yOffset,
                pageWidth - 20,
                emailHeight,
                5,
                [8, 167, 158],
                'Email & Internet Addresses',
                emailContent,
                path.join(process.cwd(), 'public', 'icons', 'email-icon.png')
            );
            yOffset += emailHeight + 10;
        } else {
            addStyledContainerWithMessage(
                doc,
                10,
                yOffset,
                pageWidth - 20,
                50,
                5,
                [8, 167, 158],
                'Email & Internet Addresses',
                ['No records found'],
                path.join(process.cwd(), 'public', 'icons', 'email-icon.png')
            );
            yOffset += 60;
        }

        // Check if there is enough space for Carrier Info, if not, add a new page
        const carrierInfoHeight = 60;
        if (yOffset + carrierInfoHeight > pageHeight - 10) {
            doc.addPage();
            setBackgroundColor();
            yOffset = 10;
        }

        if (truecallerDetails.data[0]?.phones?.length > 0) {
            const carrierInfo = [
                `Mobile: ${mobNo}`,
                `Carrier: ${truecallerDetails.data[0]?.phones[0]?.carrier || 'N/A'}`,
                `Type: ${truecallerDetails.data[0]?.phones[0]?.type || 'N/A'}`,
                truecallerDetails.data[0]?.addresses?.length > 0
                    ? `Address: ${truecallerDetails.data[0]?.addresses[0]?.address || 'N/A'}`
                    : 'Address: N/A',
            ];
            addStyledContainerWithMessage(
                doc,
                10,
                yOffset,
                pageWidth - 20,
                carrierInfoHeight,
                5,
                [8, 167, 158],
                'Carrier Info',
                carrierInfo,
                path.join(process.cwd(), 'public', 'icons', 'carrier-icon.png')
            );
            yOffset += carrierInfoHeight + 10;
        } else {
            addStyledContainerWithMessage(
                doc,
                10,
                yOffset,
                pageWidth - 20,
                50,
                5,
                [8, 167, 158],
                'Carrier Info',
                ['No records found'],
                path.join(process.cwd(), 'public', 'icons', 'carrier-icon.png')
            );
            yOffset += 60;
        }

        const upiResults = await verifyUPI(mobNo);
        if (upiResults.length > 0) {
            const upiContent = upiResults.map(
                (upiResult, index) =>
                    `${index + 1}. UPI Handle: ${upiResult.vpaAddress} ${"     "}  UPI Exists`
            );
            const upiHeight = Math.max(40, upiContent.length * 20);
            if (yOffset + upiHeight > pageHeight - 10) {
                doc.addPage();
                setBackgroundColor();
                yOffset = 10;
            }
            addStyledContainerWithMessage(
                doc,
                10,
                yOffset,
                pageWidth - 20,
                upiHeight,
                5,
                [8, 167, 158],
                'Verified UPI Addresses',
                upiContent,
                path.join(process.cwd(), 'public', 'icons', 'upi-icon.png')
            );
            yOffset += upiHeight + 10;
        }



        // WhatsApp Account section
        addAccountSection(
            doc,
            10,
            yOffset,
            pageWidth - 20,
            50,
            'WhatsApp Account',
            path.join(process.cwd(), 'public', 'icons', 'whatsapp-icon.png'),
            ['Service currently Under Maintenance, will be back shortly!']
        );
        yOffset += 60;

        // Facebook Account section
        addAccountSection(
            doc,
            10,
            yOffset,
            pageWidth - 20,
            50,
            'Facebook Account',
            path.join(process.cwd(), 'public', 'icons', 'facebook-icon.png'),
            ['Service currently Under Maintenance, will be back shortly!']
        );

        doc.addPage();
        setBackgroundColor();
        yOffset = 10; // Reset yOffset to top of the page
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);  // White color for text
        doc.text('Source Images', pageWidth / 2, 20, { align: 'center' });
        yOffset = 40;  // Start from 40px below the title
        if (truecallerDetails.data[0].image) {
            const truecallerImageBase64 = await fetchImageAsBase64(truecallerDetails.data[0].image);
            if (truecallerImageBase64) {
                doc.addImage(`data:image/jpeg;base64,${truecallerImageBase64}`, 'JPEG', 10, yOffset, 50, 50, '', 'FAST');
                yOffset += 60; // Adjust the next starting point after image
            }
        }

        doc.addPage();
        setBackgroundColor();
        yOffset = 10; // Reset yOffset to top of the page
        if (breachDetails?.success && breachDetails?.found > 0) {
            const breachContent = breachDetails.result.map(
                (breach, index) =>
                    `${index + 1}. Email: ${breach.email}\n   Source: ${breach.sources || 'N/A'}\n   Password Leaked: ${breach.has_password ? 'Yes' : 'No'}`
            );
            const breachHeight = Math.max(40, breachContent.length * 20);
            if (yOffset + breachHeight > pageHeight - 10) {
                doc.addPage();
                setBackgroundColor();
                yOffset = 10;
            }
            addStyledContainerWithMessage(
                doc,
                10,
                yOffset,
                pageWidth - 20,
                breachHeight,
                5,
                [8, 167, 158],
                'Email Breach Details ',
                breachContent,
                path.join(process.cwd(), 'public', 'icons', 'breach-icon.png')
            );
            yOffset += breachHeight + 10;
        } else {
            addStyledContainerWithMessage(
                doc,
                10,
                yOffset,
                pageWidth - 20,
                50,
                5,
                [8, 167, 158],
                'Breach Details',
                ['No records found'],
                path.join(process.cwd(), 'public', 'icons', 'breach-icon.png')
            );
            yOffset += 60;
        }

        const disclaimer = `Legal Disclaimer for OSINT Report
The information in this Open Source Intelligence (OSINT) report is derived from publicly available data as of the creation date. This report is for informational purposes only and does not constitute legal advice. Use this information responsibly and in compliance with applicable laws.`;
        const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 40);
        const disclaimerHeight = disclaimerLines.length * 10;
        doc.addPage();
        setBackgroundColor();
        addStyledContainerWithMessage(
            doc,
            10,
            10,
            pageWidth - 20,
            disclaimerHeight + 20,
            5,
            [8, 167, 158],
            'Legal Disclaimer',
            disclaimerLines,
            path.join(process.cwd(), 'public', 'icons', 'disclaimer-icon.png')
        );

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        return pdfBuffer;
    } catch (error) {
        console.error('Error generating OSINT PDF:', error);
        throw new Error('Failed to generate OSINT PDF');
    }
};
