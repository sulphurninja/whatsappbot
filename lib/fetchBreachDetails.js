export const fetchDataBreach = async (email) => {
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '45b05e4d08mshac7d6214846049ep179e8ajsn602ed9322f24',
            'x-rapidapi-host': 'breachdirectory.p.rapidapi.com'
        }
    };

    const url = `https://breachdirectory.p.rapidapi.com/?func=auto&term=${email}`;

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error('Failed to fetch data from BreachDirectory API');
        }
        const data = await response.json();
        return data; // Return the data from the response
    } catch (error) {
        console.error('Error fetching data from BreachDirectory API:', error);
        throw new Error('Failed to fetch data from BreachDirectory API');
    }
};
