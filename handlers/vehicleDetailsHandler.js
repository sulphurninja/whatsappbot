// handlers/vehicleDetailsHandler.js
import { fetchVehicleDetails } from '../lib/fetchVehicleDetails';
import { sendWhatsAppMessage } from '../lib/sendWhatsappMessage';

export const handleVehicleDetails = async (userPhoneNumber, messageContent) => {
    try {
        const regNo = messageContent.substring(2).trim(); // Assuming format is 'vd <reg_no>'
        const vehicleDetails = await fetchVehicleDetails(regNo);
        // Extract the 'response' object from the fetched data
        const response = vehicleDetails.response;

        const bodyValues = [
            response.license_plate || 'Not Available', // Registration number
            response.owner_name || 'Not Available',    // Owner's name
            response.father_name || 'Not Available',   // Father's name
            response.present_address || 'Not Available', // Current address
            response.permanent_address || 'Not Available', // Permanent address
            '-', // Mobile number (not provided in new API)
            `${response.brand_name || ''} ${response.brand_model || ''}`.trim() || 'Not Available', // Vehicle manufacturer and model
            response.chassis_number || 'Not Available', // Chassis number
            response.engine_number || 'Not Available',  // Engine number
            response.seating_capacity || 'Not Available', // Seating capacity
            response.class || 'Not Available',          // Vehicle type
            response.norms || 'Not Available',          // Vehicle category (Norms)
            response.cylinders || 'Not Available',      // Number of cylinders
            response.manufacturing_date_formatted || 'Not Available', // Manufacturing year
            response.color || 'Not Available',          // Vehicle color
            response.fuel_type || 'Not Available',      // Fuel type
            '-', // Mobile number placeholder
            response.registration_date || 'Not Available', // Registration dat
            response.fit_up_to || 'Not Available',      // Registration valid 
            vehicleDetails.reg_type_descr,
            response.rc_status || 'Not Available',      // Registration status
            response.rto_name || 'Not Available',       // RTO name and state
            response.permit_type || 'Not Available',    // Permit type
            response.insurance_company || 'Not Available', // Insurance comp
            response.insurance_policy || 'Not Available',  // Policy number
            response.financer || 'Not Available'        // Financer details
        ];

        const sanitizedBodyValues = bodyValues.map(value => value !== null && value !== undefined ? value.toString() : 'Not Available');
        const templateName = 'vehicle_details_template_fk';

        await sendWhatsAppMessage(userPhoneNumber, templateName, '', sanitizedBodyValues);
    } catch (error) {
        console.error('Error fetching or sending vehicle details:', error);
        throw new Error('Failed to fetch or send vehicle details');
    }
};
