require('dotenv/config');
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

const assistant = new AssistantV2({
    version: '2020-01-27',
    authenticator: new IamAuthenticator({
      apikey: process.env.API_KEY,
    }),
    url: process.env.ASSISTANT_URL,
  });

module.exports = assistant;