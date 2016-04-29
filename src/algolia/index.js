'use strict';

const fs = require('fs');
const glob = require('glob');
const sha256 = require('../sha256');
const chunk = require('lodash.chunk');
const camelCase = require('lodash.camelCase');
const request = require('hyperquest');

module.exports = (indexingOptions) => new Promise((resolve, reject) => {
  const { index, path } = indexingOptions;
  const { BATCH_LIMIT, ALGOLIA_APP_ID, ALGOLIA_API_KEY } = indexingOptions;

  glob(path, {}, (err, files) => {
    chunk(files, BATCH_LIMIT).forEach(f => {
      Promise.all(f.map(readJson)).then(batch => {
        const opts = {
          headers: {
            'X-Algolia-API-Key': ALGOLIA_API_KEY,
            'X-Algolia-Application-Id': ALGOLIA_APP_ID,
            'Content-Type': 'application/json',
          }
        };

        const payload = {
          'requests': batch.map(file => ({
            'action': 'updateObject',
            'body': Object.assign(prepareBody(file.metadata), {
              'objectID': sha256(file.filepath)
            })
          }))
        };

        request
          .post(`https://${ALGOLIA_APP_ID}.algolia.net/1/indexes/${index}/batch`, opts)
          .on('error', reject)
          .end(JSON.stringify(payload));
      }).then(resolve, reject);
    });
  });
});

function prepareBody (body) {
  const newO = {};

  Object.keys(body).forEach(k => {
    newO[camelCase(k)] = body[k];
  });

  return newO;
}

function readJson (filepath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, { encoding: 'utf8' }, (err, content) => {
      if (err) {
        return reject(err);
      }

      resolve({ filepath, metadata: JSON.parse(content) });
    });
  });
}
