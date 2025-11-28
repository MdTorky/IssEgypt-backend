// const { google } = require('googleapis');
// const { Readable } = require('stream');

// const auth = new google.auth.GoogleAuth({
//     credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
//     scopes: ["https://www.googleapis.com/auth/drive"],
// });

// const drive = google.drive({ version: "v3", auth });

// const uploadFileToDrive = async (file, folderId) => {
//     try {
//         const bufferStream = new Readable();
//         bufferStream.push(file.buffer);
//         bufferStream.push(null);

//         const result = await drive.files.create({
//             requestBody: {
//                 name: file.originalname,
//                 parents: [folderId], // MUST BE INSIDE SHARED DRIVE
//             },
//             media: {
//                 mimeType: file.mimetype,
//                 body: bufferStream,
//             },
//             fields: "id, webViewLink, webContentLink"
//         });

//         return result.data;
//     } catch (err) {
//         console.error("Drive Upload Error:", err.message);
//         throw new Error("Google Drive Upload Failed");
//     }
// };

// module.exports = { uploadFileToDrive };



const { google } = require('googleapis');
const { Readable } = require('stream');

// Initialize OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground" // Redirect URL
);

// Set the Refresh Token
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const drive = google.drive({ version: "v3", auth: oauth2Client });

const uploadFileToDrive = async (file, folderId) => {
    try {
        const bufferStream = new Readable();
        bufferStream.push(file.buffer);
        bufferStream.push(null);

        const result = await drive.files.create({
            requestBody: {
                name: file.originalname,
                parents: [folderId],
            },
            media: {
                mimeType: file.mimetype,
                body: bufferStream,
            },
            fields: "id, webViewLink, webContentLink",
            // Add supportsAllDrives just in case you switch to Shared Drives later
            supportsAllDrives: true
        });

        return result.data;
    } catch (err) {
        console.error("Drive Upload Error:", err.message);
        throw new Error("Google Drive Upload Failed");
    }
};

module.exports = { uploadFileToDrive };