// components/OSINTReportForm.js

import { useState } from 'react';
import axios from 'axios';

const OSINTReportForm = () => {
    const [mobNo, setMobNo] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerateReport = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/osint/report', { mobNo }, { responseType: 'blob' });

            // Create a blob URL to initiate download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // Create a link element and click to trigger download
            const a = document.createElement('a');
            a.href = url;
            a.download = 'osint-report.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setLoading(false);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report');
            setLoading(false);
        }
    };

    return (
        <div>
            <form className='flex justify-center mt-12' onSubmit={e => { e.preventDefault(); handleGenerateReport(); }}>
                <input
                    type="text"
                    value={mobNo}
                    onChange={e => setMobNo(e.target.value)}
                    placeholder="Enter Mobile Number"
                    required
                />
                <button type="submit" disabled={loading}>{loading ? 'Generating...' : 'Generate Report'}</button>
            </form>
        </div>
    );
};

export default OSINTReportForm;
