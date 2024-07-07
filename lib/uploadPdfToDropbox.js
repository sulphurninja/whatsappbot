const Dropbox = require('dropbox').Dropbox;


const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN, fetch: fetch });

export const uploadPDFToDropbox = async (pdfBuffer, filename) => {
    try {
        // Upload the PDF to Dropbox
        const response = await dbx.filesUpload({
            path: `/${filename}`,
            contents: pdfBuffer,
            mode: 'add',
            autorename: true,
            mute: false,
        });

        // Create a shared link
        const sharedLinkResponse = await dbx.sharingCreateSharedLinkWithSettings({
            path: response.path_lower,
            settings: {
                requested_visibility: 'public',
            },
        });

        // Modify the URL to make it directly downloadable
        const { url } = sharedLinkResponse;
        const mediaUrl = url.replace('dl=0', 'dl=1');

        return mediaUrl;
    } catch (error) {
        console.error('Error uploading PDF to Dropbox:', error);
        throw new Error('Failed to upload PDF');
    }
};
