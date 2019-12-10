const fs = require("fs");

function ReadDir(path) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            if (err) reject(err);
            resolve(files);
        })
    })
}

module.exports = ReadDir;