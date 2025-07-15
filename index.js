const express = require('express');
const { startTranscode, isEncoding, stopTranscode } = require('./transcode');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/transcode/:streamKey', async (req, res) => {
  const { streamKey } = req.params;
  if (!streamKey) return res.status(400).json({ error: 'Missing streamKey' });

  if (isEncoding()) {
    return res.status(409).json({ message: 'Encoding already in progress' });
  }

  try {
    await startTranscode(streamKey);
    res.status(200).json({ message: 'Transcoding started' });
  } catch (e) {
    console.error('Transcode error:', e);
    res.status(500).json({ error: 'Transcoding failed' });
  }
});

app.delete('/transcode/:streamKey', async (req, res) => {
  const { streamKey } = req.params;
  if (!streamKey) return res.status(400).json({ error: 'Missing streamKey' });

  try {
    await stopTranscode(streamKey);
    res.status(200).json({ message: 'Transcoding stopped' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to stop encoding' });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Encoder worker listening on port ${PORT}`));
