import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import cloudinary from 'cloudinary';
import pdf from 'html-pdf';

// Cloudinary configuration
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

// Function to generate PDF from HTML
const generatePDF = async (vehicleDetails) => {
    const html = `
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { margin: 20px; }
                    .header { text-align: center; }
                    .content { margin-top: 20px; }
                    .content h3 { margin: 0; }
                    .content p { margin: 5px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="path/to/your/logo.png" alt="Logo" style="width: 100px;">
                        <h2>Vehicle Details</h2>
                    </div>
                    <div class="content">
                        <h3>Vehicle Number:</h3><p>${vehicleDetails.reg_no}</p>
                        <h3>RC Owner:</h3><p>${vehicleDetails.owner_name}</p>
                        <h3>RC Father Name:</h3><p>${vehicleDetails.owner_father_name}</p>
                        <h3>Present Address:</h3><p>${vehicleDetails.current_address_line1}, ${vehicleDetails.current_address_line2}, ${vehicleDetails.current_address_line3}</p>
                        <h3>Permanent Address:</h3><p>${vehicleDetails.permanent_address_line1}, ${vehicleDetails.permanent_address_line2}, ${vehicleDetails.permanent_address_line3}</p>
                        <h3>Mobile Number:</h3><p>${vehicleDetails.mobile_no}</p>
                        <h3>Maker Model:</h3><p>${vehicleDetails.vehicle_manufacturer_name} ${vehicleDetails.model}</p>
                        <h3>Vehicle Chassis:</h3><p>${vehicleDetails.chassis_no}</p>
                        <h3>Engine Number:</h3><p>${vehicleDetails.engine_no}</p>
                        <h3>Seat Capacity:</h3><p>${vehicleDetails.vehicle_seat_capacity}</p>
                        <h3>Vehicle Type:</h3><p>${vehicleDetails.vehicle_type}</p>
                        <h3>Vehicle Category:</h3><p>${vehicleDetails.vehicle_catg}</p>
                        <h3>No Cylinders:</h3><p>${vehicleDetails.cylinders_no}</p>
                        <h3>Manufacture Date:</h3><p>${vehicleDetails.manufacturing_yr}</p>
                        <h3>Color:</h3><p>${vehicleDetails.color}</p>
                        <h3>Fuel Type:</h3><p>${vehicleDetails.fuel_descr}</p>
                        <h3>Owner Number:</h3><p>${vehicleDetails.mobile_no}</p>
                        <h3>Registered Date:</h3><p>${vehicleDetails.reg_date}</p>
                        <h3>RC Expire Date:</h3><p>${vehicleDetails.reg_upto}</p>
                        <h3>RC Registration Type:</h3><p>${vehicleDetails.reg_type_descr}</p>
                        <h3>RC Status:</h3><p>${vehicleDetails.status}</p>
                        <h3>RTO:</h3><p>${vehicleDetails.office_name}, ${vehicleDetails.state}</p>
                        <h3>Permit Type:</h3><p>-</p>
                        <h3>Insurance Company:</h3><p>${vehicleDetails.vehicle_insurance_details?.insurance_company_name || 'Not Available'}</p>
                        <h3>Insurance Policy No:</h3><p>${vehicleDetails.vehicle_insurance_details?.policy_no || 'Not Available'}</p>
                        <h3>Financer:</h3><p>${vehicleDetails.financer_details?.financer_name || 'Not Available'}</p>
                        <h3>Maker Company:</h3><p>${vehicleDetails.vehicle_manufacturer_name}</p>
                        <h3>Dealer Information</h3><p>Dealer Name: ${vehicleDetails.dealer_name}</p><p>Address: ${vehicleDetails.dealer_address_line1}, ${vehicleDetails.dealer_address_line2}</p>
                        <h3>Financier information</h3><p>Name: ${vehicleDetails.financer_details?.financer_name || 'Not Available'}</p><p>Address: ${vehicleDetails.financer_details?.financer_address_line1 || 'Not Available'}, ${vehicleDetails.financer_details?.financer_address_line2 || 'Not Available'}</p>
                    </div>
                </div>
            </body>
        </html>
    `;

    return new Promise((resolve, reject) => {
        pdf.create(html).toBuffer((err, buffer) => {
            if (err) return reject(err);
            resolve(buffer);
        });
    });
};

// Function to upload PDF to Cloudinary
const uploadPDFToCloudinary = async (pdfBuffer, fileName) => {
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream({ resource_type: 'auto', public_id: fileName }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result.secure_url);
            }
        }).end(pdfBuffer);
    });
};

// Function to send WhatsApp message via Interakt API
const sendWhatsAppMessage = async (phoneNumber, templateName, messageBody) => {
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

// Function to send WhatsApp message with a document via Interakt API
const sendWhatsAppMessageDocument = async (phoneNumber, mediaUrl) => {
    const payload = {
        countryCode: '+91',
        phoneNumber: phoneNumber,
        type: 'MediaDocument',
        mediaUrl: mediaUrl,
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

// Main API route handler
export default async (req, res) => {
    if (req.method === 'POST') {
        const { phoneNumber } = req.body;

        try {
            // Fetch data from the Eyecon API
            const details = await fetchEyeconDetails(phoneNumber);

            if (details) {
                // Extract the name from the details
                const { name } = details;

                // Fetch vehicle details from the RTO API using the name
                const vehicleDetails = await fetchVehicleDetails(name);

                // Generate the PDF
                const pdfBuffer = await generatePDF(vehicleDetails);

                // Upload the PDF to Cloudinary
                const fileName = `vehicle_details_${Date.now()}.pdf`;
                const pdfUrl = await uploadPDFToCloudinary(pdfBuffer, fileName);

                // Send the WhatsApp message with the PDF URL
                await sendWhatsAppMessage(phoneNumber, 'vehicle_details_template', `Please find the vehicle details at the following link: ${pdfUrl}`);

                // Send the WhatsApp message with the document
                await sendWhatsAppMessageDocument(phoneNumber, pdfUrl);

                res.status(200).json({ message: 'Vehicle details sent successfully' });
            } else {
                res.status(404).json({ message: 'Details not found' });
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
