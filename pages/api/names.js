export default async (req, res) => {
    if (req.method === 'GET') {
      const url = 'https://eyecon.p.rapidapi.com/api/v1/search?code=91';
  
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '2a5693d34cmsh4d9d8123750aa5fp1c224fjsnc509101cb29e',
          'x-rapidapi-host': 'eyecon.p.rapidapi.com'
        }
      };
  
      try {
        const response = await fetch(url, options);
        const data = await response.text(); // Assuming the response is text. If JSON, use response.json() instead.
        res.status(200).json({ data });
      } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  };
  