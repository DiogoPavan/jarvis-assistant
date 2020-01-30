require('dotenv/config');
const express = require('express');
const bodyParser = require('body-parser');
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');
let sessionId = null;

const app = express();
app.use(bodyParser.json());

const assistant = new AssistantV2({
  version: '2020-01-27',
  authenticator: new IamAuthenticator({
    apikey: process.env.API_KEY,
  }),
  url: process.env.ASSISTANT_URL,
});

const sendMessage = async (data, response) => {
  const { text, context = {}, message_type = 'text' } = data;

  await assistant
    .message({
      assistantId: process.env.ASSISTANT_ID,
      sessionId,
      context,
      input: {
        message_type,
        text,
      },
    })
    .then(res => {
      console.log(JSON.stringify(res, null, 2));
      response.json(res.result);
    })
    .catch(err => {
      console.log(err);
      sessionId = null;
      createSession(data, response);
    });
};

const createSession = (data, response) => {
  assistant
    .createSession({
      assistantId: process.env.ASSISTANT_ID,
    })
    .then(res => {
      sessionId = res.result.session_id;
      sendMessage(data, response);
    })
    .catch(err => {
      console.log(err);
      response.json(err);
    });
};

app.post('/conversation/', (req, response) => {
  if (!sessionId) {
    createSession(req.body, response);
  } else {
    sendMessage(req.body, response);
  }
});

app.listen(process.env.APP_PORT, () =>
  console.log(`Running on port ${process.env.APP_PORT}`)
);
