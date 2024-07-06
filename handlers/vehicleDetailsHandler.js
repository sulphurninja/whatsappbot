// handlers/vehicleDetailsHandler.js
import { fetchVehicleDetails } from '../lib/fetchVehicleDetails';
import { sendWhatsAppMessage } from '../lib/sendWhatsappMessage';

export const handleVehicleDetails = async (userPhoneNumber, messageContent) => {
    try {
        const regNo = messageContent.substring(2).trim(); // Assuming format is 'vd <reg_no>'
        const vehicleDetails = await fetchVehicleDetails(regNo);

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

        const sanitizedBodyValues = bodyValues.map(value => value !== null && value !== undefined ? value.toString() : 'Not Available');
        const templateName = 'vehicle_details_template_fk';

        await sendWhatsAppMessage(userPhoneNumber, templateName, '', sanitizedBodyValues);
    } catch (error) {
        console.error('Error fetching or sending vehicle details:', error);
        throw new Error('Failed to fetch or send vehicle details');
    }
};
