const multer = require('multer');

const storage = multer.memoryStorage(); // store in memory instead of disk
const upload = multer({ storage });

module.exports = upload;
