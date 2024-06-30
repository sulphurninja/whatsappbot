import https from 'https';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reg_no, consent, consent_text } = req.body;

  const options = {
    method: 'POST',
    hostname: 'rto-vehicle-information-verification-india.p.rapidapi.com',
    port: null,
    path: '/api/v1/rc/vehicleinfo',
    headers: {
      'x-rapidapi-key': '2a5693d34cmsh4d9d8123750aa5fp1c224fjsnc509101cb29e',
      'x-rapidapi-host': 'rto-vehicle-information-verification-india.p.rapidapi.com',
      'Content-Type': 'application/json'
    }
  };

  const requestPayload = JSON.stringify({
    reg_no,
    consent,
    consent_text
  });

  const apiReq = https.request(options, function (apiRes) {
    const chunks = [];

    apiRes.on('data', function (chunk) {
      chunks.push(chunk);
    });

    apiRes.on('end', function () {
      const body = Buffer.concat(chunks);
      res.status(apiRes.statusCode).json(JSON.parse(body.toString()));
    });
  });

  apiReq.on('error', function (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  apiReq.write(requestPayload);
  apiReq.end();
}
