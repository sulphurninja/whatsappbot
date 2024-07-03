import { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import cloudinary from 'cloudinary';

cloudinary.config({
    cloud_name: 'dxcer6hbg',
    api_key: '646238564143665',
    api_secret: 'S2YsiH6t8LBA0qpneCq69JjQJxo'
});
// Function to fetch details from Eyecon API
const fetchEyeconDetails = async (phoneNumber) => {
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '94a8f4bf31mshecce5b4466541b7p1a1c60jsncf852dadff8f',
            'x-rapidapi-host': 'eyecon.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(`https://eyecon.p.rapidapi.com/api/v1/search?code=91&number=${phoneNumber}`, options);
        if (!response.ok) {
            throw new Error('Failed to fetch data from Eyecon API');
        }
        const data = await response.json();
        return data.data; // Return only the data section of the response
    } catch (error) {
        console.error('Error fetching data from Eyecon API:', error);
        throw new Error('Failed to fetch data from Eyecon API');
    }
};


// Function to fetch vehicle details from RTO API
const fetchVehicleDetails = async (regNo) => {
    const options = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': '8ae3a5a678msheaa1dc19606c737p1d7676jsn8ca04b721932',
            'x-rapidapi-host': 'rto-vehicle-information-verification-india.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            reg_no: regNo,
            consent: 'Y',
            consent_text: 'I hear by declare my consent agreement for fetching my information via AITAN Labs API'
        })
    };

    try {
        const response = await fetch('https://rto-vehicle-information-verification-india.p.rapidapi.com/api/v1/rc/vehicleinfo', options);
        if (!response.ok) {
            throw new Error('Failed to fetch vehicle information');
        }
        const data = await response.json();
        return data.result; // Return only the result section of the response
    } catch (error) {
        console.error('Error fetching vehicle info:', error);
        throw new Error('Failed to fetch vehicle information');
    }
};


// Function to generate PDF
const generatePDF = async (vehicleDetails) => {
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const logoImageBytes = fs.readFileSync(path.join(process.cwd(), 'public', 'logo.png'));
    const logoImage = await pdfDoc.embedPng(logoImageBytes);
    const logoDims = logoImage.scale(0.5);

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12;

    // // Add the logo image at the top
    // page.drawImage(logoImage, {
    //     x: width / 2 - logoDims.width / 2,
    //     y: height - logoDims.height - 10,
    //     width: logoDims.width,
    //     height: logoDims.height,
    // });

    // Add vehicle details below the logo
    let yPosition = height - logoDims.height - 30;
    const lineHeight = fontSize + 4;

    const addTextLine = (text) => {
        page.drawText(text, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0,0,0),
        });
        yPosition -= lineHeight;
    };

    addTextLine(`Vehicle Number: ${vehicleDetails.reg_no}`);
    addTextLine(`RC Owner: ${vehicleDetails.owner_name}`);
    addTextLine(`RC Father Name: ${vehicleDetails.owner_father_name}`);
    addTextLine(`Present Address: ${vehicleDetails.current_address_line1}, ${vehicleDetails.current_address_line2}, ${vehicleDetails.current_address_line3}`);
    addTextLine(`Permanent Address: ${vehicleDetails.permanent_address_line1}, ${vehicleDetails.permanent_address_line2}, ${vehicleDetails.permanent_address_line3}`);
    addTextLine(`Mobile Number: ${vehicleDetails.mobile_no}`);
    addTextLine(`Maker Model: ${vehicleDetails.vehicle_manufacturer_name} ${vehicleDetails.model}`);
    addTextLine(`Vehicle Chassis: ${vehicleDetails.chassis_no}`);
    addTextLine(`Engine Number: ${vehicleDetails.engine_no}`);
    addTextLine(`Seat Capacity: ${vehicleDetails.vehicle_seat_capacity}`);
    addTextLine(`Vehicle Type: ${vehicleDetails.vehicle_type}`);
    addTextLine(`Vehicle Category: ${vehicleDetails.vehicle_catg}`);
    addTextLine(`No Cylinders: ${vehicleDetails.cylinders_no}`);
    addTextLine(`Manufacture Date: ${vehicleDetails.manufacturing_yr}`);
    addTextLine(`Color: ${vehicleDetails.color}`);
    addTextLine(`Fuel Type: ${vehicleDetails.fuel_descr}`);
    addTextLine(`Owner Number: ${vehicleDetails.mobile_no}`);
    addTextLine(`Registered Date: ${vehicleDetails.reg_date}`);
    addTextLine(`RC Expire Date: ${vehicleDetails.reg_upto}`);
    addTextLine(`RC Registration Type: ${vehicleDetails.reg_type_descr}`);
    addTextLine(`RC Status: ${vehicleDetails.status}`);
    addTextLine(`RTO: ${vehicleDetails.office_name}, ${vehicleDetails.state}`);
    addTextLine(`Permit Type: -`);
    addTextLine(`Insurance Company: ${vehicleDetails.vehicle_insurance_details?.insurance_company_name || 'Not Available'}`);
    addTextLine(`Insurance Policy No: ${vehicleDetails.vehicle_insurance_details?.policy_no || 'Not Available'}`);
    addTextLine(`Financer: ${vehicleDetails.financer_details?.financer_name || 'Not Available'}`);
    addTextLine(`Maker Company: ${vehicleDetails.vehicle_manufacturer_name}`);
    addTextLine(`Dealer Information`);
    addTextLine(`Dealer Name: ${vehicleDetails.dealer_name}`);
    addTextLine(`Address: ${vehicleDetails.dealer_address_line1}, ${vehicleDetails.dealer_address_line2}`);
    addTextLine(`Financier information`);
    addTextLine(`Name: ${vehicleDetails.financer_details?.financer_name || 'Not Available'}`);
    addTextLine(`Address: ${vehicleDetails.financer_details?.financer_address_line1 || 'Not Available'}, ${vehicleDetails.financer_details?.financer_address_line2 || 'Not Available'}`);

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
};

