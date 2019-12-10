const fs = require("fs");

/**
 * 列出一个目录下的所有文件和文件夹
 * @param path 要列哪个目录
 * @returns {Promise}
 * @constructor
 */
function ReadDir(path) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            if (err) reject(err);
            resolve(files);
        })
    })
}

module.exports = ReadDir;