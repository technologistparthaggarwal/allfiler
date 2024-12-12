const path = require('path');
const fileService = require('../services/fileService');
const fileManager = require('../services/fileManager');
const linkGenerator = require('../services/linkGenerator');

class FileController {
    async handleUpload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const urlInfo = fileService.generatePublicUrl(req, req.file.filename);
            const linkCode = linkGenerator.generateLink(req.file.filename, urlInfo.displayName);
            await fileManager.scheduleFileDeletion(req.file.filename, linkCode);
            
            const fileInfo = fileService.getFileInfo(req.file.size);

            res.json({
                originalFilename: urlInfo.displayName,
                publicUrl: urlInfo.publicUrl,
                size: fileInfo.size,
                expiresIn: fileInfo.expiresIn
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Failed to upload file' });
        }
    }

    async handleDownload(req, res) {
        try {
            const { linkCode } = req.params;
            const originalFilename = linkGenerator.getOriginalFilename(linkCode);
            
            if (!originalFilename) {
                return res.status(404).json({ error: 'File not found or link expired' });
            }

            const filePath = path.join(process.cwd(), 'uploads', originalFilename);
            const exists = await fileManager.checkFileExists(filePath);

            if (!exists) {
                linkGenerator.removeLink(linkCode);
                return res.status(404).json({ error: 'File not found or expired' });
            }

            const displayName = linkGenerator.getDisplayName(linkCode);
            res.setHeader('Content-Disposition', `attachment; filename="${displayName}"`);
            res.sendFile(filePath);
        } catch (error) {
            console.error('Download error:', error);
            res.status(500).json({ error: 'Failed to download file' });
        }
    }
}

module.exports = new FileController();