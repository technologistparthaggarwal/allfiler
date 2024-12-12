const urlService = require('./urlService');
const FileUtils = require('../utils/fileUtils');

class FileService {
  generatePublicUrl(req, filename) {
    const linkCode = urlService.generateLinkCode();
    const displayName = filename.split('-').slice(1).join('-');
    
    return {
      linkCode,
      displayName,
      publicUrl: urlService.buildPublicUrl(req, linkCode),
      originalFilename: displayName
    };
  }

  getFileInfo(fileSize) {
    return {
      size: FileUtils.formatFileSize(fileSize),
      expiresIn: '24 hours'
    };
  }
}

module.exports = new FileService();