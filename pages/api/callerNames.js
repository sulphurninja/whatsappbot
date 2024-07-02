// pages/api/eyecon.js

export default async function handler(req, res) {
    // Extract the phone number from the query parameters
    const { number } = req.query;

    // Ensure number is provided
    if (!number) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '94a8f4bf31mshecce5b4466541b7p1a1c60jsncf852dadff8f',
            'x-rapidapi-host': 'eyecon.p.rapidapi.com'
        }
    };

    try {
        // Make the API request with the dynamic phone number
        const response = await fetch(`https://eyecon.p.rapidapi.com/api/v1/search?code=91&number=${number}`, options);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
}
