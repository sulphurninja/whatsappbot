// lib/fetchVehicleDetails.js
export const fetchVehicleDetails = async (regNo) => {
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
