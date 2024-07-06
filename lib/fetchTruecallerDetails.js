// lib/fetchTruecallerDetails.js
export const fetchTruecallerDetails = async () => {
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '2a5693d34cmsh4d9d8123750aa5fp1c224fjsnc509101cb29e',
            'x-rapidapi-host': 'truecaller4.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch('https://truecaller4.p.rapidapi.com/api/v1/getDetailsBulk', options);
        if (!response.ok) {
            throw new Error('Failed to fetch data from Truecaller API');
        }
        const data = await response.json();
        return data; // Return the data from the response
    } catch (error) {
        console.error('Error fetching data from Truecaller API:', error);
        throw new Error('Failed to fetch data from Truecaller API');
    }
};
