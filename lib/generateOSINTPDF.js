import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { verifyUPI } from './verifyUPI';
// import { fetchWhatsAppDetails } from './fetchWhatsAppDetails';

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

        const disclaimer = `
        This Open Source Intelligence (OSINT) report has been generated by Garuda Intelligence, a private organization, at the request of authorized law enforcement agencies. The information contained within is sourced from publicly accessible data and digital verification tools available at the time of creation.
        
        By using this report, the following terms and conditions apply:
        
        1. **Authorized Use**: This report is intended solely for law enforcement personnel conducting legitimate investigations as outlined by applicable laws. The requesting agency holds full responsibility for ensuring the appropriate use of this report.
        
        2. **Compliance with Legal Standards**: The use of this report must align with all relevant Indian legislation, including but not limited to the Information Technology Act, 2000, the Bharatiya Nyaya Sanhita (BNS), the Bharatiya Nagarik Suraksha Sanhita (BNSS), the Bharatiya Sakshya Adhiniyam (BSA), and applicable provisions of the Indian Constitution, especially Article 21 regarding the Right to Privacy.
        
        3. **Data Protection**: Garuda Intelligence has compiled this report in compliance with applicable data protection laws. However, the responsibility for ensuring compliance with data protection regulations lies with the law enforcement agency using this report.
        
        4. **Verification of Information**: The information provided in this report is based on Open Source Intelligence techniques and must be independently verified by the law enforcement agency through appropriate legal channels prior to taking any formal action.
        
        5. **Confidentiality**: This report is confidential and must not be shared or distributed outside the official investigation for which it was created. The law enforcement agency is responsible for maintaining its confidentiality.
        
        6. **Limitation of Liability**: Garuda Intelligence is not liable for any consequences arising from the use or reliance on this report. The information is provided in good faith, but no guarantee is made regarding its accuracy, completeness, or reliability.
        
        7. **Not Legal Advice**: This report is not a substitute for legal counsel. The law enforcement agency should consult with its legal advisors to determine the appropriate use of the information contained in this report within investigations and legal proceedings.
        
        8. **Ethical Use**: While Garuda Intelligence follows ethical OSINT practices, the responsibility for ensuring that the report is used in accordance with the highest ethical standards lies with the law enforcement agency, ensuring that individual rights are respected throughout legitimate investigations.
        
        9. **Contractual Terms**: The use of this report is governed by the terms and conditions outlined in the agreement between Garuda Intelligence and the requesting law enforcement agency.
        
        By accepting this report, the law enforcement agency agrees to comply with these terms. It is the responsibility of the agency to ensure that all personnel using this report understand and follow these conditions.`;

        const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 10);
        const maxLinesPerPage = Math.floor((pageHeight - 10) / 8.5); // Estimate max lines per page
        let currentPageLines = [];
        let remainingLines = [...disclaimerLines];

        while (remainingLines.length > 0) {
            const linesToAdd = remainingLines.splice(0, maxLinesPerPage); // Get the lines for the current page
            currentPageLines = linesToAdd;

            // If not the first page, add a new page
            if (currentPageLines !== disclaimerLines) {
                doc.addPage();
                setBackgroundColor();
                yOffset = 10; // Reset yOffset for the new page
            }

            // Calculate height for current content
            const contentHeight = currentPageLines.length * 10;
            addStyledContainerWithMessage(
                doc,
                10,
                yOffset,
                pageWidth - 20,
                contentHeight - 10,
                5,
                [8, 167, 158],
                'Legal Disclaimer',
                currentPageLines,
                path.join(process.cwd(), 'public', 'icons', 'disclaimer-icon.png'),
                10,
                7
            );

            yOffset = pageHeight - 10; // Move yOffset to the bottom of the page to ensure space for next section
        }
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        return pdfBuffer;
    } catch (error) {
        console.error('Error generating OSINT PDF:', error);
        throw new Error('Failed to generate OSINT PDF');
    }
};
