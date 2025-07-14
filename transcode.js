const { spawn } = require('child_process');
const path = require('path');
const { getFfmpegArgs } = require('./ffmpeg/presets');

// Keep track of processes by stream key
const processes = new Map();

function isEncoding(streamKey) {
  return processes.has(streamKey);
}

function startTranscode(streamKey) {
  return new Promise((resolve, reject) => {
    if (processes.has(streamKey)) {
      return reject(new Error('Already encoding this stream.'));
    }

    const inputUrl = `${process.env.NGINX_RTMP_URL}/${streamKey}`;
    const outputDir = path.join(process.env.HLS_OUTPUT_DIR, streamKey);
    const ffmpegArgs = getFfmpegArgs(inputUrl, outputDir);

    const proc = spawn('ffmpeg', ffmpegArgs);

    processes.set(streamKey, proc);

    proc.stderr.on('data', (data) => console.log(`[${streamKey}] ${data}`));
    proc.on('exit', (code, signal) => {
      console.log(`[${streamKey}] exited with code ${code}, signal ${signal}`);
      processes.delete(streamKey);
    });

    resolve();
  });
}

function stopTranscode(streamKey) {
  return new Promise((resolve, reject) => {
    const proc = processes.get(streamKey);
    if (!proc) return resolve();

    proc.kill('SIGTERM');
    proc.on('exit', () => {
      processes.delete(streamKey);
      resolve();
    });
  });
}

module.exports = {
  startTranscode,
  stopTranscode,
  isEncoding,
};
