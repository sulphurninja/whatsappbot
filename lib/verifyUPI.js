import axios from 'axios';

export const verifyUPI = async (mobNo) => {
    const vpaSuffixes = ['axl', 'ybl', 'okaxis', 'oksbi', 'paytm'];
    const verifiedUPIs = [];

    for (const suffix of vpaSuffixes) {
        const vpaAddress = `${mobNo}@${suffix}`;
        const options = {
            method: 'POST',
            url: 'https://upi-verification.p.rapidapi.com/v3/tasks/sync/verify_with_source/ind_vpa',
            headers: {
                'x-rapidapi-key': '45b05e4d08mshac7d6214846049ep179e8ajsn602ed9322f24',
                'x-rapidapi-host': 'upi-verification.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            data: {
                task_id: 'UUID',
                group_id: 'UUID',
                data: { vpa: vpaAddress }
            }
        };

        try {
            const response = await axios(options);
            const result = response.data.result;
            if (result.account_exists === 'YES') {
                verifiedUPIs.push({
                    vpaAddress,
                    name_at_bank: result.name_at_bank
                });
            }
        } catch (error) {
            console.error(`Error verifying UPI address ${vpaAddress}:`, error);
        }
    }

    return verifiedUPIs;
};
