export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { reg_no } = req.body;

    const options = {
      method: 'POST',
      headers: {
        'x-rapidapi-key': '45b05e4d08mshac7d6214846049ep179e8ajsn602ed9322f24',
        'x-rapidapi-host': 'rto-vehicle-information-verification-india.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reg_no,
        consent: 'Y',
        consent_text: 'I hear by declare my consent agreement for fetching my information via AITAN Labs API'
      })
    };

    try {
      const apiResponse = await fetch('https://rto-vehicle-information-verification-india.p.rapidapi.com/api/v1/rc/vehicleinfo', options);
      const data = await apiResponse.json();

      // Extracting required fields from the response
      const {
        owner_name,
        owner_father_name,
        current_address_line1,
        current_address_line2,
        current_address_line3,
        permanent_address_line1,
        permanent_address_line2,
        permanent_address_line3,
        mobile_no,
        vehicle_manufacturer_name,
        model,
        chassis_no,
        engine_no,
        vehicle_seat_capacity,
        vehicle_type,
        vehicle_catg,
        cylinders_no,
        manufacturing_yr,
        color,
        fuel_descr,
        reg_no,
        reg_date,
        reg_upto,
        reg_type_descr,
        status,
        dealer_name,
        dealer_address_line1,
        insurance_company_name,
        insurance_policy_no,
        financer_name
      } = data.result;

      // Constructing the formatted response
      const formattedResponse = `Vehicle Number: ${reg_no}\n` +
        `RC Owner: ${owner_name}\n` +
        `RC Father Name: ${owner_father_name}\n` +
        `Present Address: ${current_address_line1}, ${current_address_line2}, ${current_address_line3}\n` +
        `Permanent Address: ${permanent_address_line1}, ${permanent_address_line2}, ${permanent_address_line3}\n` +
        `Mobile Number: ${mobile_no}\n` +
        `Maker Model: ${vehicle_manufacturer_name} ${model}\n` +
        `Vehicle Chassis: ${chassis_no}\n` +
        `Engine Number: ${engine_no}\n` +
        `Seat Capacity: ${vehicle_seat_capacity}\n` +
        `Vehicle Type: ${vehicle_type}\n` +
        `Vehicle Category: ${vehicle_catg}\n` +
        `No Cylinders: ${cylinders_no}\n` +
        `- Manufacture Date: ${manufacturing_yr}\n` +
        `Color: ${color}\n` +
        `Fuel Type: ${fuel_descr}\n` +
        `Owner Number: ${mobile_no}\n` +
        `Registered Date: ${reg_date}\n` +
        `RC Expire Date: ${reg_upto}\n` +
        `RC Registration Type: ${reg_type_descr}\n` +
        `RC Status: ${status}\n` +
        `RTO: ${data.result.office_name}, ${data.result.state}\n` + // Assuming office_name and state are RTO details
        `Permit Type: -\n` + // No permit details provided in the response
        `Insurance Company: ${insurance_company_name}\n` +
        `Insurance Policy No: ${insurance_policy_no}\n` +
        `Financer: ${financer_name}\n` +
        `Maker Company: ${vehicle_manufacturer_name}\n` +
        `------------------------------\n` +
        `Owner Aadhar: -\n` +
        `Owner PAN: -\n` +
        `Owner Email: -\n` +
        `Purchasing Amount: -\n` +
        `Registration Type: -\n` +
        `------------------------------\n` +  
        `Dealer Information\n` +
        `Dealer Name: ${dealer_name}\n` +
        `Address: ${dealer_address_line1},\n` +
        `------------------------------\n` +
        `Financier information\n` +
        `Name: ${financer_name}\n` +
        `Address: ${data.result.financer_address_line1}, ${data.result.financer_address_line2}`;

      res.status(apiResponse.status).send(formattedResponse);
    } catch (error) {
      console.error('Error fetching vehicle info:', error.message);
      res.status(500).json({ error: 'Failed to fetch vehicle information' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
