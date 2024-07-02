import { NextApiRequest, NextApiResponse } from 'next';

const fetchCallerName = (phoneNumber) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            hostname: 'eyecon.p.rapidapi.com',
            port: null,
            path: `/api/v1/search?code=91&number=${phoneNumber}`,
            headers: {
                'x-rapidapi-key': '94a8f4bf31mshecce5b4466541b7p1a1c60jsncf852dadff8f',
                'x-rapidapi-host': 'eyecon.p.rapidapi.com'
            }
        };

        const req = https.request(options, function (res) {
            const chunks = [];

            res.on('data', function (chunk) {
                chunks.push(chunk);
            });

            res.on('end', function () {
                const body = Buffer.concat(chunks);
                const data = JSON.parse(body.toString());
                resolve(data);
            });
        });

        req.on('error', function (error) {
            reject(error);
        });

        req.end();
    });
};

// Function to fetch vehicle details from RTO API
const fetchVehicleDetails = async (regNo) => {
    const options = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': '94a8f4bf31mshecce5b4466541b7p1a1c60jsncf852dadff8f',
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
        let templateName = ''; // Initialize template name

        // Check if message starts with 'VD'
        if (messageContent.startsWith('VD')) {
            try {
                // Extract vehicle registration number from message
                const regNo = messageContent.substring(3).trim(); // Assuming format is 'VD <reg_no>'

                // Fetch vehicle details
                const vehicleDetails = await fetchVehicleDetails(regNo);

                // Prepare formatted response
                const formattedResponse = `Vehicle Number: ${vehicleDetails.reg_no}\n` +
                    `RC Owner: ${vehicleDetails.owner_name}\n` +
                    `RC Father Name: ${vehicleDetails.owner_father_name}\n` +
                    `Present Address: ${vehicleDetails.current_address_line1}, ${vehicleDetails.current_address_line2}, ${vehicleDetails.current_address_line3}\n` +
                    `Permanent Address: ${vehicleDetails.permanent_address_line1}, ${vehicleDetails.permanent_address_line2}, ${vehicleDetails.permanent_address_line3}\n` +
                    `Mobile Number: ${vehicleDetails.mobile_no}\n` +
                    `Maker Model: ${vehicleDetails.vehicle_manufacturer_name} ${vehicleDetails.model}\n` +
                    `Vehicle Chassis: ${vehicleDetails.chassis_no}\n` +
                    `Engine Number: ${vehicleDetails.engine_no}\n` +
                    `Seat Capacity: ${vehicleDetails.vehicle_seat_capacity}\n` +
                    `Vehicle Type: ${vehicleDetails.vehicle_type}\n` +
                    `Vehicle Category: ${vehicleDetails.vehicle_catg}\n` +
                    `No Cylinders: ${vehicleDetails.cylinders_no}\n` +
                    `- Manufacture Date: ${vehicleDetails.manufacturing_yr}\n` +
                    `Color: ${vehicleDetails.color}\n` +
                    `Fuel Type: ${vehicleDetails.fuel_descr}\n` +
                    `Owner Number: ${vehicleDetails.mobile_no}\n` +
                    `Registered Date: ${vehicleDetails.reg_date}\n` +
                    `RC Expire Date: ${vehicleDetails.reg_upto}\n` +
                    `RC Registration Type: ${vehicleDetails.reg_type_descr}\n` +
                    `RC Status: ${vehicleDetails.status}\n` +
                    `RTO: ${vehicleDetails.office_name}, ${vehicleDetails.state}\n` +
                    `Permit Type: -\n` +
                    `Insurance Company: ${vehicleDetails.vehicle_insurance_details?.insurance_company_name || 'Not Available'}\n` +
                    `Insurance Policy No: ${vehicleDetails.vehicle_insurance_details?.policy_no || 'Not Available'}\n` +
                    `Financer: ${vehicleDetails.financer_details?.financer_name || 'Not Available'}\n` +
                    `Maker Company: ${vehicleDetails.vehicle_manufacturer_name}\n` +
                    `------------------------------\n` +
                    `Owner Aadhar: -\n` +
                    `Owner PAN: -\n` +
                    `Owner Email: -\n` +
                    `Purchasing Amount: -\n` +
                    `Registration Type: -\n` +
                    `------------------------------\n` +
                    `Dealer Information\n` +
                    `Dealer Name: ${vehicleDetails.dealer_name}\n` +
                    `Address: ${vehicleDetails.dealer_address_line1}, ${vehicleDetails.dealer_address_line2}\n` +
                    `------------------------------\n` +
                    `Financier information\n` +
                    `Name: ${vehicleDetails.financer_details?.financer_name || 'Not Available'}\n` +
                    `Address: ${vehicleDetails.financer_details?.financer_address_line1 || 'Not Available'}, ${vehicleDetails.financer_details?.financer_address_line2 || 'Not Available'}`;

                // Set template name for vehicle details
                templateName = 'vehicle_details_template_fk';

                // Send WhatsApp message with formatted response
                await sendWhatsAppMessage(phoneNumber, templateName, formattedResponse);

                return res.status(200).json({ status: 'success' });
            } catch (error) {
                console.error('Error fetching or sending vehicle details:', error);
                return res.status(500).json({ status: 'error', message: 'Failed to fetch or send vehicle details' });
            }
        }
        // Check if message starts with 'name'
        if (messageContent.startsWith('name')) {
            try {
                // Extract phone number from message (assuming format is 'name {number}')
                const phoneNumber = messageContent.substring(5).trim(); // Extracts the number after 'name'

                // Fetch caller name from Eyecon API
                const callerInfo = await fetchCallerName(phoneNumber);

                // Prepare message body for 'names' template
                const messageBody = `${callerInfo.name} is calling you.`; // Adjust according to Eyecon API response structure

                // Set template name for caller name
                templateName = 'names';

                // Send WhatsApp message with caller name
                await sendWhatsAppMessage(phoneNumber, templateName, messageBody);

                return res.status(200).json({ status: 'success' });
            } catch (error) {
                console.error('Error fetching or sending caller name:', error);
                return res.status(500).json({ status: 'error', message: 'Failed to fetch or send caller name' });
            }
        }

        // For non 'VD' or 'name' messages, do not send any template
        return res.status(200).json({ status: 'success', message: 'No template sent' });
    }

    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
};