import axios from 'axios';

export const verifyUPI = async (mobNo) => {
    const vpaSuffixes = ['axl', 'ybl', 'okaxis', 'oksbi'];
    const verifiedUPIs = [];

    for (const suffix of vpaSuffixes) {
        const vpaAddress = `${mobNo}@${suffix}`;

        try {
            const response = await axios.post(
                'https://uat.apiclub.in/api/v1/vpa_info',
                { vpa: vpaAddress },
                {
                    headers: {
                        Referer: 'docs.apiclub.in',
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'x-api-key': 'apclb_zG6K6g92VAtD2o4AiyvprsTj3fce83f4',
                    },
                }
            );

            const result = response.data;

            // Check if valid UPI details are in the response
            if (result.status === 'success' && result.response?.vpa) {
                verifiedUPIs.push({
                    vpaAddress: result.response.vpa,
                    name_at_bank: result.response.bank_name || 'N/A',
                });
            }
        } catch (error) {
            console.error(`Error verifying UPI address ${vpaAddress}:`, error);
        }
    }

    return verifiedUPIs;
};
