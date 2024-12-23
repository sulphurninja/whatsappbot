import React from 'react';

export default function DownloadMockPDF() {
    const downloadPDF = async () => {
        try {
            const response = await fetch('/api/okay');
            if (!response.ok) {
                throw new Error('Failed to fetch PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Trigger the download
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mock-osint-report.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Failed to download PDF.');
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <button onClick={downloadPDF} style={{ padding: '10px 20px', fontSize: '16px' }}>
                Download Mock OSINT Report
            </button>
        </div>
    );
}
