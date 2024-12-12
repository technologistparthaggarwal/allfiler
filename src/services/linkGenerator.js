const { nanoid } = require('nanoid');

class LinkGenerator {
  constructor() {
    this.linkMap = new Map();
    this.displayNames = new Map();
  }

  generateLink(originalFilename, displayName) {
    const randomCode = nanoid(8);
    this.linkMap.set(randomCode, originalFilename);
    if (displayName) {
      this.displayNames.set(randomCode, displayName);
    }
    return randomCode;
  }

  getOriginalFilename(code) {
    return this.linkMap.get(code);
  }

  getDisplayName(code) {
    return this.displayNames.get(code) || this.getOriginalFilename(code)?.split('-').slice(1).join('-');
  }

  removeLink(code) {
    this.linkMap.delete(code);
    this.displayNames.delete(code);
  }
}

module.exports = new LinkGenerator();