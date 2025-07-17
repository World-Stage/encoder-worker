const fs = require('fs');
const path = require('path');

// Utility functions for the encoder worker
function deleteDirectoryRecursive(dirPath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(dirPath)) {
      console.log(`Directory does not exist: ${dirPath}`);
      return resolve();
    }
    console.log(`Deleting directory: ${dirPath}`);
    fs.rm(dirPath, { recursive: true, force: true }, (err) => {
      if (err) {
        console.error(`Error deleting directory ${dirPath}:`, err);
        reject(err);
      } else {
        console.log(`Successfully deleted directory: ${dirPath}`);
        resolve();
      }
    });
  });
}

module.exports = {
  deleteDirectoryRecursive,
};
