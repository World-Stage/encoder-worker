const fs = require('fs');

function getFfmpegArgs(inputUrl, outputDir) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  return [
    '-i', inputUrl,
    '-c:a', 'aac',
    '-ar', '48000',
    '-b:a', '128k',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-profile:v', 'main',
    '-crf', '23',
    '-g', '60',
    '-keyint_min', '60',
    '-sc_threshold', '0',
    '-bf', '0',
    '-hls_time', '2',
    '-hls_list_size', '6',
    '-hls_flags', 'independent_segments+discont_start+delete_segments',
    '-hls_allow_cache', '0',
    '-f', 'hls',
    '-hls_segment_filename', `${outputDir}/%v_%03d.ts`,
    '-master_pl_name', 'index.m3u8',
    '-var_stream_map', 'v:0,name:720p v:1,name:480p v:2,name:360p',
    '-map', '0:v:0', '-s:v:0', '1280x720', '-b:v:0', '2500k', '-maxrate:v:0', '2750k', '-bufsize:v:0', '5000k',
    '-map', '0:v:0', '-s:v:1', '854x480', '-b:v:1', '1200k', '-maxrate:v:1', '1320k', '-bufsize:v:1', '2400k',
    '-map', '0:v:0', '-s:v:2', '640x360', '-b:v:2', '700k', '-maxrate:v:2', '770k', '-bufsize:v:2', '1400k',
    `${outputDir}/%v.m3u8`
  ];
}

module.exports = { getFfmpegArgs };
