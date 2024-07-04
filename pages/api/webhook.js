import { NextApiRequest, NextApiResponse } from 'next';

// Function to fetch details from Eyecon API
const fetchEyeconDetails = async (phoneNumber) => {
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '2a5693d34cmsh4d9d8123750aa5fp1c224fjsnc509101cb29e',
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
            'x-rapidapi-key': '2a5693d34cmsh4d9d8123750aa5fp1c224fjsnc509101cb29e',
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
const sendWhatsAppMessage = async (phoneNumber, templateName, messageBody, bodyValues = []) => {
    // Sanitize message body for Interakt API
    const sanitizedBody = messageBody.replace(/[\n\r\t]/g, ' ');
    const payload = {
        countryCode: '+91',
        phoneNumber: phoneNumber,
        type: 'Template',
        template: {
            name: templateName,
            languageCode: 'en',
            bodyValues: bodyValues.length ? bodyValues : [sanitizedBody],
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

        // Extract message content and normalize to lowercase
        const messageContent = data.message.message.toLowerCase();

        // Respond to test webhook
        if (!messageContent) {
            return res.status(200).json({ status: 'success', message: 'Webhook test successful' });
        }

        // Extract relevant details
        const userPhoneNumber = data.customer.phone_number; // Phone number of the user who sent the message
        let templateName = ''; // Initialize template name

        // Check if message starts with 'vd' or 'name'
        if (messageContent.startsWith('vd')) {
            try {
                // Extract vehicle registration number from message
                const regNo = messageContent.substring(2).trim(); // Assuming format is 'vd <reg_no>'

                // Fetch vehicle details
                const vehicleDetails = await fetchVehicleDetails(regNo);

                // Prepare body values array for template
                const bodyValues = [
                    vehicleDetails.reg_no,
                    vehicleDetails.owner_name,
                    vehicleDetails.owner_father_name,
                    `${vehicleDetails.current_address_line1}, ${vehicleDetails.current_address_line2}, ${vehicleDetails.current_address_line3}`,
                    `${vehicleDetails.permanent_address_line1}, ${vehicleDetails.permanent_address_line2}, ${vehicleDetails.permanent_address_line3}`,
                    vehicleDetails.mobile_no,
                    `${vehicleDetails.vehicle_manufacturer_name} ${vehicleDetails.model}`,
                    vehicleDetails.chassis_no,
                    vehicleDetails.engine_no,
                    vehicleDetails.vehicle_seat_capacity,
                    vehicleDetails.vehicle_type,
                    vehicleDetails.vehicle_catg,
                    vehicleDetails.cylinders_no,
                    vehicleDetails.manufacturing_yr,
                    vehicleDetails.color,
                    vehicleDetails.fuel_descr,
                    vehicleDetails.mobile_no,
                    vehicleDetails.reg_date,
                    vehicleDetails.reg_upto,
                    vehicleDetails.reg_type_descr,
                    vehicleDetails.status,
                    `${vehicleDetails.office_name}, ${vehicleDetails.state}`,
                    '-', // Assuming Permit Type is not available
                    vehicleDetails.vehicle_insurance_details?.insurance_company_name || 'Not Available',
                    vehicleDetails.vehicle_insurance_details?.policy_no || 'Not Available',
                    vehicleDetails.financer_details?.financer_name || 'Not Available'
                ];

                // Ensure all values are strings (Interakt API requires non-null values)
                const sanitizedBodyValues = bodyValues.map(value => {
                    if (value !== null && value !== undefined) {
                        return value.toString();
                    } else {
                        return 'Not Available';
                    }
                });

                // Set template name for vehicle details
                templateName = 'vehicle_details_template_fk';

                // Send WhatsApp message with body values
                await sendWhatsAppMessage(userPhoneNumber, templateName, '', sanitizedBodyValues);

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
                const enteredPhoneNumber = messageContent.substring(4).trim(); // Assuming format is 'name <number>'

                // Fetch details from Eyecon API
                const eyeconDetails = await fetchEyeconDetails(enteredPhoneNumber);

                // Prepare formatted response
                let formattedResponse = 'Names:\n';
                formattedResponse += eyeconDetails.fullName + '\n'; // Add main full name

                // Add other names to the list
                eyeconDetails.otherNames.forEach((item, index) => {
                    formattedResponse += `${index + 1}. ${item.name}\n`;
                });

                // Set template name for the WhatsApp message
                templateName = 'names';

                // Send WhatsApp message with formatted response to the user who sent the message
                await sendWhatsAppMessage(userPhoneNumber, templateName, formattedResponse);

                return res.status(200).json({ status: 'success' });
            } catch (error) {
                console.error('Error fetching or sending details:', error);
                return res.status(500).json({ status: 'error', message: 'Failed to fetch or send details' });
            }
        }

        // For non 'vd' and 'name' messages, do not send any template
        return res.status(200).json({ status: 'success', message: 'No template sent' });
    }

    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
};
