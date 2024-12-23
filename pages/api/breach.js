import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { term } = req.query;

  if (!term) {
    return res.status(400).json({ error: "The 'term' query parameter is required." });
  }

  const options = {
    method: 'GET',
    url: 'https://breachdirectory.p.rapidapi.com/',
    params: {
      func: 'auto',
      term: term,
    },
    headers: {
      'x-rapidapi-key': '45b05e4d08mshac7d6214846049ep179e8ajsn602ed9322f24',
      'x-rapidapi-host': 'breachdirectory.p.rapidapi.com',
    },
  };

  try {
    const response = await axios.request(options);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while fetching data.' });
  }
}
