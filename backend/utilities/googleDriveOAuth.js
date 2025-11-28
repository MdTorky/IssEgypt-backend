const { google } = require("googleapis");
const { Readable } = require("stream");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

// Will store tokens here (or DB later)
let savedTokens = null;

/* STEP 1 — GET GOOGLE LOGIN URL */
const generateAuthUrl = () => {
    return oAuth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: ["https://www.googleapis.com/auth/drive.file"]
    });
};

/* STEP 2 — EXCHANGE CODE FOR TOKENS */
const handleOAuthCallback = async (code) => {
    const { tokens } = await oAuth2Client.getToken(code);
    savedTokens = tokens;
    oAuth2Client.setCredentials(tokens);
    return tokens;
};

/* STEP 3 — UPLOAD FILE TO DRIVE */
const uploadFileToDrive = async (file, folderId) => {
    if (!savedTokens)
        throw new Error("Google Drive not connected — Please login first.");

    oAuth2Client.setCredentials(savedTokens);
    const drive = google.drive({ version: "v3", auth: oAuth2Client });

    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);

    const response = await drive.files.create({
        requestBody: {
            name: file.originalname,
            parents: folderId ? [folderId] : undefined
        },
        media: {
            mimeType: file.mimetype,
            body: bufferStream
        },
        fields: "id, webViewLink"
    });

    return response.data;
};

module.exports = {
    generateAuthUrl,
    handleOAuthCallback,
    uploadFileToDrive
};
