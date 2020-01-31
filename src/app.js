require('dotenv/config');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const assistant = require('./assistant');

app.use(bodyParser.json());

const sendMessage = async (data) => {
  const { sessionId, text, message_type = 'text'} = data;
  const payload = {
    assistantId: process.env.ASSISTANT_ID,
    sessionId,
    input: {
      message_type,
      text,
      options: {
        return_context: true,
      },
    },
  };

  return assistant
    .message(payload, (err, res) => {
      if (err) {
        console.log(err);
        return JSON.stringify(err, null, 2);
      }

      console.log(res);
      return JSON.stringify(res, null, 2);
    })
};

app.get('/session', (req, res) => {
  assistant.createSession({
    assistantId: process.env.ASSISTANT_ID
  }, 
  async (error, data) => {
    if (error) {
      console.log(error); 
      return res.send(error);
    } 

    const sessionId = data.result.session_id;

    const message = await sendMessage({
      sessionId: data.result.session_id,
      messageType: 'text',
      text: ''
    }); 

    const retorno = {
      sessionId,
      message: message.result
    }

    return res.status(200).json(retorno)
  })
});

app.post('/conversation', async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(401).json({ message: 'Sessão expirada' });
  } 

  const message = await sendMessage(req.body); 
  
  return sendMessage(res.status(200).json(message));
});

module.exports = app;