// Function to upload PDF to Cloudinary
const uploadPDFToCloudinary = async (pdfBytes, fileName) => {
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream({ resource_type: 'auto', public_id: fileName }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result.secure_url);
            }
        }).end(pdfBytes);
    });
};


// Function to send WhatsApp message via Interakt API
const sendWhatsAppMessage = async (phoneNumber, templateName, messageBody) => {
    // Sanitize message body for Interakt API
    const sanitizedBody = messageBody.replace(/[\n\r\t]/g, ' ');
    const payload = {
        countryCode: '+91',
        phoneNumber: phoneNumber,
        type: 'Template',
        template: {
            name: templateName,
            languageCode: 'en',
            bodyValues: [sanitizedBody],
        },
    };

    try {
        const response = await fetch('https://api.interakt.ai/v1/public/message/', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${process.env.INTERAKT_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const responseData = await response.json();
            throw new Error(`Interakt API error: ${responseData.message}`);
        }

        console.log('WhatsApp message sent successfully:', payload);
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw new Error('Failed to send WhatsApp message');
    }
};


// Function to send WhatsApp message via Interakt API
const sendWhatsAppMessageDocument = async (phoneNumber, mediaUrl) => {
    const payload = {
        countryCode: '+91',
        phoneNumber: phoneNumber,
        type: 'Document',
        data: {
            message: 'Here is your vehicle details document.',
            mediaUrl: mediaUrl,
        },
    };

    try {
        const response = await fetch('https://api.interakt.ai/v1/public/message/', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${process.env.INTERAKT_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const responseData = await response.json();
            throw new Error(`Interakt API error: ${responseData.message}`);
        }

        console.log('WhatsApp message sent successfully:', payload);
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw new Error('Failed to send WhatsApp message');
    }
};



export default async (req, res) => {
    if (req.method === 'POST') {
        const { data } = req.body;

        // Extract message content
        const messageContent = data.message.message;

        // Respond to test webhook
        if (!messageContent) {
            return res.status(200).json({ status: 'success', message: 'Webhook test successful' });
        }

        // Extract relevant details
        const phoneNumber = data.customer.phone_number;
        console.log(phoneNumber, 'phonenumber?')

        let templateName = ''; // Initialize template name

        // Check if message starts with 'VD'
        if (messageContent.startsWith('VD')) {
            try {
                // Extract vehicle registration number from message
                const regNo = messageContent.substring(3).trim(); // Assuming format is 'VD <reg_no>'

                // Fetch vehicle details
                const vehicleDetails = await fetchVehicleDetails(regNo);
                console.log(vehicleDetails, 'vehicle details')
                // Generate PDF
                const pdfBytes = await generatePDF(vehicleDetails);

                // Upload PDF to Cloudinary
                const cloudinaryUrl = await uploadPDFToCloudinary(pdfBytes, `${regNo}_vehicle_details.pdf`);

                // Send WhatsApp message with the Cloudinary URL
                await sendWhatsAppMessageDocument(phoneNumber, cloudinaryUrl);

                return res.status(200).json({ status: 'success' });
            } catch (error) {
                console.error('Error fetching or sending vehicle details:', error);
                return res.status(500).json({ status: 'error', message: 'Failed to fetch or send vehicle details' });
            }
        }



        // Check if message starts with 'name'
        if (messageContent.startsWith('name')) {
            try {
                // Extract phone number from message
                const phoneNumber = messageContent.substring(5).trim(); // Assuming format is 'name <number>'
                // Extract relevant details
                const userNumber = data.customer.phone_number;

                // const phoneNumber = data.customer.phone_number;
                console.log(phoneNumber, 'phonenumber?')
                // Fetch details from Eyecon API
                const eyeconDetails = await fetchEyeconDetails(phoneNumber);

                // Prepare formatted response
                let formattedResponse = 'Names:\n';
                formattedResponse += eyeconDetails.fullName + '\n'; // Add main full name

                // Add other names to the list
                eyeconDetails.otherNames.forEach((item, index) => {
                    formattedResponse += `${index + 1}. ${item.name}\n`;
                });

                // Set template name for the WhatsApp message
                const templateName = 'names';

                // Send WhatsApp message with formatted response
                await sendWhatsAppMessage(userNumber, templateName, formattedResponse);

                return res.status(200).json({ status: 'success' });
            } catch (error) {
                console.error('Error fetching or sending details:', error);
                return res.status(500).json({ status: 'error', message: 'Failed to fetch or send details' });
            }
        }

        // For non 'VD' messages, do not send any template
        return res.status(200).json({ status: 'success', message: 'No template sent' });
    }

    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
};
