// // routes/mega.js
// require('dotenv').config();
// const express = require('express');
// const { File } = require('megajs');
// const router = express.Router();

// router.get('/images', async (req, res) => {
//     try {
//         console.log('Fetching images from MEGA folder...');
//         const folder = File.fromURL('https://mega.nz/folder/qe5BCJwI#n9FuRS5dZ91aFCidqdYEcw');
//         const folderContents = await folder.loadAttributes();

//         const files = folderContents.children.filter(child => !child.directory);
//         const fileInfos = files.map(file => ({
//             name: file.name,
//             url: file.download()
//         }));

//         res.json(fileInfos);
//     } catch (err) {
//         console.error('Error fetching MEGA folder:', err);
//         res.status(500).send('Error fetching MEGA folder');
//     }
// });

// module.exports = router;

// routes/mega.js
// require('dotenv').config();
// const express = require('express');
// const { File } = require('megajs');
// const router = express.Router();

// router.get('/images', async (req, res) => {
//     try {
//         console.log('Fetching images from MEGA folder...');
//         const folder = File.fromURL('https://mega.nz/folder/qe5BCJwI#n9FuRS5dZ91aFCidqdYEcw');
//         const folderContents = await folder.loadAttributes();
//         console.log('Folder Contents:', folderContents); // Log folder contents for debugging

//         const files = folderContents.children.filter(child => !child.directory);
//         const fileInfos = files.map(file => ({
//             name: file.name,
//             url: file.download()
//         }));

//         console.log('Files:', fileInfos); // Log files for debugging
//         res.json(fileInfos);
//     } catch (err) {
//         console.error('Error fetching MEGA folder:', err);
//         res.status(500).send('Error fetching MEGA folder');
//     }
// });

// module.exports = router;


require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

const TERABOX_FOLDER_URL = 'https://terabox.com/s/1XSFb5g4UqgxxeXZh_0qBKg'; // Replace with your TeraBox folder URL

router.get('/images', async (req, res) => {
    try {
        console.log('Fetching images from TeraBox folder...');
        const response = await axios.get(TERABOX_FOLDER_URL);
        const $ = cheerio.load(response.data);

        // This part depends on the structure of the TeraBox page
        const fileInfos = [];
        $('img').each((index, element) => {
            const image = $(element);
            const url = image.attr('src');
            const name = image.attr('alt');
            if (url) {
                fileInfos.push({
                    name: name || `Image ${index + 1}`,
                    url: url.startsWith('http') ? url : `${TERABOX_FOLDER_URL}/${url}`
                });
            }
        });

        res.json(fileInfos);
    } catch (err) {
        console.error('Error fetching TeraBox folder:', err);
        res.status(500).send('Error fetching TeraBox folder');
    }
});

module.exports = router;
