const fs = require("fs");
const path = require("path");
const dirResolve = require("./tools/dirResolve");
const PipeStream = require("./tools/PipeStream");
const pathStats = require("./tools/pathStats");
const dir = require("./tools/config").dir;
const valid_filename = require('./tools/valid_filename');


async function RecvFile(filename, readStream) {//流式接收文件
    if (!valid_filename(filename)) throw new Error("非法路径名:" + filename);
    let fileName = path.join(dir, filename);
    await dirResolve(fileName);
    let stats = await pathStats(fileName);//检查文件是否存在
    if (stats !== null)//存在则报错
        throw new Error("文件" + fileName + "已存在");

    return new Promise(async (resolve, reject) => {
        //不存在才能写入
        let writeStream = fs.createWriteStream(fileName);
        PipeStream(readStream, writeStream)
            .then((md5) => {
                return resolve(md5)
            })
            .catch((err) => {
                return reject(err)
            });
    });
}

module.exports = RecvFile;