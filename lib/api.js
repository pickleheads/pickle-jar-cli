const fetch = require('node-fetch');

const BASE_URL = 'https://us-central1-pickle-jar-1fb9f.cloudfunctions.net';

const target = {
  addIdea: {
    method: 'POST',
    endpoint: '/addIdea',
  },
  listIdeas: {
    endpoint: '/listIdeas',
    method: 'GET',
  },
};

const api = new Proxy(target, {
  get: (obj, prop) => {
    const config = obj[prop];
    if (!config) {
      throw new Error(`Invalid API endpoint "${prop}"`);
    }
    const url = `${BASE_URL}${config.endpoint}`;
    return async body => {
      if (config.method !== 'GET' && !body) {
        throw new Error('Missing body for request');
      }
      const response =  await fetch(url, {
        body: JSON.stringify(body),
        method: config.method,
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if(!response.ok) {
        throw new Error(data.error.message);
      }
      return data;
    }
  },
});

module.exports = { api };
