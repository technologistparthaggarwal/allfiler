const fs = require('fs').promises;
const path = require('path');
const schedule = require('node-schedule');
const linkGenerator = require('./linkGenerator');

class FileManager {
  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.init();
  }

  async init() {
    try {
      await fs.access(this.uploadsDir);
      this.cleanupExistingFiles();
    } catch {
      await fs.mkdir(this.uploadsDir);
    }
  }

  async cleanupExistingFiles() {
    try {
      const files = await fs.readdir(this.uploadsDir);
      for (const file of files) {
        const filePath = path.join(this.uploadsDir, file);
        const stats = await fs.stat(filePath);
        const fileAge = Date.now() - stats.birthtimeMs;
        
        if (fileAge >= 24 * 60 * 60 * 1000) {
          await fs.unlink(filePath);
          console.log(`Deleted expired file: ${file}`);
        } else {
          const remainingTime = (24 * 60 * 60 * 1000) - fileAge;
          const deleteDate = new Date(Date.now() + remainingTime);
          this.scheduleFileDeletion(file, file.split('-')[0]);
        }
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  scheduleFileDeletion(filename, linkCode) {
    const filePath = path.join(this.uploadsDir, filename);
    const deleteDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    schedule.scheduleJob(deleteDate, async () => {
      try {
        await fs.unlink(filePath);
        linkGenerator.removeLink(linkCode);
        console.log(`File deleted: ${filename}`);
      } catch (error) {
        if (error.code === 'ENOENT') {
          linkGenerator.removeLink(linkCode);
        } else {
          console.error(`Error deleting file ${filename}:`, error);
        }
      }
    });
  }

  async getFileInfo(filename) {
    try {
      const filePath = path.join(this.uploadsDir, filename);
      const stats = await fs.stat(filePath);
      const creationTime = stats.birthtimeMs;
      const expirationTime = creationTime + (24 * 60 * 60 * 1000);
      const remainingTime = expirationTime - Date.now();
      
      return {
        exists: true,
        remainingTime: Math.max(0, remainingTime),
        size: stats.size
      };
    } catch {
      return { exists: false };
    }
  }

  async renameFile(oldPath, newPath) {
    try {
      await fs.rename(oldPath, newPath);
      return true;
    } catch (error) {
      console.error('Error renaming file:', error);
      return false;
    }
  }

  getPublicUrl(req, filename, customName) {
    const protocol = req.protocol;
    const host = req.get('host');
    const linkCode = linkGenerator.generateLink(filename, customName);
    return {
      url: `${protocol}://${host}/files/${linkCode}`,
      linkCode,
      displayName: customName || filename.split('-').slice(1).join('-')
    };
  }
}

module.exports = new FileManager();