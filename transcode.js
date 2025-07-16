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
    if (!proc) {
      console.log('No process found for streamKey:', streamKey);
      return resolve();
    }
    
    console.log('Found process, killing:', streamKey);
    
    // Set a timeout to force kill if SIGTERM doesn't work
    const timeout = setTimeout(() => {
      console.log('Force killing process:', streamKey);
      proc.kill('SIGKILL');
    }, 5000); // 5 second timeout
    
    // Listen for the existing exit event
    const exitHandler = (code, signal) => {
      console.log('Process exited:', streamKey, 'code:', code, 'signal:', signal);
      clearTimeout(timeout);
      processes.delete(streamKey);
      resolve();
    };
    
    // Add our exit handler
    proc.once('exit', exitHandler);
    
    // Send SIGTERM first
    proc.kill('SIGTERM');
  });
}

module.exports = {
  startTranscode,
  stopTranscode,
  isEncoding,
};
