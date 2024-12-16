// pages/api/vehicleDetails.js
export default async function handler(req, res) {
  const { vid } = req.query; // Retrieve the vehicle ID from the request query parameters

  const options = {
      method: 'POST',
      headers: {
          accept: 'application/json',
          Referer: 'docs.apiclub.in',
          'content-type': 'application/json',
          'API-KEY': 'apclb_zG6K6g92VAtD2o4AiyvprsTj3fce83f4'
      },
      body: JSON.stringify({ vehicleId: vid }) // Plug in the vehicle ID
  };

  try {
      const response = await fetch('https://api.apiclub.in/api/v1/rc_info', options);

      if (!response.ok) {
          throw new Error(`Failed to fetch vehicle information: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data); // Log the response data to the console

      res.status(200).json(data); // Send the response data back to the client
  } catch (error) {
      console.error('Error fetching vehicle info:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
}
