const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const fileController = require('../controllers/fileController');

router.post('/upload', upload.single('file'), fileController.handleUpload.bind(fileController));
router.get('/:linkCode', fileController.handleDownload.bind(fileController));

module.exports = router;