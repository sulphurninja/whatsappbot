import { uploadPDFToDropbox } from '../../lib/uploadPdfToDropbox';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { pdfBuffer, filename } = req.body;

        try {
            const mediaUrl = await uploadPDFToDropbox(Buffer.from(pdfBuffer, 'base64'), filename);
            res.status(200).json({ mediaUrl });
        } catch (error) {
            res.status(500).json({ error: 'Failed to upload PDF' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
