import { sendWhatsAppMessage } from '../lib/sendMessage';

const firstChunk = `🚔*Enhance Your Investigative Skills*
👇
🏍🚙 *Vehicle & Challan:* 
  *VD MH14TC4540* - Check vehicle registration details
  *Challan MH14TC4540* - Search for traffic violations
  *Fasttag MH14TC4540* - Find any vehicle's FASTag information 
  *CVN MA1NMC57111* -  Chassis to Vehicle Number (coming soon)
👇
🪩 *OSINT:*
  *OSINT 98XXXXXXX5* - Advanced people search
  *EMAIL test@gmail.com* - Easily search for Gmail-related information
👇
📲 *Communication Insights:*
  *SMS VM-HDFCBN* - Decode SMS headers, company info, and more.
  *Name 98XXXXXX80* - Identify callers 
  *VN +44042009560* - Uncover virtual number details
🔎 *Location & Identity:*
  *PAN BEL81E* - Retrieve PAN card information
  *GST 27AADCT73G1Z3* - Retrieve GST information
  *PGST BEL95C* - Retrieve PAN TO GST Information
  *IPL https ://google.com* -  Track IP/GPS (copy & share the generated link)
  *IPSTOP #XDTRFGTZ* - Delete an IP Log link
  *IP 192.168.0.01* - Lookup IP address details
  *PIN 411044* - Get Pin Code information`;

const secondChunk = `👇
📌 *Device & Travel:*
  *IMEI 35920003041526* - Find device model details
  *FULL IMEI 35920003041526* -  Find the last digit of an IMEI
  *PNR 845257456* -  Check train ticket status & info
👇
💵 *Financial & Legal:*
  *IFSC KKBK0062517 or IFSC KOTAH CHINC* -  Find bank & IFSC codes
  *UPI 9XXXXXX567* - Get UPI ID details
  *CC Vikas* -  Track court cases
👇
💡 *More Tools:*
  *GAS 9XXXXX2345* - Link phone numbers to gas connections
  *BTS 404-434903227* -  Cell tower info on Google Maps
  *Network 9XXXXX2345* - Mobile number portability details
👇
*Account & Support:*
  *Validity* - Check your subscription status
  *Support* - Get assistance`;

export const handleHelp = async (userPhoneNumber) => {
    try {
        // Send the first chunk
        await sendWhatsAppMessage(userPhoneNumber, firstChunk);
        
        // Send the second chunk
        await sendWhatsAppMessage(userPhoneNumber, secondChunk);
    } catch (error) {
        console.error('Error sending help message:', error);
        throw new Error('Failed to send help message');
    }
};
