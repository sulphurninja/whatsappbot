// lib/fetchEyeconDetails.js
export const fetchEyeconDetails = async (phoneNumber) => {
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
