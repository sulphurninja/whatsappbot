// lib/fetchTruecallerDetails.js
export const fetchTruecallerDetails = async (phoneNumber) => {
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '45b05e4d08mshac7d6214846049ep179e8ajsn602ed9322f24',
            'x-rapidapi-host': 'truecaller4.p.rapidapi.com'
        }
    };

    const url = `https://truecaller4.p.rapidapi.com/api/v1/getDetails?phone=${phoneNumber}&countryCode=IN`;

    try {
        const response = await fetch(url, options);
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
