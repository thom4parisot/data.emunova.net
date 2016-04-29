'use strict';

const crypto = require('crypto');

module.exports = function sha256(message, length = 12) {
  return crypto
    .createHash('sha256')
    .update(message)
    .digest('hex')
    .slice(0, length);
}
