require('dotenv/config');
const express = require('express');
const bodyParser = require('body-parser');
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

const app = express();
app.use(bodyParser.json());

const assistant = new AssistantV2({
  version: '2020-01-27',
  authenticator: new IamAuthenticator({
    apikey: process.env.API_KEY,
  }),
  url: process.env.ASSISTANT_URL,
});

app.post('/conversation/', (req, res) => {
  const { text, context = {}, message_type = 'text' } = req.body;

  assistant
    .createSession({
      assistantId: process.env.ASSISTANT_ID,
    })
    .then(res => {
      const { session_id: sessionId } = res.result;

      assistant
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
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
});

app.listen(process.env.APP_PORT, () =>
  console.log(`Running on port ${process.env.APP_PORT}`)
);
