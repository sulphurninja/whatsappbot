// lib/fetchVehicleDetails.js
import axios from 'axios';

export const fetchVehicleDetails = async (regNo) => {
    const options = {
        method: 'POST',
        url: 'https://vehicle-rc-verification-api3.p.rapidapi.com/api/v1/private/rc-advance',
        headers: {
            'x-rapidapi-key': '2a5693d34cmsh4d9d8123750aa5fp1c224fjsnc509101cb29e',
            'x-rapidapi-host': 'vehicle-rc-verification-api3.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            reg_no: regNo,
            consent: 'Y',
            consent_text: 'I hear by declare my consent agreement for fetching my information via AITAN Labs API'
        }
    };

    try {
        const response = await axios.request(options);
        if (response.data.status !== 'success') {
            throw new Error('Failed to fetch vehicle information');
        }
        return response.data.result; // Return only the result section of the response
    } catch (error) {
        console.error('Error fetching vehicle info:', error);
        throw new Error('Failed to fetch vehicle information');
    }
};
