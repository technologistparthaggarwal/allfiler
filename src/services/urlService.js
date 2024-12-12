const { nanoid } = require('nanoid');

class UrlService {
  generateLinkCode() {
    return nanoid(8);
  }

  buildPublicUrl(req, linkCode) {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/files/${linkCode}`;
  }
}

module.exports = new UrlService();