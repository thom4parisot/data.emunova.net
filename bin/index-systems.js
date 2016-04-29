#!/usr/bin/env node

'use strict';

const index = require('../src/algolia');

const BATCH_LIMIT = process.env.BATCH_LIMIT || 500;
const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY;
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const INDEX_ENV = 'prod';

index({
  ALGOLIA_APP_ID,
  ALGOLIA_API_KEY,
  BATCH_LIMIT,
  index: `${INDEX_ENV}_systems`,
  path: 'systems/*/index.json',
}).catch(e => console.error(e))
