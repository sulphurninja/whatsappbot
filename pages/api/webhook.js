// pages/api/webhook.js

import { NextApiRequest, NextApiResponse } from 'next';
import { fetchEyeconDetails } from '../../lib/fetchEyeconDetails';
import { fetchVehicleDetails } from '../../lib/fetchVehicleDetails';
import { fetchTruecallerDetails } from '../../lib/fetchTruecallerDetails';
import { sendWhatsAppMessage } from '../../lib/sendWhatsappMessage';

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
        const authorizedPhoneNumbers = ['9850750188', '7499247072', '9130867715'];

        // Check if sender is authorized
        if (!authorizedPhoneNumbers.includes(userPhoneNumber)) {
            return res.status(403).json({ status: 'error', message: 'Unauthorized access' });
        }

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

        if (['HELP', 'help', 'Help'].includes(messageContent)) {
            try {
                // Set template name for the help message
                templateName = 'help';

                // Send WhatsApp message with help template to the user who sent the message
                await sendWhatsAppMessage(userPhoneNumber, templateName, '');

                return res.status(200).json({ status: 'success' });
            } catch (error) {
                console.error('Error sending help message:', error);
                return res.status(500).json({ status: 'error', message: 'Failed to send help message' });
            }
        }

        if (messageContent.startsWith('name')) {
            try {
                // Extract phone number from message
                const enteredPhoneNumber = messageContent.substring(4).trim(); // Assuming format is 'name <number>'

                // Fetch details from Eyecon API
                const eyeconDetails = await fetchEyeconDetails(enteredPhoneNumber);

                // Prepare formatted response
                let formattedResponse = 'Names:\n';
                formattedResponse += eyeconDetails.fullName + '\n'; // Add main full name

                // Initialize other names list
                const otherNamesList = [];

                // Add other names to the list
                eyeconDetails.otherNames.forEach((item, index) => {
                    otherNamesList.push(item.name);
                });

                // Ensure at least 3 items for Interakt template
                while (otherNamesList.length < 3) {
                    otherNamesList.push(' '); // Add empty whitespace for missing names
                }

                // Prepare body values for Interakt API
                const bodyValues = [
                    eyeconDetails.fullName,
                    ...otherNamesList.slice(0, 3) // Take only first 3 names or empty spaces
                ];

                // Set template name for the WhatsApp message
                templateName = 'names';

                // Send WhatsApp message with formatted response to the user who sent the message
                await sendWhatsAppMessage(userPhoneNumber, templateName, formattedResponse, bodyValues);

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
