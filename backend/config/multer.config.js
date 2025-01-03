import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define the path for the uploads directory
const UPLOADS_DIR = path.join('uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(`Saving file to: ${UPLOADS_DIR}`);
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = uniqueSuffix + path.extname(file.originalname);
        console.log(`Saving file as: ${filename}`);
        cb(null, filename);
    },
});
const uploadImage = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, 
});
export default uploadImage;