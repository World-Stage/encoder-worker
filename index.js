const express = require('express');
const path = require('path');
const { startTranscode, isEncoding, stopTranscode } = require('./transcode');
const { deleteDirectoryRecursive } = require('./utils');

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
    // Cleanup output directory even if process not found
    const outputDir = path.join(process.env.HLS_OUTPUT_DIR, streamKey);
    await deleteDirectoryRecursive(outputDir);
    res.status(200).json({ message: 'Transcoding stopped' });
  } catch (e) {
    console.error('Error stopping transcode or cleaning up:', e);
    res.status(500).json({ error: 'Failed to stop encoding' });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Encoder worker listening on port ${PORT}`));
