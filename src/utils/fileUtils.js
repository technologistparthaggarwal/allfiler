const path = require('path');

class FileUtils {
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getFileExtension(filename) {
    return path.extname(filename);
  }

  static validateFileSize(size, maxSize = 10 * 1024 * 1024) {
    return size <= maxSize;
  }
}

module.exports = FileUtils;