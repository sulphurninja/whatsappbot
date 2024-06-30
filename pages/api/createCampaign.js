// pages/api/createCampaign.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { campaign_name, campaign_type, template_name, language_code } = req.body;
  
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Basic OXdhT01vdnBya2VLUlNpMURiT3Q2ZU9nTU5lcV80clR6Z0NwV0lCcnNrazo=`);
    myHeaders.append("Content-Type", "application/json");
  
    const raw = JSON.stringify({
      campaign_name,
      campaign_type,
      template_name,
      language_code
    });
  
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
  
    try {
      const response = await fetch("https://api.interakt.ai/v1/public/create-campaign/", requestOptions);
      const result = await response.text();
      res.status(200).json({ result });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  