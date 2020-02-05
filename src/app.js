require('dotenv/config');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const assistant = require('./assistant');
const cors = require('cors');

app.use(bodyParser.json());

app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

app.get('/session', (req, res) => {
  assistant.createSession(
    {
      assistantId: process.env.ASSISTANT_ID,
    },
    (error, data) => {
      if (error) {
        return res.send(error);
      }

      const sessionId = data.result.session_id;
      const payload = {
        assistantId: process.env.ASSISTANT_ID,
        sessionId,
        input: {
          message_type: 'text',
          text: '',
        },
      };

      assistant.message(payload, (err, response) => {
        if (err) {
          sessionId = null;
          return res.status(500).json({ message: 'Erro no servidor' });
        }

        const retorno = {
          sessionId,
          message: response.result,
        };

        return res.status(200).json(retorno);
      });
    }
  );
});

app.post('/conversation', (req, res) => {
  const { sessionId, text, message_type = 'text' } = req.body;

  if (!sessionId) {
    return res.status(401).json({ message: 'Sessão expirada' });
  }

  const payload = {
    assistantId: process.env.ASSISTANT_ID,
    sessionId,
    input: {
      message_type,
      text,
    },
  };

  assistant.message(payload, (err, response) => {
    if (err) {
      sessionId = null;
      return res.status(500).json({ message: 'Erro no servidor' });
    }

    return res.status(200).json(response.result);
  });
});

module.exports = app;
