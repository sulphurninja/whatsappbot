// handlers/vehicleDetailsHandler.js
import { fetchVehicleDetails } from '../lib/fetchVehicleDetails';
import { sendWhatsAppMessage } from '../lib/sendWhatsappMessage';

export const handleVehicleDetails = async (userPhoneNumber, messageContent) => {
    try {
        const regNo = messageContent.substring(2).trim(); // Assuming format is 'vd <reg_no>'
        const vehicleDetails = await fetchVehicleDetails(regNo);

        // Ensure the order and the required fields are matched for the WhatsApp template
        const bodyValues = [
            vehicleDetails.reg_no,  // {{1}} Vehicle Number
            vehicleDetails.owner_name,  // {{2}} RC Owner
            vehicleDetails.owner_father_name,  // {{3}} RC Father Name
            `${vehicleDetails.current_address_line1}, ${vehicleDetails.current_address_line2}, ${vehicleDetails.current_address_line3}`,  // {{4}} Present Address
            `${vehicleDetails.permanent_address_line1}, ${vehicleDetails.permanent_address_line2}, ${vehicleDetails.permanent_address_line3}`,  // {{5}} Permanent Address
            vehicleDetails.mobile_no,  // {{6}} Mobile Number
            `${vehicleDetails.vehicle_manufacturer_name} ${vehicleDetails.model}`,  // {{7}} Maker Model
            vehicleDetails.chassis_no,  // {{8}} Vehicle Chassis
            vehicleDetails.engine_no,  // {{9}} Engine Number
            vehicleDetails.vehicle_seat_capacity,  // {{10}} Seat Capacity
            vehicleDetails.vehicle_type,  // {{11}} Vehicle Type
            vehicleDetails.vehicle_catg,  // {{12}} Vehicle Category
            vehicleDetails.cylinders_no,  // {{13}} No Cylinders
            vehicleDetails.manufacturing_yr,  // {{14}} Manufacture Date
            vehicleDetails.color,  // {{15}} Color
            vehicleDetails.fuel_descr,  // {{16}} Fuel Type
            vehicleDetails.mobile_no,  // {{17}} Owner Number (same as mobile_no)
            vehicleDetails.reg_date,  // {{18}} Registered Date
            vehicleDetails.reg_upto,  // {{19}} RC Expire Date
            vehicleDetails.reg_type_descr,  // {{20}} RC Registration Type
            vehicleDetails.status,  // {{21}} RC Status
            `${vehicleDetails.office_name}, ${vehicleDetails.state}`,  // {{22}} RTO
            '-',  // {{23}} Permit Type (Not Available)
            vehicleDetails.vehicle_insurance_details?.insurance_company_name || 'N/A',  // {{24}} Insurance Company
            vehicleDetails.vehicle_insurance_details?.policy_no || 'N/A',  // {{25}} Insurance Policy No
            vehicleDetails.financer_details?.financer_name || 'N/A',  // {{26}} Financer: Maker Company
        ];

        // Ensure all values are sanitized, replacing null or undefined with 'N/A'
        const sanitizedBodyValues = bodyValues.map(value => value !== null && value !== undefined ? value.toString() : 'N/A');

        const templateName = 'vehicle_details_template_fk';

        // Send the sanitized body values to WhatsApp message
        await sendWhatsAppMessage(userPhoneNumber, templateName, '', sanitizedBodyValues);
    } catch (error) {
        console.error('Error fetching or sending vehicle details:', error);
        throw new Error('Failed to fetch or send vehicle details');
    }
};
