// lib/fetchVehicleDetails.js
export const fetchVehicleDetails = async (vid) => {
    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            Referer: 'docs.apiclub.in',
            'content-type': 'application/json',
            'API-KEY': 'apclb_zG6K6g92VAtD2o4AiyvprsTj3fce83f4'
        },
        body: JSON.stringify({ vehicleId: vid }) // Use vehicle ID in the payload
    };

    try {
        const response = await fetch('https://api.apiclub.in/api/v1/rc_info', options);

        if (!response.ok) {
            throw new Error('Failed to fetch vehicle information');
        }

        const data = await response.json();
        return data; // Return the full response data
    } catch (error) {
        console.error('Error fetching vehicle info:', error);
        throw new Error('Failed to fetch vehicle information');
    }
};
