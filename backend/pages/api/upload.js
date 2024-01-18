import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import streamifier from "streamifier";
dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadMiddleware = upload.single("file");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true,
});

async function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

export default async function handler(req, res) {
    await runMiddleware(req, res, uploadMiddleware);
    const stream = await cloudinary.uploader.upload_stream(
        {
            folder: "demo",
        },
        (error, result) => {
            if (error) return res.status(500).json({ error: "Error uploading image." });
            res.status(200).json(result);
        }
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
}

export const config = {
    api: {
        bodyParser: false,
    },
};
