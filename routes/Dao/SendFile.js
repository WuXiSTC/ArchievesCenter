const fs = require("fs");
const path = require("path");
const PipeStream = require("./tools/PipeStream");
const pathStats = require("./tools/pathStats");
const dir = require("./tools/config").dir;
const valid_filename = require('./tools/valid_filename');


async function SendFile(filename, writeStream, start, end) {//流式发送文件
    if (!valid_filename(filename)) throw new Error("非法路径名:" + filename);
    let fileName = path.join(dir, filename);
    let stats = await pathStats(fileName);
    if (stats === null || !stats.isFile())
        throw new Error("文件" + fileName + "不存在");

    return new Promise((resolve, reject) => {
        let readStream = null;
        if (isNaN(start) || isNaN(end)) readStream = fs.createReadStream(fileName);
        else readStream = fs.createReadStream(fileName, {start, end});
        PipeStream(readStream, writeStream)
            .then((md5) => {
                return resolve(md5)
            })
            .catch((err) => {
                return reject(err)
            });
    });
}

module.exports = SendFile;
